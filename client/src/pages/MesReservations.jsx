import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import "./MesReservations.css";

function MesReservations() {

    const navigate = useNavigate();

    // =====================================================
    // ETATS
    // =====================================================

    const [reservations, setReservations] = useState([]);
    const [offresDetails, setOffresDetails] = useState({});
    const [paiements, setPaiements] = useState([]);
    const [detailReservation, setDetailReservation] = useState(null);
    const [chargement, setChargement] = useState(true);

    // =====================================================
    // PAGINATION
    // =====================================================

    const [pageReservations, setPageReservations] = useState(1);
    const [pagePaiements, setPagePaiements] = useState(1);

    const elementsParPage = 3;

    // =====================================================
    // UTILISATEUR
    // =====================================================

    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur")
    );

    // =====================================================
    // NORMALISER STATUT
    // =====================================================

    const normaliserStatut = (statut) => {

        return String(statut || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    };

    // =====================================================
    // FORMAT MONTANT EURO
    // =====================================================
    // IMPORTANT :
    // AUCUNE CONVERSION.
    // La valeur reçue est affichée telle quelle avec €.
    // Exemple : 150000 => 150 000 €
    // =====================================================

    const formatMontantEuro = (montant) => {

        return `${Number(montant || 0).toLocaleString("fr-FR")} €`;

    };

    // =====================================================
    // CONSTRUIRE URL PHOTO
    // =====================================================

    const construireUrlPhoto = (photo) => {

        if (!photo) {
            return null;
        }

        let nomPhoto = null;

        // -------------------------------------------------
        // STRING
        // -------------------------------------------------

        if (typeof photo === "string") {

            nomPhoto = photo;

        }

        // -------------------------------------------------
        // OBJET
        // -------------------------------------------------

        else if (typeof photo === "object") {

            nomPhoto =
                photo.secure_url ||
                photo.url ||
                photo.chemin_photo ||
                photo.photo ||
                photo.image ||
                photo.nom_photo ||
                photo.filename ||
                photo.file_name ||
                null;

        }

        if (!nomPhoto) {
            return null;
        }

        nomPhoto = String(nomPhoto).trim();

        if (!nomPhoto) {
            return null;
        }

        // -------------------------------------------------
        // CLOUDINARY / URL EXTERNE
        // -------------------------------------------------

        if (
            nomPhoto.startsWith("http://") ||
            nomPhoto.startsWith("https://") ||
            nomPhoto.startsWith("blob:")
        ) {

            return nomPhoto;

        }

        // -------------------------------------------------
        // URL SERVEUR
        // -------------------------------------------------

        const serveur = (
            import.meta.env.VITE_SERVER_URL ||
            import.meta.env.VITE_API_URL ||
            "http://localhost:8081"
        ).replace(/\/$/, "");

        // -------------------------------------------------
        // /uploads/...
        // -------------------------------------------------

        if (nomPhoto.startsWith("/uploads/")) {

            return `${serveur}${nomPhoto}`;

        }

        // -------------------------------------------------
        // uploads/...
        // -------------------------------------------------

        if (nomPhoto.startsWith("uploads/")) {

            return `${serveur}/${nomPhoto}`;

        }

        // -------------------------------------------------
        // AUTRE CHEMIN
        // -------------------------------------------------

        if (nomPhoto.startsWith("/")) {

            return `${serveur}${nomPhoto}`;

        }

        // -------------------------------------------------
        // ANCIEN NOM DE FICHIER
        // -------------------------------------------------

        return `${serveur}/uploads/${nomPhoto}`;

    };

    // =====================================================
    // EXTRAIRE PHOTOS
    // =====================================================

    const extrairePhotos = (data) => {

        if (Array.isArray(data)) {

            return data;

        }

        if (
            data &&
            Array.isArray(data.photos)
        ) {

            return data.photos;

        }

        if (
            data &&
            Array.isArray(data.data)
        ) {

            return data.data;

        }

        if (
            data &&
            Array.isArray(data.images)
        ) {

            return data.images;

        }

        return [];

    };

    // =====================================================
    // CHARGER LES INFORMATIONS COMPLÈTES DES OFFRES
    // =====================================================

    const chargerDetailsOffres = async (reservations) => {

        try {

            const details = {};

            // -------------------------------------------------
            // ID OFFRES UNIQUES
            // -------------------------------------------------

            const offresUniques = [
                ...new Set(
                    reservations
                        .map(
                            (reservation) =>
                                reservation.id_offre
                        )
                        .filter(Boolean)
                )
            ];

            console.log(
                "======================================"
            );

            console.log(
                "OFFRES À RÉCUPÉRER :",
                offresUniques
            );

            console.log(
                "======================================"
            );

            // -------------------------------------------------
            // RÉCUPÉRATION DES OFFRES
            // -------------------------------------------------

            await Promise.all(

                offresUniques.map(
                    async (idOffre) => {

                        try {

                            console.log(
                                `Récupération offre ${idOffre}...`
                            );

                            const response =
                                await api.get(
                                    `/offres/${idOffre}`
                                );

                            const offre =
                                response.data;

                            console.log(
                                `Détails offre ${idOffre} :`,
                                offre
                            );

                            // -------------------------------------------------
                            // PHOTO PRINCIPALE
                            // -------------------------------------------------

                            const imagePrincipale =
                                offre?.image ||
                                offre?.image_principale ||
                                offre?.photo ||
                                offre?.photo_principale ||
                                offre?.imagePrincipale ||
                                null;

                            // -------------------------------------------------
                            // PHOTOS DÉTAILLÉES
                            // -------------------------------------------------

                            const photos =
                                extrairePhotos(
                                    offre
                                );

                            details[idOffre] = {

                                ...offre,

                                // Image principale
                                image:
                                    imagePrincipale,

                                // Photos détaillées
                                photos:
                                    photos

                            };

                            console.log(
                                `Image principale offre ${idOffre} :`,
                                imagePrincipale
                            );

                            console.log(
                                `Photos détaillées offre ${idOffre} :`,
                                photos
                            );

                        }

                        catch (error) {

                            console.error(
                                `Erreur récupération offre ${idOffre} :`,
                                error.response?.data ||
                                error.message
                            );

                            // -------------------------------------------------
                            // FALLBACK
                            // -------------------------------------------------

                            const reservation =
                                reservations.find(
                                    (item) =>
                                        Number(
                                            item.id_offre
                                        ) ===
                                        Number(
                                            idOffre
                                        )
                                );

                            details[idOffre] = {

                                image:
                                    reservation?.image ||
                                    reservation?.image_principale ||
                                    null,

                                photos: []

                            };

                        }

                    }
                )

            );

            // -------------------------------------------------
            // ENREGISTRER
            // -------------------------------------------------

            setOffresDetails(details);

            console.log(
                "======================================"
            );

            console.log(
                "DÉTAILS DE TOUTES LES OFFRES :",
                details
            );

            console.log(
                "======================================"
            );

        }

        catch (error) {

            console.error(
                "Erreur générale récupération offres :",
                error
            );

            setOffresDetails({});

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
                setOffresDetails({});
                setChargement(false);

                return;

            }

            try {

                // =================================================
                // RESERVATIONS
                // =================================================

                const resReservations =
                    await api.get(
                        "/reservations"
                    );

                console.log(
                    "Toutes les réservations :",
                    resReservations.data
                );

                // =================================================
                // MES RESERVATIONS
                // =================================================

                const mesReservations =
                    Array.isArray(
                        resReservations.data
                    )
                        ? resReservations.data.filter(
                            (reservation) =>
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
                        (reservation) => {

                            const statut =
                                normaliserStatut(
                                    reservation.statut
                                );

                            return (

                                statut ===
                                    "en attente" ||

                                statut ===
                                    "attente" ||

                                statut ===
                                    "annulee" ||

                                statut ===
                                    "rejetee"

                            );

                        }
                    );

                setReservations(
                    reservationsVisibles
                );

                // =================================================
                // RÉCUPÉRER LES OFFRES
                // =================================================

                await chargerDetailsOffres(
                    reservationsVisibles
                );

                // =================================================
                // PAIEMENTS
                // =================================================

                try {

                    const resPaiements =
                        await api.get(
                            "/paiements"
                        );

                    console.log(
                        "Tous les paiements :",
                        resPaiements.data
                    );

                    const mesPaiements =
                        Array.isArray(
                            resPaiements.data
                        )
                            ? resPaiements.data.filter(
                                (paiement) =>
                                    Number(
                                        paiement.id_utilisateur
                                    ) ===
                                    Number(
                                        utilisateur.id_utilisateur
                                    )
                            )
                            : [];

                    const paiementsVisibles =
                        mesPaiements.filter(
                            (paiement) => {

                                const statut =
                                    normaliserStatut(
                                        paiement.statut
                                    );

                                return (

                                    statut ===
                                        "en attente" ||

                                    statut ===
                                        "attente" ||

                                    statut ===
                                        "non valide" ||

                                    statut ===
                                        "non validee" ||

                                    statut ===
                                        "echoue" ||

                                    statut ===
                                        "echec"

                                );

                            }
                        );

                    setPaiements(
                        paiementsVisibles
                    );

                }

                catch (error) {

                    console.error(
                        "Erreur chargement paiements :",
                        error
                    );

                    setPaiements([]);

                }

            }

            catch (error) {

                console.error(
                    "Erreur chargement réservations :",
                    error
                );

                setReservations([]);
                setOffresDetails({});

            }

            finally {

                setChargement(false);

            }

        };

        // =================================================
        // PREMIER CHARGEMENT
        // =================================================

        chargerDonnees();

        // =================================================
        // ACTUALISATION
        // =================================================

        interval =
            setInterval(
                chargerDonnees,
                5000
            );

        return () => {

            clearInterval(
                interval
            );

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
    // STATUT RESERVATION
    // =====================================================

    const statutClass = (statut) => {

        const valeur =
            normaliserStatut(
                statut
            );

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
    // STATUT PAIEMENT
    // =====================================================

    const paiementClass = (statut) => {

        const valeur =
            normaliserStatut(
                statut
            );

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
                    (anciennesReservations) => {

                        const nouvellesReservations =
                            anciennesReservations.filter(
                                (reservation) =>
                                    reservation.id_reservation !==
                                    idReservation
                            );

                        const nouvelleTotalPages =
                            Math.ceil(
                                nouvellesReservations.length /
                                elementsParPage
                            );

                        if (
                            nouvelleTotalPages > 0 &&
                            pageReservations >
                                nouvelleTotalPages
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

                    setDetailReservation(
                        null
                    );

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
                    (anciensPaiements) => {

                        const nouveauxPaiements =
                            anciensPaiements.filter(
                                (paiement) =>
                                    paiement.id_paiement !==
                                    idPaiement
                            );

                        const nouvelleTotalPages =
                            Math.ceil(
                                nouveauxPaiements.length /
                                elementsParPage
                            );

                        if (
                            nouvelleTotalPages > 0 &&
                            pagePaiements >
                                nouvelleTotalPages
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
    // OUVRIR MODALE
    // =====================================================

    const ouvrirDetailsReservation = (
        reservation
    ) => {

        setDetailReservation(
            reservation
        );

    };

    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (chargement) {

        return (

            <div className="mes-reservations-page">

                <div className="reservations-loading">

                    <div className="loading-spinner"></div>

                    <h2>
                        Chargement de vos réservations
                    </h2>

                    <p>
                        Veuillez patienter...
                    </p>

                </div>

            </div>

        );

    }

    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="mes-reservations-page">

            <div className="mes-reservations-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="page-header">

                    <button
                        type="button"
                        className="retour-page-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <span>
                            ←
                        </span>

                        Retour

                    </button>

                    <div className="page-title">

                        <span className="title-icon">
                            📋
                        </span>

                        <div>

                            <h1>
                                Mes réservations
                            </h1>

                            <p>
                                Retrouvez vos réservations et
                                les paiements nécessitant une action.
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    RESERVATIONS
                ================================================= */}

                <section className="reservations-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Mes réservations
                            </h2>

                            <p>
                                Réservations en attente,
                                annulées ou rejetées
                            </p>

                        </div>

                        <span className="section-count">

                            {reservations.length}

                            {" "}

                            réservation
                            {reservations.length > 1 ? "s" : ""}

                        </span>

                    </div>

                    {reservations.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                🏝️
                            </div>

                            <h3>
                                Aucune réservation
                            </h3>

                            <p>
                                Vous n'avez actuellement aucune
                                réservation nécessitant une action.
                            </p>

                        </div>

                    ) : (

                        <>

                            <div className="reservations-list">

                                {reservationsPage.map(
                                    (reservation) => {

                                        // -------------------------------------------------
                                        // RÉCUPÉRER L'OFFRE
                                        // -------------------------------------------------

                                        const offre =
                                            offresDetails[
                                                reservation.id_offre
                                            ] || {};

                                        // -------------------------------------------------
                                        // IMAGE PRINCIPALE
                                        // -------------------------------------------------

                                        const imagePrincipale =
                                            offre.image ||
                                            offre.image_principale ||
                                            reservation.image ||
                                            reservation.image_principale ||
                                            null;

                                        const imageUrl =
                                            construireUrlPhoto(
                                                imagePrincipale
                                            );

                                        return (

                                            <article
                                                className="reservation-client-card"
                                                key={
                                                    reservation.id_reservation
                                                }
                                            >

                                                {/* =================================================
                                                    IMAGE PRINCIPALE
                                                ================================================= */}

                                                <div className="reservation-card-image">

                                                    {imageUrl ? (

                                                        <img
                                                            src={imageUrl}
                                                            alt={
                                                                reservation.titre ||
                                                                "Offre touristique"
                                                            }
                                                            onError={(event) => {

                                                                console.error(
                                                                    "Erreur image principale :",
                                                                    imageUrl
                                                                );

                                                                event.currentTarget.style.display =
                                                                    "none";

                                                            }}
                                                        />

                                                    ) : (

                                                        <div className="reservation-no-image">

                                                            <span>
                                                                🏝️
                                                            </span>

                                                            <small>
                                                                Aucune image
                                                            </small>

                                                        </div>

                                                    )}

                                                    {/* STATUT */}

                                                    <span
                                                        className={
                                                            `image-status ${statutClass(
                                                                reservation.statut
                                                            )}`
                                                        }
                                                    >

                                                        {reservation.statut ||
                                                            "En attente"}

                                                    </span>

                                                </div>

                                                {/* =================================================
                                                    INFORMATIONS
                                                ================================================= */}

                                                <div className="reservation-info">

                                                    <div className="reservation-info-top">

                                                        <span className="reservation-label">
                                                            RÉSERVATION
                                                        </span>

                                                        <span className="reservation-number">

                                                            #

                                                            {
                                                                reservation.id_reservation
                                                            }

                                                        </span>

                                                    </div>

                                                    <h2>

                                                        {
                                                            reservation.titre ||
                                                            "Offre touristique"
                                                        }

                                                    </h2>

                                                    {reservation.destination && (

                                                        <p className="reservation-destination">

                                                            📍

                                                            {
                                                                reservation.destination
                                                            }

                                                        </p>

                                                    )}

                                                    <div className="reservation-meta">

                                                        {/* DATE */}

                                                        <div>

                                                            <span>
                                                                📅
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Date
                                                                </small>

                                                                <strong>

                                                                    {
                                                                        reservation.date_reservation
                                                                            ? new Date(
                                                                                reservation.date_reservation
                                                                            ).toLocaleDateString(
                                                                                "fr-FR"
                                                                            )
                                                                            : "-"
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                        {/* PERSONNES */}

                                                        <div>

                                                            <span>
                                                                👥
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Personnes
                                                                </small>

                                                                <strong>

                                                                    {
                                                                        reservation.nombre_personnes ||
                                                                        0
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                        {/* MONTANT */}

                                                        <div>

                                                            <span>
                                                                💰
                                                            </span>

                                                            <div>

                                                                <small>
                                                                    Montant
                                                                </small>

                                                                <strong>

                                                                    {formatMontantEuro(
                                                                        reservation.montant_total
                                                                    )}

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* =================================================
                                                        ACTIONS
                                                    ================================================= */}

                                                    <div className="reservation-actions">

                                                        <button
                                                            type="button"
                                                            className="voir-plus-button"
                                                            onClick={() =>
                                                                ouvrirDetailsReservation(
                                                                    reservation
                                                                )
                                                            }
                                                        >

                                                            <span>
                                                                👁️
                                                            </span>

                                                            Voir les détails

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

                                                            <span>
                                                                🗑️
                                                            </span>

                                                            Supprimer

                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                            {/* =================================================
                                PAGINATION RESERVATIONS
                            ================================================= */}

                            {totalPagesReservations > 1 && (

                                <div className="pagination">

                                    <button
                                        type="button"
                                        disabled={
                                            pageReservations === 1
                                        }
                                        onClick={() =>
                                            setPageReservations(
                                                pageReservations - 1
                                            )
                                        }
                                    >

                                        ←

                                        <span>
                                            Précédent
                                        </span>

                                    </button>

                                    {Array.from(
                                        {
                                            length:
                                                totalPagesReservations
                                        },
                                        (_, index) => (

                                            <button
                                                type="button"
                                                key={
                                                    index + 1
                                                }
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

                                                {
                                                    index + 1
                                                }

                                            </button>

                                        )
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            pageReservations ===
                                            totalPagesReservations
                                        }
                                        onClick={() =>
                                            setPageReservations(
                                                pageReservations + 1
                                            )
                                        }
                                    >

                                        <span>
                                            Suivant
                                        </span>

                                        →

                                    </button>

                                </div>

                            )}

                        </>

                    )}

                </section>

                {/* =================================================
                    PAIEMENTS
                ================================================= */}

                <section className="paiements-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Paiements nécessitant une action
                            </h2>

                            <p>
                                Paiements en attente,
                                non valides ou échoués
                            </p>

                        </div>

                        <span className="section-count payment-count">

                            {paiements.length}

                            {" "}

                            paiement
                            {paiements.length > 1 ? "s" : ""}

                        </span>

                    </div>

                    {paiements.length === 0 ? (

                        <div className="empty-state payment-empty">

                            <div className="empty-icon">
                                💳
                            </div>

                            <h3>
                                Aucun paiement à traiter
                            </h3>

                            <p>
                                Tous vos paiements sont actuellement
                                à jour.
                            </p>

                        </div>

                    ) : (

                        <>

                            <div className="paiements-list">

                                {paiementsPage.map(
                                    (paiement) => (

                                        <article
                                            className="paiement-client-card"
                                            key={
                                                paiement.id_paiement
                                            }
                                        >

                                            <div className="paiement-icon">
                                                💳
                                            </div>

                                            <div className="paiement-info">

                                                <div className="paiement-header">

                                                    <h3>

                                                        Paiement #

                                                        {
                                                            paiement.id_paiement
                                                        }

                                                    </h3>

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

                                                </div>

                                                {paiement.id_reservation && (

                                                    <p>

                                                        <strong>
                                                            Réservation :
                                                        </strong>

                                                        {" #"}

                                                        {
                                                            paiement.id_reservation
                                                        }

                                                    </p>

                                                )}

                                                <div className="paiement-details-row">

                                                    {/* MONTANT */}

                                                    <div>

                                                        <span>
                                                            Montant
                                                        </span>

                                                        <strong>

                                                            {formatMontantEuro(
                                                                paiement.montant ||
                                                                paiement.montant_total
                                                            )}

                                                        </strong>

                                                    </div>

                                                    {/* MODE */}

                                                    {paiement.mode_paiement && (

                                                        <div>

                                                            <span>
                                                                Mode de paiement
                                                            </span>

                                                            <strong>

                                                                {
                                                                    paiement.mode_paiement
                                                                }

                                                            </strong>

                                                        </div>

                                                    )}

                                                </div>

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

                                                        🗑️

                                                        Supprimer

                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                            {/* =================================================
                                PAGINATION PAIEMENTS
                            ================================================= */}

                            {totalPagesPaiements > 1 && (

                                <div className="pagination">

                                    <button
                                        type="button"
                                        disabled={
                                            pagePaiements === 1
                                        }
                                        onClick={() =>
                                            setPagePaiements(
                                                pagePaiements - 1
                                            )
                                        }
                                    >

                                        ←

                                        <span>
                                            Précédent
                                        </span>

                                    </button>

                                    {Array.from(
                                        {
                                            length:
                                                totalPagesPaiements
                                        },
                                        (_, index) => (

                                            <button
                                                type="button"
                                                key={
                                                    index + 1
                                                }
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

                                                {
                                                    index + 1
                                                }

                                            </button>

                                        )
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            pagePaiements ===
                                            totalPagesPaiements
                                        }
                                        onClick={() =>
                                            setPagePaiements(
                                                pagePaiements + 1
                                            )
                                        }
                                    >

                                        <span>
                                            Suivant
                                        </span>

                                        →

                                    </button>

                                </div>

                            )}

                        </>

                    )}

                </section>

            </div>

            {/* =====================================================
                MODALE DÉTAILS
            ===================================================== */}

            {detailReservation && (

                <div
                    className="reservation-modal-overlay"
                    onClick={() =>
                        setDetailReservation(null)
                    }
                >

                    <div
                        className="reservation-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            HEADER MODALE
                        ================================================= */}

                        <div className="reservation-modal-header">

                            <div>

                                <span>
                                    DÉTAILS DE LA RÉSERVATION
                                </span>

                                <h2>

                                    {
                                        detailReservation.titre ||
                                        "Offre touristique"
                                    }

                                </h2>

                            </div>

                            <button
                                type="button"
                                className="reservation-modal-close"
                                onClick={() =>
                                    setDetailReservation(
                                        null
                                    )
                                }
                            >

                                ×

                            </button>

                        </div>

                        {/* =================================================
                            CONTENU MODALE
                        ================================================= */}

                        <div className="reservation-modal-content">

                            {/* =================================================
                                GALERIE
                            ================================================= */}

                            {(() => {

                                const offre =
                                    offresDetails[
                                        detailReservation.id_offre
                                    ] || {};

                                const imagePrincipale =
                                    offre.image ||
                                    offre.image_principale ||
                                    detailReservation.image ||
                                    detailReservation.image_principale ||
                                    null;

                                const photosDetail =
                                    extrairePhotos(
                                        offre
                                    );

                                const imagePrincipaleUrl =
                                    construireUrlPhoto(
                                        imagePrincipale
                                    );

                                return (

                                    <div className="reservation-gallery">

                                        {/* IMAGE PRINCIPALE */}

                                        {imagePrincipaleUrl && (

                                            <div className="gallery-main-image">

                                                <img
                                                    src={
                                                        imagePrincipaleUrl
                                                    }
                                                    alt={
                                                        detailReservation.titre ||
                                                        "Image principale de l'offre"
                                                    }
                                                    onError={(event) => {

                                                        console.error(
                                                            "Erreur image principale modale :",
                                                            imagePrincipaleUrl
                                                        );

                                                        event.currentTarget.style.display =
                                                            "none";

                                                    }}
                                                />

                                                <span className="gallery-main-label">

                                                    Image principale

                                                </span>

                                            </div>

                                        )}

                                        {/* =================================================
                                            PHOTOS DÉTAILLÉES
                                        ================================================= */}

                                        {photosDetail.length > 0 && (

                                            <div className="gallery-details">

                                                <div className="gallery-title">

                                                    <h3>
                                                        Galerie de l'offre
                                                    </h3>

                                                    <span>

                                                        {
                                                            photosDetail.length
                                                        }

                                                        {" "}

                                                        photo
                                                        {
                                                            photosDetail.length > 1
                                                                ? "s"
                                                                : ""
                                                        }

                                                    </span>

                                                </div>

                                                <div className="gallery-grid">

                                                    {photosDetail.map(
                                                        (
                                                            photo,
                                                            index
                                                        ) => {

                                                            const url =
                                                                construireUrlPhoto(
                                                                    photo
                                                                );

                                                            if (!url) {

                                                                return null;

                                                            }

                                                            return (

                                                                <div
                                                                    className="gallery-detail-image"
                                                                    key={
                                                                        photo.id_photo ||
                                                                        photo.id ||
                                                                        index
                                                                    }
                                                                >

                                                                    <img
                                                                        src={url}
                                                                        alt={
                                                                            `${detailReservation.titre || "Offre"} - photo ${index + 1}`
                                                                        }
                                                                        onError={(event) => {

                                                                            console.error(
                                                                                "Erreur photo détaillée :",
                                                                                url
                                                                            );

                                                                            event.currentTarget.style.display =
                                                                                "none";

                                                                        }}
                                                                    />

                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                        {/* AUCUNE IMAGE */}

                                        {!imagePrincipaleUrl &&
                                            photosDetail.length === 0 && (

                                                <div className="modal-no-image">

                                                    <span>
                                                        🏝️
                                                    </span>

                                                    <p>
                                                        Aucune photo disponible
                                                        pour cette offre.
                                                    </p>

                                                </div>

                                            )}

                                    </div>

                                );

                            })()}

                            {/* =================================================
                                INFORMATIONS RESERVATION
                            ================================================= */}

                            <div className="reservation-details">

                                <div className="details-title">

                                    <span>
                                        📋
                                    </span>

                                    <h3>
                                        Informations de réservation
                                    </h3>

                                </div>

                                <div className="details-grid">

                                    {/* STATUT */}

                                    <div className="detail-item">

                                        <span>
                                            Statut
                                        </span>

                                        <strong>

                                            <span
                                                className={
                                                    `statut ${statutClass(
                                                        detailReservation.statut
                                                    )}`
                                                }
                                            >

                                                {
                                                    detailReservation.statut ||
                                                    "En attente"
                                                }

                                            </span>

                                        </strong>

                                    </div>

                                    {/* NUMERO */}

                                    <div className="detail-item">

                                        <span>
                                            Numéro
                                        </span>

                                        <strong>

                                            #

                                            {
                                                detailReservation.id_reservation
                                            }

                                        </strong>

                                    </div>

                                    {/* DATE */}

                                    <div className="detail-item">

                                        <span>
                                            Date de réservation
                                        </span>

                                        <strong>

                                            {
                                                detailReservation.date_reservation
                                                    ? new Date(
                                                        detailReservation.date_reservation
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )
                                                    : "-"
                                            }

                                        </strong>

                                    </div>

                                    {/* PERSONNES */}

                                    <div className="detail-item">

                                        <span>
                                            Nombre de personnes
                                        </span>

                                        <strong>

                                            {
                                                detailReservation.nombre_personnes ||
                                                0
                                            }

                                        </strong>

                                    </div>

                                    {/* =================================================
                                        MONTANT TOTAL EN EURO
                                    ================================================= */}

                                    <div className="detail-item">

                                        <span>
                                            Montant total
                                        </span>

                                        <strong className="detail-price">

                                            {formatMontantEuro(
                                                detailReservation.montant_total
                                            )}

                                        </strong>

                                    </div>

                                    {/* DESTINATION */}

                                    {detailReservation.destination && (

                                        <div className="detail-item">

                                            <span>
                                                Destination
                                            </span>

                                            <strong>

                                                📍

                                                {
                                                    detailReservation.destination
                                                }

                                            </strong>

                                        </div>

                                    )}

                                </div>

                                {/* =================================================
                                    MESSAGE
                                ================================================= */}

                                {detailReservation.message && (

                                    <div className="reservation-message">

                                        <span>
                                            💬
                                        </span>

                                        <div>

                                            <strong>
                                                Message
                                            </strong>

                                            <p>
                                                {
                                                    detailReservation.message
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="reservation-modal-footer">

                            <button
                                type="button"
                                className="fermer-modal-button"
                                onClick={() =>
                                    setDetailReservation(
                                        null
                                    )
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

export default MesReservations;