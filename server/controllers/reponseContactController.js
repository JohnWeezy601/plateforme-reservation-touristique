const db = require("../db");

const envoyerEmailClient = require("../services/emailService");

console.log("🔥 reponseContactController.js CHARGE");

// =============================
// ENVOYER UNE REPONSE CLIENT
// =============================

exports.envoyerReponse = async (req, res) => {

    console.log("====================================");
    console.log("🚨 POST /api/reponses REÇU");
    console.log("BODY :", req.body);
    console.log("====================================");

    const {
        id_contact,
        message
    } = req.body;

    try {

        // =============================
        // 1. VÉRIFICATION DES DONNÉES
        // =============================

        if (!id_contact || !message || !message.trim()) {

            return res.status(400).json({
                success: false,
                message: "Données manquantes"
            });

        }

        console.log("✅ Données reçues");
        console.log("ID CONTACT :", id_contact);
        console.log("MESSAGE :", message);


        // =============================
        // 2. RÉCUPÉRER LE CONTACT
        // =============================

        console.log("🔎 Recherche du contact...");

        const [contacts] = await db.query(
            "SELECT * FROM contact WHERE id_contact = ?",
            [id_contact]
        );

        console.log("📋 Contacts trouvés :", contacts);

        if (contacts.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Contact introuvable"
            });

        }

        const contact = contacts[0];

        console.log("👤 CONTACT :", contact);
        console.log("📧 EMAIL CLIENT :", contact.email);


        // =============================
        // 3. ENREGISTRER LA RÉPONSE
        // =============================

        console.log("💾 Enregistrement de la réponse...");

        await db.query(
            `
            INSERT INTO reponse_contact
            (
                id_contact,
                message
            )
            VALUES (?, ?)
            `,
            [
                id_contact,
                message.trim()
            ]
        );

        console.log("✅ Réponse enregistrée");


        // =============================
        // 4. ENVOYER L'EMAIL
        // =============================

        console.log("📨 Envoi de l'email...");

        await envoyerEmailClient(
            contact.email,
            "Réponse à votre demande - Plateforme touristique",
            message.trim()
        );

        console.log("✅ Email envoyé");


        // =============================
        // 5. CHANGER LE STATUT
        // =============================

        console.log("🔄 Mise à jour du statut du contact...");

        await db.query(
            `
            UPDATE contact
            SET statut = 'Traité'
            WHERE id_contact = ?
            `,
            [id_contact]
        );

        console.log("✅ Statut du contact mis à jour");


        // =============================
        // 6. SUCCÈS
        // =============================

        return res.status(200).json({

            success: true,

            message: "Réponse envoyée avec succès"

        });

    }

    catch (error) {

        console.error("====================================");
        console.error("❌ ERREUR ENVOI RÉPONSE CONTACT");
        console.error("====================================");

        console.error("Message :", error.message);
        console.error("Code :", error.code);
        console.error("SQL State :", error.sqlState);
        console.error("SQL Message :", error.sqlMessage);
        console.error("Stack :", error.stack);

        console.error("====================================");

        return res.status(500).json({

            success: false,

            message: "Erreur serveur lors de l'envoi de la réponse",

            error: error.message

        });

    }

};