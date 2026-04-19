const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require login + Admin role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;