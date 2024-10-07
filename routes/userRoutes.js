const UserController = require('../controllers/controller/userController');
const verifyToken = require('../middleware/authMiddleware');

const userRoutes = (app) => {
    app.post('/user/create', UserController.createUser);
    app.post('/user/login', UserController.loginUser);
    app.get('/user/profile', verifyToken, UserController.getUserProfile);
}

module.export =userRoutes;