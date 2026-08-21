import {
    useState,
    useEffect
} from "react";

import {
    FaTimes,
    FaSave,
    FaImage
} from "react-icons/fa";

import api from "../api/api";

import "./DestinationModal.css";


function DestinationModal({
    open,
    close,
    destination,
    refresh
}) {

    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);


    // ==========================================
    // URL IMAGE
    // ==========================================

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        // Image Cloudinary
        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        // Ancienne image locale
        return `${import.meta.env.VITE_SERVER_URL}/uploads/${image}`;
    };


    // ==========================================
    // INITIALISER L'APERÇU
    // ==========================================

    useEffect(() => {

        if (destination?.image) {

            setImagePreview(
                getImageUrl(destination.image)
            );

        } else {

            setImagePreview(null);

        }

    }, [destination]);


    // ==========================================
    // FERMER LA MODALE
    // ==========================================

    if (!open) {
        return null;
    }


    // ==========================================
    // SAUVEGARDER
    // ==========================================

    const sauvegarder = async (e) => {

        e.preventDefault();


        if (loading) {
            return;
        }


        setLoading(true);


        const form = e.target;

        const formData = new FormData();


        // ==========================================
        // INFORMATIONS DESTINATION
        // ==========================================

        formData.append(
            "nom",
            form.nom.value
        );

        formData.append(
            "region",
            form.region.value
        );

        formData.append(
            "pays",
            form.pays.value
        );

        formData.append(
            "description",
            form.description.value
        );


        // ==========================================
        // ANCIENNE IMAGE
        // ==========================================

        if (destination?.image) {

            formData.append(
                "oldImage",
                destination.image
            );

        }


        // ==========================================
        // NOUVELLE IMAGE
        // ==========================================

        const fichier = form.image.files[0];

        if (fichier) {

            formData.append(
                "image",
                fichier
            );

        }


        try {

            let response;


            // ==========================================
            // MODIFICATION
            // ==========================================

            if (destination) {

                response = await api.put(
                    `/destinations/${destination.id_destination}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            }


            // ==========================================
            // AJOUT
            // ==========================================

            else {

                response = await api.post(
                    "/destinations",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            }


            console.log(
                "Réponse backend :",
                response.data
            );


            alert(
                response.data.message
            );


            // Fermer la modale
            close();


            // Recharger les destinations
            await refresh();

        }

        catch (error) {

            console.error(
                "Erreur destination :",
                error.response?.data || error
            );


            alert(
                error.response?.data?.message ||
                "Erreur lors de l'opération"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // AFFICHAGE
    // ==========================================

    return (

        <div className="modal-overlay">

            <div className="modal-box">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="modal-header">

                    <h2>

                        {destination
                            ? "Modifier destination"
                            : "Ajouter destination"
                        }

                    </h2>


                    <button
                        type="button"
                        onClick={close}
                    >

                        <FaTimes />

                    </button>

                </div>


                {/* ==========================================
                    FORMULAIRE
                ========================================== */}

                <form onSubmit={sauvegarder}>

                    {/* Nom */}

                    <label>
                        Nom destination
                    </label>

                    <input
                        name="nom"
                        placeholder="Ex: Nosy Be"
                        defaultValue={
                            destination?.nom || ""
                        }
                        required
                    />


                    {/* Région */}

                    <label>
                        Région
                    </label>

                    <input
                        name="region"
                        placeholder="Ex: Diana"
                        defaultValue={
                            destination?.region || ""
                        }
                    />


                    {/* Pays */}

                    <label>
                        Pays
                    </label>

                    <input
                        name="pays"
                        placeholder="Ex: Madagascar"
                        defaultValue={
                            destination?.pays || ""
                        }
                    />


                    {/* Description */}

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        placeholder="Description destination"
                        defaultValue={
                            destination?.description || ""
                        }
                    />


                    {/* Image */}

                    <label>

                        <FaImage />

                        Image destination

                    </label>


                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => {

                            const fichier =
                                e.target.files[0];

                            if (fichier) {

                                setImagePreview(
                                    URL.createObjectURL(fichier)
                                );

                            }

                        }}
                    />


                    {/* ==========================================
                        APERÇU IMAGE
                    ========================================== */}

                    {imagePreview && (

                        <div className="image-preview">

                            <img
                                src={imagePreview}
                                alt="Aperçu destination"
                                className="preview-img"
                                onError={(e) => {

                                    console.error(
                                        "Erreur chargement aperçu :",
                                        imagePreview
                                    );

                                    e.currentTarget.style.display =
                                        "none";
                                }}
                            />

                        </div>

                    )}


                    {/* ==========================================
                        BOUTON
                    ========================================== */}

                    <button
                        className="btn-save"
                        type="submit"
                        disabled={loading}
                    >

                        <FaSave />

                        {loading
                            ? "Enregistrement..."
                            : "Enregistrer"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}


export default DestinationModal;