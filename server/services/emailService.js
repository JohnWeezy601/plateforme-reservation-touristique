const transporter = require("../config/email");

// Échapper les caractères HTML
const escapeHTML = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ========================================
// ENVOI EMAIL CLIENT
// ========================================

const envoyerEmailClient = async (email, sujet, message) => {

    console.log("====================================");
    console.log("📨 PRÉPARATION EMAIL");
    console.log("DESTINATAIRE :", email);
    console.log("SUJET :", sujet);
    console.log("CONTENU :", message);
    console.log("====================================");

    if (!email) {
        throw new Error("Adresse du destinataire manquante.");
    }

    const contenu = String(message).trim();

    if (!contenu) {
        throw new Error("Le contenu de l'e-mail est vide.");
    }

    const contenuHTML = escapeHTML(contenu)
        .replace(/\r?\n/g, "<br>");

    try {

        console.log("⏳ Début de sendMail...");

        const info = await transporter.sendMail({

            from: {
                name: "Plateforme touristique",
                address: process.env.EMAIL_FROM
            },

            to: email,

            subject: sujet,

            text: contenu,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 25px;
                    color: #333;
                ">

                    <h2 style="color: #087f5b;">
                        Plateforme touristique
                    </h2>

                    <p>Bonjour,</p>

                    <p>
                        Nous avons répondu à votre demande.
                    </p>

                    <div style="
                        background: #f1f5f9;
                        padding: 20px;
                        border-left: 4px solid #087f5b;
                        line-height: 1.7;
                        overflow-wrap: anywhere;
                    ">
                        ${contenuHTML}
                    </div>

                    <p>
                        Merci pour votre confiance.
                    </p>

                    <p>
                        Cordialement,<br>
                        <strong>
                            L'équipe de la Plateforme touristique
                        </strong>
                    </p>

                </div>
            `

        });

        console.log("====================================");
        console.log("✅ EMAIL TRANSMIS AU SERVEUR SMTP");
        console.log("Message ID :", info.messageId);
        console.log("Acceptés :", info.accepted);
        console.log("Refusés :", info.rejected);
        console.log("Réponse SMTP :", info.response);
        console.log("====================================");

        if (!info.accepted || info.accepted.length === 0) {
            throw new Error("Aucun destinataire accepté par SMTP.");
        }

        return info;

    } catch (error) {

        console.error("====================================");
        console.error("❌ ERREUR ENVOI EMAIL");
        console.error("Message :", error.message);
        console.error("Code :", error.code);
        console.error("Command :", error.command);
        console.error("Response :", error.response);
        console.error("====================================");

        throw error;
    }
};

module.exports = envoyerEmailClient;