const { User } = require('../models');

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

    // Valider l'association d'agence
    if (req.body.profile?.agence_id) {
      // Seuls les gérants peuvent avoir une agence associée
      if (req.body.role && req.body.role !== 'gerant') {
        return res.status(400).json({
          status: 'error',
          message: 'Seuls les gérants peuvent être associés à une agence.'
        });
      }
      if (!req.body.role && existingUser.role !== 'gerant') {
        return res.status(400).json({
          status: 'error',
          message: 'Seuls les gérants peuvent être associés à une agence.'
        });
      }

      // Vérifier si l'agence existe
      const { Agence } = require('../models');
      const agence = await Agence.findById(req.body.profile.agence_id);
      if (!agence) {
        return res.status(400).json({
          status: 'error',
          message: 'Agence non trouvée.'
        });
      }

      // Vérifier si l'agence n'est pas déjà assignée à un autre gérant
      const existingGerant = await User.findOne({
        _id: { $ne: req.params.id },
        role: 'gerant',
        'profile.agence_id': req.body.profile.agence_id
      });
      if (existingGerant) {
        return res.status(400).json({
          status: 'error',
          message: 'Cette agence est déjà assignée à un autre gérant.'
        });
      }
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