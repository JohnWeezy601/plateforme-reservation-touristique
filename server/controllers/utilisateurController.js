
const db = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");

const cloudinary = require("cloudinary").v2;

const fs = require("fs");


// =====================================================
// CONFIGURATION CLOUDINARY
// =====================================================

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});


// =====================================================
// CONFIGURATION GOOGLE
// =====================================================

const googleClient = new OAuth2Client(

    process.env.GOOGLE_CLIENT_ID

);


// =====================================================
// AJOUT UTILISATEUR
// =====================================================

exports.register = async (req, res) => {

    const {

        nom,

        prenom,

        email,

        mot_de_passe,

        password,

        telephone,

        role

    } = req.body;


    const passwordFinal =
        password || mot_de_passe;


    try {

        // =====================================================
        // VÉRIFIER MOT DE PASSE
        // =====================================================

        if (!passwordFinal) {

            return res.status(400).json({

                message:
                    "Le mot de passe est obligatoire"

            });

        }


        // =====================================================
        // RÔLES AUTORISÉS
        // =====================================================

        const rolesAutorises = [

            "Administrateur",

            "Touriste",

            "Prestataire"

        ];


        if (!rolesAutorises.includes(role)) {

            return res.status(400).json({

                message: "Rôle invalide"

            });

        }


        // =====================================================
        // VÉRIFIER EMAIL EXISTANT
        // =====================================================

        const [emailExiste] = await db.query(

            `
            SELECT id_utilisateur

            FROM utilisateur

            WHERE email=?
            `,

            [

                email

            ]

        );


        if (emailExiste.length > 0) {

            return res.status(400).json({

                message:
                    "Cet email existe déjà"

            });

        }


        // =====================================================
        // HASH MOT DE PASSE
        // =====================================================

        const hashPassword =
            await bcrypt.hash(

                passwordFinal,

                10

            );


        // =====================================================
        // INSERTION
        // =====================================================

        const [result] = await db.query(

            `
            INSERT INTO utilisateur
            (
                nom,
                prenom,
                email,
                mot_de_passe,
                telephone,
                role,
                provider
            )

            VALUES (?,?,?,?,?,?,?)
            `,

            [

                nom,

                prenom,

                email,

                hashPassword,

                telephone,

                role,

                "local"

            ]

        );


        res.json({

            message:
                "Utilisateur ajouté avec succès",

            id:
                result.insertId

        });

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur ajout utilisateur",

            error:
                error.message

        });

    }

};


// =====================================================
// LOGIN CLASSIQUE
// =====================================================

exports.login = async (req, res) => {

    const {

        email,

        mot_de_passe

    } = req.body;


    try {

        const [result] = await db.query(

            `
            SELECT *

            FROM utilisateur

            WHERE email=?
            `,

            [

                email

            ]

        );


        if (result.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        const utilisateur =
            result[0];


        // =====================================================
        // VÉRIFIER MOT DE PASSE
        // =====================================================

        if (!utilisateur.mot_de_passe) {

            return res.status(401).json({

                message:
                    "Ce compte utilise une connexion Google"

            });

        }


        const passwordOK =
            await bcrypt.compare(

                mot_de_passe,

                utilisateur.mot_de_passe

            );


        if (!passwordOK) {

            return res.status(401).json({

                message:
                    "Mot de passe incorrect"

            });

        }


        // =====================================================
        // TOKEN JWT
        // =====================================================

        const token =
            jwt.sign(

                {

                    id:
                        utilisateur.id_utilisateur,

                    role:
                        utilisateur.role

                },

                process.env.JWT_SECRET,

                {

                    expiresIn: "1h"

                }

            );


        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Connexion réussie",

            token,

            utilisateur: {

                id:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom,

                email:
                    utilisateur.email,

                role:
                    utilisateur.role,

                photo:
                    utilisateur.photo

            }

        });

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur serveur"

        });

    }

};


// =====================================================
// CONNEXION AVEC GOOGLE
// =====================================================

