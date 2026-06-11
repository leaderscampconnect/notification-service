const express = require('express');
const router = express.Router();

const { authenticate } = require('../config/keycloak');
const requireRole = require('../middleware/roleMiddleware');
const {
  getUserNotifications,
  getNotificationById,
  getAllNotifications,
} = require('../controllers/notificationController');

// All notification routes require a valid Keycloak token
router.use(authenticate);

// User routes — accessible by any authenticated user
router.get('/', getUserNotifications);
router.get('/:id', getNotificationById);

// Admin route — requires the "admin" realm role in Keycloak
router.get('/admin/all', requireRole('admin'), getAllNotifications);

module.exports = router;
