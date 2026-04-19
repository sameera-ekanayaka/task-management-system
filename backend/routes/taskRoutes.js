const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment
} = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require login
router.use(protect);

// All roles can view tasks
router.get('/', getAllTasks);
router.get('/:id', getTaskById);

// All roles can update status and add comments
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/comments', addComment);

// Project Manager and Admin only
router.post('/', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), createTask);
router.put('/:id', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), updateTask);
router.delete('/:id', authorizeRoles('ADMIN', 'PROJECT_MANAGER'), deleteTask);

module.exports = router;