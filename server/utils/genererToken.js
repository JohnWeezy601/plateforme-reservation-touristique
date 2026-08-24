const crypto = require("crypto");

function genererTokenVerification() {

    return crypto.randomBytes(32).toString("hex");

}

module.exports = genererTokenVerification;