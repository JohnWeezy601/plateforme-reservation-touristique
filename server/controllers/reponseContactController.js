const db = require("../db");
const envoyerEmailClient = require("../services/emailService");

console.log("🔥 reponseContactController.js CHARGE");

// ========================================
// ENVOYER UNE RÉPONSE À UN CLIENT
// ========================================

exports.envoyerReponse = async (req, res) => {
    try {
        const { id_contact, message } = req.body;

        console.log("🚨 POST /api/reponses REÇU");
        console.log("ID CONTACT :", id_contact);
        console.log("MESSAGE :", message);

        // 1. Vérifier les données
        if (!id_contact || !message || !String(message).trim()) {
            return res.status(400).json({
                success: false,
                message: "L'identifiant et le message sont obligatoires."
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

        // 4. Modifier le statut
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
            emailEnCours: Boolean(contact.email),
            message: "Réponse enregistrée avec succès. Envoi de l'e-mail en cours."
        });

        // 6. Envoyer l'e-mail en arrière-plan
        setImmediate(async () => {
            try {
                if (!contact.email) {
                    console.log("⚠️ Aucun e-mail pour ce contact.");
                    return;
                }

                const info = await envoyerEmailClient(
                    contact.email,
                    "Réponse à votre demande - Plateforme touristique",
                    contenu
                );

                console.log("✅ EMAIL TRANSMIS AU SERVEUR SMTP");
                console.log("DESTINATAIRE :", contact.email);
                console.log("MESSAGE ID :", info.messageId);

            } catch (emailError) {
                console.error("❌ ÉCHEC ENVOI EMAIL :", emailError);
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