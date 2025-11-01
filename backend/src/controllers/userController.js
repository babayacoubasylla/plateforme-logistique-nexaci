const { User, Agence } = require('../models');
const crypto = require('crypto');

// Récupérer tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Créer un utilisateur (admin seulement)
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, role, profile } = req.body || {};

    if (!nom || !prenom || !email || !telephone) {
      return res.status(400).json({
        status: 'error',
        message: 'nom, prenom, email et telephone sont requis.'
      });
    }

    // Vérifier doublons email/téléphone
    const existing = await User.findOne({ $or: [{ email }, { telephone }] });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email ou téléphone existe déjà.'
      });
    }

    // Mapper agence_id -> profile.agence si fourni
    let mappedProfile = profile || {};
    const agenceId = profile?.agence_id || req.body.agence_id;
    if (agenceId) {
      const agence = await Agence.findById(agenceId);
      if (!agence) {
        return res.status(400).json({ status: 'error', message: 'Agence non trouvée.' });
      }
      mappedProfile = { ...mappedProfile, agence: agence._id };
    }

    // Générer un mot de passe temporaire si non fourni (UI admin ne demande pas le mot de passe)
    const tempPassword = req.body.password || crypto.randomBytes(6).toString('base64url');

    const newUser = await User.create({
      nom,
      prenom,
      email,
      telephone,
      role: role || 'client',
      password: tempPassword,
      profile: mappedProfile
    });

    const userResponse = {
      id: newUser._id,
      nom: newUser.nom,
      prenom: newUser.prenom,
      email: newUser.email,
      telephone: newUser.telephone,
      role: newUser.role,
      profile: newUser.profile,
      date_creation: newUser.date_creation
    };

    return res.status(201).json({
      status: 'success',
      message: 'Utilisateur créé avec succès.',
      data: { user: userResponse, tempPassword }
    });
  } catch (error) {
    return res.status(400).json({ status: 'error', message: error.message });
  }
};

// Récupérer un utilisateur par ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    // Empêcher la mise à jour du mot de passe via cette route
    if (req.body.password) {
      delete req.body.password;
    }

    // Vérifier si l'utilisateur existe avant la mise à jour
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    // Valider l'association d'agence (mapper agence_id -> profile.agence)
    if (req.body.profile?.agence_id) {
      // Seuls les gérants peuvent avoir une agence associée
      const nextRole = req.body.role || existingUser.role;
      if (nextRole !== 'gerant') {
        return res.status(400).json({
          status: 'error',
          message: 'Seuls les gérants peuvent être associés à une agence.'
        });
      }

      const agence = await Agence.findById(req.body.profile.agence_id);
      if (!agence) {
        return res.status(400).json({ status: 'error', message: 'Agence non trouvée.' });
      }

      const existingGerant = await User.findOne({
        _id: { $ne: req.params.id },
        role: 'gerant',
        'profile.agence': req.body.profile.agence_id
      });
      if (existingGerant) {
        return res.status(400).json({ status: 'error', message: 'Cette agence est déjà assignée à un autre gérant.' });
      }

      // Remplacer agence_id par la clé correcte 'agence'
      req.body.profile.agence = req.body.profile.agence_id;
      delete req.body.profile.agence_id;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateMe = async (req, res) => {
  try {
    // Empêcher la mise à jour du mot de passe et du rôle
    const filteredBody = { ...req.body };
    const excludedFields = ['password', 'role', 'email'];
    excludedFields.forEach(field => delete filteredBody[field]);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};