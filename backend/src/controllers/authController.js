const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, role } = req.body;

    console.log('Registration attempt for:', email);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { telephone }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email ou téléphone existe déjà.',
      });
    }

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      nom,
      prenom,
      email,
      telephone,
      password,
      role: role || 'client',
    });

    // Générer le token JWT
    const token = generateToken({ id: newUser._id });
    const refreshToken = generateRefreshToken({ id: newUser._id });

    // Retourner la réponse sans le mot de passe
    const userResponse = {
      id: newUser._id,
      nom: newUser.nom,
      prenom: newUser.prenom,
      email: newUser.email,
      telephone: newUser.telephone,
      role: newUser.role,
      profile: newUser.profile,
      date_creation: newUser.date_creation,
    };

    res.status(201).json({
      status: 'success',
      message: 'Utilisateur créé avec succès.',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, telephone, password } = req.body;

    console.log('🔍 Login attempt for:', email || telephone);
    console.log('🔍 Password provided:', password);

    // Vérifier que email ou telephone est fourni
    if (!email && !telephone) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez fournir un email ou un numéro de téléphone.',
      });
    }

    // Trouver l'utilisateur et inclure le password
    const user = await User.findOne({
      $or: [{ email }, { telephone }]
    }).select('+password');

    console.log('🔍 User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('🔍 User details:', {
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        passwordExists: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordPrefix: user.password ? user.password.substring(0, 20) + '...' : 'none'
      });

      // Debug: Vérifier la méthode correctPassword
      console.log('🔍 Testing password comparison...');
      const isMatch = await user.correctPassword(password, user.password);
      console.log('🔍 Password match result:', isMatch);

      // Debug alternative: tester avec bcrypt directement
      const bcrypt = require('bcryptjs');
      const directCompare = await bcrypt.compare(password, user.password);
      console.log('🔍 Direct bcrypt compare:', directCompare);
    }

    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        status: 'error',
        message: 'Email/téléphone ou mot de passe incorrect.',
      });
    }

    // Vérifier si le mot de passe est correct
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    console.log('🔍 Final password check result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        status: 'error',
        message: 'Email/téléphone ou mot de passe incorrect.',
      });
    }

    // Vérifier si le compte est actif
    if (user.profile.statut !== 'actif') {
      return res.status(401).json({
        status: 'error',
        message: 'Votre compte est désactivé. Contactez l\'administrateur.',
      });
    }

    // Générer les tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

  // Ne pas modifier updatedAt ici pour éviter d'invalider le JWT via changedPasswordAfter

    // Retourner la réponse sans le mot de passe
    const userResponse = {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      profile: user.profile,
      date_creation: user.date_creation,
    };

    console.log('✅ Login successful for:', user.email);

    res.status(200).json({
      status: 'success',
      message: 'Connexion réussie.',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token manquant.',
      });
    }

    const { verifyRefreshToken, generateToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    const newToken = generateToken({ id: user._id });

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Refresh token invalide ou expiré.',
    });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Déconnexion réussie.',
  });
};