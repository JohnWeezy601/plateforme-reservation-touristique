import { useEffect, useState } from "react";
import api from "../api/api";
import "./Paiements.css";

function Paiements() {
    const [paiements, setPaiements] = useState([]);
    const [recherche, setRecherche] = useState("");
    const [menuOuvert, setMenuOuvert] = useState(null);
    const [detailPaiement, setDetailPaiement] = useState(null);

    const [page, setPage] = useState(1);
    const paiementsParPage = 4;

    // ===========================
    // URL IMAGE
    // ===========================

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

    // ===========================
    // CHARGER PAIEMENTS
    // ===========================

    const chargerPaiements = async () => {
        try {
            const res = await api.get("/paiements");

            setPaiements(res.data);
        } catch (error) {
            console.log(
                "Erreur chargement paiements :",
                error
            );
        }
    };

    useEffect(() => {
        chargerPaiements();
    }, []);

    // ===========================
    // VALIDER PAIEMENT
    // ===========================

    const validerPaiement = async (id) => {
        try {
            await api.put(
                `/paiements/${id}`,
                {
                    statut: "Paye"
                }
            );

            setPaiements((prev) =>
                prev.map((paiement) =>
                    paiement.id_paiement === id
                        ? {
                            ...paiement,
                            statut: "Paye"
                        }
                        : paiement
                )
            );

            if (
                detailPaiement &&
                detailPaiement.id_paiement === id
            ) {
                setDetailPaiement({
                    ...detailPaiement,
                    statut: "Paye"
                });
            }

            setMenuOuvert(null);
        } catch (error) {
            console.log(
                "Erreur validation paiement :",
                error
            );
        }
    };

    // ===========================
    // REFUSER PAIEMENT
    // ===========================

    const refuserPaiement = async (id) => {
        try {
            await api.put(
                `/paiements/${id}`,
                {
                    statut: "Echoue"
                }
            );

            setPaiements((prev) =>
                prev.map((paiement) =>
                    paiement.id_paiement === id
                        ? {
                            ...paiement,
                            statut: "Echoue"
                        }
                        : paiement
                )
            );

            if (
                detailPaiement &&
                detailPaiement.id_paiement === id
            ) {
                setDetailPaiement({
                    ...detailPaiement,
                    statut: "Echoue"
                });
            }

            setMenuOuvert(null);
        } catch (error) {
            console.log(
                "Erreur refus paiement :",
                error
            );
        }
    };

    // ===========================
    // SUPPRIMER PAIEMENT
    // ===========================

    const supprimerPaiement = async (id) => {
        const confirmation = window.confirm(
            "Voulez-vous supprimer ce paiement ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            await api.delete(
                `/paiements/${id}`
            );

            setPaiements((prev) =>
                prev.filter(
                    (paiement) =>
                        paiement.id_paiement !== id
                )
            );

            if (
                detailPaiement &&
                detailPaiement.id_paiement === id
            ) {
                setDetailPaiement(null);
            }

            setMenuOuvert(null);
        } catch (error) {
            console.log(
                "Erreur suppression paiement :",
                error
            );

            alert(
                "Impossible de supprimer le paiement"
            );
        }
    };

    // ===========================
    // RECHERCHE
    // ===========================

    const paiementsFiltres = paiements.filter(
        (paiement) => {
            const texte = recherche
                .toLowerCase()
                .trim();

            return (
                (paiement.mode_paiement || "")
                    .toLowerCase()
                    .includes(texte) ||

                String(
                    paiement.id_reservation || ""
                ).includes(texte) ||

                (
                    paiement.date_paiement
                        ? new Date(
                            paiement.date_paiement
                        ).toLocaleDateString("fr-FR")
                        : ""
                ).includes(texte)
            );
        }
    );

    // ===========================
    // PAGINATION
    // ===========================

    const indexDernier =
        page * paiementsParPage;

    const indexPremier =
        indexDernier - paiementsParPage;

    const paiementsAffiches =
        paiementsFiltres.slice(
            indexPremier,
            indexDernier
        );

    const nombrePages =
        Math.ceil(
            paiementsFiltres.length /
            paiementsParPage
        );

    // ===========================
    // RENDER
    // ===========================

    return (
        <div className="dashboard-content">

            {/* HEADER */}

            <div className="paiement-header">
                <div>
                    <h1>
                        💳 Gestion des paiements
                    </h1>

                    <p>
                        Gérez les paiements des réservations des clients.
                    </p>
                </div>
            </div>


            {/* RECHERCHE */}

            <div className="recherche-paiement">
                <input
                    type="text"
                    placeholder="🔍 Rechercher paiement..."
                    value={recherche}
                    onChange={(e) => {
                        setRecherche(e.target.value);
                        setPage(1);
                    }}
                />
            </div>


            {/* LISTE PAIEMENTS */}

            <div className="paiements-grid">

                {paiementsAffiches.length === 0 ? (

                    <div className="empty">
                        Aucun paiement disponible
                    </div>

                ) : (

                    paiementsAffiches.map((paiement) => (

                        <div
                            className="paiement-card"
                            key={paiement.id_paiement}
                        >

                            {/* MENU */}

                            <div className="menu-paiement">

                                <button
                                    className="btn-menu-paiement"
                                    onClick={() =>
                                        setMenuOuvert(
                                            menuOuvert ===
                                            paiement.id_paiement
                                                ? null
                                                : paiement.id_paiement
                                        )
                                    }
                                >
                                    ⋮
                                </button>


                                {menuOuvert ===
                                    paiement.id_paiement && (

                                    <div className="menu-actions">

                                        <button
                                            onClick={() => {
                                                setDetailPaiement(
                                                    paiement
                                                );

                                                setMenuOuvert(
                                                    null
                                                );
                                            }}
                                        >
                                            👁 Voir détails
                                        </button>


                                        <button
                                            disabled={
                                                paiement.statut ===
                                                "Paye"
                                            }
                                            onClick={() =>
                                                validerPaiement(
                                                    paiement.id_paiement
                                                )
                                            }
                                        >
                                            ✅ Valider
                                        </button>


                                        <button
                                            disabled={
                                                paiement.statut ===
                                                "Echoue"
                                            }
                                            onClick={() =>
                                                refuserPaiement(
                                                    paiement.id_paiement
                                                )
                                            }
                                        >
                                            ❌ Refuser
                                        </button>


                                        <button
                                            onClick={() =>
                                                supprimerPaiement(
                                                    paiement.id_paiement
                                                )
                                            }
                                        >
                                            🗑 Supprimer
                                        </button>

                                    </div>
                                )}

                            </div>


                            {/* INFORMATIONS */}

                            <div className="paiement-body">

                                <h3>
                                    Paiement #
                                    {paiement.id_paiement}
                                </h3>


                                <p>
                                    <strong>
                                        Réservation :
                                    </strong>{" "}
                                    {paiement.id_reservation}
                                </p>


                                <p>
                                    <strong>
                                        Client :
                                    </strong>{" "}
                                    {paiement.nom || "Non défini"}{" "}
                                    {paiement.prenom || ""}
                                </p>


                                <p>
                                    <strong>
                                        Montant :
                                    </strong>{" "}

                                    {Number(
                                        paiement.montant_total ||
                                        paiement.montant ||
                                        0
                                    ).toLocaleString("fr-FR")}{" "}
                                    €
                                </p>


                                <p>
                                    <strong>
                                        Mode :
                                    </strong>{" "}
                                    {paiement.mode_paiement || "-"}
                                </p>


                                <p>
                                    <strong>
                                        Date :
                                    </strong>{" "}

                                    {paiement.date_paiement
                                        ? new Date(
                                            paiement.date_paiement
                                        ).toLocaleDateString("fr-FR")
                                        : "-"
                                    }
                                </p>


                                <p>
                                    <strong>
                                        Statut :
                                    </strong>{" "}

                                    <span
                                        className={
                                            `statut ${
                                                (
                                                    paiement.statut ||
                                                    "En attente"
                                                )
                                                    .replace(/\s/g, "")
                                                    .toLowerCase()
                                            }`
                                        }
                                    >
                                        {paiement.statut ||
                                            "En attente"}
                                    </span>
                                </p>

                            </div>

                        </div>
                    ))
                )}

            </div>


            {/* PAGINATION */}

            {nombrePages > 0 && (
                <div className="pagination">

                    <button
                        disabled={page === 1}
                        onClick={() =>
                            setPage(page - 1)
                        }
                    >
                        ⬅
                    </button>


                    {Array.from(
                        { length: nombrePages },
                        (_, index) => (
                            <button
                                key={index}
                                className={
                                    page === index + 1
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() =>
                                    setPage(index + 1)
                                }
                            >
                                {index + 1}
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
                        ➡
                    </button>

                </div>
            )}


            {/* MODALE */}

            {detailPaiement && (

                <div className="modal-overlay">

                    <div className="modal-paiement">

                        {/* HEADER MODALE */}

                        <div className="modal-header">

                            <h2>
                                Détails du paiement
                            </h2>

                            <button
                                className="close-modal"
                                onClick={() =>
                                    setDetailPaiement(null)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <div className="detail-grid">

                            <p>
                                <strong>
                                    ID paiement :
                                </strong>{" "}
                                {detailPaiement.id_paiement}
                            </p>


                            <p>
                                <strong>
                                    ID réservation :
                                </strong>{" "}
                                {detailPaiement.id_reservation}
                            </p>


                            <hr />


                            {/* CLIENT */}

                            <h3>
                                Informations client
                            </h3>


                            <p>
                                <strong>
                                    Nom :
                                </strong>{" "}
                                {detailPaiement.nom || "-"}{" "}
                                {detailPaiement.prenom || ""}
                            </p>


                            <p>
                                <strong>
                                    Email :
                                </strong>{" "}
                                {detailPaiement.email || "-"}
                            </p>


                            <p>
                                <strong>
                                    Téléphone :
                                </strong>{" "}
                                {detailPaiement.telephone || "-"}
                            </p>


                            <hr />


                            {/* OFFRE */}

                            <h3>
                                Informations offre
                            </h3>


                            <p>
                                <strong>
                                    Offre :
                                </strong>{" "}
                                {detailPaiement.titre || "-"}
                            </p>


                            <p>
                                <strong>
                                    Destination :
                                </strong>{" "}
                                {detailPaiement.destination || "-"}
                            </p>


                            <p>
                                <strong>
                                    Prix :
                                </strong>{" "}

                                {Number(
                                    detailPaiement.prix || 0
                                ).toLocaleString("fr-FR")}{" "}
                                €
                            </p>


                            <hr />


                            {/* SEJOUR */}

                            <h3>
                                Informations séjour
                            </h3>


                            <p>
                                <strong>
                                    Date réservation :
                                </strong>{" "}

                                {detailPaiement.date_reservation
                                    ? new Date(
                                        detailPaiement.date_reservation
                                    ).toLocaleDateString("fr-FR")
                                    : "-"
                                }
                            </p>


                            <p>
                                <strong>
                                    Début séjour :
                                </strong>{" "}

                                {detailPaiement.date_debut_sejour
                                    ? new Date(
                                        detailPaiement.date_debut_sejour
                                    ).toLocaleDateString("fr-FR")
                                    : "-"
                                }
                            </p>


                            <p>
                                <strong>
                                    Fin séjour :
                                </strong>{" "}

                                {detailPaiement.date_fin_sejour
                                    ? new Date(
                                        detailPaiement.date_fin_sejour
                                    ).toLocaleDateString("fr-FR")
                                    : "-"
                                }
                            </p>


                            <p>
                                <strong>
                                    Nombre personnes :
                                </strong>{" "}
                                {detailPaiement.nombre_personnes || 0}
                            </p>


                            <hr />


                            {/* PAIEMENT */}

                            <h3>
                                Paiement
                            </h3>


                            <p>
                                <strong>
                                    Montant payé :
                                </strong>{" "}

                                {Number(
                                    detailPaiement.montant_total ||
                                    detailPaiement.montant ||
                                    0
                                ).toLocaleString("fr-FR")}{" "}
                                €
                            </p>


                            <p>
                                <strong>
                                    Mode paiement :
                                </strong>{" "}
                                {detailPaiement.mode_paiement || "-"}
                            </p>


                            <p>
                                <strong>
                                    Statut :
                                </strong>{" "}

                                <span
                                    className={
                                        `statut ${
                                            (
                                                detailPaiement.statut ||
                                                "En attente"
                                            )
                                                .replace(/\s/g, "")
                                                .toLowerCase()
                                        }`
                                    }
                                >
                                    {detailPaiement.statut ||
                                        "En attente"}
                                </span>
                            </p>

                        </div>


                        {/* PREUVE DE PAIEMENT */}

                        {detailPaiement.preuve && (

                            <div className="preuve-paiement">

                                <h3>
                                    Preuve paiement
                                </h3>

                                <img
                                    src={getImageUrl(
                                        detailPaiement.preuve
                                    )}
                                    alt="Preuve de paiement"
                                />

                            </div>
                        )}


                        {/* ACTIONS */}

                        <div className="modal-actions">

                            <button
                                className="btn-valider"
                                disabled={
                                    detailPaiement.statut ===
                                    "Paye"
                                }
                                onClick={() =>
                                    validerPaiement(
                                        detailPaiement.id_paiement
                                    )
                                }
                            >
                                ✅ Valider
                            </button>


                            <button
                                className="btn-refuser"
                                disabled={
                                    detailPaiement.statut ===
                                    "Echoue"
                                }
                                onClick={() =>
                                    refuserPaiement(
                                        detailPaiement.id_paiement
                                    )
                                }
                            >
                                ❌ Refuser
                            </button>


                            <button
                                className="btn-close"
                                onClick={() =>
                                    setDetailPaiement(null)
                                }
                            >
                                Fermer
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Paiements;