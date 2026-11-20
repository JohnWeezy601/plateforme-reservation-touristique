const db = require("../db");
const envoyerEmailClient = require("../services/emailService");

console.log("🔥 reponseContactController.js CHARGE");

// ========================================
// ENVOYER UNE RÉPONSE À UN CLIENT
// ========================================

exports.envoyerReponse = async (req, res) => {
    console.log("====================================");
    console.log("🚨 POST /api/reponses REÇU");
    console.log("BODY :", req.body);
    console.log("====================================");

    try {
        const { id_contact, message } = req.body;

        // 1. Vérifier les données reçues
        if (!id_contact || !message || !String(message).trim()) {
            return res.status(400).json({
                success: false,
                message: "L'identifiant du contact et le message sont obligatoires."
            });
        }

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

        console.log("📧 EMAIL CLIENT :", contact.email);

        // 3. Enregistrer la réponse dans la base de données
        await db.query(
            `INSERT INTO reponse_contact (id_contact, message)
             VALUES (?, ?)`,
            [id_contact, String(message).trim()]
        );

        console.log("✅ Réponse enregistrée dans la base de données.");

        // 4. Mettre à jour le statut du contact
        await db.query(
            `UPDATE contact
             SET statut = 'Traité'
             WHERE id_contact = ?`,
            [id_contact]
        );

        console.log("✅ Statut du contact mis à jour.");

        // 5. Envoyer l'e-mail sans bloquer l'enregistrement
        let emailEnvoye = false;

        try {
            if (contact.email) {
                await envoyerEmailClient(
                    contact.email,
                    "Réponse à votre demande - Plateforme touristique",
                    String(message).trim()
                );

                emailEnvoye = true;

                console.log("✅ E-mail envoyé au client.");
            } else {
                console.log("⚠️ Aucun e-mail disponible pour ce contact.");
            }
        } catch (emailError) {
            console.error(
                "⚠️ Échec de l'envoi de l'e-mail :",
                emailError.message
            );
        }

        // 6. Retourner le résultat
        return res.status(200).json({
            success: true,
            emailEnvoye,
            message: emailEnvoye
                ? "Réponse enregistrée et e-mail envoyé avec succès."
                : "Réponse enregistrée et contact traité, mais l'e-mail n'a pas pu être envoyé."
        });

    } catch (error) {
        console.error("❌ ERREUR RÉPONSE CONTACT :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors de l'enregistrement de la réponse.",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};