require("dotenv").config();

const cloudinary = require("./config/cloudinary");

async function testCloudinary() {
    try {
        console.log("=================================");
        console.log("TEST CLOUDINARY");
        console.log("=================================");

        console.log("Cloud name :", process.env.CLOUDINARY_CLOUD_NAME);
        console.log("API key    :", process.env.CLOUDINARY_API_KEY);

        const result = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
            {
                folder: "plateforme-reservation-touristique/test"
            }
        );

        console.log("=================================");
        console.log("UPLOAD CLOUDINARY RÉUSSI !");
        console.log("=================================");

        console.log("Public ID :", result.public_id);
        console.log("URL       :", result.secure_url);

    } catch (error) {

        console.log("=================================");
        console.log("ERREUR CLOUDINARY");
        console.log("=================================");

        console.error(error);
    }
}

testCloudinary();