exports.googleLogin = async (req, res) => {

    const { credential } = req.body;


    try {

        // =====================================================
        // VÉRIFIER LE CREDENTIAL GOOGLE
        // =====================================================

        if (!credential) {

            return res.status(400).json({

                message:
                    "Token Google manquant"

            });

        }


        const ticket =
            await googleClient.verifyIdToken({

                idToken:
                    credential,

                audience:
                    process.env.GOOGLE_CLIENT_ID

            });


        const payload =
            ticket.getPayload();


        // =====================================================
        // INFORMATIONS GOOGLE
        // =====================================================

        const googleId =
            payload.sub;

        const email =
            payload.email;

        const emailVerified =
            payload.email_verified;

        const nom =
            payload.family_name || "";

        const prenom =
            payload.given_name || "";

        const photo =
            payload.picture || null;


        // =====================================================
        // EMAIL GOOGLE VÉRIFIÉ
        // =====================================================

        if (!emailVerified) {

            return res.status(401).json({

                message:
                    "L'adresse email Google n'est pas vérifiée"

            });

        }


        // =====================================================
        // CHERCHER UN COMPTE GOOGLE EXISTANT
        // =====================================================

        const [utilisateursGoogle] =
            await db.query(

                `
                SELECT *

                FROM utilisateur

                WHERE provider=?

                AND provider_id=?
                `,

                [

                    "google",

                    googleId

                ]

            );


        let utilisateur;


        // =====================================================
        // COMPTE GOOGLE EXISTANT
        // =====================================================

        if (utilisateursGoogle.length > 0) {

            utilisateur =
                utilisateursGoogle[0];

        }

        else {

            // =====================================================
            // CHERCHER PAR EMAIL
            // =====================================================

            const [utilisateursEmail] =
                await db.query(

                    `
                    SELECT *

                    FROM utilisateur

                    WHERE email=?
                    `,

                    [

                        email

                    ]

                );


            // =====================================================
            // EMAIL DÉJÀ EXISTANT
            // =====================================================

            if (utilisateursEmail.length > 0) {

                utilisateur =
                    utilisateursEmail[0];


                // =====================================================
                // ASSOCIER LE COMPTE EXISTANT À GOOGLE
                // =====================================================

                await db.query(

                    `
                    UPDATE utilisateur

                    SET

                        provider=?,

                        provider_id=?

                    WHERE id_utilisateur=?
                    `,

                    [

                        "google",

                        googleId,

                        utilisateur.id_utilisateur

                    ]

                );


                utilisateur.provider =
                    "google";

                utilisateur.provider_id =
                    googleId;

            }

            else {

                // =====================================================
                // CRÉER NOUVEL UTILISATEUR GOOGLE
                // =====================================================

                const [result] =
                    await db.query(

                        `
                        INSERT INTO utilisateur
                        (
                            nom,
                            prenom,
                            email,
                            mot_de_passe,
                            provider,
                            provider_id,
                            telephone,
                            role,
                            photo
                        )

                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,

                        [

                            nom,

                            prenom,

                            email,

                            null,

                            "google",

                            googleId,

                            null,

                            "Touriste",

                            photo

                        ]

                    );


                const [nouvelUtilisateur] =
                    await db.query(

                        `
                        SELECT *

                        FROM utilisateur

                        WHERE id_utilisateur=?
                        `,

                        [

                            result.insertId

                        ]

                    );


                utilisateur =
                    nouvelUtilisateur[0];

            }

        }


        // =====================================================
        // CRÉER JWT
        // =====================================================

        const token =
            jwt.sign(

                {

                    id:
                        utilisateur.id_utilisateur,

                    role:
                        utilisateur.role

                },

                process.env.JWT_SECRET,

                {

                    expiresIn: "1h"

                }

            );


        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Connexion Google réussie",

            token,

            utilisateur: {

                id:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom,

                email:
                    utilisateur.email,

                role:
                    utilisateur.role,

                photo:
                    utilisateur.photo

            }

        });

    }

    catch (error) {

        console.log(
            "❌ Erreur connexion Google :",
            error
        );


        res.status(500).json({

            message:
                "Erreur lors de la connexion avec Google",

            error:
                error.message

        });

    }

};


// =====================================================
// MODIFIER UTILISATEUR
// =====================================================

exports.updateUtilisateur = async (req, res) => {

    const id =
        req.params.id;


    const {

        nom,

        prenom,

        email,

        telephone,

        role

    } = req.body;


    try {

        const rolesAutorises = [

            "Administrateur",

            "Touriste",

            "Prestataire"

        ];


        if (!rolesAutorises.includes(role)) {

            return res.status(400).json({

                message:
                    "Rôle invalide"

            });

        }


        await db.query(

            `
            UPDATE utilisateur

            SET

                nom=?,

                prenom=?,

                email=?,

                telephone=?,

                role=?

            WHERE id_utilisateur=?
            `,

            [

                nom,

                prenom,

                email,

                telephone,

                role,

                id

            ]

        );


        res.json({

            message:
                "Utilisateur modifié avec succès"

        });

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur modification utilisateur"

        });

    }

};


// =====================================================
// SUPPRIMER UTILISATEUR
// =====================================================

exports.deleteUtilisateur = async (req, res) => {

    const id =
        req.params.id;


    try {

        await db.query(

            `
            DELETE FROM recommandation_ia

            WHERE id_utilisateur=?
            `,

            [

                id

            ]

        );


        await db.query(

            `
            DELETE FROM notification

            WHERE id_utilisateur=?
            `,

            [

                id

            ]

        );


        await db.query(

            `
            DELETE FROM avis

            WHERE id_utilisateur=?
            `,

            [

                id

            ]

        );


        await db.query(

            `
            DELETE FROM reservation

            WHERE id_utilisateur=?
            `,

            [

                id

            ]

        );


        await db.query(

            `
            DELETE FROM utilisateur

            WHERE id_utilisateur=?
            `,

            [

                id

            ]

        );


        res.json({

            message:
                "Utilisateur supprimé avec succès"

        });

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur suppression utilisateur",

            error:
                error.message

        });

    }

};


// =====================================================
// AFFICHER UTILISATEURS
// =====================================================

exports.getUtilisateurs = async (req, res) => {

    try {

        const [utilisateurs] =
            await db.query(

                `
                SELECT

                    id_utilisateur,

                    nom,

                    prenom,

                    email,

                    telephone,

                    role,

                    photo,

                    date_inscription

                FROM utilisateur

                ORDER BY date_inscription DESC
                `

            );


        res.json(
            utilisateurs
        );

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur récupération utilisateurs"

        });

    }

};


// =====================================================
// AFFICHER UN UTILISATEUR PAR ID
// =====================================================

exports.getUtilisateurById = async (req, res) => {

    const id =
        req.params.id;


    try {

        const [utilisateur] =
            await db.query(

                `
                SELECT

                    id_utilisateur,

                    nom,

                    prenom,

                    email,

                    telephone,

                    role,

                    photo,

                    date_inscription

                FROM utilisateur

                WHERE id_utilisateur=?
                `,

                [

                    id

                ]

            );


        if (utilisateur.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        res.json(
            utilisateur[0]
        );

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur récupération utilisateur"

        });

    }

};


// =====================================================
// MODIFIER PHOTO UTILISATEUR
// =====================================================

exports.updatePhoto = async (req, res) => {

    const id =
        req.params.id;


    if (!req.file) {

        return res.status(400).json({

            message:
                "Aucune photo envoyée"

        });

    }


    try {

        const [utilisateurs] =
            await db.query(

                `
                SELECT photo

                FROM utilisateur

                WHERE id_utilisateur=?
                `,

                [

                    id

                ]

            );


        if (utilisateurs.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        const anciennePhoto =
            utilisateurs[0].photo;


        console.log(
            "☁️ Upload photo utilisateur vers Cloudinary..."
        );


        const resultat =
            await cloudinary.uploader.upload(

                req.file.path,

                {

                    folder:
                        "plateforme-touristique/utilisateurs",

                    resource_type:
                        "image"

                }

            );


        console.log(
            "✅ Upload Cloudinary réussi"
        );


        console.log(
            "URL :",
            resultat.secure_url
        );


        console.log(
            "Public ID :",
            resultat.public_id
        );


        const nouvellePhoto =
            resultat.secure_url;


        await db.query(

            `
            UPDATE utilisateur

            SET photo=?

            WHERE id_utilisateur=?
            `,

            [

                nouvellePhoto,

                id

            ]

        );


        console.log(
            "✅ Base de données mise à jour"
        );


        if (

            anciennePhoto &&

            anciennePhoto.includes(
                "res.cloudinary.com"
            )

        ) {

            try {

                const partie =
                    anciennePhoto.split(
                        "/upload/"
                    )[1];


                if (partie) {

                    const sansVersion =
                        partie.replace(
                            /^v\d+\//,
                            ""
                        );


                    const publicIdAncien =
                        sansVersion.replace(
                            /\.[^/.]+$/,
                            ""
                        );


                    console.log(
                        "🗑️ Suppression ancienne photo :",
                        publicIdAncien
                    );


                    await cloudinary.uploader.destroy(

                        publicIdAncien,

                        {

                            resource_type:
                                "image"

                        }

                    );


                    console.log(
                        "✅ Ancienne photo supprimée de Cloudinary"
                    );

                }

            }

            catch (cloudinaryError) {

                console.log(

                    "⚠️ Impossible de supprimer l'ancienne photo Cloudinary :",

                    cloudinaryError.message

                );

            }

        }


        try {

            if (

                req.file.path &&

                fs.existsSync(
                    req.file.path
                )

            ) {

                fs.unlinkSync(
                    req.file.path
                );

                console.log(
                    "🗑️ Fichier local temporaire supprimé"
                );

            }

        }

        catch (fileError) {

            console.log(

                "⚠️ Impossible de supprimer le fichier local :",

                fileError.message

            );

        }


        res.json({

            message:
                "Photo modifiée avec succès",

            photo:
                nouvellePhoto,

            public_id:
                resultat.public_id

        });

    }

    catch (error) {

        console.log(
            "❌ Erreur modification photo :",
            error
        );


        res.status(500).json({

            message:
                "Erreur lors de la modification de la photo",

            error:
                error.message

        });

    }

};

