const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendWelcomeEmail } = require('../services/emailService');
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + 'A1!';
};

const createUser = async (req, res) => {
  const { name, email, role } = req.body;
  try {
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Bad Request', message: 'Name, email and role are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid email format' });
    }
    const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Role must be ADMIN, PROJECT_MANAGER or COLLABORATOR' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email already in use' });
    }
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, mustResetPassword: true }
    });
    // Send welcome email
await sendWelcomeEmail(name, email, tempPassword);

res.status(201).json({
  message: 'User created successfully',
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
  tempPassword
});
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    const users = await prisma.user.findMany({
      where: filter,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    if (role) {
      const validRoles = ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Bad Request', message: 'Invalid role' });
      }
    }
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(role && { role })
      },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    res.status(200).json({ message: 'User updated successfully', user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }
    await prisma.user.update({ where: { id: parseInt(id) }, data: { isActive: false } });
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser };