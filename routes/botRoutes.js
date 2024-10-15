const express = require('express');
const botController = require('../controllers/botController');
const verifyToken = require('../middleware/authMiddleware');

const botRoutes = (app) => {
    app.post('/user/bot/create', verifyToken, botController.createBot);
    app.get('/user/bot/:botId', verifyToken, botController.getBot);
    app.delete('/user/bot/:botId', verifyToken, botController.deleteBot);
    app.put('/user/bot/:botId', verifyToken, botController.updateBot);
}

module.exports = router;