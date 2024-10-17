const fileController = require("../controllers/fileController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/fileHandling")

const fileRoutes = (app) => {
  app.post("/user/bot/:botId/upload", verifyToken,upload.array('files'),fileController.uploadMultipleFiles);
  app.get("/user/bot/:botId/download", verifyToken,fileController.downloadFile);
  app.delete("/user/bot/:botId/file", verifyToken, fileController.deleteFile);
  app.get("/user/bot/:botId/filedetails", verifyToken, fileController.getFileInformation);
};

module.exports = fileRoutes;