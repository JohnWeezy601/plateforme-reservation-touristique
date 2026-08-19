const multer = require("multer");
const path = require("path");

// ==========================================
// STOCKAGE EN MÉMOIRE
// ==========================================
// Le fichier est conservé temporairement
// dans req.file.buffer avant son envoi vers
// Cloudinary.

const storage = multer.memoryStorage();


// ==========================================
// TYPES D'IMAGES AUTORISÉS
// ==========================================

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
            new Error(
                "Format image non autorisé. Utilisez JPG, JPEG, PNG ou WEBP."
            ),
            false
        );

    }

};


// ==========================================
// MULTER
// ==========================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});


module.exports = upload;