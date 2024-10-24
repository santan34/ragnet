const fs = require("fs");
const path = require("path");
const Document = require("../models/documents");
const Bot = require("../models/bots");
const { documentValidationSchema } = require("../utils/joi");
const NodeZip = require("node-zip");
const docsFromPDFs = require("../services/pdfLoader");
const embeddingClient = require("../utils/chroma");

class FileController {
  /**
   * Uploads a single file and associates it with a bot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} req.params.botId - ID of the bot to associate the file with
   * @param {Object} req.file - Uploaded file object from multer
   * @returns {Promise<void>}
   */
  static async uploadFile(req, res) {
    const { botId } = req.params;
    const { fileName } = req.body;

    // Input validation
    if (!botId) {
      return res.status(400).json({ error: "Bot id is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileDetails = {
      documentName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      createdAt: new Date(),
      path: req.file.path,
    };

    try {
      // Create and save new document
      const newDoc = new Document(fileDetails);
      await newDoc.save();

      // Find and update bot with new document
      const chatBot = await Bot.findById(botId);
      if (!chatBot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      chatBot.botDocuments.push(newDoc._id);
      await chatBot.save();
      return res.status(200).json({
        message: "File uploaded successfully",
        file: newDoc,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  /**
   * Uploads multiple files and associates them with a bot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} req.params.botId - ID of the bot to associate files with
   * @param {Array} req.files - Array of uploaded file objects from multer
   * @returns {Promise<void>}
   */
  static async uploadMultipleFiles(req, res) {
    const { botId } = req.params;

    // Input validation
    if (!botId) {
      return res.status(400).json({ error: "Bot id is required" });
    }

    if (!req.files?.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const chatBot = await Bot.findById(botId);
      if (!chatBot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const documents = [];
      const docList = [];

      // Process each file
      for (const file of req.files) {
        const fileDetails = {
          documentName: file.originalname,
          type: file.mimetype,
          size: file.size,
          createdAt: new Date(),
          path: file.path,
        };

        const newDoc = new Document(fileDetails);
        await newDoc.save();
        
        chatBot.botDocuments.push(newDoc._id);
        documents.push(newDoc);
        docList.push(file.path);
      }

      await chatBot.save();

      // Create embeddings for all documents
      const docs = docsFromPDFs(docList);
      await embeddingClient.addDocuments(chatBot.botName, docs);

      return res.status(200).json({
        message: "Files uploaded successfully",
        files: documents,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  /**
   * Downloads a single file from the server
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} req.body.docId - ID of the document to download
   * @returns {Promise<void>}
   */
  static async downloadFile(req, res) {
    try {
      const { docId } = req.body;
      
      if (!docId) {
        return res.status(400).json({ error: "File id is required" });
      }

      const document = await Document.findById(docId);
      if (!document) {
        return res.status(404).json({ error: "File not found" });
      }

      // Verify file exists on server
      const filepath = path.join(__dirname, '..', document.path);
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      // Set download headers and initiate download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${document.name}`
      );
      
      return res.download(document.path, document.name);
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  /**
   * Downloads multiple files as a zip archive
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Array<string>} req.body.docIds - Array of document IDs to download
   * @returns {Promise<void>}
   */
  static async downloadFiles(req, res) {
    const { docIds } = req.body;

    if (!docIds?.length) {
      return res.status(400).json({ error: "No files selected" });
    }

    try {
      const documents = await Document.find({ _id: { $in: docIds } });
      if (!documents.length) {
        return res.status(404).json({ error: "Files not found" });
      }

      // Create zip archive
      const zip = new NodeZip();
      
      // Add existing files to zip and clean up missing files
      for (const document of documents) {
        const filepath = path.join(__dirname, document.path);
        if (!fs.existsSync(filepath)) {
          await Document.findByIdAndDelete(document._id);
        } else {
          zip.file(document.name, fs.readFileSync(filepath));
        }
      }

      // Generate and send zip file
      const data = zip.generate({ base64: false, compression: "DEFLATE" });
      res.setHeader("Content-Disposition", "attachment; filename=files.zip");
      res.setHeader("Content-Type", "application/zip");
      
      return res.send(Buffer.from(data, "binary"));
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  /**
   * Deletes a single file and its associated references
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} req.params.botId - ID of the bot owning the file
   * @param {string} req.body.docId - ID of the document to delete
   * @returns {Promise<void>}
   */
  static async deleteFile(req, res) {
    const { botId } = req.params;
    const { docId } = req.body;

    // Input validation
    if (!botId || !docId) {
      return res.status(400).json({
        error: !botId ? "Bot id is required" : "File id is required",
      });
    }

    try {
      // Parallel fetch of document and bot
      const [document, chatBot] = await Promise.all([
        Document.findById(docId),
        Bot.findById(botId)
      ]);

      if (!chatBot || !document) {
        return res.status(404).json({
          error: !chatBot ? "Bot not found" : "File not found",
        });
      }

      // Check file existence and delete if found
      const filepath = path.join(__dirname, '..', document.path);
      if (!fs.existsSync(filepath)) {
        await Document.findByIdAndDelete(docId);
        return res.status(404).json({ error: "File not found on server" });
      }

      // Delete file and update references
      fs.unlinkSync(filepath);
      chatBot.botDocuments = chatBot.botDocuments.filter(
        (doc) => doc.toString() !== docId
      );
      await Promise.all([
        Document.findByIdAndDelete(docId),
        chatBot.save()
      ]);

      return res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  /**
   * Retrieves information about a specific file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {string} req.body.docId - ID of the document to get information about
   * @returns {Promise<void>}
   */
  static async getFileInformation(req, res) {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({ error: "File id is required" });
    }

    try {
      const document = await Document.findById(docId);
      if (!document) {
        return res.status(404).json({ error: "File not found" });
      }

      return res.status(200).json({
        message: "File information retrieved successfully",
        file: document,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }
}

module.exports = FileController;