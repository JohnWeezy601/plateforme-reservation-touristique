import { useEffect, useState } from "react";
import api from "../api/api";
import "./Destinations.css";

import DestinationModal from "../components/DestinationModal";
import DestinationDetailsModal from "../components/DestinationDetailsModal";

import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye,
    FaEllipsisV,
    FaChevronLeft,
    FaChevronRight,
    FaMapMarkerAlt
} from "react-icons/fa";

function Destinations() {

    const [destinations, setDestinations] = useState([]);
    const [recherche, setRecherche] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [detailDestination, setDetailDestination] = useState(null);
    const [menuOuvert, setMenuOuvert] = useState(null);
    const [page, setPage] = useState(1);

    const elementsParPage = 5;

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

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

        // Ancienne image locale
        return `${SERVER_URL}/uploads/${image}`;
    };

    // ==========================================
    // CHARGER LES DESTINATIONS
    // ==========================================

    const chargerDestinations = async () => {

        try {

            const res = await api.get("/destinations");

            console.log(
                "DESTINATIONS :",
                res.data
            );

            setDestinations(res.data);

        } catch (error) {

            console.error(
                "Erreur chargement destinations :",
                error
            );

        }
    };

    // ==========================================
    // INITIALISATION
    // ==========================================

    useEffect(() => {

        chargerDestinations();

        const fermerMenu = (e) => {

            if (!e.target.closest(".menu-action")) {
                setMenuOuvert(null);
            }
        };

        document.addEventListener(
            "click",
            fermerMenu
        );

        return () => {

            document.removeEventListener(
                "click",
                fermerMenu
            );

        };

    }, []);

    // ==========================================
    // SUPPRIMER DESTINATION
    // ==========================================

    const supprimer = async (id) => {

        const confirmation = window.confirm(
            "Voulez-vous supprimer cette destination ?"
        );

        if (!confirmation) {
            return;
        }

        try {

            const res = await api.delete(
                `/destinations/${id}`
            );

            alert(res.data.message);

            chargerDestinations();

        } catch (error) {

            console.error(
                "Erreur suppression :",
                error
            );

            alert(
                "Erreur suppression destination"
            );
        }
    };

    // ==========================================
    // RECHERCHE
    // ==========================================

    const filtres = destinations.filter((destination) => {

        const texte = recherche.toLowerCase();

        return (
            (destination.nom || "")
                .toLowerCase()
                .includes(texte)

            ||

            (destination.region || "")
                .toLowerCase()
                .includes(texte)

            ||

            (destination.pays || "")
                .toLowerCase()
                .includes(texte)
        );
    });

    // ==========================================
    // PAGINATION
    // ==========================================

    const indexDernier =
        page * elementsParPage;

    const indexPremier =
        indexDernier - elementsParPage;

    const destinationsAffichees =
        filtres.slice(
            indexPremier,
            indexDernier
        );

    const nombrePages =
        Math.ceil(
            filtres.length / elementsParPage
        );

    // ==========================================
    // AFFICHAGE
    // ==========================================

    return (

        <div className="destination-container">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="destination-header">

                <div>

                    <h1>
                        <FaMapMarkerAlt />
                        Gestion des destinations
                    </h1>

                    <p>
                        Gérer les destinations touristiques.
                    </p>

                </div>

                <button
                    className="btn-add"
                    onClick={() => {

                        setSelectedDestination(null);
                        setOpenModal(true);

                    }}
                >
                    <FaPlus />
                </button>

            </div>

            {/* ==================================
                RECHERCHE
            ================================== */}

            <div className="search-box">

                <FaSearch />

                <input
                    type="text"
                    placeholder="Rechercher une destination..."
                    value={recherche}
                    onChange={(e) => {

                        setRecherche(
                            e.target.value
                        );

                        setPage(1);

                    }}
                />

            </div>

            {/* ==================================
                TABLEAU
            ================================== */}

            <div className="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Région</th>
                            <th>Pays</th>
                            <th>Description</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {destinationsAffichees.length === 0 ? (

                            <tr>

                                <td colSpan="7">

                                    <div className="empty">

                                        Aucune destination disponible

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            destinationsAffichees.map(
                                (destination) => (

                                    <tr
                                        key={
                                            destination.id_destination
                                        }
                                    >

                                        {/* ID */}

                                        <td>

                                            {
                                                destination.id_destination
                                            }

                                        </td>

                                        {/* IMAGE */}

                                        <td>

                                            {destination.image ? (

                                                <img
                                                    src={getImageUrl(
                                                        destination.image
                                                    )}
                                                    className="destination-image"
                                                    alt={
                                                        destination.nom ||
                                                        "Destination"
                                                    }
                                                    onError={(e) => {

                                                        console.error(
                                                            "Erreur chargement image :",
                                                            destination.image
                                                        );

                                                        e.currentTarget.style.display =
                                                            "none";

                                                    }}
                                                />

                                            ) : (

                                                <span>
                                                    Pas d'image
                                                </span>

                                            )}

                                        </td>

                                        {/* NOM */}

                                        <td>

                                            {
                                                destination.nom
                                            }

                                        </td>

                                        {/* REGION */}

                                        <td>

                                            {
                                                destination.region ||
                                                "-"
                                            }

                                        </td>

                                        {/* PAYS */}

                                        <td>

                                            {
                                                destination.pays ||
                                                "-"
                                            }

                                        </td>

                                        {/* DESCRIPTION */}

                                        <td>

                                            {
                                                destination.description

                                                    ?

                                                    destination.description.length >
                                                    50

                                                        ?

                                                        destination.description.substring(
                                                            0,
                                                            50
                                                        ) + "..."

                                                        :

                                                        destination.description

                                                    :

                                                    "Aucune description"
                                            }

                                        </td>

                                        {/* ACTIONS */}

                                        <td>

                                            <div className="menu-action">

                                                <button
                                                    className="btn-menu"
                                                    onClick={(e) => {

                                                        e.stopPropagation();

                                                        setMenuOuvert(
                                                            menuOuvert ===
                                                                destination.id_destination
                                                                ? null
                                                                : destination.id_destination
                                                        );

                                                    }}
                                                >

                                                    <FaEllipsisV />

                                                </button>

                                                {menuOuvert ===
                                                    destination.id_destination && (

                                                    <div
                                                        className="menu-content"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >

                                                        {/* VOIR */}

                                                        <button
                                                            onClick={() => {

                                                                setDetailDestination(
                                                                    destination
                                                                );

                                                                setMenuOuvert(
                                                                    null
                                                                );

                                                            }}
                                                        >

                                                            <FaEye />

                                                            Voir détails

                                                        </button>

                                                        {/* MODIFIER */}

                                                        <button
                                                            onClick={() => {

                                                                setSelectedDestination(
                                                                    destination
                                                                );

                                                                setOpenModal(
                                                                    true
                                                                );

                                                                setMenuOuvert(
                                                                    null
                                                                );

                                                            }}
                                                        >

                                                            <FaEdit />

                                                            Modifier

                                                        </button>

                                                        {/* SUPPRIMER */}

                                                        <button
                                                            onClick={() => {

                                                                supprimer(
                                                                    destination.id_destination
                                                                );

                                                                setMenuOuvert(
                                                                    null
                                                                );

                                                            }}
                                                        >

                                                            <FaTrash />

                                                            Supprimer

                                                        </button>

                                                    </div>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

            {/* ==================================
                PAGINATION
            ================================== */}

            {nombrePages > 0 && (

                <div className="pagination">

                    <button
                        disabled={page === 1}
                        onClick={() =>
                            setPage(page - 1)
                        }
                    >

                        <FaChevronLeft />

                    </button>

                    {Array.from(
                        {
                            length: nombrePages
                        },
                        (_, i) => (

                            <button
                                key={i}
                                className={
                                    page === i + 1
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() =>
                                    setPage(i + 1)
                                }
                            >

                                {i + 1}

                            </button>

                        )
                    )}

                    <button
                        disabled={
                            page === nombrePages
                        }
                        onClick={() =>
                            setPage(page + 1)
                        }
                    >

                        <FaChevronRight />

                    </button>

                </div>

            )}

            {/* ==================================
                MODALE AJOUT / MODIFICATION
            ================================== */}

            <DestinationModal
                open={openModal}
                close={() => {

                    setOpenModal(false);
                    setSelectedDestination(null);

                }}
                destination={selectedDestination}
                refresh={chargerDestinations}
            />

            {/* ==================================
                MODALE DETAILS
            ================================== */}

            <DestinationDetailsModal
                open={
                    detailDestination !== null
                }
                close={() => {

                    setDetailDestination(null);

                }}
                destination={detailDestination}
            />

        </div>

    );
}

export default Destinations;