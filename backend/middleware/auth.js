const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token',
                shouldRefresh: true
            });
        }

        req.user = { userId: decodedToken.userId };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token format' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired' 
            });
        }
        res.status(401).json({ 
            success: false,
            message: 'Authentication failed' 
        });
    }
};

module.exports = { authenticateToken };