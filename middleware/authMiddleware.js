const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';

/**
 * Middleware to verify user authentication tokens
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
    const BEARER_PREFIX = 'Bearer ';
    const AUTH_HEADER = 'authorization';

    const requestId = req.id || Date.now();
    
    // Check for authorization header
    const authHeader = req.headers[AUTH_HEADER];
    if (!authHeader) {
        logger.warn({
            requestId,
            message: 'Missing authorization header',
            path: req.path
        });

        return res.status(401).json({
            error: 'Authentication required',
            code: 'MISSING_AUTH_HEADER'
        });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith(BEARER_PREFIX)) {
        logger.warn({
            requestId,
            message: 'Invalid authorization format',
            path: req.path
        });

        return res.status(401).json({
            error: 'Invalid authentication format',
            code: 'INVALID_AUTH_FORMAT'
        });
    }

    // Extract token
    const token = authHeader.slice(BEARER_PREFIX.length);
    if (!token) {
        logger.warn({
            requestId,
            message: 'Missing token',
            path: req.path
        });

        return res.status(401).json({
            error: 'Authentication token required',
            code: 'MISSING_TOKEN'
        });
    }

    try {
        // Verify token with additional security options
        const decoded = jwt.verify(token, secret, {
            algorithms: ['HS256'], // Explicitly specify allowed algorithms
            maxAge: process.env.JWT_LIFESPAN || '2h' // Maximum token age
        });

        if (!decoded.userId) {
            throw new Error('Invalid token payload');
        }

        req.userId = decoded.userId;

        // IMPROVEMENT: Add successful auth logging
        logger.info({
            requestId,
            userId: req.userId,
            message: 'Successfully authenticated request',
            path: req.path
        });

        next();
    } catch (error) {
        // Handle different types of JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        // Log unexpected errors
        logger.error({
            requestId,
            error: error.message,
            stack: error.stack,
            path: req.path
        });
        
        return res.status(401).json({
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

/**
 * Simple logger implementation

 */
const logger = {
    info: (data) => console.log('INFO:', data),
    warn: (data) => console.log('WARN:', data),
    error: (data) => console.error('ERROR:', data)
};

/**
 * SECURITY CONSIDERATIONS:
 * 1. JWT_SECRET should be a strong, random value stored in environment variables
 * 2. Consider implementing token blacklisting for logged out users
 * 3. Add rate limiting to prevent brute force attacks
 * 4. Implement proper logging for security audit trail
 * 5. Consider adding refresh token mechanism
 * 
 * IMPROVEMENT SUGGESTIONS:
 * 1. Add proper logging with correlation IDs
 * 2. Implement token refresh mechanism
 * 3. Add request timing metrics
 * 4. Consider adding user roles/permissions validation
 * 5. Add request source tracking (IP, user agent)
 */

module.exports = verifyToken;