const fs = require("fs");
const path = require("path");
const Document = require("../models/documents");
const Bot = require("../models/bots");
const { documentValidationSchema } = require("../utils/joi");
const NodeZip = require("node-zip");

class FileControler {
  static async uploadFile(req, res) {
    if(!req.file) {
      res.status(400).json({
        error: "No file uploadeded",
      });
      return;
    }
    //validate that only pdf files are uploaded

    const fileDetails = {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      content: req.file.buffer,
      createdAt: new Date(),
      //play with the path to get the right path
      path: req.file.path,
    };
    try {
      const newDoc = new Document(fileDetails);
      await newDoc.save();
      res.status(200).json({
        message: "File uploaded successfully",
        file: newDoc,
      });
      return
    }
    catch (error) {
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

  static async uploadMultipleFiles(req, res) {
    //multiple file upload
    if(!req.files || req.files.length === 0) {
      res.status(400).json({
        error: "No files uploaded",
      });
      return;
    }

    try {
      const documents = [];
      for (const file of req.files) {
        const fileDetails = {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          content: file.buffer,
          createdAt: new Date(),
          //play with the path to get the right path
          path: file.path
        }
        const newDoc = new Document(fileDetails);
        await newDoc.save();
        documents.push(newDoc);
    }
    res.status(200).json({
      message: "Files uploaded successfully",
      files: documents,
    });
  

  } catch (error) {
    res.status(500).json({
      error: `Internal server error: ${error}`,
    });
    return;
  }}

  static async downloadFile(req, res) {
    //download file
    try {
      //handle jwt for the files
      const { docId } = req.bod
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
      res.setHeader("Content-Disposition", `attachment; filename=${document.name}`);
      res.download(document.path, document.name);
      res.status(200).json({
        message: "File downloading successfully"
      })
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }

  }

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
      documents.forEach((document) => {
        const filepath = path.join(__dirname, document.path);
        if (!fs.existsSync(filepath)) {
          res.status(404).json({
            error: "File not found on server",
            file : document.name
          });
          continue;
        }
        zip.file(document.name, fs.readFileSync(filepath));
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

  static async deleteFile(req, res) {
    //delete file
  }

  static async deleteFiles(req, res) {
    //delete multiple files
  }

  static async getFileInformation(req, res) {
    //send information about a file
  }
}
