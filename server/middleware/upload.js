const multer = require("multer");
const path = require("path");
const fs = require("fs");



// ==================================
// Création dossier uploads
// ==================================

const uploadDir = path.join(
    __dirname,
    "../uploads"
);



if(!fs.existsSync(uploadDir)){


    fs.mkdirSync(
        uploadDir,
        {
            recursive:true
        }
    );


}





// ==================================
// Configuration stockage
// ==================================

const storage = multer.diskStorage({


    destination:(req,file,cb)=>{


        cb(
            null,
            uploadDir
        );


    },




    filename:(req,file,cb)=>{


        const extension =
        path.extname(
            file.originalname
        ).toLowerCase();



        const nomOriginal =
        path.basename(
            file.originalname,
            extension
        )
        .replace(/\s+/g,"-")
        .replace(/[^a-zA-Z0-9-_]/g,"");



        const nomFichier =

        Date.now()
        +
        "-"
        +
        nomOriginal
        +
        extension;



        cb(
            null,
            nomFichier
        );



    }



});








// ==================================
// Vérification fichier image
// ==================================


const fileFilter=(req,file,cb)=>{


    const extensionsAutorisees=[

        ".jpg",
        ".jpeg",
        ".png",
        ".webp"

    ];



    const extension =

    path.extname(
        file.originalname
    )
    .toLowerCase();




    if(
        extensionsAutorisees.includes(extension)
    ){


        cb(
            null,
            true
        );


    }
    else{


        cb(

            new Error(
                "Format image non autorisé"
            ),

            false

        );


    }



};







// ==================================
// Multer
// ==================================


const upload = multer({


    storage:storage,


    fileFilter:fileFilter,


    limits:{


        fileSize:
        5 * 1024 * 1024


    }



});





module.exports = upload;