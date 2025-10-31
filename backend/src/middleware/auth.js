const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User } = require('../models');

// Middleware pour protéger les routes
const protect = async (req, res, next) => {
  try {
    // 1) Récupérer le token
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Accès non autorisé. Token manquant.',
      });
    }

    // 2) Vérifier le token
    const decoded = verifyToken(token);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    // 4) Vérifier si le mot de passe a changé après l'émission du token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'Mot de passe modifié récemment. Veuillez vous reconnecter.',
      });
    }

    // 5) Ajouter l'utilisateur à la requête
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Token invalide ou expiré.',
    });
  }
};

// Middleware pour restreindre l'accès par rôle
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action.',
      });
    }
    next();
  };
};

// Middleware optionnel (pour les routes publiques qui peuvent avoir un user connecté)
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const currentUser = await User.findById(decoded.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
};