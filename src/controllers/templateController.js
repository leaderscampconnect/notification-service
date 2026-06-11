const Joi = require('joi');
const Template = require('../models/Template');

const templateSchema = Joi.object({
  name: Joi.string().trim().required(),
  eventType: Joi.string()
    .valid('booking.confirmed', 'ticket.issued')
    .required(),
  subject: Joi.string().required(),
  htmlBody: Joi.string().required(),
  textBody: Joi.string().optional().allow('', null),
  isActive: Joi.boolean().optional(),
});

/**
 * GET /api/templates
 */
const getAllTemplates = async (req, res, next) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/templates/:id
 */
const getTemplateById = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/templates
 */
const createTemplate = async (req, res, next) => {
  try {
    const { error, value } = templateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const template = await Template.create(value);
    res.status(201).json(template);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        error: `Duplicate value for field: ${field}`,
      });
    }
    next(err);
  }
};

/**
 * PUT /api/templates/:id
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { error, value } = templateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { ...value, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/templates/:id
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
