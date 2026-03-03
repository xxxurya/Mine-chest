const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getUserById } = require('../users/user.service');
const logger = require('../../utils/logger');

async function registerUser(username, password, role) {
  try {
    logger.debug('Hashing password for user', { username, role });
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.debug('Creating user in database', { username, role });
    const userId = await createUser(username, hashedPassword, role);
    logger.debug('User created successfully', { userId, username, role });
    return { userId };
  } catch (error) {
    logger.error('Error registering user', { username, role, error: error.message });
    throw error;
  }
}

async function loginUser(username, password) {
  try {
    logger.debug('Looking up user by username', { username });
    const user = await getUserByUsername(username);
    if (!user) {
      logger.debug('User not found', { username });
      return null;
    }

    logger.debug('Comparing password', { username });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.debug('Invalid password', { username });
      return null;
    }

    logger.debug('Generating JWT token', { userId: user.id, username });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    logger.debug('Login successful', { userId: user.id, username });
    return { token, user: { id: user.id, username: user.username, role: user.role } };
  } catch (error) {
    logger.error('Error logging in user', { username, error: error.message });
    throw error;
  }
}

async function getCurrentUser(userId) {
  try {
    logger.debug('Fetching current user', { userId });
    const user = await getUserById(userId);
    logger.debug('Current user fetched', { userId, found: !!user });
    return user;
  } catch (error) {
    logger.error('Error fetching current user', { userId, error: error.message });
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
