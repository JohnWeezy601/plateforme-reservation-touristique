const { v2: cloudinary } = require("cloudinary");

console.log("====================================");
console.log("        TEST CLOUDINARY");
console.log("====================================");

console.log(
    "NODE_ENV :",
    process.env.NODE_ENV
);

console.log(
    "CLOUDINARY_CLOUD_NAME :",
    process.env.CLOUDINARY_CLOUD_NAME
        ? "OK"
        : "MANQUANT"
);

console.log(
    "CLOUDINARY_API_KEY :",
    process.env.CLOUDINARY_API_KEY
        ? "OK"
        : "MANQUANT"
);

console.log(
    "CLOUDINARY_API_SECRET :",
    process.env.CLOUDINARY_API_SECRET
        ? "OK"
        : "MANQUANT"
);

console.log(
    "Nombre de variables CLOUDINARY :",
    Object.keys(process.env)
        .filter(key => key.startsWith("CLOUDINARY_"))
        .length
);

console.log("====================================");


cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});


module.exports = cloudinary;