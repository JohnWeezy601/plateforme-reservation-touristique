import {
    FaTimes,
    FaMapMarkerAlt,
    FaGlobeAfrica
} from "react-icons/fa";

import "./DestinationDetailsModal.css";


function DestinationDetailsModal({
    open,
    close,
    destination
}) {

    // ==========================================
    // Si la modale n'est pas ouverte
    // ==========================================

    if (!open || !destination) {
        return null;
    }


    // ==========================================
    // URL IMAGE
    // ==========================================

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        // Image Cloudinary ou autre URL distante
        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        // Anciennes images stockées localement
        return `${import.meta.env.VITE_SERVER_URL}/uploads/${image}`;
    };


    return (
        <div className="detail-overlay">

            <div className="detail-modal">

                {/* ==========================================
                    IMAGE
                ========================================== */}

                <div className="detail-image-container">

                    {destination.image ? (

                        <img
                            src={getImageUrl(destination.image)}
                            alt={destination.nom}
                            onError={(e) => {

                                console.error(
                                    "Erreur chargement image destination :",
                                    destination.image
                                );

                                e.currentTarget.style.display = "none";
                            }}
                        />

                    ) : (

                        <p>
                            Aucune image disponible
                        </p>

                    )}

                </div>


                {/* ==========================================
                    CONTENU
                ========================================== */}

                <div className="detail-content">

                    <h2>
                        {destination.nom}
                    </h2>


                    <div className="detail-info">

                        {/* Région */}

                        <div className="detail-item">

                            <FaMapMarkerAlt />

                            <span>

                                <strong>
                                    Région :
                                </strong>

                                {" "}

                                {destination.region || "-"}

                            </span>

                        </div>


                        {/* Pays */}

                        <div className="detail-item">

                            <FaGlobeAfrica />

                            <span>

                                <strong>
                                    Pays :
                                </strong>

                                {" "}

                                {destination.pays || "-"}

                            </span>

                        </div>

                    </div>


                    {/* ==========================================
                        DESCRIPTION
                    ========================================== */}

                    <div className="detail-description">

                        <h3>
                            Description
                        </h3>

                        <p>

                            {destination.description
                                ? destination.description
                                : "Aucune description disponible"
                            }

                        </p>

                    </div>

                </div>


                {/* ==========================================
                    FOOTER
                ========================================== */}

                <div className="detail-footer">

                    <button
                        className="btn-close-detail"
                        onClick={close}
                    >

                        <FaTimes />

                        Fermer

                    </button>

                </div>

            </div>

        </div>
    );
}


export default DestinationDetailsModal;