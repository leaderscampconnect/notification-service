const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Returns paginated notifications for the authenticated user.
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status.toUpperCase();

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10))
        .select('-renderedBody -metadata'), // don't leak full HTML in list view
      Notification.countDocuments(filter),
    ]);

    res.json({
      data: notifications,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/:id
 * Returns a single notification belonging to the authenticated user.
 */
const getNotificationById = async (req, res, next) => {
  try {
    const userId = req.auth?.sub;

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId,
    }).populate('templateId', 'name eventType version');

    if (!notification) {
      return res
        .status(404)
        .json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/admin/all
 * Admin-only: returns all notifications with optional filters.
 */
const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, eventType, userId } = req.query;

    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (eventType) filter.eventType = eventType;
    if (userId) filter.userId = userId;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10)),
      Notification.countDocuments(filter),
    ]);

    res.json({
      data: notifications,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserNotifications,
  getNotificationById,
  getAllNotifications,
};
