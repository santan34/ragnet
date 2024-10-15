const fileController = require("../controllers/fileController");
const verifyToken = require("../middleware/authMiddleware");

const fileRoutes = (app) => {
  app.post("/api/file/upload", verifyToken, fileController.uploadFile);
  app.get("/api/file/download/:fileId", verifyToken, fileController.downloadFile);
  app.delete("/api/file/delete/:fileId", verifyToken, fileController.deleteFile);
  app.get("/api/file/list", verifyToken, fileController.listFiles);
};

module.exports = fileRoutes;