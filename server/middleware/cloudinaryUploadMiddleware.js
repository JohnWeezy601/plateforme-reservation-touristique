const multer = require("multer");
const path = require("path");


// ==================================
// Stockage temporaire en mémoire
// ==================================

const storage = multer.memoryStorage();


// ==================================
// Vérification image
// ==================================

const fileFilter = (req, file, cb) => {

    const extensionsAutorisees = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (extensionsAutorisees.includes(extension)) {

        cb(null, true);

    } else {

        cb(
            new Error("Format image non autorisé"),
            false
        );

    }

};


// ==================================
// Multer
// ==================================

const uploadMiddleware = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


module.exports = uploadMiddleware;