const fs = require("fs");
const path = require("path");
const Document = require("../models/documents");
const Bot = require("../models/bots");
const { documentValidationSchema } = require("../utils/joi");
const NodeZip = require("node-zip");
const docsFromPDFs = require("../services/pdfLoader");
const embeddingClient = require("../utils/chroma");

class FileController {
  //uploads a file from local storage
  static async uploadFile(req, res) {
    const { botId } = req.params;
    //validate these
    const { fileName } = req.body
    if (!botId) {
      res.status(400).json({
        error: "Bot id is required",
      });
      return;
    }
    if (!req.file) {
      res.status(400).json({
        error: "No file uploaded",
      });
      return;
    }
    //validate that only pdf files are uploaded
    const fileDetails = {
      documentName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      createdAt: new Date(),
      //play with the path to get the right path
      path: req.file.path,
    };
    try {
      const newDoc = new Document(fileDetails);
      await newDoc.save();
      console.log(newDoc)
      console.log(",,,,,,,,,,,,,,,,,,,,,,")
      const chatBot = await Bot.findById(botId);
      console.log(chatBot);
      if (!chatBot) {
        res.status(404).json({
          error: "Bot not found",
        });
        return;
      }
      chatBot.botDocuments.push(newDoc._id);
      console.log(".........after pushing..............");
      console.log(chatBot);
      //const docList = [];
      //docList.push(req.file.path);
      //const docs = docsFromPDFs(docList);
      //create embbedings
      //await embeddingClient.addDocuments(chatBot.botName, docs)
      await chatBot.save();
      console.log("000000....the bot...........")
      console.log(chatBot)
      res.status(200).json({
        message: "File uploaded successfully",
        file: newDoc,
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
    //maybe save the file details in a database,
    //map the file details to the file
    //files are stored in folder name of the bot

    //HANDLE SINgle file upload
  }

  //uploads multiple files from local storage
  static async uploadMultipleFiles(req, res) {
    //multiple file upload
    const { botId } = req.params;
    if (!botId) {
      return res.status(400).json({
        error: "Bot id is required",
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    try {
      const chatBot = await Bot.findById(botId);
      if (!chatBot) {
        res.status(404).json({
          error: "Bot not found",
        });
        return;
      }
      const documents = [];
      const docList = []
      for (const file of req.files) {
        const fileDetails = {
          documentName: file.originalname,
          type: file.mimetype,
          size: file.size,
          createdAt: new Date(),
          //play with the path to get the right path
          path: file.path,
        };
        const newDoc = new Document(fileDetails);
        await newDoc.save();
        chatBot.botDocuments.push(newDoc._id);
        await chatBot.save();
        documents.push(newDoc);
        docList.push(file.path);
      }
      //const docs = docsFromPDFs(docList);
      //await embeddingClient.addDocuments(chatBot.botName, docs);
      res.status(200).json({
        message: "Files uploaded successfully",
        files: documents,
      });
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }

  //downloads a file from the server
  static async downloadFile(req, res) {
    //download file
    try {
      //handle jwt for the files
      const { docId } = req.bod;
      const document = await Document.findById(docId);
      if (!document) {
        res.status(404).json({
          error: "File not found",
        });
        return;
      }
      const filepath = path.join(__dirname, document.path);
      if (!fs.existsSync(filepath)) {
        res.status(404).json({
          error: "File not found on server",
        });
        return;
      }
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${document.name}`
      );
      res.download(document.path, document.name);
      res.status(200).json({
        message: "File downloading successfully",
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }

  //downloads multiple files from the server
  static async downloadFiles(req, res) {
    //download multiple files
    const { docIds } = req.body;
    if (!docIds || docIds.length === 0) {
      res.status(400).json({
        error: "No files selected",
      });
      return;
    }
    try {
      const documents = await Document.find({ _id: { $in: docIds } });
      if (documents.length === 0) {
        res.status(404).json({
          error: "Files not found",
        });
        return;
      }
      const zip = new NodeZip();
      const validDocuments = [];
      documents.forEach(async (document) => {
        const filepath = path.join(__dirname, document.path);
        if (!fs.existsSync(filepath)) {
          await Document.findByIdAndDelete(document._id);
        } else {
          zip.file(document.name, fs.readFileSync(filepath));
        }
      });
      const data = zip.generate({ base64: false, compression: "DEFLATE" });
      res.setHeader("Content-Disposition", `attachment; filename=files.zip`);
      res.setHeader("Content-Type", "application/zip");
      res.send(Buffer.from(data, "binary"));
      res.status(200).json({
        message: "Files downloading successfully",
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }

  //deletes a file from the server
  static async deleteFile(req, res) {
    //delete a file
    const { botId } = req.params;
    if (!botId) {
      res.status(400).json({
        error: "Bot id is required",
      });
      return;
    }
    const { docId } = req.body;
    if (!docId) {
      res.status(400).json({
        error: "File id is required",
      });
      return;
    }
    try {
      const document = await Document.findById(docId);
      const chatBot = await Bot.findById(botId);
      if (!chatBot) {
        res.status(404).json({
          error: "Bot not found",
        });
        return;
      }
      if (!document) {
        res.status(404).json({
          error: "File not found",
        });
        return;
      }
      const filepath = path.join(__dirname, document.path);
      if (!fs.existsSync(filepath)) {
        await Document.findByIdAndDelete(docId);
        res.status(404).json({
          error: "File not found on server",
        });
        return;
      }
      fs.unlinkSync(filepath);
      chatBot.documents = chatBot.documents.filter(
        (doc) => doc.toString() !== docId
      );
      await Document.findByIdAndDelete(docId);
      await embeddingClient.deleteCollection(chatBot.botName);
      res.status(200).json({
        message: "File deleted successfully",
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }

  //deletes multiple files from the server
  static async deleteFiles(req, res) {
    //delete multiple files
    const { botId } = req.params;
    if (!botId) {
      res.status(400).json({
        error: "Bot id is required",
      });
      return;
    }
    const { docIds } = req.body;
    if (!docIds || docIds.length === 0) {
      res.status(400).json({
        error: "No files selected",
      });
      return;
    }
    try {
      const chatBot = await Bot.findById(botId);
      const documents = await Document.find({ _id: { $in: docIds } });
      if (documents.length === 0) {
        res.status(404).json({
          error: "Files not found",
        });
        return;
      }
      documents.forEach(async (document) => {
        const filepath = path.join(__dirname, document.path);
        if (!fs.existsSync(filepath)) {
          await Document.findByIdAndDelete(document._id);
        } else {
          fs.unlinkSync(filepath);
          chatBot.documents = chatBot.documents.filter(
            (doc) => doc.toString() !== document._id
          );
          await Document.findByIdAndDelete(document._id);
        }
      });
      await embeddingClient.deleteCollection(chatBot.botName);
      res.status(200).json({
        message: "Files deleted successfully",
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }

  //get information about a file from the server
  static async getFileInformation(req, res) {
    //send information about a file
    const { docId } = req.body;
    try {
      const document = await Document.findById(docId);
      if (!document) {
        res.status(404).json({
          error: "File not found",
        });
        return;
      }
      res.status(200).json({
        message: "File information sent successfully",
        file: document,
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }
}

module.exports = FileController;
