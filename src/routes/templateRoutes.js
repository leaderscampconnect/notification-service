const express = require('express');
const router = express.Router();

const { authenticate } = require('../config/keycloak');
const requireRole = require('../middleware/roleMiddleware');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');

// All template management routes require Keycloak auth + "admin" role
router.use(authenticate, requireRole('admin'));

router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;
