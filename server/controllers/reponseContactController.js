const db = require("../db");
const envoyerEmailClient = require("../services/emailService");

console.log("🔥 reponseContactController.js CHARGE");

// ========================================
// ENVOYER UNE REPONSE CLIENT
// ========================================

exports.envoyerReponse = async (req, res) => {

    console.log("====================================");
    console.log("🚨 POST /api/reponses REÇU");
    console.log("BODY :", req.body);
    console.log("====================================");

    try {

        const { id_contact, message } = req.body;

        // 1. Vérification
        if (!id_contact || !message || !String(message).trim()) {

            return res.status(400).json({
                success: false,
                message: "Données manquantes."
            });

        }

        const contenu = String(message).trim();

        // 2. Récupérer le contact
        const [contacts] = await db.query(
            "SELECT * FROM contact WHERE id_contact = ?",
            [id_contact]
        );

        if (contacts.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Contact introuvable."
            });

        }

        const contact = contacts[0];

        console.log("📧 DESTINATAIRE :", contact.email);

        // 3. Enregistrer la réponse
        await db.query(
            `INSERT INTO reponse_contact
            (id_contact, message)
            VALUES (?, ?)`,
            [id_contact, contenu]
        );

        console.log("✅ Réponse enregistrée.");

        // 4. Changer le statut
        await db.query(
            `UPDATE contact
            SET statut = 'Traité'
            WHERE id_contact = ?`,
            [id_contact]
        );

        console.log("✅ Contact marqué comme traité.");

        // 5. Répondre immédiatement au frontend
        res.status(200).json({

            success: true,

            message: "Réponse enregistrée avec succès.",

            emailEnCours: Boolean(contact.email)

        });

        // 6. Envoyer l'email en arrière-plan
        setImmediate(async () => {

            try {

                if (!contact.email) {

                    console.error(
                        "⚠️ Adresse email du contact inexistante."
                    );

                    return;
                }

                await envoyerEmailClient(
                    contact.email,
                    "Réponse à votre demande - Plateforme touristique",
                    contenu
                );

                console.log(
                    "✅ ENVOI EMAIL TERMINÉ POUR :",
                    contact.email
                );

            } catch (emailError) {

                console.error(
                    "❌ ÉCHEC ENVOI EMAIL EN ARRIÈRE-PLAN :",
                    emailError.message
                );

            }

        });

    } catch (error) {

        console.error("❌ ERREUR RÉPONSE CONTACT :", error);

        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message: "Erreur lors de l'enregistrement de la réponse.",

                error: process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

            });

        }

    }

};