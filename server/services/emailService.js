const transporter = require("../config/email");

// ========================================
// SÉCURISER LE CONTENU HTML
// ========================================

const escapeHTML = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ========================================
// ENVOYER UN EMAIL AU CLIENT
// ========================================

const envoyerEmailClient = async (email, sujet, message) => {
    if (!email) {
        throw new Error("Adresse e-mail du destinataire manquante.");
    }

    if (!message || !String(message).trim()) {
        throw new Error("Le contenu du message est vide.");
    }

    const contenu = String(message).trim();
    const contenuHTML = escapeHTML(contenu).replace(/\r?\n/g, "<br>");

    console.log("====================================");
    console.log("📨 PRÉPARATION EMAIL");
    console.log("DESTINATAIRE :", email);
    console.log("SUJET :", sujet);
    console.log("CONTENU :", contenu);
    console.log("====================================");

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
                background-color: #f7f7f7;
                color: #333;
            ">

                <div style="
                    background-color: #087f5b;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                ">
                    <h2>Plateforme touristique</h2>
                </div>

                <div style="
                    background-color: white;
                    padding: 25px;
                    border-radius: 0 0 8px 8px;
                ">

                    <h3>Bonjour,</h3>

                    <p>
                        Nous avons répondu à votre demande.
                    </p>

                    <div style="
                        padding: 15px;
                        background-color: #f1f5f9;
                        border-left: 4px solid #087f5b;
                        border-radius: 4px;
                        line-height: 1.7;
                        white-space: normal;
                        overflow-wrap: anywhere;
                    ">
                        ${contenuHTML}
                    </div>

                    <p style="margin-top: 25px;">
                        Merci pour votre confiance.
                    </p>

                    <p>
                        Cordialement,<br>
                        <strong>L'équipe de la Plateforme touristique</strong>
                    </p>

                </div>
            </div>
        `
    });

    console.log("====================================");
    console.log("📧 RÉSULTAT ENVOI EMAIL");
    console.log("Message ID :", info.messageId);
    console.log("Acceptés :", info.accepted);
    console.log("Refusés :", info.rejected);
    console.log("====================================");

    if (!info.accepted || info.accepted.length === 0) {
        throw new Error("Le serveur SMTP n'a accepté aucun destinataire.");
    }

    return info;
};

module.exports = envoyerEmailClient;