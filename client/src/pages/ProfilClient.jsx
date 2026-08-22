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
    FaImage
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

    const [photoModal, setPhotoModal] = useState(false);

    const [photoModalTitle, setPhotoModalTitle] =
        useState("Photo de profil");

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
    // URL CLOUDINARY OU URL EXTERNE
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

    if (photoValue.startsWith("/uploads/")) {
        return `${import.meta.env.VITE_API_URL || "http://localhost:8081"}${photoValue}`;
    }

    if (photoValue.startsWith("/")) {
        return `${import.meta.env.VITE_API_URL || "http://localhost:8081"}${photoValue}`;
    }

    return `${import.meta.env.VITE_API_URL || "http://localhost:8081"}/uploads/${photoValue}`;
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


            setUtilisateur(user);


            setFormData({
                nom: user.nom || "",
                prenom: user.prenom || "",
                email: user.email || "",
                telephone: user.telephone || ""
            });


            const anciennePhoto =
                getPhotoUrl(user.photo);


            setPhotoOriginale(
                anciennePhoto
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


        // Vérifier type
        if (!file.type.startsWith("image/")) {

            setError(
                "Veuillez sélectionner une image valide."
            );

            return;

        }


        // Vérifier taille
        if (file.size > 5 * 1024 * 1024) {

            setError(
                "La photo ne doit pas dépasser 5 Mo."
            );

            return;

        }


        // Supprimer ancienne preview
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
            // RÉCUPÉRER PHOTO RENVOYÉE PAR LE BACKEND
            // =================================================

            const nouvellePhoto =
                response.data?.photo ||
                response.data?.utilisateur?.photo;


            if (!nouvellePhoto) {

                throw new Error(
                    "Le serveur n'a pas retourné la nouvelle photo."
                );

            }


            const utilisateurMisAJour = {

                ...utilisateur,

                photo: nouvellePhoto

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
            // ÉTATS
            // =================================================

            setUtilisateur(
                utilisateurMisAJour
            );


            setPhotoOriginale(
                getPhotoUrl(nouvellePhoto)
            );


            if (photoPreview) {

                URL.revokeObjectURL(
                    photoPreview
                );

            }


            setPhoto(null);

            setPhotoPreview(null);


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


        setSaving(true);

        setMessage("");

        setError("");


        try {

            const response =
                await api.put(

                    `/utilisateurs/${utilisateur.id_utilisateur}`,

                    formData

                );


            const updatedUser =
                response.data?.utilisateur ||
                response.data ||
                {};


            const utilisateurFinal = {

                ...utilisateur,

                ...updatedUser,

                ...formData

            };


            // =================================================
            // LOCAL STORAGE
            // =================================================

            localStorage.setItem(

                "utilisateur",

                JSON.stringify(
                    utilisateurFinal
                )

            );


            setUtilisateur(
                utilisateurFinal
            );


            setMessage(
                "Vos informations ont été mises à jour avec succès."
            );


            // Informer navbar
            window.dispatchEvent(
                new Event(
                    "utilisateurConnecte"
                )
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
        titre = "Photo de profil"
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


        setPhotoModal(true);

    };


    // =====================================================
    // FERMER MODAL
    // =====================================================

    const fermerPhotoModal = () => {

        setPhotoModal(false);

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
                    onClick={retourEspaceClient}
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
                                    src={photoActuelle}
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
                            disabled={!photoActuelle}
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
                        COMPARAISON ANCIENNE / NOUVELLE PHOTO
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
                                                src={photoOriginale}
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
                                            src={photoPreview}
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
                                    disabled={savingPhoto}
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
                                    disabled={savingPhoto}
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
                        onSubmit={handleSubmit}
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
                                disabled={saving}
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


                            {(
                                photoPreview &&
                                photoModalTitle ===
                                "Nouvelle photo"
                            ) ||

                            (
                                photoOriginale &&
                                photoModalTitle ===
                                "Photo actuelle"
                            ) ||

                            (
                                photoActuelle &&
                                photoModalTitle ===
                                "Photo de profil"
                            ) ? (

                                <img
                                    src={
                                        photoModalTitle ===
                                        "Nouvelle photo"
                                            ? photoPreview
                                            : photoModalTitle ===
                                              "Photo actuelle"
                                                ? photoOriginale
                                                : photoActuelle
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