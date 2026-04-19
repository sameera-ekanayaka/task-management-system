const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @route   GET /api/notifications
// @access  All logged in users
const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Latest 20 notifications
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.status(200).json({ notifications, unreadCount });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   PATCH /api/notifications/:id/read
// @access  All logged in users
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notification not found'
      });
    }

    // Make sure user owns this notification
    if (notification.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You cannot access this notification'
      });
    }

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    res.status(200).json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

// @route   PATCH /api/notifications/read-all
// @access  All logged in users
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.status(200).json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };