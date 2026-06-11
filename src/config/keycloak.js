const { expressjwt: expressJwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const KEYCLOAK_URL =
  process.env.KEYCLOAK_URL || 'http://keycloak:8180';
const KEYCLOAK_REALM =
  process.env.KEYCLOAK_REALM || 'campconnect';

const jwksUri = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`;
const issuer = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

/**
 * Express middleware that validates Bearer JWTs signed by Keycloak.
 * Attaches decoded payload to req.auth on success.
 */
const authenticate = expressJwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri,
  }),
  algorithms: ['RS256'],
  issuer,
});

module.exports = { authenticate, issuer };
