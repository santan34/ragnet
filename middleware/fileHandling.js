const path = require('path');
const multer = require('multer');
const fs = require('fs');

/**
 * Configuration constants
 * IMPROVEMENT: Move to environment variables or config file
 */
const CONFIG = {
    UPLOAD_DIR: 'uploads/',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file
    ALLOWED_MIME_TYPES: ['application/pdf'],
    FILE_NAME_MAX_LENGTH: 200,
    SANITIZE_REGEX: /[^a-zA-Z0-9.-]/g
};

/**
 * Ensure upload directory exists
 * IMPROVEMENT: Add proper error handling for directory creation
 */
const ensureUploadDir = () => {
    if (!fs.existsSync(CONFIG.UPLOAD_DIR)) {
        fs.mkdirSync(CONFIG.UPLOAD_DIR, { recursive: true });
    }
};

ensureUploadDir();

/**
 * Custom storage configuration for multer
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CONFIG.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        
        // Sanitize original filename
        const sanitizedOriginalName = path.parse(file.originalname).name
            .replace(CONFIG.SANITIZE_REGEX, '_')
            .substring(0, CONFIG.FILE_NAME_MAX_LENGTH);
            
        // Create final filename
        const filename = `${timestamp}-${randomString}-${sanitizedOriginalName}.pdf`;
        console.log(`Generated filename: ${filename} for original: ${file.originalname}`);
        
        cb(null, filename);
    }
});

/**
 * Validate file before upload
 * @param {Request} req - Express request object
 * @param {File} file - Uploaded file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
    // Validate MIME type
    if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error('Only PDF files are allowed'), false);
    }

    if (req.headers['content-length'] > CONFIG.MAX_FILE_SIZE) {
        return cb(new Error(`File size exceeds ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`), false);
    }

    if (file.originalname.length > CONFIG.FILE_NAME_MAX_LENGTH) {
        return cb(new Error('Filename is too long'), false);
    }

    cb(null, true);
};

/**
 * Multer error handler
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'File upload error',
            message: err.message,
            code: err.code
        });
    }
    
    if (err) {
        return res.status(400).json({
            error: 'Invalid file',
            message: err.message
        });
    }
    
    next();
};

/**
 * Configure multer upload
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: CONFIG.MAX_FILE_SIZE // Limit individual file size only
    }
});

/**
 * SECURITY CONSIDERATIONS:
 * 1. Consider adding a maximum limit to the number of files per request based on your use case
 * 2. Implement virus scanning for uploaded files
 * 3. Add file type validation beyond MIME type checking
 * 4. Implement proper file cleanup for failed uploads
 * 5. Add rate limiting for file uploads
 * 6. Consider implementing file encryption at rest
 * 
 * IMPROVEMENT SUGGESTIONS:
 * 1. Add proper logging system
 * 2. Implement file compression
 * 3. Add support for multiple file types if needed
 * 4. Add file metadata storage
 * 5. Implement progress tracking for large files
 * 6. Consider adding a configurable limit for the number of files based on your use case
 */

module.exports = {
    upload,
    handleMulterError,
    CONFIG
};