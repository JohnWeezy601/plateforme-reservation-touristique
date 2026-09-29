import { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import "./MonEtablissement.css";

function MonEtablissement() {
    // =====================================================
    // ÉTATS
    // =====================================================

    const [utilisateur, setUtilisateur] = useState(null);
    const [etablissement, setEtablissement] = useState(null);

    const [chargement, setChargement] = useState(true);

    const [modificationProfil, setModificationProfil] =
        useState(false);

    const [modificationEtablissement, setModificationEtablissement] =
        useState(false);

    const [sauvegardeProfil, setSauvegardeProfil] =
        useState(false);

    const [sauvegardeEtablissement, setSauvegardeEtablissement] =
        useState(false);

    const [sauvegardePhoto, setSauvegardePhoto] =
        useState(false);

    const [message, setMessage] = useState("");
    const [erreur, setErreur] = useState("");

    // =====================================================
    // RÉFÉRENCE INPUT PHOTO
    // =====================================================

    const inputPhotoRef = useRef(null);

    // =====================================================
    // FORMULAIRE PROFIL
    // =====================================================

    const [profilForm, setProfilForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: ""
    });

    // =====================================================
    // FORMULAIRE ÉTABLISSEMENT
    // =====================================================

    const [etablissementForm, setEtablissementForm] = useState({
        nom_entreprise: "",
        description: "",
        adresse: "",
        ville: "",
        telephone: "",
        email: ""
    });

    // =====================================================
    // CHARGER LES INFORMATIONS
    // =====================================================

    useEffect(() => {
        chargerInformations();
    }, []);

    const chargerInformations = async () => {
        try {
            setChargement(true);
            setErreur("");
            setMessage("");

            // =================================================
            // RÉCUPÉRER UTILISATEUR LOCAL
            // =================================================

            const utilisateurConnecte =
                localStorage.getItem("utilisateur");

            if (!utilisateurConnecte) {
                setErreur("Utilisateur non connecté.");
                return;
            }

            let utilisateurLocal;

            try {
                utilisateurLocal = JSON.parse(
                    utilisateurConnecte
                );
            } catch (error) {
                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

                setErreur(
                    "Les informations de l'utilisateur sont invalides."
                );

                return;
            }

            console.log(
                "UTILISATEUR CONNECTÉ :",
                utilisateurLocal
            );

            // =================================================
            // RÉCUPÉRER ID UTILISATEUR
            // =================================================

            const idUtilisateur =
                utilisateurLocal.id_utilisateur ||
                utilisateurLocal.id;

            console.log(
                "ID UTILISATEUR :",
                idUtilisateur
            );

            if (!idUtilisateur) {
                setErreur(
                    "Identifiant utilisateur introuvable."
                );

                return;
            }

            // =================================================
            // VÉRIFIER LE RÔLE
            // =================================================

            if (
                utilisateurLocal.role !==
                "Prestataire"
            ) {
                setErreur(
                    "Cet espace est réservé aux prestataires."
                );

                return;
            }

            // =================================================
            // RÉCUPÉRER UTILISATEUR
            // =================================================

            const utilisateurResponse =
                await api.get(
                    `/utilisateurs/${idUtilisateur}`
                );

            console.log(
                "UTILISATEUR RÉCUPÉRÉ :",
                utilisateurResponse.data
            );

            const utilisateurData =
                utilisateurResponse.data;

            setUtilisateur(utilisateurData);

            // =================================================
            // REMPLIR FORMULAIRE PROFIL
            // =================================================

            setProfilForm({
                nom:
                    utilisateurData.nom || "",

                prenom:
                    utilisateurData.prenom || "",

                email:
                    utilisateurData.email || "",

                telephone:
                    utilisateurData.telephone || ""
            });

            // =================================================
            // RÉCUPÉRER ÉTABLISSEMENT
            // =================================================

            const prestataireResponse =
                await api.get(
                    `/prestataires/utilisateur/${idUtilisateur}`
                );

            console.log(
                "ÉTABLISSEMENT RÉCUPÉRÉ :",
                prestataireResponse.data
            );

            const prestataireData =
                prestataireResponse.data;

            setEtablissement(
                prestataireData
            );

            // =================================================
            // REMPLIR FORMULAIRE ÉTABLISSEMENT
            // =================================================

            setEtablissementForm({
                nom_entreprise:
                    prestataireData.nom_entreprise ||
                    "",

                description:
                    prestataireData.description ||
                    "",

                adresse:
                    prestataireData.adresse ||
                    "",

                ville:
                    prestataireData.ville ||
                    "",

                telephone:
                    prestataireData.telephone ||
                    "",

                email:
                    prestataireData.email ||
                    ""
            });

        } catch (error) {
            console.error(
                "Erreur récupération informations :",
                error
            );

            if (error.response) {
                console.error(
                    "Statut :",
                    error.response.status
                );

                console.error(
                    "Réponse serveur :",
                    error.response.data
                );
            }

            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les informations."
            );

        } finally {
            setChargement(false);
        }
    };

    // =====================================================
    // MODIFICATION FORMULAIRE PROFIL
    // =====================================================

    const handleProfilChange = (event) => {
        const { name, value } =
            event.target;

        setProfilForm((ancien) => ({
            ...ancien,
            [name]: value
        }));
    };

    // =====================================================
    // MODIFICATION FORMULAIRE ÉTABLISSEMENT
    // =====================================================

    const handleEtablissementChange = (event) => {
        const { name, value } =
            event.target;

        setEtablissementForm((ancien) => ({
            ...ancien,
            [name]: value
        }));
    };

    // =====================================================
    // ANNULER MODIFICATION PROFIL
    // =====================================================

    const annulerModificationProfil = () => {
        if (!utilisateur) {
            return;
        }

        setProfilForm({
            nom: utilisateur.nom || "",
            prenom: utilisateur.prenom || "",
            email: utilisateur.email || "",
            telephone: utilisateur.telephone || ""
        });

        setModificationProfil(false);
    };

    // =====================================================
    // ANNULER MODIFICATION ÉTABLISSEMENT
    // =====================================================

    const annulerModificationEtablissement = () => {
        if (!etablissement) {
            return;
        }

        setEtablissementForm({
            nom_entreprise:
                etablissement.nom_entreprise || "",

            description:
                etablissement.description || "",

            adresse:
                etablissement.adresse || "",

            ville:
                etablissement.ville || "",

            telephone:
                etablissement.telephone || "",

            email:
                etablissement.email || ""
        });

        setModificationEtablissement(false);
    };

    // =====================================================
    // OUVRIR SÉLECTEUR PHOTO
    // =====================================================

    const choisirPhoto = () => {
        if (inputPhotoRef.current) {
            inputPhotoRef.current.click();
        }
    };

    // =====================================================
    // MODIFIER PHOTO DE PROFIL
    // =====================================================

    const handlePhotoChange = async (event) => {
        const fichier = event.target.files?.[0];

        if (!fichier) {
            return;
        }

        // =================================================
        // VÉRIFIER TYPE DE FICHIER
        // =================================================

        if (!fichier.type.startsWith("image/")) {
            setErreur(
                "Veuillez sélectionner une image valide."
            );

            event.target.value = "";
            return;
        }

        // =================================================
        // VÉRIFIER TAILLE
        // =================================================

        const tailleMaximale =
            5 * 1024 * 1024;

        if (fichier.size > tailleMaximale) {
            setErreur(
                "La photo ne doit pas dépasser 5 Mo."
            );

            event.target.value = "";
            return;
        }

        try {
            setSauvegardePhoto(true);
            setErreur("");
            setMessage("");

            if (!utilisateur?.id_utilisateur) {
                setErreur(
                    "Identifiant utilisateur introuvable."
                );

                return;
            }

            // =================================================
            // FORM DATA
            // =================================================

            const formData = new FormData();

            formData.append(
                "photo",
                fichier
            );

            console.log(
                "ENVOI PHOTO PROFIL..."
            );

            // =================================================
            // ENVOYER AU BACKEND
            // =================================================

            const response = await api.put(
                `/utilisateurs/photo/${utilisateur.id_utilisateur}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(
                "PHOTO MODIFIÉE :",
                response.data
            );

            // =================================================
            // RÉCUPÉRER NOUVELLE PHOTO
            // =================================================

            const nouvellePhoto =
                response.data?.photo ||
                response.data?.utilisateur?.photo;

            if (!nouvellePhoto) {
                // Si le backend ne renvoie pas la photo,
                // on recharge les informations.
                await chargerInformations();

                setMessage(
                    "Votre photo de profil a été modifiée avec succès."
                );

                return;
            }

            // =================================================
            // METTRE À JOUR UTILISATEUR
            // =================================================

            const utilisateurMisAJour = {
                ...utilisateur,
                photo: nouvellePhoto
            };

            setUtilisateur(
                utilisateurMisAJour
            );

            // =================================================
            // METTRE À JOUR LOCAL STORAGE
            // =================================================

            const utilisateurLocalString =
                localStorage.getItem(
                    "utilisateur"
                );

            if (utilisateurLocalString) {
                const utilisateurLocal =
                    JSON.parse(
                        utilisateurLocalString
                    );

                const utilisateurLocalMisAJour = {
                    ...utilisateurLocal,
                    photo: nouvellePhoto
                };

                localStorage.setItem(
                    "utilisateur",
                    JSON.stringify(
                        utilisateurLocalMisAJour
                    )
                );
            }

            setMessage(
                "Votre photo de profil a été modifiée avec succès."
            );

        } catch (error) {
            console.error(
                "Erreur modification photo :",
                error
            );

            if (error.response) {
                console.error(
                    "Statut :",
                    error.response.status
                );

                console.error(
                    "Réponse serveur :",
                    error.response.data
                );
            }

            setErreur(
                error.response?.data?.message ||
                "Impossible de modifier votre photo de profil."
            );

        } finally {
            setSauvegardePhoto(false);

            // Permet de sélectionner à nouveau
            // le même fichier si nécessaire.
            event.target.value = "";
        }
    };

    // =====================================================
    // ENREGISTRER PROFIL
    // =====================================================

    const enregistrerProfil = async () => {
        try {
            setSauvegardeProfil(true);
            setErreur("");
            setMessage("");

            if (!utilisateur?.id_utilisateur) {
                setErreur(
                    "Identifiant utilisateur introuvable."
                );

                return;
            }

            // =================================================
            // DONNÉES À ENVOYER
            // =================================================

            const donnees = {
                nom: profilForm.nom,
                prenom: profilForm.prenom,
                email: profilForm.email,
                telephone: profilForm.telephone
            };

            console.log(
                "MODIFICATION PROFIL :",
                donnees
            );

            // =================================================
            // APPEL API
            // =================================================

            const response = await api.put(
                `/utilisateurs/${utilisateur.id_utilisateur}`,
                donnees
            );

            console.log(
                "PROFIL MODIFIÉ :",
                response.data
            );

            // =================================================
            // RÉCUPÉRER UTILISATEUR MIS À JOUR
            // =================================================

            const utilisateurRetour =
                response.data?.utilisateur;

            const utilisateurMisAJour = {
                ...utilisateur,
                nom:
                    utilisateurRetour?.nom ??
                    profilForm.nom,

                prenom:
                    utilisateurRetour?.prenom ??
                    profilForm.prenom,

                email:
                    utilisateurRetour?.email ??
                    profilForm.email,

                telephone:
                    utilisateurRetour?.telephone ??
                    profilForm.telephone
            };

            setUtilisateur(
                utilisateurMisAJour
            );

            // =================================================
            // METTRE À JOUR LOCAL STORAGE
            // =================================================

            const utilisateurLocalString =
                localStorage.getItem(
                    "utilisateur"
                );

            if (utilisateurLocalString) {
                const utilisateurLocal =
                    JSON.parse(
                        utilisateurLocalString
                    );

                const utilisateurLocalMisAJour = {
                    ...utilisateurLocal,
                    nom: profilForm.nom,
                    prenom: profilForm.prenom,
                    email: profilForm.email,
                    telephone: profilForm.telephone
                };

                localStorage.setItem(
                    "utilisateur",
                    JSON.stringify(
                        utilisateurLocalMisAJour
                    )
                );
            }

            setModificationProfil(false);

            setMessage(
                "Votre profil a été modifié avec succès."
            );

        } catch (error) {
            console.error(
                "Erreur modification profil :",
                error
            );

            setErreur(
                error.response?.data?.message ||
                "Impossible de modifier votre profil."
            );

        } finally {
            setSauvegardeProfil(false);
        }
    };

    // =====================================================
    // ENREGISTRER ÉTABLISSEMENT
    // =====================================================

    const enregistrerEtablissement = async () => {
        try {
            setSauvegardeEtablissement(true);
            setErreur("");
            setMessage("");

            if (!etablissement?.id_prestataire) {
                setErreur(
                    "Identifiant du prestataire introuvable."
                );

                return;
            }

            // =================================================
            // DONNÉES À ENVOYER
            // =================================================

            const donnees = {
                nom_entreprise:
                    etablissementForm.nom_entreprise,

                description:
                    etablissementForm.description,

                adresse:
                    etablissementForm.adresse,

                ville:
                    etablissementForm.ville,

                telephone:
                    etablissementForm.telephone,

                email:
                    etablissementForm.email,

                // Le statut reste inchangé.
                statut:
                    etablissement.statut
            };

            console.log(
                "MODIFICATION ÉTABLISSEMENT :",
                donnees
            );

            // =================================================
            // APPEL API
            // =================================================

            await api.put(
                `/prestataires/${etablissement.id_prestataire}`,
                donnees
            );

            // =================================================
            // METTRE À JOUR L'ÉTAT
            // =================================================

            setEtablissement({
                ...etablissement,
                ...etablissementForm
            });

            setModificationEtablissement(
                false
            );

            setMessage(
                "Les informations de votre établissement ont été modifiées avec succès."
            );

        } catch (error) {
            console.error(
                "Erreur modification établissement :",
                error
            );

            setErreur(
                error.response?.data?.message ||
                "Impossible de modifier les informations de l'établissement."
            );

        } finally {
            setSauvegardeEtablissement(false);
        }
    };

    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (chargement) {
        return (
            <div className="mon-etablissement">

                <div className="etablissement-message">

                    <div className="chargement-spinner"></div>

                    <span>
                        Chargement des informations...
                    </span>

                </div>

            </div>
        );
    }

    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (
        <div className="mon-etablissement">

            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="etablissement-header">

                <div>

                    <h1>
                        Mon profil et mon établissement
                    </h1>

                    <p>
                        Gérez vos informations personnelles
                        et celles de votre établissement.
                    </p>

                </div>

            </div>


            {/* =================================================
                MESSAGE DE SUCCÈS
            ================================================= */}

            {message && (
                <div className="etablissement-success">

                    <span>✓</span>

                    <p>
                        {message}
                    </p>

                </div>
            )}


            {/* =================================================
                MESSAGE D'ERREUR
            ================================================= */}

            {erreur && (
                <div className="etablissement-error">

                    <p>
                        {erreur}
                    </p>

                    <button
                        type="button"
                        onClick={chargerInformations}
                    >
                        Réessayer
                    </button>

                </div>
            )}


            {/* =================================================
                PROFIL UTILISATEUR
            ================================================= */}

            {utilisateur && (

                <div className="etablissement-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Mon profil
                            </h2>

                            <p>
                                Vos informations personnelles
                            </p>

                        </div>

                        {!modificationProfil && (

                            <button
                                type="button"
                                className="btn-modifier"
                                onClick={() => {
                                    setMessage("");
                                    setModificationProfil(true);
                                }}
                            >
                                ✏️ Modifier
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        PHOTO ET IDENTITÉ
                    ================================================= */}

                    <div className="profil-identite">

                        <div className="profil-photo-container">

                            <div className="profil-photo">

                                {utilisateur.photo ? (

                                    <img
                                        src={utilisateur.photo}
                                        alt="Photo de profil"
                                    />

                                ) : (

                                    <div className="profil-photo-placeholder">

                                        {(
                                            utilisateur.prenom?.charAt(0) ||
                                            utilisateur.nom?.charAt(0) ||
                                            "P"
                                        ).toUpperCase()}

                                    </div>

                                )}

                                {/* =================================================
                                    BOUTON PHOTO
                                ================================================= */}

                                <button
                                    type="button"
                                    className="btn-photo"
                                    onClick={choisirPhoto}
                                    disabled={sauvegardePhoto}
                                    title="Modifier la photo"
                                >
                                    {sauvegardePhoto
                                        ? "..."
                                        : "📷"}
                                </button>

                                <input
                                    ref={inputPhotoRef}
                                    type="file"
                                    accept="image/*"
                                    className="input-photo-hidden"
                                    onChange={handlePhotoChange}
                                />

                            </div>

                        </div>


                        <div className="profil-identite-info">

                            <h3>
                                {utilisateur.prenom}{" "}
                                {utilisateur.nom}
                            </h3>

                            <span>
                                Prestataire
                            </span>

                            <small>
                                Cliquez sur 📷 pour modifier votre photo
                            </small>

                        </div>

                    </div>


                    {/* =================================================
                        FORMULAIRE PROFIL
                    ================================================= */}

                    <div className="etablissement-grid">

                        <div className="etablissement-field">

                            <label>
                                Prénom
                            </label>

                            {modificationProfil ? (

                                <input
                                    type="text"
                                    name="prenom"
                                    value={profilForm.prenom}
                                    onChange={handleProfilChange}
                                    placeholder="Votre prénom"
                                />

                            ) : (

                                <p>
                                    {utilisateur.prenom || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Nom
                            </label>

                            {modificationProfil ? (

                                <input
                                    type="text"
                                    name="nom"
                                    value={profilForm.nom}
                                    onChange={handleProfilChange}
                                    placeholder="Votre nom"
                                />

                            ) : (

                                <p>
                                    {utilisateur.nom || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Email
                            </label>

                            {modificationProfil ? (

                                <input
                                    type="email"
                                    name="email"
                                    value={profilForm.email}
                                    onChange={handleProfilChange}
                                    placeholder="Votre email"
                                />

                            ) : (

                                <p>
                                    {utilisateur.email || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Téléphone
                            </label>

                            {modificationProfil ? (

                                <input
                                    type="text"
                                    name="telephone"
                                    value={profilForm.telephone}
                                    onChange={handleProfilChange}
                                    placeholder="Votre téléphone"
                                />

                            ) : (

                                <p>
                                    {utilisateur.telephone || "-"}
                                </p>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        BOUTONS PROFIL
                    ================================================= */}

                    {modificationProfil && (

                        <div className="form-actions">

                            <button
                                type="button"
                                className="btn-annuler"
                                onClick={
                                    annulerModificationProfil
                                }
                                disabled={sauvegardeProfil}
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                className="btn-enregistrer"
                                onClick={
                                    enregistrerProfil
                                }
                                disabled={sauvegardeProfil}
                            >
                                {sauvegardeProfil
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                        </div>

                    )}

                </div>

            )}


            {/* =================================================
                ÉTABLISSEMENT
            ================================================= */}

            {etablissement && (

                <div className="etablissement-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Mon établissement
                            </h2>

                            <p>
                                Informations de votre entreprise
                            </p>

                        </div>

                        {!modificationEtablissement && (

                            <button
                                type="button"
                                className="btn-modifier"
                                onClick={() => {
                                    setMessage("");
                                    setModificationEtablissement(
                                        true
                                    );
                                }}
                            >
                                ✏️ Modifier
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        TITRE ÉTABLISSEMENT
                    ================================================= */}

                    <div className="etablissement-title">

                        <div className="etablissement-icon">
                            🏨
                        </div>

                        <div>

                            <h2>
                                {etablissement.nom_entreprise ||
                                    "Mon établissement"}
                            </h2>

                            <span className="statut-badge">
                                {etablissement.statut ||
                                    "Statut non défini"}
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        FORMULAIRE ÉTABLISSEMENT
                    ================================================= */}

                    <div className="etablissement-grid">

                        <div className="etablissement-field">

                            <label>
                                Nom de l'entreprise
                            </label>

                            {modificationEtablissement ? (

                                <input
                                    type="text"
                                    name="nom_entreprise"
                                    value={
                                        etablissementForm.nom_entreprise
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Nom de votre entreprise"
                                />

                            ) : (

                                <p>
                                    {etablissement.nom_entreprise || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Ville
                            </label>

                            {modificationEtablissement ? (

                                <input
                                    type="text"
                                    name="ville"
                                    value={
                                        etablissementForm.ville
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Ville"
                                />

                            ) : (

                                <p>
                                    {etablissement.ville || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Téléphone
                            </label>

                            {modificationEtablissement ? (

                                <input
                                    type="text"
                                    name="telephone"
                                    value={
                                        etablissementForm.telephone
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Téléphone"
                                />

                            ) : (

                                <p>
                                    {etablissement.telephone || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Email
                            </label>

                            {modificationEtablissement ? (

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        etablissementForm.email
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Email de l'entreprise"
                                />

                            ) : (

                                <p>
                                    {etablissement.email || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field full-width">

                            <label>
                                Adresse
                            </label>

                            {modificationEtablissement ? (

                                <input
                                    type="text"
                                    name="adresse"
                                    value={
                                        etablissementForm.adresse
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Adresse de l'établissement"
                                />

                            ) : (

                                <p>
                                    {etablissement.adresse || "-"}
                                </p>

                            )}

                        </div>


                        <div className="etablissement-field full-width">

                            <label>
                                Description
                            </label>

                            {modificationEtablissement ? (

                                <textarea
                                    name="description"
                                    value={
                                        etablissementForm.description
                                    }
                                    onChange={
                                        handleEtablissementChange
                                    }
                                    placeholder="Description de votre établissement"
                                    rows="5"
                                />

                            ) : (

                                <p>
                                    {etablissement.description ||
                                        "Aucune description disponible."}
                                </p>

                            )}

                        </div>


                        {/* =================================================
                            STATUT NON MODIFIABLE
                        ================================================= */}

                        <div className="etablissement-field full-width">

                            <label>
                                Statut de l'établissement
                            </label>

                            <div className="statut-non-modifiable">

                                <span className="statut-badge">
                                    {etablissement.statut ||
                                        "Non défini"}
                                </span>

                                <small>
                                    Le statut est défini par
                                    l'administrateur.
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        BOUTONS ÉTABLISSEMENT
                    ================================================= */}

                    {modificationEtablissement && (

                        <div className="form-actions">

                            <button
                                type="button"
                                className="btn-annuler"
                                onClick={
                                    annulerModificationEtablissement
                                }
                                disabled={
                                    sauvegardeEtablissement
                                }
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                className="btn-enregistrer"
                                onClick={
                                    enregistrerEtablissement
                                }
                                disabled={
                                    sauvegardeEtablissement
                                }
                            >
                                {sauvegardeEtablissement
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}

export default MonEtablissement;