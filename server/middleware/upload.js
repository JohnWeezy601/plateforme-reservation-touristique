const multer = require("multer");
const path = require("path");


// ==========================================
// STOCKAGE EN MÉMOIRE
// ==========================================
//
// Le fichier reste temporairement dans :
// req.file.buffer
//
// Il sera ensuite envoyé vers Cloudinary.
// ==========================================

const storage = multer.memoryStorage();


// ==========================================
// TYPES DE FICHIERS AUTORISÉS
// ==========================================

const fileFilter = (req, file, cb) => {

    const extensionsAutorisees = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".pdf"
    ];


    const extension = path
        .extname(file.originalname)
        .toLowerCase();


    if (extensionsAutorisees.includes(extension)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Format non autorisé. Utilisez JPG, JPEG, PNG, WEBP ou PDF."
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