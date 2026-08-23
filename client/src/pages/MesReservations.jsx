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
    // CONSTRUIRE URL PHOTO
    // =====================================================
    //
    // Cette fonction accepte :
    //
    // 1. Une URL Cloudinary complète
    // 2. Une URL HTTP/HTTPS
    // 3. /uploads/photo.jpg
    // 4. uploads/photo.jpg
    // 5. photo.jpg
    // 6. Un objet contenant :
    //    - photo
    //    - url
    //    - secure_url
    //    - image
    //    - nom_photo
    //    - filename
    //    - file_name
    //
    // =====================================================

    const construireUrlPhoto = (photo) => {

        if (!photo) {
            return null;
        }


        // =================================================
        // RECUPERER LA VALEUR DE LA PHOTO
        // =================================================

        let nomPhoto = null;


        if (typeof photo === "string") {

            nomPhoto = photo;

        }
        else if (typeof photo === "object") {

            nomPhoto =
                photo.secure_url ||
                photo.url ||
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


        // =================================================
        // NETTOYAGE
        // =================================================

        nomPhoto = String(nomPhoto).trim();


        if (!nomPhoto) {
            return null;
        }


        // =================================================
        // CLOUDINARY / URL EXTERNE
        // =================================================

        if (
            nomPhoto.startsWith("http://") ||
            nomPhoto.startsWith("https://") ||
            nomPhoto.startsWith("blob:")
        ) {

            return nomPhoto;

        }


        // =================================================
        // URL SERVEUR
        // =================================================

        const serveur =
            (
                import.meta.env.VITE_SERVER_URL ||
                import.meta.env.VITE_API_URL ||
                "http://localhost:8081"
            ).replace(/\/$/, "");


        // =================================================
        // /uploads/...
        // =================================================

        if (nomPhoto.startsWith("/uploads/")) {

            return `${serveur}${nomPhoto}`;

        }


        // =================================================
        // uploads/...
        // =================================================

        if (nomPhoto.startsWith("uploads/")) {

            return `${serveur}/${nomPhoto}`;

        }


        // =================================================
        // AUTRE CHEMIN COMMENÇANT PAR /
        // =================================================

        if (nomPhoto.startsWith("/")) {

            return `${serveur}${nomPhoto}`;

        }


        // =================================================
        // ANCIEN NOM DE FICHIER
        // =================================================

        return `${serveur}/uploads/${nomPhoto}`;

    };


    // =====================================================
    // EXTRAIRE LES PHOTOS DE LA REPONSE
    // =====================================================
    //
    // Le backend peut éventuellement retourner :
    //
    // [
    //    {...},
    //    {...}
    // ]
    //
    // ou :
    //
    // {
    //    photos: [...]
    // }
    //
    // ou :
    //
    // {
    //    data: [...]
    // }
    //
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
    // CHARGER TOUTES LES PHOTOS DES OFFRES
    // =====================================================

    const chargerPhotosOffres = async (
        reservations
    ) => {

        try {

            const photosParOffre = {};


            // =================================================
            // RECUPERER LES ID OFFRES UNIQUES
            // =================================================

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
                "IDs offres à récupérer :",
                offresUniques
            );


            // =================================================
            // RECUPERER LES PHOTOS DE CHAQUE OFFRE
            // =================================================

            await Promise.all(

                offresUniques.map(
                    async (idOffre) => {

                        try {

                            console.log(
                                `Récupération photos offre ${idOffre}...`
                            );


                            const response =
                                await api.get(
                                    `/offres/${idOffre}/photos`
                                );


                            console.log(
                                `Réponse photos offre ${idOffre} :`,
                                response.data
                            );


                            const photos =
                                extrairePhotos(
                                    response.data
                                );


                            // =================================================
                            // STOCKER LES PHOTOS
                            // =================================================

                            photosParOffre[idOffre] =
                                photos;


                            console.log(
                                `Photos offre ${idOffre} :`,
                                photos
                            );

                        }
                        catch (error) {

                            console.error(
                                `Erreur récupération photos offre ${idOffre} :`,
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
            // ENREGISTRER DANS LE STATE
            // =================================================

            setPhotosOffres(
                photosParOffre
            );


            console.log(
                "Photos de toutes les offres :",
                photosParOffre
            );

        }
        catch (error) {

            console.error(
                "Erreur générale récupération photos :",
                error
            );


            setPhotosOffres({});

        }

    };


    // =====================================================
    // CHARGER RESERVATIONS + PAIEMENTS
    // =====================================================

    useEffect(() => {

        let interval;


        const chargerDonnees =
            async () => {

                if (!utilisateur) {

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
                    // PHOTOS DES OFFRES
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


                        // =================================================
                        // MES PAIEMENTS
                        // =================================================

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


                        console.log(
                            "Mes paiements :",
                            mesPaiements
                        );


                        // =================================================
                        // PAIEMENTS VISIBLES
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

                    setPhotosOffres({});

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

        interval =
            setInterval(
                chargerDonnees,
                5000
            );


        // =====================================================
        // NETTOYAGE
        // =====================================================

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
    // CLASSE STATUT RESERVATION
    // =====================================================

    const statutClass = (statut) => {

        const valeur =
            normaliserStatut(
                statut
            );


        if (valeur === "annulee") {

            return "annulee";

        }


        if (valeur === "rejetee") {

            return "rejetee";

        }


        if (valeur === "confirmee") {

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
                                    reservation.id_reservation !==
                                    idReservation
                            );


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
                                                IMAGE / PHOTOS
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
                                                                        src={
                                                                            url
                                                                        }
                                                                        alt={
                                                                            reservation.titre ||
                                                                            "Photo de l'offre"
                                                                        }
                                                                        onError={(
                                                                            event
                                                                        ) => {

                                                                            console.error(
                                                                                "Erreur chargement photo :",
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
                                                        onError={(
                                                            event
                                                        ) => {

                                                            console.error(
                                                                "Erreur chargement image principale :",
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


                                {Array.from(
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
                                )}


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
                                            pagePaiements - 1
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
                                )}


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

                        )}

                    </>

                )}

            </section>


            {/* =====================================================
                MODALE VOIR PLUS
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
                                                onError={(
                                                    event
                                                ) => {

                                                    console.error(
                                                        "Erreur chargement photo modale :",
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
                                    onError={(
                                        event
                                    ) => {

                                        console.error(
                                            "Erreur chargement image principale modale :",
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
                                        detailReservation.statut
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