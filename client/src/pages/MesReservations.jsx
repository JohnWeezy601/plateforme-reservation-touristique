import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import "./MesReservations.css";


function MesReservations() {


    const navigate = useNavigate();


    const [reservations, setReservations] = useState([]);
    const [photosOffres, setPhotosOffres] = useState({});

    const [paiements, setPaiements] = useState([]);

    const [detailReservation, setDetailReservation] =
        useState(null);

    const [chargement, setChargement] =
        useState(true);


    // =====================================================
    // PAGINATION
    // =====================================================

    const [pageReservations, setPageReservations] =
        useState(1);

    const [pagePaiements, setPagePaiements] =
        useState(1);

    const elementsParPage = 3;


    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur")
    );


    // =====================================================
    // NORMALISER LE STATUT
    // =====================================================

    const normaliserStatut = (statut) => {

        return String(statut || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    };

    // =====================================================
// CHARGER TOUTES LES PHOTOS DES OFFRES
// =====================================================

const chargerPhotosOffres = async (reservations) => {

    try {

        const photosParOffre = {};

        const offresUniques = [
            ...new Set(
                reservations
                    .map(reservation => reservation.id_offre)
                    .filter(Boolean)
            )
        ];

        await Promise.all(

            offresUniques.map(
                async (idOffre) => {

                    try {

                        const res = await api.get(
                            `/offres/${idOffre}/photos`
                        );

                        photosParOffre[idOffre] =
                            Array.isArray(res.data)
                                ? res.data
                                : [];

                    }
                    catch (error) {

                        console.log(
                            `Erreur photos offre ${idOffre} :`,
                            error.response?.data ||
                            error
                        );

                        photosParOffre[idOffre] = [];

                    }

                }
            )

        );

        setPhotosOffres(photosParOffre);

    }
    catch (error) {

        console.log(
            "Erreur récupération photos offres :",
            error
        );

    }

};

    // =====================================================
    // CHARGER RESERVATIONS + PAIEMENTS
    // =====================================================
    

    useEffect(() => {

        let interval;


        const chargerDonnees = async () => {

            if (!utilisateur) {

                setReservations([]);

                setPaiements([]);

                setChargement(false);

                return;

            }


            try {

                // =================================================
                // RESERVATIONS
                // =================================================

                const resReservations =
                    await api.get("/reservations");


                console.log(
                    "Toutes les réservations :",
                    resReservations.data
                );


                // =================================================
                // MES RESERVATIONS
                // =================================================

                const mesReservations =
                    Array.isArray(resReservations.data)
                        ? resReservations.data.filter(

                            reservation =>

                                Number(
                                    reservation.id_utilisateur
                                ) ===
                                Number(
                                    utilisateur.id_utilisateur
                                )

                        )
                        : [];


                console.log(
                    "Mes réservations :",
                    mesReservations
                );


                // =================================================
                // RESERVATIONS VISIBLES
                // =================================================

                const reservationsVisibles =
                    mesReservations.filter(

                        reservation => {

                            const statut =
                                normaliserStatut(
                                    reservation.statut
                                );


                            return (

                                statut === "en attente" ||

                                statut === "attente" ||

                                statut === "annulee" ||

                                statut === "rejetee"

                            );

                        }

                    );


              setReservations(
    reservationsVisibles
);

chargerPhotosOffres(
    reservationsVisibles
);


                // =================================================
                // PAIEMENTS
                // =================================================

                try {

                    const resPaiements =
                        await api.get("/paiements");


                    console.log(
                        "Tous les paiements :",
                        resPaiements.data
                    );


                    // =================================================
                    // MES PAIEMENTS
                    // =================================================

                    const mesPaiements =
                        Array.isArray(resPaiements.data)
                            ? resPaiements.data.filter(

                                paiement =>

                                    Number(
                                        paiement.id_utilisateur
                                    ) ===
                                    Number(
                                        utilisateur.id_utilisateur
                                    )

                            )
                            : [];


                    console.log(
                        "Mes paiements :",
                        mesPaiements
                    );


                    // =================================================
                    // PAIEMENTS VISIBLES
                    // =================================================

                    const paiementsVisibles =
                        mesPaiements.filter(

                            paiement => {

                                const statut =
                                    normaliserStatut(
                                        paiement.statut
                                    );


                                return (

                                    statut === "en attente" ||

                                    statut === "attente" ||

                                    statut === "non valide" ||

                                    statut === "non validee" ||

                                    statut === "echoue" ||

                                    statut === "echec"

                                );

                            }

                        );


                    setPaiements(
                        paiementsVisibles
                    );


                }
                catch (error) {

                    console.log(
                        "Erreur chargement paiements :",
                        error
                    );

                    setPaiements([]);

                }


            }
            catch (error) {

                console.log(
                    "Erreur chargement réservations :",
                    error
                );

                setReservations([]);

            }
            finally {

                setChargement(false);

            }

        };


        // =====================================================
        // PREMIER CHARGEMENT
        // =====================================================

        chargerDonnees();


        // =====================================================
        // ACTUALISATION AUTOMATIQUE
        // =====================================================

        interval = setInterval(
            chargerDonnees,
            5000
        );


        // =====================================================
        // NETTOYAGE
        // =====================================================

        return () => {

            clearInterval(interval);

        };


    }, []);


    // =====================================================
    // PAGINATION RESERVATIONS
    // =====================================================

    const totalPagesReservations =
        Math.ceil(
            reservations.length /
            elementsParPage
        );


    const indexDebutReservations =
        (pageReservations - 1) *
        elementsParPage;


    const reservationsPage =
        reservations.slice(
            indexDebutReservations,
            indexDebutReservations +
            elementsParPage
        );


    // =====================================================
    // PAGINATION PAIEMENTS
    // =====================================================

    const totalPagesPaiements =
        Math.ceil(
            paiements.length /
            elementsParPage
        );


    const indexDebutPaiements =
        (pagePaiements - 1) *
        elementsParPage;


    const paiementsPage =
        paiements.slice(
            indexDebutPaiements,
            indexDebutPaiements +
            elementsParPage
        );


    // =====================================================
    // CLASSE STATUT RESERVATION
    // =====================================================

    const statutClass = (statut) => {

        const valeur =
            normaliserStatut(statut);


        if (
            valeur === "annulee"
        ) {

            return "annulee";

        }


        if (
            valeur === "rejetee"
        ) {

            return "rejetee";

        }


        if (
            valeur === "confirmee"
        ) {

            return "confirmee";

        }


        return "attente";

    };


    // =====================================================
    // CLASSE STATUT PAIEMENT
    // =====================================================

    const paiementClass = (statut) => {

        const valeur =
            normaliserStatut(statut);


        if (
            valeur === "echoue" ||
            valeur === "echec"
        ) {

            return "paiement-echoue";

        }


        if (
            valeur === "non valide" ||
            valeur === "non validee"
        ) {

            return "paiement-non-valide";

        }


        if (
            valeur === "valide" ||
            valeur === "paye"
        ) {

            return "paiement-valide";

        }


        return "paiement-attente";

    };


    // =====================================================
    // SUPPRIMER RESERVATION
    // =====================================================

    const supprimerReservation =
        async (idReservation) => {


            const confirmer =
                window.confirm(
                    "Voulez-vous vraiment supprimer cette réservation ?"
                );


            if (!confirmer) {

                return;

            }


            try {

                await api.delete(
                    `/reservations/${idReservation}`
                );


                setReservations(
                    anciennesReservations => {

                        const nouvellesReservations =
                            anciennesReservations.filter(

                                reservation =>

                                    reservation.id_reservation !==
                                    idReservation

                            );


                        // Revenir à la page précédente
                        // si la page actuelle devient vide

                        const nouvelleTotalPages =
                            Math.ceil(
                                nouvellesReservations.length /
                                elementsParPage
                            );


                        if (
                            pageReservations >
                            nouvelleTotalPages &&
                            nouvelleTotalPages > 0
                        ) {

                            setPageReservations(
                                nouvelleTotalPages
                            );

                        }


                        return nouvellesReservations;

                    }
                );


                if (
                    detailReservation &&
                    detailReservation.id_reservation ===
                    idReservation
                ) {

                    setDetailReservation(null);

                }


            }
            catch (error) {

                console.error(
                    "Erreur suppression réservation :",
                    error.response?.data ||
                    error.message
                );


                alert(
                    "Impossible de supprimer cette réservation."
                );

            }

        };


    // =====================================================
    // SUPPRIMER PAIEMENT
    // =====================================================

    const supprimerPaiement =
        async (idPaiement) => {


            const confirmer =
                window.confirm(
                    "Voulez-vous vraiment supprimer ce paiement ?"
                );


            if (!confirmer) {

                return;

            }


            try {

                await api.delete(
                    `/paiements/${idPaiement}`
                );


                setPaiements(
                    anciensPaiements => {

                        const nouveauxPaiements =
                            anciensPaiements.filter(

                                paiement =>

                                    paiement.id_paiement !==
                                    idPaiement

                            );


                        const nouvelleTotalPages =
                            Math.ceil(
                                nouveauxPaiements.length /
                                elementsParPage
                            );


                        if (
                            pagePaiements >
                            nouvelleTotalPages &&
                            nouvelleTotalPages > 0
                        ) {

                            setPagePaiements(
                                nouvelleTotalPages
                            );

                        }


                        return nouveauxPaiements;

                    }
                );


            }
            catch (error) {

                console.error(
                    "Erreur suppression paiement :",
                    error.response?.data ||
                    error.message
                );


                alert(
                    "Impossible de supprimer ce paiement."
                );

            }

        };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (chargement) {

        return (

            <div className="mes-reservations">

                <h1>
                    Mes réservations
                </h1>

                <p className="subtitle">
                    Chargement de vos réservations...
                </p>

            </div>

        );

    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="mes-reservations">


            {/* =================================================
                BOUTON RETOUR
            ================================================= */}

            <button
                type="button"
                className="retour-page-button"
                onClick={() => navigate(-1)}
            >

                ← Retour

            </button>


            <h1>
                Mes réservations
            </h1>


            <p className="subtitle">

                Retrouvez vos réservations en attente,
                annulées ou rejetées ainsi que vos paiements
                nécessitant une action.

            </p>


            {/* =================================================
                RESERVATIONS
            ================================================= */}

            <section className="reservations-section">


                <h2>
                    📋 Mes réservations
                </h2>


                {

                    reservations.length === 0 ? (

                        <div className="empty">

                            Aucune réservation à afficher.

                        </div>

                    ) : (

                        <>

                            <div className="reservations-list">


                                {

                                    reservationsPage.map(

                                        reservation => (

                                            <div

                                                className="reservation-client-card"

                                                key={
                                                    reservation.id_reservation
                                                }

                                            >


                                                {/* IMAGE */}

                                                <div className="reservation-image">

    {
        photosOffres[reservation.id_offre]?.length > 0 ? (

            <div className="reservation-photos">

                {
                    photosOffres[
                        reservation.id_offre
                    ].map(
                        (photo, index) => {

                            const nomPhoto =
                                typeof photo === "string"
                                    ? photo
                                    : photo.photo ||
                                      photo.nom_photo ||
                                      photo.image;

                            return (

                                <img
                                    key={
                                        photo.id_photo ||
                                        photo.id ||
                                        index
                                    }

                                    src={
                                        nomPhoto?.startsWith("http://") ||
                                        nomPhoto?.startsWith("https://")
                                            ? nomPhoto
                                            : `${import.meta.env.VITE_SERVER_URL}/uploads/${nomPhoto}`
                                    }

                                    alt={
                                        reservation.titre ||
                                        "Photo de l'offre"
                                    }

                                    onError={(e) => {

                                        console.log(
                                            "Erreur chargement photo offre :",
                                            nomPhoto
                                        );

                                        e.currentTarget.style.display =
                                            "none";

                                    }}
                                />

                            );

                        }
                    )

                }

            </div>

        ) : reservation.image ? (

            <img
                src={
                    `${import.meta.env.VITE_SERVER_URL}/uploads/${reservation.image}`
                }

                alt={
                    reservation.titre ||
                    "Offre touristique"
                }
            />

        ) : (

            <div className="reservation-no-image">

                🏝️

            </div>

        )
    }

</div>


                                                {/* INFORMATIONS */}

                                                <div className="reservation-info">


                                                    <h2>

                                                        {
                                                            reservation.titre ||
                                                            "Offre touristique"
                                                        }

                                                    </h2>


                                                    <p>

                                                        📅 Date réservation :

                                                        {" "}

                                                        {

                                                            reservation.date_reservation

                                                                ? new Date(
                                                                    reservation.date_reservation
                                                                ).toLocaleDateString(
                                                                    "fr-FR"
                                                                )

                                                                : "-"

                                                        }

                                                    </p>


                                                    <p>

                                                        👥 Nombre personnes :

                                                        {" "}

                                                        {
                                                            reservation.nombre_personnes ||
                                                            0
                                                        }

                                                    </p>


                                                    <p>

                                                        💰 Montant :

                                                        {" "}

                                                        <strong>

                                                            {

                                                                Number(
                                                                    reservation.montant_total ||
                                                                    0
                                                                ).toLocaleString(
                                                                    "fr-FR"
                                                                )

                                                            }

                                                            {" "}Ar

                                                        </strong>

                                                    </p>


                                                    {/* STATUT */}

                                                    <span

                                                        className={
                                                            `statut ${statutClass(
                                                                reservation.statut
                                                            )}`
                                                        }

                                                    >

                                                        {
                                                            reservation.statut ||
                                                            "En attente"
                                                        }

                                                    </span>


                                                    {/* ACTIONS */}

                                                    <div className="reservation-actions">


                                                        <button

                                                            type="button"

                                                            className="voir-plus-button"

                                                            onClick={() =>
                                                                setDetailReservation(
                                                                    reservation
                                                                )
                                                            }

                                                        >

                                                            👁️ Voir plus

                                                        </button>


                                                        <button

                                                            type="button"

                                                            className="supprimer-button"

                                                            onClick={() =>
                                                                supprimerReservation(
                                                                    reservation.id_reservation
                                                                )
                                                            }

                                                        >

                                                            🗑️ Supprimer

                                                        </button>


                                                    </div>


                                                </div>


                                            </div>

                                        )

                                    )

                                }


                            </div>


                            {/* PAGINATION RESERVATIONS */}

                            {

                                totalPagesReservations > 1 && (

                                    <div className="pagination">


                                        <button

                                            type="button"

                                            onClick={() =>
                                                setPageReservations(
                                                    pageReservations - 1
                                                )
                                            }

                                            disabled={
                                                pageReservations === 1
                                            }

                                        >

                                            ← Précédent

                                        </button>


                                        {

                                            Array.from(
                                                {
                                                    length:
                                                        totalPagesReservations
                                                },
                                                (_, index) => (

                                                    <button

                                                        type="button"

                                                        key={index + 1}

                                                        className={
                                                            pageReservations ===
                                                            index + 1
                                                                ? "active"
                                                                : ""
                                                        }

                                                        onClick={() =>
                                                            setPageReservations(
                                                                index + 1
                                                            )
                                                        }

                                                    >

                                                        {index + 1}

                                                    </button>

                                                )
                                            )

                                        }


                                        <button

                                            type="button"

                                            onClick={() =>
                                                setPageReservations(
                                                    pageReservations + 1
                                                )
                                            }

                                            disabled={
                                                pageReservations ===
                                                totalPagesReservations
                                            }

                                        >

                                            Suivant →

                                        </button>


                                    </div>

                                )

                            }

                        </>

                    )

                }


            </section>


            {/* =================================================
                PAIEMENTS
            ================================================= */}

            <section className="paiements-section">


                <h2>
                    💳 Paiements nécessitant une action
                </h2>


                {

                    paiements.length === 0 ? (

                        <div className="empty">

                            Aucun paiement nécessitant une action.

                        </div>

                    ) : (

                        <>

                            <div className="paiements-list">


                                {

                                    paiementsPage.map(

                                        paiement => (

                                            <div

                                                className="paiement-client-card"

                                                key={
                                                    paiement.id_paiement
                                                }

                                            >


                                                <div className="paiement-info">


                                                    <h3>

                                                        💳 Paiement #

                                                        {
                                                            paiement.id_paiement
                                                        }

                                                    </h3>


                                                    {

                                                        paiement.id_reservation && (

                                                            <p>

                                                                📋 Réservation :

                                                                {" "}

                                                                <strong>

                                                                    #
                                                                    {
                                                                        paiement.id_reservation
                                                                    }

                                                                </strong>

                                                            </p>

                                                        )

                                                    }


                                                    <p>

                                                        💰 Montant :

                                                        {" "}

                                                        <strong>

                                                            {

                                                                Number(

                                                                    paiement.montant ||

                                                                    paiement.montant_total ||

                                                                    0

                                                                ).toLocaleString(
                                                                    "fr-FR"
                                                                )

                                                            }

                                                            {" "}Ar

                                                        </strong>

                                                    </p>


                                                    {

                                                        paiement.mode_paiement && (

                                                            <p>

                                                                💳 Mode de paiement :

                                                                {" "}

                                                                <strong>

                                                                    {
                                                                        paiement.mode_paiement
                                                                    }

                                                                </strong>

                                                            </p>

                                                        )

                                                    }


                                                    <span

                                                        className={
                                                            `paiement-statut ${paiementClass(
                                                                paiement.statut
                                                            )}`
                                                        }

                                                    >

                                                        {
                                                            paiement.statut ||
                                                            "En attente"
                                                        }

                                                    </span>


                                                    <div className="paiement-actions">


                                                        <button

                                                            type="button"

                                                            className="supprimer-button"

                                                            onClick={() =>
                                                                supprimerPaiement(
                                                                    paiement.id_paiement
                                                                )
                                                            }

                                                        >

                                                            🗑️ Supprimer

                                                        </button>


                                                    </div>


                                                </div>


                                            </div>

                                        )

                                    )

                                }


                            </div>


                            {/* PAGINATION PAIEMENTS */}

                            {

                                totalPagesPaiements > 1 && (

                                    <div className="pagination">


                                        <button

                                            type="button"

                                            onClick={() =>
                                                setPagePaiements(
                                                    pagePaiements - 1
                                                )
                                            }

                                            disabled={
                                                pagePaiements === 1
                                            }

                                        >

                                            ← Précédent

                                        </button>


                                        {

                                            Array.from(
                                                {
                                                    length:
                                                        totalPagesPaiements
                                                },
                                                (_, index) => (

                                                    <button

                                                        type="button"

                                                        key={index + 1}

                                                        className={
                                                            pagePaiements ===
                                                            index + 1
                                                                ? "active"
                                                                : ""
                                                        }

                                                        onClick={() =>
                                                            setPagePaiements(
                                                                index + 1
                                                            )
                                                        }

                                                    >

                                                        {index + 1}

                                                    </button>

                                                )
                                            )

                                        }


                                        <button

                                            type="button"

                                            onClick={() =>
                                                setPagePaiements(
                                                    pagePaiements + 1
                                                )
                                            }

                                            disabled={
                                                pagePaiements ===
                                                totalPagesPaiements
                                            }

                                        >

                                            Suivant →

                                        </button>


                                    </div>

                                )

                            }

                        </>

                    )

                }


            </section>


            {/* =================================================
                MODALE VOIR PLUS
            ================================================= */}

            {

                detailReservation && (

                    <div

                        className="reservation-modal-overlay"

                        onClick={() =>
                            setDetailReservation(null)
                        }

                    >


                        <div

                            className="reservation-modal"

                            onClick={e =>
                                e.stopPropagation()
                            }

                        >


                            {/* HEADER */}

                            <div className="reservation-modal-header">


                                <h2>

                                    {
                                        detailReservation.titre ||
                                        "Détails de la réservation"
                                    }

                                </h2>


                                <button

                                    type="button"

                                    className="reservation-modal-close"

                                    onClick={() =>
                                        setDetailReservation(null)
                                    }

                                >

                                    ×

                                </button>


                            </div>


                            {/* IMAGE */}

                            {

                                detailReservation.image && (

                                    <div className="reservation-modal-image">

                                        <img

                                            src={
                                                `${import.meta.env.VITE_SERVER_URL}/uploads/${detailReservation.image}`
                                            }

                                            alt={
                                                detailReservation.titre ||
                                                "Offre touristique"
                                            }

                                        />

                                    </div>

                                )

                            }


                            {/* DETAILS */}

                            <div className="reservation-details">


                                <p>

                                    <strong>
                                        Statut :
                                    </strong>

                                    {" "}

                                    <span

                                        className={
                                            `statut ${statutClass(
                                                detailReservation.statut
                                            )}`
                                        }

                                    >

                                        {
                                            detailReservation.statut
                                        }

                                    </span>

                                </p>


                                <p>

                                    <strong>
                                        Date de réservation :
                                    </strong>

                                    {" "}

                                    {

                                        detailReservation.date_reservation

                                            ? new Date(
                                                detailReservation.date_reservation
                                            ).toLocaleDateString(
                                                "fr-FR"
                                            )

                                            : "-"

                                    }

                                </p>


                                <p>

                                    <strong>
                                        Nombre de personnes :
                                    </strong>

                                    {" "}

                                    {
                                        detailReservation.nombre_personnes ||
                                        0
                                    }

                                </p>


                                <p>

                                    <strong>
                                        Montant total :
                                    </strong>

                                    {" "}

                                    {

                                        Number(
                                            detailReservation.montant_total ||
                                            0
                                        ).toLocaleString(
                                            "fr-FR"
                                        )

                                    }

                                    {" "}Ar

                                </p>


                                {

                                    detailReservation.destination && (

                                        <p>

                                            <strong>
                                                Destination :
                                            </strong>

                                            {" "}

                                            {
                                                detailReservation.destination
                                            }

                                        </p>

                                    )

                                }


                                {

                                    detailReservation.message && (

                                        <p>

                                            <strong>
                                                Message :
                                            </strong>

                                            {" "}

                                            {
                                                detailReservation.message
                                            }

                                        </p>

                                    )

                                }


                            </div>


                            {/* FOOTER */}

                            <div className="reservation-modal-footer">


                                <button

                                    type="button"

                                    className="fermer-modal-button"

                                    onClick={() =>
                                        setDetailReservation(null)
                                    }

                                >

                                    Fermer

                                </button>


                            </div>


                        </div>


                    </div>

                )

            }


        </div>

    );

}


export default MesReservations;
