const jwt = require('jsonwebtoken');

module.exports = (options = {}) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT);

            if (options.requireAdmin && decoded.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
    };
};