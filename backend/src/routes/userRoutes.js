const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Routes protégées pour l'utilisateur connecté
router.use(protect);

router.patch('/update-me', updateMe);

// Routes admin seulement
router.use(restrictTo('admin', 'super_admin'));

router.get('/', getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;