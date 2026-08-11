require("dotenv").config();


console.log("EMAIL_HOST :", process.env.EMAIL_HOST);

console.log("EMAIL_USER :", process.env.EMAIL_USER);

console.log(
    "EMAIL_PASS début :",
    process.env.EMAIL_PASS.substring(0,12)
);

console.log(
    "EMAIL_PASS longueur :",
    process.env.EMAIL_PASS.length
);