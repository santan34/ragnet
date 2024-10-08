const multer = require("multer");

const storage = multer.diskStorage({
  //check if file is a pdf
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
