const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { normalizeCI, variants } = require('../utils/phone');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
  let { nom, prenom, email, telephone, password, role } = req.body;

  // Normaliser email/telephone
  email = typeof email === 'string' ? email.trim().toLowerCase() : email;
  telephone = typeof telephone === 'string' ? normalizeCI(telephone) : telephone;

  console.log('Registration attempt for:', email || telephone);

    // Vérifier si l'utilisateur existe déjà
    // Rechercher existant par email exact ou par variantes de téléphone
    const telVariants = telephone ? variants(telephone) : [];
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(telVariants.length ? [{ telephone: { $in: telVariants } }] : []),
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email ou téléphone existe déjà.',
      });
    }

    // 🏢 Assigner une agence par défaut pour les nouveaux utilisateurs
    const Agence = require('../models/Agence');
    const agenceParDefaut = await Agence.findOne().sort({ createdAt: 1 }); // Première agence créée
    
    // Créer le nouvel utilisateur
    const userData = {
      nom,
      prenom,
      email,
      telephone, // déjà normalisé en +225XXXXXXXXXX
      password,
      role: role || 'client',
    };
    
    // Assigner l'agence par défaut si elle existe (sauf pour admin/super_admin)
    if (agenceParDefaut && !['admin', 'super_admin'].includes(userData.role)) {
      userData.profile = { agence: agenceParDefaut._id };
      console.log(`🏢 Agence assignée à nouveau user: ${agenceParDefaut.nom}`);
    }
    
    const newUser = await User.create(userData);

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
    // Accepter identifiant dans 'email' ou 'telephone'.
    // Si un numéro de téléphone est envoyé dans 'email', le basculer automatiquement vers 'telephone' (compat mobile v2)
  let { email, telephone, password } = req.body;

    // Normalisation basique
  email = typeof email === 'string' ? email.trim().toLowerCase() : email;
  telephone = typeof telephone === 'string' ? telephone.trim() : telephone;

    // Heuristique: si "email" ne contient pas '@' ou ressemble à un numéro, on considère que c'est un téléphone
    const looksLikePhone = (v) => typeof v === 'string' && (/^\+?\d[\d\s-]{6,}$/.test(v) || !v.includes('@'));
    if (!telephone && looksLikePhone(email)) {
      telephone = email;
      email = undefined;
    }

  console.log('🔍 Login attempt for:', email || telephone);
  console.log('🔍 Password provided length:', typeof password === 'string' ? password.length : 0);

    // Vérifier que email ou telephone est fourni
    if (!email && !telephone) {
      return res.status(400).json({
        status: 'error',
        message: 'Veuillez fournir un email ou un numéro de téléphone.',
      });
    }

    // Trouver l'utilisateur et inclure le password
    // Construire une recherche robuste par variantes
    const telVars = telephone ? variants(telephone) : [];
    const query = {
      $or: [
        ...(email ? [{ email }] : []),
        ...(telVars.length ? [{ telephone: { $in: telVars } }] : []),
      ]
    };
    const user = await User.findOne(query).select('+password');

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