const ChatController = require("../controllers/chatcontroller");
const verifyToken = require("../middleware/authMiddleware");

const chatRoutes = (app) => {
    app.post("api/chat/initiate", ChatController.initiateChat);
    app.post("api/chat/send", ChatController.sendMessage);
    app.get("api/chat/history", ChatController.getChatHistory);
    app.post("api/chat/end", ChatController.endChat);
    app.get("api/chat/status", ChatController.getChatStatus);
    app.get("api/bot/info", ChatController.getBotInfo);
    app.post("api/chat/restart", ChatController.restartChat);
};

module.export = chatRoutes;
