const fs = require("fs");

class FileControler {
  static async uploadFile(req, res) {
    //check if the file details are are avilable
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }
    const fileDetails = {
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };
    //maybe save the file details in a database,
    //map the file details to the file
    //files are stored in folder name of the bot

    //HANDLE SINgle file upload
  }

  static async uploadMultipleFiles(req, res) {
    //multiple file upload
  }

  static async downloadFile(req, res) {
    //download file
  }

  static async downloadFiles(req, res) {
    //download multiple files
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
