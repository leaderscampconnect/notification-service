/**
 * Role-based access control middleware.
 *
 * Reads roles from the Keycloak JWT claim: realm_access.roles
 * Usage: requireRole('admin') or requireRole('admin', 'manager')
 *
 * @param {...string} roles - One or more Keycloak realm roles required
 */
const requireRole = (...roles) =>
  (req, res, next) => {
    const userRoles = req.auth?.realm_access?.roles ?? [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };

module.exports = requireRole;
