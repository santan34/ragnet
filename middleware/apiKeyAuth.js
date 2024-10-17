
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET_2 || 'getishjdtrerfghuytfdcfv-i dighggytr';

const verifyApiToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({
            error : 'Unauthorised bot'
        })
        return
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error : 'Unauthorised bot'
        })
    }
    try{
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        req.botId = decoded.botId;
        console.log(req.botId);
        next();
    }
    catch (error) {
        return res.status(401).json({ error: error });
    }
}
module.exports = verifyApiToken;