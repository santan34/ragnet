const res = require("express/lib/response");
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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(res.status(400).json({
      error: "Only pdf files are allowed",
    }));
    return;
    //potentially problematic
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

 module.exports = upload;
