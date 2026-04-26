const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send welcome email with temp password
const sendWelcomeEmail = async (name, email, tempPassword) => {
  try {
    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Task Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Task Management System</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2>Welcome, ${name}! 👋</h2>
            <p>Your account has been created successfully.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>🔑 Temporary Password:</strong> 
                <span style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
                  ${tempPassword}
                </span>
              </p>
            </div>
            <p style="color: #dc2626;">
              ⚠️ Please login and reset your password immediately!
            </p>
            <a href="${process.env.FRONTEND_URL}/login" 
               style="display: inline-block; background-color: #1a73e8; color: white; 
                      padding: 12px 24px; border-radius: 8px; text-decoration: none;
                      margin-top: 10px;">
              Login Now →
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated message from Task Management System</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

// Send deadline reminder email
const sendDeadlineEmail = async (name, email, taskTitle, dueDate) => {
  try {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⚠️ Task Deadline Approaching: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f39c12; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">⏰ Deadline Reminder</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2>Hi ${name},</h2>
            <p>This is a reminder that you have an upcoming task deadline!</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; 
                        margin: 20px 0; border-left: 4px solid #f39c12;">
              <h3 style="margin: 0 0 10px 0; color: #1a1a2e;">📋 ${taskTitle}</h3>
              <p style="margin: 0; color: #666;">
                <strong>Due Date:</strong> ${formattedDate}
              </p>
            </div>
            <p>Please make sure to complete this task on time!</p>
            <a href="${process.env.FRONTEND_URL}/tasks"
               style="display: inline-block; background-color: #f39c12; color: white;
                      padding: 12px 24px; border-radius: 8px; text-decoration: none;
                      margin-top: 10px;">
              View Task →
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated message from Task Management System</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deadline email sent to ${email} for task: ${taskTitle}`);
    return true;

  } catch (error) {
    console.error('Failed to send deadline email:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendDeadlineEmail };