const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';
const verifyToken = (req, res) => {
    const token = req.headers('Authorization');
    if (!token) {
        res.status(401).json({
            error : 'Unauthorised user'
        })
        return
    }
    try{
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }

}
module.exports = verifyToken;
