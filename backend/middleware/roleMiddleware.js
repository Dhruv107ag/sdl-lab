/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces that req.user has one of the allowed roles.
 * @param {string|string[]} allowedRoles - Role name or array of permitted role strings
 */
function roleMiddleware(allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Authentication identity missing.' });
        }

        if (!rolesArray.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Required: ${rolesArray.join(' or ')}.`
            });
        }

        next();
    };
}

module.exports = roleMiddleware;
