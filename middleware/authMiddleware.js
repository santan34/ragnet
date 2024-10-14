
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log(1)
        res.status(401).json({
            error : 'Unauthorised user'
        })
        return
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log(2)
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
        return res.status(401).json({ error: error });
    }
}
module.exports = verifyToken;