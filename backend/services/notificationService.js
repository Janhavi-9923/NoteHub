const Notification = require('../models/Notification');

async function createNotification(userId, type, message, link = '') {
  return Notification.create({ user: userId, type, message, link });
}

module.exports = { createNotification };
