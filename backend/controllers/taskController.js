const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @route   POST /api/tasks
// @access  Project Manager only
const createTask = async (req, res) => {
  const { title, description, priority, dueDate, assignedUserIds } = req.body;
  const createdById = req.user.id;

  try {
    // Validation
    if (!title) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title is required'
      });
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Priority must be LOW, MEDIUM or HIGH'
      });
    }

    // Validate due date is not in the past
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Due date cannot be in the past'
      });
    }

    // Validate assigned users exist
    if (assignedUserIds && assignedUserIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: assignedUserIds } }
      });
      if (users.length !== assignedUserIds.length) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'One or more assigned users do not exist'
        });
      }
    }

    // Create task with assignments
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById,
        assignments: {
          create: assignedUserIds
            ? assignedUserIds.map((userId) => ({ userId }))
            : []
        }
      },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Create notifications for assigned users
    if (assignedUserIds && assignedUserIds.length > 0) {
      await prisma.notification.createMany({
        data: assignedUserIds.map((userId) => ({
          userId,
          message: `You have been assigned a new task: "${title}"`
        }))
      });
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   GET /api/tasks
// @access  All logged in users
const getAllTasks = async (req, res) => {
  const { status, priority, search } = req.query;
  const { id: userId, role } = req.user;

  try {
    // Build filter
    const filter = {};

    // Collaborators only see their assigned tasks
    if (role === 'COLLABORATOR') {
      filter.assignments = { some: { userId } };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { contains: search };

    const tasks = await prisma.task.findMany({
      where: filter,
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ tasks });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   GET /api/tasks/:id
// @access  All logged in users
const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    res.status(200).json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   PUT /api/tasks/:id
// @access  Project Manager only
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    // Validate status
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Status must be TODO, IN_PROGRESS or COMPLETED'
      });
    }

    const updated = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        createdBy: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json({
      message: 'Task updated successfully',
      task: updated
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   PATCH /api/tasks/:id/status
// @access  Collaborator and above
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { id: userId, role } = req.user;

  try {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Status must be TODO, IN_PROGRESS or COMPLETED'
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { assignments: true }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    // Collaborators can only update their assigned tasks
    if (role === 'COLLABORATOR') {
      const isAssigned = task.assignments.some((a) => a.userId === userId);
      if (!isAssigned) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update status of your assigned tasks'
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updated
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   DELETE /api/tasks/:id
// @access  Project Manager only
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   POST /api/tasks/:id/comments
// @access  All logged in users
const addComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    if (!content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Comment content is required'
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: parseInt(id),
        userId
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment
};