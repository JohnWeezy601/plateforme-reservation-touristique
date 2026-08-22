import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaArrowLeft,
    FaSave,
    FaCamera,
    FaTimes,
    FaEye,
    FaCheck,
    FaImage,
    FaImages,
    FaNewspaper
} from "react-icons/fa";

import api from "../api/api";

import "./ProfilClient.css";


function ProfilClient() {

    const navigate = useNavigate();


    // =====================================================
    // ÉTATS
    // =====================================================

    const [utilisateur, setUtilisateur] = useState(null);

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: ""
    });

    const [photo, setPhoto] = useState(null);

    const [photoPreview, setPhotoPreview] = useState(null);

    const [photoOriginale, setPhotoOriginale] = useState(null);


    // =====================================================
    // NOUVEAUX ÉTATS
    // =====================================================

    // Anciennes photos de profil
    const [mesPhotos, setMesPhotos] = useState([]);

    // Photos publiées dans les avis
    const [mesPostes, setMesPostes] = useState([]);

    const [loadingPhotos, setLoadingPhotos] = useState(false);

    const [loadingPostes, setLoadingPostes] = useState(false);


    // =====================================================
    // MODAL PHOTO
    // =====================================================

    const [photoModal, setPhotoModal] = useState(false);

    const [photoModalTitle, setPhotoModalTitle] =
        useState("Photo de profil");

    const [photoModalUrl, setPhotoModalUrl] =
        useState(null);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [savingPhoto, setSavingPhoto] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // =====================================================
    // CONSTRUIRE URL PHOTO
    // =====================================================

    const getPhotoUrl = (photoValue) => {

        if (!photoValue) {
            return null;
        }


        // =====================================================
        // CLOUDINARY / URL EXTERNE / BLOB
        // =====================================================

        if (
            photoValue.startsWith("http://") ||
            photoValue.startsWith("https://") ||
            photoValue.startsWith("blob:")
        ) {
            return photoValue;
        }


        // =====================================================
        // ANCIENNES PHOTOS LOCALES
        // =====================================================

        const apiUrl =
            import.meta.env.VITE_API_URL ||
            "http://localhost:8081";


        if (photoValue.startsWith("/uploads/")) {

            return `${apiUrl}${photoValue}`;

        }


        if (photoValue.startsWith("/")) {

            return `${apiUrl}${photoValue}`;

        }


        return `${apiUrl}/uploads/${photoValue}`;

    };


    // =====================================================
    // RÉCUPÉRATION UTILISATEUR
    // =====================================================

    useEffect(() => {

        const data =
            localStorage.getItem("utilisateur");


        if (!data) {

            navigate("/login-client");

            return;

        }


        try {

            const parsedData =
                JSON.parse(data);


            const user =
                parsedData?.utilisateur
                    ? parsedData.utilisateur
                    : parsedData;


            // =================================================
            // NORMALISER ID
            // =================================================

            const utilisateurNormalise = {

                ...user,

                id_utilisateur:
                    user.id_utilisateur ||
                    user.id,

                telephone:
                    user.telephone || ""

            };


            setUtilisateur(
                utilisateurNormalise
            );


            // =================================================
            // FORMULAIRE
            // =================================================

            setFormData({

                nom:
                    utilisateurNormalise.nom || "",

                prenom:
                    utilisateurNormalise.prenom || "",

                email:
                    utilisateurNormalise.email || "",

                telephone:
                    utilisateurNormalise.telephone || ""

            });


            // =================================================
            // PHOTO ACTUELLE
            // =================================================

            const anciennePhoto =
                getPhotoUrl(
                    utilisateurNormalise.photo
                );


            setPhotoOriginale(
                anciennePhoto
            );


            // =================================================
            // RÉCUPÉRER MES PHOTOS
            // =================================================

            chargerMesPhotos(
                utilisateurNormalise.id_utilisateur
            );


            // =================================================
            // RÉCUPÉRER MES POSTES
            // =================================================

            chargerMesPostes(
                utilisateurNormalise.id_utilisateur
            );

        }
        catch (err) {

            console.error(
                "Erreur lecture utilisateur :",
                err
            );


            localStorage.removeItem(
                "utilisateur"
            );


            navigate("/login-client");

        }
        finally {

            setLoading(false);

        }

    }, [navigate]);


    // =====================================================
    // RÉCUPÉRER MES ANCIENNES PHOTOS
    // =====================================================

    const chargerMesPhotos = async (idUtilisateur) => {

        if (!idUtilisateur) {
            return;
        }


        setLoadingPhotos(true);


        try {

            const response =
                await api.get(
                    `/utilisateurs/${idUtilisateur}/photos-profil`
                );


            const photos =
                response.data?.photos || [];


            setMesPhotos(
                photos
            );

        }
        catch (err) {

            console.error(
                "Erreur récupération Mes photos :",
                err
            );

            setMesPhotos([]);

        }
        finally {

            setLoadingPhotos(false);

        }

    };


    // =====================================================
    // RÉCUPÉRER MES POSTES
    // =====================================================

    const chargerMesPostes = async (idUtilisateur) => {

        if (!idUtilisateur) {
            return;
        }


        setLoadingPostes(true);


        try {

            const response =
                await api.get(
                    `/avis-photo/utilisateur/${idUtilisateur}`
                );


            const photos =
                response.data?.photos || [];


            setMesPostes(
                photos
            );

        }
        catch (err) {

            console.error(
                "Erreur récupération Mes postes :",
                err
            );

            setMesPostes([]);

        }
        finally {

            setLoadingPostes(false);

        }

    };


    // =====================================================
    // NETTOYAGE URL BLOB
    // =====================================================

    useEffect(() => {

        return () => {

            if (photoPreview) {

                URL.revokeObjectURL(
                    photoPreview
                );

            }

        };

    }, [photoPreview]);


    // =====================================================
    // MODIFICATION CHAMPS
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));


        setMessage("");

        setError("");

    };


    // =====================================================
    // SÉLECTION PHOTO
    // =====================================================

    const handlePhotoChange = (e) => {

        const file =
            e.target.files?.[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            setError(
                "Veuillez sélectionner une image valide."
            );

            return;

        }


        if (file.size > 5 * 1024 * 1024) {

            setError(
                "La photo ne doit pas dépasser 5 Mo."
            );

            return;

        }


        if (photoPreview) {

            URL.revokeObjectURL(
                photoPreview
            );

        }


        const preview =
            URL.createObjectURL(file);


        setPhoto(file);

        setPhotoPreview(preview);

        setMessage("");

        setError("");

    };


    // =====================================================
    // ANNULER NOUVELLE PHOTO
    // =====================================================

    const annulerNouvellePhoto = () => {

        if (photoPreview) {

            URL.revokeObjectURL(
                photoPreview
            );

        }


        setPhoto(null);

        setPhotoPreview(null);

        setMessage("");

        setError("");

    };


    // =====================================================
    // ENREGISTRER PHOTO
    // =====================================================

    const enregistrerPhoto = async () => {

        if (!utilisateur?.id_utilisateur) {

            setError(
                "Utilisateur non identifié."
            );

            return;

        }


        if (!photo) {

            setError(
                "Veuillez sélectionner une nouvelle photo."
            );

            return;

        }


        setSavingPhoto(true);

        setMessage("");

        setError("");


        try {

            const formDataPhoto =
                new FormData();


            formDataPhoto.append(
                "photo",
                photo
            );


            const response =
                await api.put(

                    `/utilisateurs/photo/${utilisateur.id_utilisateur}`,

                    formDataPhoto,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }

                );


            // =================================================
            // NOUVELLE PHOTO
            // =================================================

            const nouvellePhoto =
                response.data?.photo ||
                response.data?.utilisateur?.photo;


            if (!nouvellePhoto) {

                throw new Error(
                    "Le serveur n'a pas retourné la nouvelle photo."
                );

            }


            // =================================================
            // UTILISATEUR MIS À JOUR
            // =================================================

            const utilisateurMisAJour = {

                ...utilisateur,

                photo:
                    nouvellePhoto

            };


            // =================================================
            // LOCAL STORAGE
            // =================================================

            localStorage.setItem(

                "utilisateur",

                JSON.stringify(
                    utilisateurMisAJour
                )

            );


            // =================================================
            // ÉTAT UTILISATEUR
            // =================================================

            setUtilisateur(
                utilisateurMisAJour
            );


            setPhotoOriginale(
                getPhotoUrl(
                    nouvellePhoto
                )
            );


            // =================================================
            // NETTOYER PREVIEW
            // =================================================

            if (photoPreview) {

                URL.revokeObjectURL(
                    photoPreview
                );

            }


            setPhoto(null);

            setPhotoPreview(null);


            // =================================================
            // RECHARGER MES PHOTOS
            // =================================================

            await chargerMesPhotos(
                utilisateur.id_utilisateur
            );


            // =================================================
            // INFORMER NAVBAR
            // =================================================

            window.dispatchEvent(
                new Event(
                    "utilisateurConnecte"
                )
            );


            setMessage(
                "Votre photo de profil a été mise à jour avec succès."
            );

        }
        catch (err) {

            console.error(
                "Erreur changement photo :",
                err
            );


            setError(
                err.response?.data?.message ||
                "Erreur lors de la modification de la photo."
            );

        }
        finally {

            setSavingPhoto(false);

        }

    };


    // =====================================================
    // ENREGISTREMENT INFORMATIONS
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!utilisateur) {
            return;
        }


        const idUtilisateur =
            utilisateur.id_utilisateur ||
            utilisateur.id;


        if (!idUtilisateur) {

            setError(
                "Utilisateur non identifié."
            );

            return;

        }


        setSaving(true);

        setMessage("");

        setError("");


        try {

            const donneesModification = {

                nom:
                    formData.nom.trim(),

                prenom:
                    formData.prenom.trim(),

                email:
                    formData.email.trim(),

                telephone:
                    formData.telephone.trim(),

                role:
                    utilisateur.role ||
                    "Touriste"

            };


            const response =
                await api.put(

                    `/utilisateurs/${idUtilisateur}`,

                    donneesModification

                );


            const updatedUser =
                response.data?.utilisateur ||
                {};


            const utilisateurFinal = {

                ...utilisateur,

                ...updatedUser,

                id_utilisateur:
                    idUtilisateur,

                nom:
                    donneesModification.nom,

                prenom:
                    donneesModification.prenom,

                email:
                    donneesModification.email,

                telephone:
                    donneesModification.telephone,

                role:
                    donneesModification.role

            };


            localStorage.setItem(

                "utilisateur",

                JSON.stringify(
                    utilisateurFinal
                )

            );


            setUtilisateur(
                utilisateurFinal
            );


            setFormData({

                nom:
                    utilisateurFinal.nom || "",

                prenom:
                    utilisateurFinal.prenom || "",

                email:
                    utilisateurFinal.email || "",

                telephone:
                    utilisateurFinal.telephone || ""

            });


            window.dispatchEvent(
                new Event(
                    "utilisateurConnecte"
                )
            );


            setMessage(
                "Vos informations ont été mises à jour avec succès."
            );

        }
        catch (err) {

            console.error(
                "Erreur modification profil :",
                err
            );


            setError(
                err.response?.data?.message ||
                "Erreur lors de la modification du profil."
            );

        }
        finally {

            setSaving(false);

        }

    };


    // =====================================================
    // VOIR PHOTO
    // =====================================================

    const voirPhoto = (
        photoUrl,
        titre = "Photo"
    ) => {

        if (!photoUrl) {

            setError(
                "Aucune photo disponible."
            );

            return;

        }


        setPhotoModalTitle(
            titre
        );

        setPhotoModalUrl(
            photoUrl
        );

        setPhotoModal(
            true
        );

    };


    // =====================================================
    // FERMER MODAL
    // =====================================================

    const fermerPhotoModal = () => {

        setPhotoModal(
            false
        );

        setPhotoModalUrl(
            null
        );

    };


    // =====================================================
    // RETOUR
    // =====================================================

    const retourEspaceClient = () => {

        navigate(
            "/espace-client"
        );

    };


    // =====================================================
    // PHOTO ACTUELLE
    // =====================================================

    const photoActuelle =
        photoPreview ||
        photoOriginale;


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (loading) {

        return (

            <div className="profil-client-loading">

                Chargement du profil...

            </div>

        );

    }


    if (!utilisateur) {
        return null;
    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="profil-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="profil-client-header">

                <button
                    className="profil-client-back"
                    onClick={
                        retourEspaceClient
                    }
                >

                    <FaArrowLeft />

                    <span>
                        Retour à mon espace
                    </span>

                </button>


                <div>

                    <span className="profil-client-label">
                        ESPACE CLIENT
                    </span>

                    <h1>
                        Mon profil
                    </h1>

                    <p>
                        Gérez vos informations personnelles
                        et votre photo de profil.
                    </p>

                </div>

            </div>


            {/* =================================================
                MESSAGES
            ================================================= */}

            {message && (

                <div className="profil-client-success">

                    <FaCheck />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {error && (

                <div className="profil-client-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >

                        <FaTimes />

                    </button>

                </div>

            )}


            {/* =================================================
                CONTENU
            ================================================= */}

            <div className="profil-client-container">


                {/* =================================================
                    CARTE PROFIL
                ================================================= */}

                <section className="profil-client-photo-card">


                    <div className="profil-facebook-cover">

                        <div className="profil-facebook-avatar">

                            {photoActuelle ? (

                                <img
                                    src={
                                        photoActuelle
                                    }
                                    alt="Photo de profil"
                                />

                            ) : (

                                <FaUser />

                            )}

                        </div>


                        <button
                            type="button"
                            className="profil-view-photo"
                            onClick={() =>
                                voirPhoto(
                                    photoActuelle,
                                    photoPreview
                                        ? "Nouvelle photo"
                                        : "Photo de profil"
                                )
                            }
                            disabled={
                                !photoActuelle
                            }
                        >

                            <FaEye />

                        </button>

                    </div>


                    <div className="profil-client-photo-info">


                        <h2>

                            {utilisateur.prenom || ""}

                            {" "}

                            {utilisateur.nom || ""}

                        </h2>


                        <p>
                            {utilisateur.email}
                        </p>


                        <div className="profil-photo-actions">


                            <label
                                className="profil-client-photo-button"
                            >

                                <FaCamera />

                                <span>
                                    Choisir une nouvelle photo
                                </span>


                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handlePhotoChange
                                    }
                                />

                            </label>


                        </div>


                    </div>


                    {/* =================================================
                        COMPARAISON
                    ================================================= */}

                    {photoPreview && (

                        <div className="photo-comparison">


                            <div className="photo-comparison-header">

                                <div>

                                    <span>
                                        MODIFICATION
                                    </span>

                                    <h3>
                                        Nouvelle photo sélectionnée
                                    </h3>

                                </div>

                                <FaImage />

                            </div>


                            <div className="photo-comparison-grid">


                                {/* ANCIENNE PHOTO */}

                                <div className="photo-version">

                                    <span>
                                        Photo actuelle
                                    </span>


                                    <div
                                        className="photo-version-image"
                                        onClick={() =>
                                            voirPhoto(
                                                photoOriginale,
                                                "Photo actuelle"
                                            )
                                        }
                                    >

                                        {photoOriginale ? (

                                            <img
                                                src={
                                                    photoOriginale
                                                }
                                                alt="Ancienne photo"
                                            />

                                        ) : (

                                            <FaUser />

                                        )}


                                        {photoOriginale && (

                                            <div className="photo-overlay">

                                                <FaEye />

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* NOUVELLE PHOTO */}

                                <div className="photo-version">

                                    <span>
                                        Nouvelle photo
                                    </span>


                                    <div
                                        className="photo-version-image photo-new"
                                        onClick={() =>
                                            voirPhoto(
                                                photoPreview,
                                                "Nouvelle photo"
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                photoPreview
                                            }
                                            alt="Nouvelle photo"
                                        />


                                        <div className="photo-overlay">

                                            <FaEye />

                                        </div>

                                    </div>

                                </div>


                            </div>


                            <div className="photo-comparison-actions">


                                <button
                                    type="button"
                                    className="photo-cancel-button"
                                    onClick={
                                        annulerNouvellePhoto
                                    }
                                    disabled={
                                        savingPhoto
                                    }
                                >

                                    <FaTimes />

                                    Annuler

                                </button>


                                <button
                                    type="button"
                                    className="photo-save-button"
                                    onClick={
                                        enregistrerPhoto
                                    }
                                    disabled={
                                        savingPhoto
                                    }
                                >

                                    <FaSave />

                                    {savingPhoto
                                        ? "Enregistrement..."
                                        : "Enregistrer la nouvelle photo"
                                    }

                                </button>


                            </div>


                        </div>

                    )}


                </section>


                {/* =================================================
                    MES PHOTOS
                ================================================= */}

                <section className="profil-client-gallery-card">

                    <div className="profil-client-section-title">

                        <span>
                            GALERIE PERSONNELLE
                        </span>

                        <h2>
                            <FaImages />
                            Mes photos
                        </h2>

                        <p>
                            Retrouvez ici vos anciennes photos de profil.
                        </p>

                    </div>


                    {loadingPhotos ? (

                        <div className="profil-gallery-loading">
                            Chargement de vos photos...
                        </div>

                    ) : mesPhotos.length === 0 ? (

                        <div className="profil-gallery-empty">

                            <FaImages />

                            <span>
                                Vous n'avez pas encore d'ancienne photo de profil.
                            </span>

                        </div>

                    ) : (

                        <div className="profil-gallery-grid">

                            {mesPhotos.map((item) => {

                                const url =
                                    getPhotoUrl(
                                        item.photo
                                    );


                                return (

                                    <div
                                        className="profil-gallery-item"
                                        key={
                                            item.id_photo
                                        }
                                        onClick={() =>
                                            voirPhoto(
                                                url,
                                                "Mes photos"
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                url
                                            }
                                            alt="Ancienne photo de profil"
                                        />

                                        <div className="profil-gallery-overlay">

                                            <FaEye />

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </section>


                {/* =================================================
                    MES POSTES
                ================================================= */}

                <section className="profil-client-gallery-card">

                    <div className="profil-client-section-title">

                        <span>
                            PUBLICATIONS
                        </span>

                        <h2>
                            <FaNewspaper />
                            Mes postes
                        </h2>

                        <p>
                            Retrouvez ici les photos que vous avez publiées
                            dans vos avis.
                        </p>

                    </div>


                    {loadingPostes ? (

                        <div className="profil-gallery-loading">
                            Chargement de vos publications...
                        </div>

                    ) : mesPostes.length === 0 ? (

                        <div className="profil-gallery-empty">

                            <FaNewspaper />

                            <span>
                                Vous n'avez pas encore publié de photo.
                            </span>

                        </div>

                    ) : (

                        <div className="profil-gallery-grid">

                            {mesPostes.map((item) => {

                                const url =
                                    getPhotoUrl(
                                        item.photo
                                    );


                                return (

                                    <div
                                        className="profil-gallery-item"
                                        key={
                                            item.id_photo
                                        }
                                        onClick={() =>
                                            voirPhoto(
                                                url,
                                                "Mes postes"
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                url
                                            }
                                            alt="Photo publiée dans un avis"
                                        />

                                        <div className="profil-gallery-overlay">

                                            <FaEye />

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </section>


                {/* =================================================
                    INFORMATIONS PERSONNELLES
                ================================================= */}

                <section className="profil-client-form-card">


                    <div className="profil-client-section-title">

                        <span>
                            INFORMATIONS PERSONNELLES
                        </span>

                        <h2>
                            Mes informations
                        </h2>

                        <p>
                            Ces informations sont utilisées
                            pour votre compte client.
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >


                        <div className="profil-client-grid">


                            {/* NOM */}

                            <div className="profil-client-field">

                                <label>
                                    Nom
                                </label>


                                <div className="profil-client-input">

                                    <FaUser />

                                    <input
                                        type="text"
                                        name="nom"
                                        value={
                                            formData.nom
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Votre nom"
                                    />

                                </div>

                            </div>


                            {/* PRÉNOM */}

                            <div className="profil-client-field">

                                <label>
                                    Prénom
                                </label>


                                <div className="profil-client-input">

                                    <FaUser />

                                    <input
                                        type="text"
                                        name="prenom"
                                        value={
                                            formData.prenom
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Votre prénom"
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="profil-client-field">

                                <label>
                                    Email
                                </label>


                                <div className="profil-client-input">

                                    <FaEnvelope />

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Votre adresse email"
                                    />

                                </div>

                            </div>


                            {/* TÉLÉPHONE */}

                            <div className="profil-client-field">

                                <label>
                                    Téléphone
                                </label>


                                <div className="profil-client-input">

                                    <FaPhone />

                                    <input
                                        type="text"
                                        name="telephone"
                                        value={
                                            formData.telephone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Votre numéro de téléphone"
                                    />

                                </div>

                            </div>


                        </div>


                        <div className="profil-client-actions">


                            <button
                                type="button"
                                className="profil-client-cancel"
                                onClick={
                                    retourEspaceClient
                                }
                            >

                                Annuler

                            </button>


                            <button
                                type="submit"
                                className="profil-client-save"
                                disabled={
                                    saving
                                }
                            >

                                <FaSave />

                                {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer les informations"
                                }

                            </button>


                        </div>


                    </form>


                </section>


            </div>


            {/* =================================================
                MODAL PHOTO GRAND FORMAT
            ================================================= */}

            {photoModal && (

                <div
                    className="photo-viewer-overlay"
                    onClick={
                        fermerPhotoModal
                    }
                >


                    <div
                        className="photo-viewer"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        <div className="photo-viewer-header">

                            <h3>
                                {photoModalTitle}
                            </h3>


                            <button
                                type="button"
                                onClick={
                                    fermerPhotoModal
                                }
                            >

                                <FaTimes />

                            </button>

                        </div>


                        <div className="photo-viewer-content">


                            {photoModalUrl ? (

                                <img
                                    src={
                                        photoModalUrl
                                    }
                                    alt={
                                        photoModalTitle
                                    }
                                />

                            ) : (

                                <div className="photo-viewer-empty">

                                    <FaUser />

                                    <span>
                                        Aucune photo disponible
                                    </span>

                                </div>

                            )}


                        </div>


                    </div>


                </div>

            )}


        </div>

    );

}


export default ProfilClient;