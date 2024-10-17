const ChatController = require("../controllers/chatcontroller");
const verifyToken = require("../middleware/authMiddleware");
const verifyApiToken = require("../middleware/apiKeyAuth");

const chatRoutes = (app) => {
    app.post("/api/chat/initiate", verifyApiToken, ChatController.initiateChat);
    app.post("/api/chat/:chatId/send", verifyApiToken, ChatController.sendMessage);
    app.get("/api/chat/:chatId/history", verifyApiToken,ChatController.getChatHistory);
    app.post("/api/chat/:chatId/end", verifyApiToken, ChatController.endChat);
    app.get("/api/chat/:chatId/status", verifyApiToken, ChatController.getChatStatus);
};

module.exports = chatRoutes;
