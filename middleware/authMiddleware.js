
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'getishjdty-uc565gtduf-fv';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader)
    console.log(",,,,,,,,,,,,,,,,,")
    if (!authHeader) {
        console.log(1)
        res.status(401).json({
            error : 'Unauthorised user'
        })
        return
    }
    const token = authHeader.split(' ')[1];
    console.log(token)
    console.log(".......................")
    if (!token) {
        console.log(2)
        return res.status(401).json({
            error : 'Unauthorised user'
        })

    }
    try{
        const decoded = jwt.verify(token, secret);
        console.log(decoded)
        console.log("..................")
        req.userId = decoded.userId;
        console.log(req.userId);
        console.log("...............")
        next();
    }
    catch (error) {
        return res.status(401).json({ error: error });
    }
}
module.exports = verifyToken;