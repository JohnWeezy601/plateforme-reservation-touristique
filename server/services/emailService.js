
const escapeHTML = (text) => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ========================================
// ENVOI EMAIL CLIENT VIA API BREVO
// ========================================

const envoyerEmailClient = async (email, sujet, message) => {

    console.log("====================================");
    console.log("📨 PRÉPARATION EMAIL VIA API BREVO");
    console.log("DESTINATAIRE :", email);
    console.log("SUJET :", sujet);
    console.log("====================================");

    if (!email) {
        throw new Error("Adresse du destinataire manquante.");
    }

    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY est absente.");
    }

    if (!process.env.EMAIL_FROM) {
        throw new Error("EMAIL_FROM est absente.");
    }

    const contenu = String(message || "").trim();

    if (!contenu) {
        throw new Error("Le contenu de l'e-mail est vide.");
    }

    const contenuHTML = escapeHTML(contenu)
        .replace(/\r?\n/g, "<br>");

    try {

        console.log("⏳ Début de l'envoi via HTTPS...");

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: {
                        name: "Plateforme touristique",
                        email: process.env.EMAIL_FROM
                    },

                    to: [
                        { email: email }
                    ],

                    subject: sujet,

                    textContent: contenu,

                    htmlContent: `
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

                            <p>Merci pour votre confiance.</p>

                            <p>
                                Cordialement,<br>
                                <strong>
                                    L'équipe de la Plateforme touristique
                                </strong>
                            </p>

                        </div>
                    `
                })
            }
        );

        const responseText = await response.text();

        let resultat = {};

        try {
            resultat = responseText ? JSON.parse(responseText) : {};
        } catch {
            resultat = { message: responseText };
        }

        if (!response.ok) {
            console.error("❌ ERREUR API BREVO");
            console.error("Statut HTTP :", response.status);
            console.error("Réponse :", resultat);

            throw new Error(
                resultat.message ||
                `Erreur API Brevo : HTTP ${response.status}`
            );
        }

        console.log("====================================");
        console.log("✅ EMAIL ACCEPTÉ PAR BREVO");
        console.log("Message ID :", resultat.messageId);
        console.log("====================================");

        return resultat;

    } catch (error) {

        console.error("====================================");
        console.error("❌ ERREUR ENVOI EMAIL BREVO");
        console.error("Message :", error.message);
        console.error("====================================");

        throw error;
    }
};

module.exports = envoyerEmailClient;
