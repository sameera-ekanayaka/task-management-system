const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendDeadlineEmail } = require('./emailService');
const checkDeadlines = async (io, connectedUsers) => {
  try {
    const now = new Date();

    // Get tasks due in next 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    // Get tasks due in next 3 days
    const threeDays = new Date();
    threeDays.setHours(threeDays.getHours() + 72);

    // Find tasks with approaching deadlines
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: threeDays
        },
        status: {
          not: 'COMPLETED'
        }
      },
      include: {
        assignments: {
          include: {
            user: true
          }
        }
      }
    });

    for (const task of upcomingTasks) {
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

      // Determine urgency message
      let message = '';
      if (hoursUntilDue <= 24) {
        message = `⚠️ URGENT: Task "${task.title}" is due tomorrow!`;
      } else if (hoursUntilDue <= 48) {
        message = `📅 Reminder: Task "${task.title}" is due in 2 days`;
      } else {
        message = `📅 Reminder: Task "${task.title}" is due in 3 days`;
      }

      // Send notification to each assigned user
      for (const assignment of task.assignments) {
        const userId = assignment.userId;

        // Check if notification already sent today
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId,
            message,
            createdAt: {
              gte: new Date(now.setHours(0, 0, 0, 0))
            }
          }
        });

        // Only send if not already notified today
if (!existingNotif) {
  // Save to database
  await prisma.notification.create({
    data: { userId, message }
  });

  // Send real-time if user is online
  const socketId = connectedUsers[userId];
  if (socketId) {
    io.to(socketId).emit('notification', {
      message,
      taskId: task.id
    });
  }

  // Send email notification
  await sendDeadlineEmail(
    assignment.user.name,
    assignment.user.email,
    task.title,
    task.dueDate
  );
        }

        console.log(`Deadline notification sent to user ${userId}: ${message}`);
      }
    }

    console.log(`Deadline check completed. Found ${upcomingTasks.length} upcoming tasks.`);

  } catch (error) {
    console.error('Deadline check error:', error);
  }
};

module.exports = { checkDeadlines };