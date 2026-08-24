const db = require("../db");

const crypto = require("crypto");


function genererToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}


async function genererTokens() {

    try {

        console.log(
            "🔐 Génération des tokens..."
        );


        const [paiements] = await db.query(`

            SELECT id_paiement

            FROM paiement

            WHERE statut = 'Paye'

        `);


        console.log(
            `💳 ${paiements.length} paiement(s) payé(s) trouvé(s).`
        );


        for (const paiement of paiements) {


            // Vérifier si un token existe déjà

            const [existant] = await db.query(`

                SELECT id_verification

                FROM verification_recu

                WHERE id_paiement = ?

                LIMIT 1

            `, [
                paiement.id_paiement
            ]);


            if (existant.length > 0) {

                console.log(
                    `⏭️ Paiement ${paiement.id_paiement} : token déjà présent`
                );

                continue;

            }


            const token = genererToken();


            await db.query(`

                INSERT INTO verification_recu
                (
                    id_paiement,
                    token
                )

                VALUES (?, ?)

            `, [
                paiement.id_paiement,
                token
            ]);


            console.log(
                `✅ Paiement ${paiement.id_paiement} → token créé`
            );

        }


        console.log(
            "🎉 Génération terminée."
        );


        process.exit(0);

    }
    catch (error) {

        console.error(
            "❌ Erreur génération tokens :",
            error
        );


        process.exit(1);

    }

}


genererTokens();