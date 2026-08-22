const db = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { OAuth2Client } =
    require("google-auth-library");

const cloudinary =
    require("cloudinary").v2;


// =====================================================
// CONFIGURATION CLOUDINARY
// =====================================================

cloudinary.config({

    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET

});


// =====================================================
// CONFIGURATION GOOGLE
// =====================================================

const googleClient =
    new OAuth2Client(
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

                message:
                    "Rôle invalide"

            });

        }


        // =====================================================
        // VÉRIFIER EMAIL
        // =====================================================

        const [emailExiste] =
            await db.query(

                `
                SELECT id_utilisateur

                FROM utilisateur

                WHERE email=?
                `,

                [email]

            );


        if (emailExiste.length > 0) {

            return res.status(400).json({

                message:
                    "Cet email existe déjà"

            });

        }


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashPassword =
            await bcrypt.hash(
                passwordFinal,
                10
            );


        // =====================================================
        // INSERTION
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

        const [result] =
            await db.query(

                `
                SELECT *

                FROM utilisateur

                WHERE email=?
                `,

                [email]

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
        // PASSWORD
        // =====================================================

        if (!utilisateur.mot_de_passe) {

            return res.status(401).json({

                message:
                    "Ce compte utilise une connexion Google ou Facebook"

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
        // JWT
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

                    expiresIn:
                        "1h"

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

                id_utilisateur:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom,

                email:
                    utilisateur.email,

                telephone:
                    utilisateur.telephone,

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
// GOOGLE LOGIN
// =====================================================

exports.googleLogin = async (req, res) => {

    const { credential } =
        req.body;


    try {

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


        if (!emailVerified) {

            return res.status(401).json({

                message:
                    "L'adresse email Google n'est pas vérifiée"

            });

        }


        // =====================================================
        // CHERCHER GOOGLE
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


        if (utilisateursGoogle.length > 0) {

            utilisateur =
                utilisateursGoogle[0];

        }

        else {

            const [utilisateursEmail] =
                await db.query(

                    `
                    SELECT *

                    FROM utilisateur

                    WHERE email=?
                    `,

                    [email]

                );


            if (utilisateursEmail.length > 0) {

                utilisateur =
                    utilisateursEmail[0];


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

                        [result.insertId]

                    );


                utilisateur =
                    nouvelUtilisateur[0];

            }

        }


        // =====================================================
        // JWT
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

                    expiresIn:
                        "1h"

                }

            );


        res.json({

            message:
                "Connexion Google réussie",

            token,

            utilisateur: {

                id:
                    utilisateur.id_utilisateur,

                id_utilisateur:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom,

                email:
                    utilisateur.email,

                telephone:
                    utilisateur.telephone,

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
// FACEBOOK LOGIN
// =====================================================

exports.facebookLogin = async (req, res) => {

    const { accessToken } =
        req.body;


    try {

        if (!accessToken) {

            return res.status(400).json({

                message:
                    "Token Facebook manquant"

            });

        }


        const url =
            `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!response.ok || data.error) {

            console.log(
                "❌ Erreur API Facebook :",
                data
            );


            return res.status(401).json({

                message:
                    "Token Facebook invalide ou expiré"

            });

        }


        const facebookId =
            data.id;

        const email =
            data.email || null;

        const nom =
            data.last_name || "";

        const prenom =
            data.first_name || "";

        const photo =
            data.picture &&
            data.picture.data
                ? data.picture.data.url
                : null;


        if (!email) {

            return res.status(400).json({

                message:
                    "Impossible de récupérer l'adresse email Facebook"

            });

        }


        const [utilisateursFacebook] =
            await db.query(

                `
                SELECT *

                FROM utilisateur

                WHERE provider=?

                AND provider_id=?
                `,

                [

                    "facebook",
                    facebookId

                ]

            );


        let utilisateur;


        if (utilisateursFacebook.length > 0) {

            utilisateur =
                utilisateursFacebook[0];

        }

        else {

            const [utilisateursEmail] =
                await db.query(

                    `
                    SELECT *

                    FROM utilisateur

                    WHERE email=?
                    `,

                    [email]

                );


            if (utilisateursEmail.length > 0) {

                utilisateur =
                    utilisateursEmail[0];


                await db.query(

                    `
                    UPDATE utilisateur

                    SET

                        provider=?,

                        provider_id=?,

                        photo=COALESCE(photo, ?)

                    WHERE id_utilisateur=?
                    `,

                    [

                        "facebook",
                        facebookId,
                        photo,
                        utilisateur.id_utilisateur

                    ]

                );


                utilisateur.provider =
                    "facebook";

                utilisateur.provider_id =
                    facebookId;


                if (!utilisateur.photo) {

                    utilisateur.photo =
                        photo;

                }

            }

            else {

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
                            "facebook",
                            facebookId,
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

                        [result.insertId]

                    );


                utilisateur =
                    nouvelUtilisateur[0];

            }

        }


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

                    expiresIn:
                        "1h"

                }

            );


        res.json({

            message:
                "Connexion Facebook réussie",

            token,

            utilisateur: {

                id:
                    utilisateur.id_utilisateur,

                id_utilisateur:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom,

                email:
                    utilisateur.email,

                telephone:
                    utilisateur.telephone,

                role:
                    utilisateur.role,

                photo:
                    utilisateur.photo

            }

        });

    }

    catch (error) {

        console.log(
            "❌ Erreur connexion Facebook :",
            error
        );


        res.status(500).json({

            message:
                "Erreur lors de la connexion avec Facebook",

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


        // =====================================================
        // RÉCUPÉRER UTILISATEUR MIS À JOUR
        // =====================================================

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

                WHERE id_utilisateur=?
                `,

                [id]

            );


        res.json({

            message:
                "Utilisateur modifié avec succès",

            utilisateur:
                utilisateurs[0]

        });

    }

    catch (error) {

        console.log(error);


        res.status(500).json({

            message:
                "Erreur modification utilisateur",

            error:
                error.message

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

            [id]

        );


        await db.query(

            `
            DELETE FROM notification

            WHERE id_utilisateur=?
            `,

            [id]

        );


        await db.query(

            `
            DELETE FROM avis

            WHERE id_utilisateur=?
            `,

            [id]

        );


        await db.query(

            `
            DELETE FROM reservation

            WHERE id_utilisateur=?
            `,

            [id]

        );


        // =====================================================
        // HISTORIQUE PHOTOS PROFIL
        // =====================================================

        await db.query(

            `
            DELETE FROM photo_profil_historique

            WHERE id_utilisateur=?
            `,

            [id]

        );


        await db.query(

            `
            DELETE FROM utilisateur

            WHERE id_utilisateur=?
            `,

            [id]

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
// AFFICHER UN UTILISATEUR
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

                [id]

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
// IMPORTANT :
// L'ANCIENNE PHOTO N'EST PLUS SUPPRIMÉE.
// ELLE EST CONSERVÉE DANS
// photo_profil_historique.
// =====================================================

exports.updatePhoto = async (req, res) => {

    const id =
        req.params.id;


    // =====================================================
    // VÉRIFIER FICHIER
    // =====================================================

    if (!req.file) {

        return res.status(400).json({

            message:
                "Aucune photo envoyée"

        });

    }


    try {

        // =====================================================
        // RÉCUPÉRER UTILISATEUR
        // =====================================================

        const [utilisateurs] =
            await db.query(

                `
                SELECT

                    id_utilisateur,
                    photo

                FROM utilisateur

                WHERE id_utilisateur=?
                `,

                [id]

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
            "☁️ Upload nouvelle photo vers Cloudinary..."
        );


        // =====================================================
        // UPLOAD CLOUDINARY
        // =====================================================

        const resultat =
            await new Promise(

                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(

                            {

                                folder:
                                    "plateforme-touristique/utilisateurs",

                                resource_type:
                                    "image"

                            },

                            (error, result) => {

                                if (error) {

                                    reject(error);

                                }

                                else {

                                    resolve(result);

                                }

                            }

                        );


                    stream.end(
                        req.file.buffer
                    );

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


        // =====================================================
        // SAUVEGARDER L'ANCIENNE PHOTO
        // =====================================================
        //
        // ON NE LA SUPPRIME PLUS DE CLOUDINARY.
        //
        // =====================================================

        if (anciennePhoto) {

            console.log(
                "📸 Conservation de l'ancienne photo"
            );


            await db.query(

                `
                INSERT INTO photo_profil_historique
                (
                    id_utilisateur,
                    photo,
                    public_id
                )

                VALUES (?, ?, ?)
                `,

                [

                    id,

                    anciennePhoto,

                    extrairePublicIdCloudinary(
                        anciennePhoto
                    )

                ]

            );

        }


        // =====================================================
        // METTRE À JOUR PHOTO ACTUELLE
        // =====================================================

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
            "✅ Photo actuelle mise à jour"
        );


        // =====================================================
        // RÉCUPÉRER UTILISATEUR MIS À JOUR
        // =====================================================

        const [utilisateurMisAJour] =
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

                [id]

            );


        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Photo modifiée avec succès",

            photo:
                nouvellePhoto,

            public_id:
                resultat.public_id,

            utilisateur:
                utilisateurMisAJour[0]

        });

    }

    catch (error) {

        console.error(
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


// =====================================================
// EXTRAIRE PUBLIC ID CLOUDINARY
// =====================================================

function extrairePublicIdCloudinary(photoUrl) {

    if (!photoUrl) {

        return null;

    }


    // =====================================================
    // SI CE N'EST PAS UNE URL CLOUDINARY
    // =====================================================

    if (
        !photoUrl.includes(
            "res.cloudinary.com"
        )
    ) {

        return null;

    }


    try {

        const partie =
            photoUrl.split(
                "/upload/"
            )[1];


        if (!partie) {

            return null;

        }


        const sansVersion =
            partie.replace(
                /^v\d+\//,
                ""
            );


        return sansVersion.replace(
            /\.[^/.]+$/,
            ""
        );

    }

    catch (error) {

        console.log(
            "⚠️ Impossible d'extraire le public_id :",
            error.message
        );


        return null;

    }

}


// =====================================================
// MES PHOTOS
// =====================================================
// Retourne toutes les anciennes photos de profil.
// La photo actuelle est ajoutée en premier.
// =====================================================

exports.getPhotosProfil = async (req, res) => {

    const id =
        req.params.id;


    try {

        // =====================================================
        // VÉRIFIER UTILISATEUR
        // =====================================================

        const [utilisateurs] =
            await db.query(

                `
                SELECT

                    id_utilisateur,
                    photo

                FROM utilisateur

                WHERE id_utilisateur=?
                `,

                [id]

            );


        if (utilisateurs.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        const utilisateur =
            utilisateurs[0];


        // =====================================================
        // ANCIENNES PHOTOS
        // =====================================================

        const [anciennesPhotos] =
            await db.query(

                `
                SELECT

                    id_photo_profil,
                    id_utilisateur,
                    photo,
                    public_id,
                    date_ajout

                FROM photo_profil_historique

                WHERE id_utilisateur=?

                ORDER BY date_ajout DESC
                `,

                [id]

            );


        // =====================================================
        // CONSTRUIRE RÉPONSE
        // =====================================================

        const photos = [];


        // =====================================================
        // PHOTO ACTUELLE
        // =====================================================

        if (utilisateur.photo) {

            photos.push({

                id_photo_profil:
                    "current",

                id_utilisateur:
                    id,

                photo:
                    utilisateur.photo,

                public_id:
                    null,

                date_ajout:
                    null,

                actuelle:
                    true

            });

        }


        // =====================================================
        // ANCIENNES PHOTOS
        // =====================================================

        anciennesPhotos.forEach(
            (photo) => {

                photos.push({

                    ...photo,

                    actuelle:
                        false

                });

            }
        );


        res.json({

            message:
                "Photos de profil récupérées",

            photos

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur récupération photos profil :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération photos de profil",

            error:
                error.message

        });

    }

};


// =====================================================
// MES POSTS
// =====================================================
// Les photos publiées par le client viennent de
// avis_photo.
// On ne modifie PAS avisPhotoController.
// =====================================================

exports.getPostsUtilisateur = async (req, res) => {

    const id =
        req.params.id;


    try {

        // =====================================================
        // VÉRIFIER UTILISATEUR
        // =====================================================

        const [utilisateurs] =
            await db.query(

                `
                SELECT

                    id_utilisateur

                FROM utilisateur

                WHERE id_utilisateur=?
                `,

                [id]

            );


        if (utilisateurs.length === 0) {

            return res.status(404).json({

                message:
                    "Utilisateur introuvable"

            });

        }


        // =====================================================
        // RÉCUPÉRER LES POSTS AVEC PHOTOS
        // =====================================================

        const [posts] =
            await db.query(

                `
                SELECT

                    a.id_avis,

                    a.id_utilisateur,

                    a.commentaire,

                    a.note,

                    a.date_avis,

                    ap.id_photo,

                    ap.photo,

                    ap.public_id,

                    ap.date_ajout

                FROM avis a

                INNER JOIN avis_photo ap
                    ON ap.id_avis = a.id_avis

                WHERE a.id_utilisateur=?

                ORDER BY
                    a.date_avis DESC,
                    ap.date_ajout ASC
                `,

                [id]

            );


        // =====================================================
        // REGROUPER LES PHOTOS PAR POST
        // =====================================================

        const postsMap =
            new Map();


        posts.forEach(
            (item) => {

                if (
                    !postsMap.has(
                        item.id_avis
                    )
                ) {

                    postsMap.set(

                        item.id_avis,

                        {

                            id_avis:
                                item.id_avis,

                            id_utilisateur:
                                item.id_utilisateur,

                            commentaire:
                                item.commentaire,

                            note:
                                item.note,

                            date_avis:
                                item.date_avis,

                            photos: []

                        }

                    );

                }


                postsMap
                    .get(item.id_avis)
                    .photos
                    .push({

                        id_photo:
                            item.id_photo,

                        photo:
                            item.photo,

                        public_id:
                            item.public_id,

                        date_ajout:
                            item.date_ajout

                    });

            }
        );


        const postsFinal =
            Array.from(
                postsMap.values()
            );


        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Posts utilisateur récupérés",

            posts:
                postsFinal

        });

    }

    catch (error) {

        console.error(
            "❌ Erreur récupération posts utilisateur :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération posts utilisateur",

            error:
                error.message

        });

    }

};