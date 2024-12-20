const UserController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

const userRoutes = (app) => {
  app.post("/user/create", UserController.createUser);
  app.post("/user/login", UserController.loginUser);
  app.get("/user/profile", verifyToken, UserController.getUserProfile);
  app.delete("/user/profile/delete", verifyToken, UserController.deleteUser);
  app.get("/user/profile/change-password",verifyToken,UserController.changePassword);
  //logout
  //otp tish
};

module.exports = userRoutes;
