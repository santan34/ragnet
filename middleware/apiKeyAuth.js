const jwt = require('jsonwebtoken');


const secret = process.env.JWT_SECRET_2 || 'getishjdtrerfghuytfdcfv-i dighggytr';

/**
 * Middleware to verify JWT tokens and extract user and bot IDs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyApiToken = (req, res, next) => {
    const BEARER_PREFIX = 'Bearer ';
    const AUTH_HEADER = 'authorization';
    
    // Check for authorization header
    const authHeader = req.headers[AUTH_HEADER];
    if (!authHeader) {
        return res.status(401).json({
            error: 'Authentication required',
            code: 'MISSING_AUTH_HEADER'
        });
    }

    // Validate Bearer token format
    if (!authHeader.startsWith(BEARER_PREFIX)) {
        return res.status(401).json({
            error: 'Invalid authentication format',
            code: 'INVALID_AUTH_FORMAT'
        });
    }

    // Extract token
    const token = authHeader.slice(BEARER_PREFIX.length);
    if (!token) {
        return res.status(401).json({
            error: 'Authentication token required',
            code: 'MISSING_TOKEN'
        });
    }

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, secret, {
            algorithms: ['HS256'], 
            maxAge: '2h'
        });

        if (!decoded.userId || !decoded.botId) {
            throw new Error('Invalid token payload');
        }
        // Attach decoded data to request object
        req.userId = decoded.userId;
        req.botId = decoded.botId;

        next();
    } catch (error) {
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
        console.error('JWT verification error:', error);
        
        return res.status(401).json({
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

/**
 * SECURITY CONSIDERATIONS
 * 2. Consider implementing token blacklisting for revoked tokens
 * 3. Consider adding rate limiting to prevent brute force attacks
 * 4. Add request logging for security auditing
 * 5. Consider adding token refresh mechanism
 * 
 * IMPROVEMENT SUGGESTIONS:
 * 1. Add request logging with correlation IDs
 * 2. Implement token expiration handling with refresh tokens
 * 3. Add detailed error codes for better client handling
 * 4. Consider adding token type verification (access vs refresh)
 * 5. Add validation for token payload structure
 */

module.exports = verifyApiToken;