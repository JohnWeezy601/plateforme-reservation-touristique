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


    // =====================================================
    // UTILISATEUR
    // =====================================================

    const utilisateur = (() => {

        try {

            const data =
                localStorage.getItem("utilisateur");

            return data
                ? JSON.parse(data)
                : null;

        }
        catch (error) {

            console.error(
                "Erreur lecture utilisateur :",
                error
            );

            return null;

        }

    })();


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
    // CONSTRUIRE URL PHOTO
    // =====================================================
    //
    // Compatible avec :
    //
    // - URL Cloudinary
    // - URL HTTP / HTTPS
    // - blob:
    // - /uploads/photo.jpg
    // - uploads/photo.jpg
    // - ancien nom de fichier
    //
    // =====================================================

    const construireUrlPhoto = (photo) => {

        if (!photo) {

            return null;

        }


        let valeurPhoto = null;


        // =================================================
        // PHOTO SOUS FORME DE TEXTE
        // =================================================

        if (typeof photo === "string") {

            valeurPhoto = photo;

        }


        // =================================================
        // PHOTO SOUS FORME D'OBJET
        // =================================================

        else if (
            typeof photo === "object"
        ) {

            valeurPhoto =
                photo.chemin_photo ||
                photo.secure_url ||
                photo.url ||
                photo.photo ||
                photo.image ||
                photo.nom_photo ||
                photo.filename ||
                photo.file_name ||
                null;

        }


        if (!valeurPhoto) {

            return null;

        }


        valeurPhoto =
            String(valeurPhoto).trim();


        if (!valeurPhoto) {

            return null;

        }


        // =================================================
        // CLOUDINARY / URL EXTERNE
        // =================================================

        if (
            valeurPhoto.startsWith(
                "http://"
            ) ||
            valeurPhoto.startsWith(
                "https://"
            ) ||
            valeurPhoto.startsWith(
                "blob:"
            )
        ) {

            return valeurPhoto;

        }


        // =================================================
        // URL SERVEUR
        // =================================================

        const serveur = (
            import.meta.env.VITE_SERVER_URL ||
            import.meta.env.VITE_API_URL ||
            "http://localhost:8081"
        ).replace(/\/$/, "");


        // =================================================
        // /uploads/photo.jpg
        // =================================================

        if (
            valeurPhoto.startsWith(
                "/uploads/"
            )
        ) {

            return (
                serveur +
                valeurPhoto
            );

        }


        // =================================================
        // uploads/photo.jpg
        // =================================================

        if (
            valeurPhoto.startsWith(
                "uploads/"
            )
        ) {

            return (
                serveur +
                "/" +
                valeurPhoto
            );

        }


        // =================================================
        // AUTRE CHEMIN SERVEUR
        // =================================================

        if (
            valeurPhoto.startsWith("/")
        ) {

            return (
                serveur +
                valeurPhoto
            );

        }


        // =================================================
        // ANCIEN NOM DE FICHIER
        // =================================================

        return (
            serveur +
            "/uploads/" +
            valeurPhoto
        );

    };


    // =====================================================
    // EXTRAIRE LES PHOTOS
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
    // CHARGER LES PHOTOS DES OFFRES
    // =====================================================

    const chargerPhotosOffres = async (
        reservations
    ) => {

        try {

            const photosParOffre = {};


            // =================================================
            // RECUPERER LES IDS UNIQUES
            // =================================================

            const offresUniques = [
                ...new Set(
                    reservations
                        .map(
                            (reservation) =>
                                reservation.id_offre
                        )
                        .filter(
                            (id) =>
                                id !== null &&
                                id !== undefined
                        )
                )
            ];


            console.log(
                "======================================"
            );

            console.log(
                "IDS OFFRES POUR LES PHOTOS :",
                offresUniques
            );


            // =================================================
            // AUCUNE OFFRE
            // =================================================

            if (
                offresUniques.length === 0
            ) {

                setPhotosOffres({});

                return;

            }


            // =================================================
            // RECUPERATION DES PHOTOS
            // =================================================

            await Promise.all(

                offresUniques.map(
                    async (idOffre) => {

                        try {

                            console.log(
                                `Récupération photos offre ${idOffre}`
                            );


                            const response =
                                await api.get(
                                    `/offres/${idOffre}/photos`
                                );


                            console.log(
                                `Photos reçues pour offre ${idOffre} :`,
                                response.data
                            );


                            const photos =
                                extrairePhotos(
                                    response.data
                                );


                            photosParOffre[idOffre] =
                                photos;


                            console.log(
                                `Nombre photos offre ${idOffre} :`,
                                photos.length
                            );

                        }
                        catch (error) {

                            console.error(
                                `Erreur photos offre ${idOffre} :`,
                                error.response?.data ||
                                error.message
                            );


                            photosParOffre[idOffre] =
                                [];

                        }

                    }
                )

            );


            // =================================================
            // ENREGISTRER
            // =================================================

            setPhotosOffres(
                photosParOffre
            );


            console.log(
                "PHOTOS DE TOUTES LES OFFRES :",
                photosParOffre
            );

        }
        catch (error) {

            console.error(
                "Erreur générale photos offres :",
                error
            );


            setPhotosOffres({});

        }

    };


    // =====================================================
    // CHARGER LES DONNEES
    // =====================================================

    useEffect(() => {

        let interval = null;

        let actif = true;


        const chargerDonnees = async () => {

            if (!utilisateur) {

                if (!actif) {
                    return;
                }

                setReservations([]);

                setPaiements([]);

                setPhotosOffres({});

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
                // VERIFIER FORMAT
                // =================================================

                const toutesReservations =
                    Array.isArray(
                        resReservations.data
                    )
                        ? resReservations.data
                        : (
                            Array.isArray(
                                resReservations.data?.reservations
                            )
                                ? resReservations.data.reservations
                                : []
                        );


                // =================================================
                // MES RESERVATIONS
                // =================================================

                const mesReservations =
                    toutesReservations.filter(
                        (reservation) =>
                            Number(
                                reservation.id_utilisateur
                            ) ===
                            Number(
                                utilisateur.id_utilisateur
                            )
                    );


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


                if (!actif) {
                    return;
                }


                setReservations(
                    reservationsVisibles
                );


                // =================================================
                // PHOTOS
                // =================================================

                await chargerPhotosOffres(
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


                    const tousPaiements =
                        Array.isArray(
                            resPaiements.data
                        )
                            ? resPaiements.data
                            : (
                                Array.isArray(
                                    resPaiements.data?.paiements
                                )
                                    ? resPaiements.data.paiements
                                    : []
                            );


                    // =================================================
                    // MES PAIEMENTS
                    // =================================================

                    const mesPaiements =
                        tousPaiements.filter(
                            (paiement) =>
                                Number(
                                    paiement.id_utilisateur
                                ) ===
                                Number(
                                    utilisateur.id_utilisateur
                                )
                        );


                    // =================================================
                    // PAIEMENTS NECESSITANT UNE ACTION
                    // =================================================

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


                    if (!actif) {
                        return;
                    }


                    setPaiements(
                        paiementsVisibles
                    );

                }
                catch (error) {

                    console.error(
                        "Erreur chargement paiements :",
                        error.response?.data ||
                        error.message
                    );


                    if (actif) {

                        setPaiements([]);

                    }

                }

            }
            catch (error) {

                console.error(
                    "Erreur chargement réservations :",
                    error.response?.data ||
                    error.message
                );


                if (actif) {

                    setReservations([]);

                    setPhotosOffres({});

                }

            }
            finally {

                if (actif) {

                    setChargement(false);

                }

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


        // =================================================
        // NETTOYAGE
        // =================================================

        return () => {

            actif = false;

            if (interval) {

                clearInterval(
                    interval
                );

            }

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
    // CLASSE STATUT PAIEMENT
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
                                    Number(
                                        reservation.id_reservation
                                    ) !==
                                    Number(
                                        idReservation
                                    )
                            );


                        const nouvelleTotalPages =
                            Math.ceil(
                                nouvellesReservations.length /
                                elementsParPage
                            );


                        if (
                            nouvelleTotalPages === 0
                        ) {

                            setPageReservations(1);

                        }
                        else if (
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
                    Number(
                        detailReservation.id_reservation
                    ) ===
                    Number(
                        idReservation
                    )
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
                                    Number(
                                        paiement.id_paiement
                                    ) !==
                                    Number(
                                        idPaiement
                                    )
                            );


                        const nouvelleTotalPages =
                            Math.ceil(
                                nouveauxPaiements.length /
                                elementsParPage
                            );


                        if (
                            nouvelleTotalPages === 0
                        ) {

                            setPagePaiements(1);

                        }
                        else if (
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
                RETOUR
            ================================================= */}

            <button
                type="button"
                className="retour-page-button"
                onClick={() =>
                    navigate(-1)
                }
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


                {reservations.length === 0 ? (

                    <div className="empty">

                        Aucune réservation à afficher.

                    </div>

                ) : (

                    <>

                        <div className="reservations-list">

                            {reservationsPage.map(
                                (reservation) => {

                                    const photos =
                                        photosOffres[
                                            reservation.id_offre
                                        ] || [];


                                    return (

                                        <div
                                            className="reservation-client-card"
                                            key={
                                                reservation.id_reservation
                                            }
                                        >


                                            {/* =================================================
                                                PHOTOS
                                            ================================================= */}

                                            <div className="reservation-image">

                                                {photos.length > 0 ? (

                                                    <div className="reservation-photos">

                                                        {photos.map(
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

                                                                    <img
                                                                        key={
                                                                            photo.id_photo ||
                                                                            photo.id ||
                                                                            photo.id_offre_photo ||
                                                                            index
                                                                        }
                                                                        src={url}
                                                                        alt={
                                                                            reservation.titre ||
                                                                            "Photo de l'offre"
                                                                        }
                                                                        loading="lazy"
                                                                        onError={(
                                                                            event
                                                                        ) => {

                                                                            console.error(
                                                                                "Erreur chargement photo Cloudinary :",
                                                                                url
                                                                            );


                                                                            event.currentTarget.style.display =
                                                                                "none";

                                                                        }}
                                                                    />

                                                                );

                                                            }
                                                        )}

                                                    </div>

                                                ) : reservation.image ? (

                                                    <img
                                                        src={
                                                            construireUrlPhoto(
                                                                reservation.image
                                                            )
                                                        }
                                                        alt={
                                                            reservation.titre ||
                                                            "Offre touristique"
                                                        }
                                                        loading="lazy"
                                                        onError={(
                                                            event
                                                        ) => {

                                                            console.error(
                                                                "Erreur image principale :",
                                                                reservation.image
                                                            );


                                                            event.currentTarget.style.display =
                                                                "none";

                                                        }}
                                                    />

                                                ) : (

                                                    <div className="reservation-no-image">

                                                        🏝️

                                                    </div>

                                                )}

                                            </div>


                                            {/* =================================================
                                                INFORMATIONS
                                            ================================================= */}

                                            <div className="reservation-info">

                                                <h2>

                                                    {
                                                        reservation.titre ||
                                                        "Offre touristique"
                                                    }

                                                </h2>


                                                <p>

                                                    📅 Date réservation :{" "}

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

                                                    👥 Nombre personnes :{" "}

                                                    {
                                                        reservation.nombre_personnes ||
                                                        0
                                                    }

                                                </p>


                                                <p>

                                                    💰 Montant :{" "}

                                                    <strong>

                                                        {
                                                            Number(
                                                                reservation.montant_total ||
                                                                0
                                                            ).toLocaleString(
                                                                "fr-FR"
                                                            )
                                                        }{" "}

                                                        Ar

                                                    </strong>

                                                </p>


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

                                    );

                                }
                            )}

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        {totalPagesReservations > 1 && (

                            <div className="pagination">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPageReservations(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                    disabled={
                                        pageReservations === 1
                                    }
                                >

                                    ← Précédent

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

                                            {index + 1}

                                        </button>

                                    )
                                )}


                                <button
                                    type="button"
                                    onClick={() =>
                                        setPageReservations(
                                            (page) =>
                                                page + 1
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

                        )}

                    </>

                )}

            </section>


            {/* =================================================
                PAIEMENTS
            ================================================= */}

            <section className="paiements-section">

                <h2>
                    💳 Paiements nécessitant une action
                </h2>


                {paiements.length === 0 ? (

                    <div className="empty">

                        Aucun paiement nécessitant une action.

                    </div>

                ) : (

                    <>

                        <div className="paiements-list">

                            {paiementsPage.map(
                                (paiement) => (

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


                                            {paiement.id_reservation && (

                                                <p>

                                                    📋 Réservation :{" "}

                                                    <strong>

                                                        #

                                                        {
                                                            paiement.id_reservation
                                                        }

                                                    </strong>

                                                </p>

                                            )}


                                            <p>

                                                💰 Montant :{" "}

                                                <strong>

                                                    {
                                                        Number(
                                                            paiement.montant ||
                                                            paiement.montant_total ||
                                                            0
                                                        ).toLocaleString(
                                                            "fr-FR"
                                                        )
                                                    }{" "}

                                                    Ar

                                                </strong>

                                            </p>


                                            {paiement.mode_paiement && (

                                                <p>

                                                    💳 Mode de paiement :{" "}

                                                    <strong>

                                                        {
                                                            paiement.mode_paiement
                                                        }

                                                    </strong>

                                                </p>

                                            )}


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
                            )}

                        </div>


                        {/* =================================================
                            PAGINATION PAIEMENTS
                        ================================================= */}

                        {totalPagesPaiements > 1 && (

                            <div className="pagination">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPagePaiements(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                    disabled={
                                        pagePaiements === 1
                                    }
                                >

                                    ← Précédent

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

                                            {index + 1}

                                        </button>

                                    )
                                )}


                                <button
                                    type="button"
                                    onClick={() =>
                                        setPagePaiements(
                                            (page) =>
                                                page + 1
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

                        )}

                    </>

                )}

            </section>


            {/* =====================================================
                MODALE DETAIL RESERVATION
            ===================================================== */}

            {detailReservation && (

                <div
                    className="reservation-modal-overlay"
                    onClick={() =>
                        setDetailReservation(
                            null
                        )
                    }
                >

                    <div
                        className="reservation-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* =================================================
                            HEADER
                        ================================================= */}

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
                                    setDetailReservation(
                                        null
                                    )
                                }
                            >

                                ×

                            </button>

                        </div>


                        {/* =================================================
                            PHOTOS
                        ================================================= */}

                        {(
                            photosOffres[
                                detailReservation.id_offre
                            ] || []
                        ).length > 0 ? (

                            <div className="reservation-modal-photos">

                                {(
                                    photosOffres[
                                        detailReservation.id_offre
                                    ] || []
                                ).map(
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

                                            <img
                                                key={
                                                    photo.id_photo ||
                                                    photo.id ||
                                                    photo.id_offre_photo ||
                                                    index
                                                }
                                                src={url}
                                                alt={
                                                    detailReservation.titre ||
                                                    "Photo de l'offre"
                                                }
                                                loading="lazy"
                                                onError={(
                                                    event
                                                ) => {

                                                    console.error(
                                                        "Erreur photo modale :",
                                                        url
                                                    );


                                                    event.currentTarget.style.display =
                                                        "none";

                                                }}
                                            />

                                        );

                                    }
                                )}

                            </div>

                        ) : detailReservation.image ? (

                            <div className="reservation-modal-image">

                                <img
                                    src={
                                        construireUrlPhoto(
                                            detailReservation.image
                                        )
                                    }
                                    alt={
                                        detailReservation.titre ||
                                        "Offre touristique"
                                    }
                                    loading="lazy"
                                    onError={(
                                        event
                                    ) => {

                                        console.error(
                                            "Erreur image principale modale :",
                                            detailReservation.image
                                        );


                                        event.currentTarget.style.display =
                                            "none";

                                    }}
                                />

                            </div>

                        ) : (

                            <div className="reservation-modal-no-image">

                                🏝️

                                <span>
                                    Aucune photo disponible
                                </span>

                            </div>

                        )}


                        {/* =================================================
                            DETAILS
                        ================================================= */}

                        <div className="reservation-details">

                            <p>

                                <strong>
                                    Statut :
                                </strong>{" "}

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

                            </p>


                            <p>

                                <strong>
                                    Date de réservation :
                                </strong>{" "}

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
                                </strong>{" "}

                                {
                                    detailReservation.nombre_personnes ||
                                    0
                                }

                            </p>


                            <p>

                                <strong>
                                    Montant total :
                                </strong>{" "}

                                {
                                    Number(
                                        detailReservation.montant_total ||
                                        0
                                    ).toLocaleString(
                                        "fr-FR"
                                    )
                                }{" "}

                                Ar

                            </p>


                            {detailReservation.destination && (

                                <p>

                                    <strong>
                                        Destination :
                                    </strong>{" "}

                                    {
                                        detailReservation.destination
                                    }

                                </p>

                            )}


                            {detailReservation.message && (

                                <p>

                                    <strong>
                                        Message :
                                    </strong>{" "}

                                    {
                                        detailReservation.message
                                    }

                                </p>

                            )}

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