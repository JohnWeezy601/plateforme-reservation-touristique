const { v2: cloudinary } = require("cloudinary");

console.log("========== CLOUDINARY CONFIG ==========");
console.log(
    "CLOUDINARY_CLOUD_NAME présent :",
    !!process.env.CLOUDINARY_CLOUD_NAME
);
console.log(
    "CLOUDINARY_API_KEY présent :",
    !!process.env.CLOUDINARY_API_KEY
);
console.log(
    "CLOUDINARY_API_SECRET présent :",
    !!process.env.CLOUDINARY_API_SECRET
);
console.log(
    "API KEY longueur :",
    process.env.CLOUDINARY_API_KEY
        ? process.env.CLOUDINARY_API_KEY.length
        : 0
);
console.log("=======================================");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;