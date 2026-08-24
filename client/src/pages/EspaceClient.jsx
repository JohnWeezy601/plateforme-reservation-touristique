import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaUser,
    FaCalendarAlt,
    FaCreditCard,
    FaStar,
    FaBell,
    FaArrowRight,
    FaChartLine,
    FaCompass,
    FaSearch
} from "react-icons/fa";

import api from "../api/api";

import "./EspaceClient.css";


function EspaceClient() {

    const navigate = useNavigate();


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const [utilisateur, setUtilisateur] = useState(() => {

        const data =
            localStorage.getItem("utilisateur");

        try {

            if (!data) {
                return null;
            }

            const parsedData =
                JSON.parse(data);

            return parsedData?.utilisateur
                ? parsedData.utilisateur
                : parsedData;

        }
        catch (error) {

            console.error(
                "Erreur lecture utilisateur :",
                error
            );

            return null;

        }

    });


    // =====================================================
    // ROUTES CLIENT
    // =====================================================

    const routes = {

        accueil:
            "/espace-client",

        profil:
            "/espace-client/profil",

        reservations:
            "/espace-client/reservations",

        transactions:
            "/espace-client/transactions",

        avis:
            "/espace-client/avis",

        notifications:
            "/espace-client/notifications",

        // ==========================================
        // VRAIE ROUTE PUBLIQUE DES OFFRES
        // ==========================================

        offres:
            "/offres-public",

        login:
            "/login-client"

    };


    // =====================================================
    // ÉTATS DES COMPTEURS
    // =====================================================

    const [reservations, setReservations] =
        useState([]);

    const [transactions, setTransactions] =
        useState([]);

    const [avis, setAvis] =
        useState([]);

    const [notifications, setNotifications] =
        useState([]);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    const [chargementCompteurs, setChargementCompteurs] =
        useState(true);


    // =====================================================
    // RÉCUPÉRATION DES INFORMATIONS CLIENT
    // =====================================================

    useEffect(() => {

        const recupererUtilisateur = async () => {

            if (!utilisateur) {
                return;
            }


            const idUtilisateur =
                utilisateur.id_utilisateur ||
                utilisateur.id ||
                utilisateur.idUtilisateur;


            if (!idUtilisateur) {

                console.warn(
                    "ID utilisateur introuvable."
                );

                return;

            }


            try {

                const response =
                    await api.get(
                        `/utilisateurs/${idUtilisateur}`
                    );


                const utilisateurAPI =
                    response?.data?.utilisateur ||
                    response?.data?.user ||
                    response?.data;


                if (
                    utilisateurAPI &&
                    typeof utilisateurAPI === "object"
                ) {

                    const utilisateurMisAJour = {

                        ...utilisateur,
                        ...utilisateurAPI

                    };


                    setUtilisateur(
                        utilisateurMisAJour
                    );


                    localStorage.setItem(
                        "utilisateur",
                        JSON.stringify(
                            utilisateurMisAJour
                        )
                    );

                }

            }
            catch (error) {

                console.error(
                    "Erreur récupération utilisateur :",
                    error
                );

            }

        };


        recupererUtilisateur();

    }, [utilisateur?.id_utilisateur]);


    // =====================================================
    // RÉCUPÉRATION DES VRAIS COMPTEURS
    // DEPUIS LA BASE DE DONNÉES
    // =====================================================

    useEffect(() => {

        const recupererCompteurs = async () => {

            if (!utilisateur) {
                return;
            }


            const idUtilisateur =
                utilisateur.id_utilisateur ||
                utilisateur.id ||
                utilisateur.idUtilisateur;


            if (!idUtilisateur) {

                console.warn(
                    "Impossible de récupérer les compteurs : ID utilisateur manquant."
                );

                return;

            }


            try {

                setChargementCompteurs(true);


                // =====================================================
                // 1. RÉCUPÉRER LES RÉSERVATIONS
                // =====================================================

                let reservationsUtilisateur = [];


                try {

                    const responseReservations =
                      await api.get(
                     "/reservations"
                    );


                    const dataReservations =
                        responseReservations?.data;


                    if (Array.isArray(dataReservations)) {

                        reservationsUtilisateur =
                            dataReservations.filter(
                                (reservation) =>
                                    Number(
                                        reservation.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                            );

                    }

                    else if (
                        Array.isArray(
                            dataReservations?.reservations
                        )
                    ) {

                        reservationsUtilisateur =
                            dataReservations.reservations.filter(
                                (reservation) =>
                                    Number(
                                        reservation.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                            );

                    }

                }
                catch (error) {

                    console.error(
                        "Erreur récupération réservations :",
                        error
                    );

                }


                // =====================================================
                // 2. RÉCUPÉRER LES TRANSACTIONS / PAIEMENTS
                // =====================================================

                let transactionsUtilisateur = [];


                try {

                    const responsePaiements =
                        await api.get(
                            "/paiements"
                        );


                    const dataPaiements =
                        responsePaiements?.data;


                    if (Array.isArray(dataPaiements)) {

                        transactionsUtilisateur =
                            dataPaiements.filter(
                                (paiement) =>
                                    Number(
                                        paiement.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                            );

                    }

                    else if (
                        Array.isArray(
                            dataPaiements?.paiements
                        )
                    ) {

                        transactionsUtilisateur =
                            dataPaiements.paiements.filter(
                                (paiement) =>
                                    Number(
                                        paiement.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                            );

                    }

                }
                catch (error) {

                    console.error(
                        "Erreur récupération transactions :",
                        error
                    );

                }


                // =====================================================
                // 3. RÉCUPÉRER LES AVIS
                // =====================================================

                let avisUtilisateur = [];


                try {

                    const responseAvis =
                        await api.get(
                            "/avis"
                        );


                    const dataAvis =
                        responseAvis?.data;


                    if (Array.isArray(dataAvis)) {

                        avisUtilisateur =
                            dataAvis.filter(
                                (avisItem) =>
                                    Number(
                                        avisItem.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                                    &&
                                    String(
                                        avisItem.statut || ""
                                    )
                                        .toLowerCase()
                                        .startsWith("publi")
                            );

                    }

                    else if (
                        Array.isArray(
                            dataAvis?.avis
                        )
                    ) {

                        avisUtilisateur =
                            dataAvis.avis.filter(
                                (avisItem) =>
                                    Number(
                                        avisItem.id_utilisateur
                                    ) ===
                                    Number(idUtilisateur)
                                    &&
                                    String(
                                        avisItem.statut || ""
                                    )
                                        .toLowerCase()
                                        .startsWith("publi")
                            );

                    }

                }
                catch (error) {

                    console.error(
                        "Erreur récupération avis :",
                        error
                    );

                }


                // =====================================================
                // 4. RÉCUPÉRER LES NOTIFICATIONS
                // =====================================================

                let notificationsUtilisateur = [];


                try {

                    const responseNotifications =
                        await api.get(
                            `/notifications/utilisateur/${idUtilisateur}`
                        );


                    const dataNotifications =
                        responseNotifications?.data;


                    if (
                        Array.isArray(dataNotifications)
                    ) {

                        notificationsUtilisateur =
                            dataNotifications;

                    }

                    else if (
                        Array.isArray(
                            dataNotifications?.notifications
                        )
                    ) {

                        notificationsUtilisateur =
                            dataNotifications.notifications;

                    }

                }
                catch (error) {

                    console.error(
                        "Erreur récupération notifications :",
                        error
                    );

                }


                // =====================================================
                // ENREGISTRER LES DONNÉES
                // =====================================================

                setReservations(
                    reservationsUtilisateur
                );


                setTransactions(
                    transactionsUtilisateur
                );


                setAvis(
                    avisUtilisateur
                );


                setNotifications(
                    notificationsUtilisateur
                );


                console.log(
                    "===== COMPTEURS ESPACE CLIENT ====="
                );

                console.log(
                    "Utilisateur :",
                    idUtilisateur
                );

                console.log(
                    "Réservations :",
                    reservationsUtilisateur.length
                );

                console.log(
                    "Transactions :",
                    transactionsUtilisateur.length
                );

                console.log(
                    "Avis publiés :",
                    avisUtilisateur.length
                );

                console.log(
                    "Notifications :",
                    notificationsUtilisateur.length
                );

                console.log(
                    "===================================="
                );

            }
            catch (error) {

                console.error(
                    "Erreur récupération compteurs :",
                    error
                );

            }
            finally {

                setChargementCompteurs(false);

            }

        };


        recupererCompteurs();


    }, [
        utilisateur?.id_utilisateur
    ]);


    // =====================================================
    // UTILISATEUR NON CONNECTÉ
    // =====================================================

    if (!utilisateur) {

        navigate(routes.login);

        return null;

    }


    // =====================================================
    // TÉLÉPHONE
    // =====================================================

    const telephone =
        utilisateur.telephone ||
        utilisateur.tel ||
        utilisateur.phone ||
        utilisateur.numero_telephone ||
        utilisateur.numeroTelephone ||
        utilisateur.phoneNumber ||
        utilisateur.mobile ||
        "-";


    // =====================================================
    // PHOTO
    // =====================================================

    const photoUtilisateur =
        utilisateur.photo ||
        utilisateur.image ||
        utilisateur.photo_profil ||
        null;


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const statistiques = useMemo(() => {

        const totalActions =
            reservations.length +
            transactions.length +
            avis.length +
            notifications.length;


        const objectif = 20;


        const taux = Math.min(

            Math.round(
                (totalActions / objectif) * 100
            ),

            100

        );


        return {

            totalActions,

            taux,

            reservations:
                reservations.length,

            transactions:
                transactions.length,

            avis:
                avis.length,

            notifications:
                notifications.length

        };

    }, [
        reservations,
        transactions,
        avis,
        notifications
    ]);


    // =====================================================
    // FONCTION NAVIGATION CLAVIER
    // =====================================================

    const gererNavigationClavier = (
        event,
        route
    ) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            navigate(route);

        }

    };


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <div className="espace-client-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="espace-client-header">


                <div className="client-header-text">

                    <span className="welcome-label">

                        ESPACE PERSONNEL

                    </span>


                    <h1>

                        Bienvenue,{" "}

                        {utilisateur.prenom ||
                            utilisateur.nom ||
                            "Client"}

                        !

                    </h1>


                    <p>

                        Gérez facilement vos activités
                        touristiques depuis votre espace personnel.

                    </p>

                </div>


                {/* =================================================
                    PHOTO PROFIL
                ================================================= */}

                <button
                    type="button"
                    className="header-profile-button"
                    onClick={() =>
                        navigate(routes.profil)
                    }
                    aria-label="Ouvrir mon profil"
                >

                    {photoUtilisateur ? (

                        <img
                            src={photoUtilisateur}
                            alt="Photo profil"
                        />

                    ) : (

                        <FaUser />

                    )}

                </button>


            </header>


            {/* =================================================
                DÉCOUVRIR LES OFFRES
            ================================================= */}

            <section className="discover-offers-section">


                <div className="discover-offers-content">


                    <div className="discover-offers-icon">

                        <FaCompass />

                    </div>


                    <div className="discover-offers-text">

                        <span>
                            EXPLOREZ NOS DESTINATIONS
                        </span>

                        <h2>
                            Découvrez les offres touristiques
                        </h2>

                        <p>
                            Trouvez votre prochaine destination,
                            explorez nos offres et préparez votre
                            prochaine expérience touristique.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn-discover-offers"
                        onClick={() =>
                            navigate(routes.offres)
                        }
                    >

                        <FaSearch />

                        <span>
                            Découvrir les offres
                        </span>

                        <FaArrowRight />

                    </button>


                </div>


            </section>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <section className="client-statistics">


                <div className="statistics-header">


                    <div>

                        <span>
                            ACTIVITÉ DU CLIENT
                        </span>


                        <h2>
                            Votre activité
                        </h2>

                    </div>


                    <FaChartLine />

                </div>


                <div className="activity-progress">


                    <div className="activity-progress-info">

                        <strong>

                            {chargementCompteurs
                                ? "..."
                                : `${statistiques.taux}%`}

                        </strong>


                        <span>
                            taux d'activité
                        </span>

                    </div>


                    <div className="progress-bar">

                        <div
                            className="progress-value"
                            style={{
                                width:
                                    `${statistiques.taux}%`
                            }}
                        />

                    </div>


                    <p>

                        {chargementCompteurs
                            ? "Chargement de votre activité..."
                            :
                            <>
                                {statistiques.totalActions} action
                                {statistiques.totalActions > 1
                                    ? "s"
                                    : ""}
                                {" "}enregistrée
                                {statistiques.totalActions > 1
                                    ? "s"
                                    : ""}
                                {" "}dans votre espace.
                            </>
                        }

                    </p>


                </div>


            </section>


            {/* =================================================
                COMPTEURS RAPIDES
            ================================================= */}

            <section className="client-counters">


                {/* =================================================
                    RÉSERVATIONS
                ================================================= */}

                <div
                    className="client-counter counter-reservations"
                    onClick={() =>
                        navigate(routes.reservations)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.reservations
                        )
                    }
                >

                    <div className="counter-icon">

                        <FaCalendarAlt />

                    </div>


                    <div className="counter-content">

                        <span>
                            Réservations
                        </span>


                        <strong>

                            {chargementCompteurs
                                ? "..."
                                : statistiques.reservations}

                        </strong>

                    </div>


                    <FaArrowRight
                        className="counter-arrow"
                    />

                </div>


                {/* =================================================
                    TRANSACTIONS
                ================================================= */}

                <div
                    className="client-counter counter-transactions"
                    onClick={() =>
                        navigate(routes.transactions)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.transactions
                        )
                    }
                >

                    <div className="counter-icon">

                        <FaCreditCard />

                    </div>


                    <div className="counter-content">

                        <span>
                            Transactions
                        </span>


                        <strong>

                            {chargementCompteurs
                                ? "..."
                                : statistiques.transactions}

                        </strong>

                    </div>


                    <FaArrowRight
                        className="counter-arrow"
                    />

                </div>


                {/* =================================================
                    AVIS
                ================================================= */}

                <div
                    className="client-counter counter-avis"
                    onClick={() =>
                        navigate(routes.avis)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.avis
                        )
                    }
                >

                    <div className="counter-icon">

                        <FaStar />

                    </div>


                    <div className="counter-content">

                        <span>
                            Avis publiés
                        </span>


                        <strong>

                            {chargementCompteurs
                                ? "..."
                                : statistiques.avis}

                        </strong>

                    </div>


                    <FaArrowRight
                        className="counter-arrow"
                    />

                </div>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div
                    className="client-counter counter-notifications"
                    onClick={() =>
                        navigate(routes.notifications)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.notifications
                        )
                    }
                >

                    <div className="counter-icon">

                        <FaBell />

                    </div>


                    <div className="counter-content">

                        <span>
                            Notifications
                        </span>


                        <strong>

                            {chargementCompteurs
                                ? "..."
                                : statistiques.notifications}

                        </strong>

                    </div>


                    <FaArrowRight
                        className="counter-arrow"
                    />

                </div>


            </section>


            {/* =================================================
                CARTES CLIENT
            ================================================= */}

            <section className="client-dashboard-cards">


                {/* =================================================
                    MON PROFIL
                ================================================= */}

                <div
                    className="client-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(routes.profil)
                    }
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.profil
                        )
                    }
                >

                    <div className="client-card-icon">

                        <FaUser />

                    </div>


                    <div>

                        <h3>
                            Mon profil
                        </h3>


                        <p>
                            Consultez et modifiez vos informations personnelles.
                        </p>

                    </div>


                    <FaArrowRight
                        className="card-arrow"
                    />

                </div>


                {/* =================================================
                    MES RÉSERVATIONS
                ================================================= */}

                <div
                    className="client-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(routes.reservations)
                    }
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.reservations
                        )
                    }
                >

                    <div className="client-card-icon">

                        <FaCalendarAlt />

                    </div>


                    <div className="client-card-main">

                        <div className="client-card-title">

                            <h3>
                                Mes réservations
                            </h3>


                            <span className="card-counter">

                                {chargementCompteurs
                                    ? "..."
                                    : statistiques.reservations}

                            </span>

                        </div>


                        <p>
                            Consultez toutes vos réservations touristiques.
                        </p>

                    </div>


                    <FaArrowRight
                        className="card-arrow"
                    />

                </div>


                {/* =================================================
                    MES TRANSACTIONS
                ================================================= */}

                <div
                    className="client-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(routes.transactions)
                    }
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.transactions
                        )
                    }
                >

                    <div className="client-card-icon">

                        <FaCreditCard />

                    </div>


                    <div className="client-card-main">

                        <div className="client-card-title">

                            <h3>
                                Mes transactions
                            </h3>


                            <span className="card-counter">

                                {chargementCompteurs
                                    ? "..."
                                    : statistiques.transactions}

                            </span>

                        </div>


                        <p>
                            Consultez vos paiements et transactions.
                        </p>

                    </div>


                    <FaArrowRight
                        className="card-arrow"
                    />

                </div>


                {/* =================================================
                    MES AVIS
                ================================================= */}

                <div
                    className="client-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(routes.avis)
                    }
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.avis
                        )
                    }
                >

                    <div className="client-card-icon">

                        <FaStar />

                    </div>


                    <div className="client-card-main">

                        <div className="client-card-title">

                            <h3>
                                Mes avis
                            </h3>


                            <span className="card-counter">

                                {chargementCompteurs
                                    ? "..."
                                    : statistiques.avis}

                            </span>

                        </div>


                        <p>
                            Consultez vos avis publiés.
                        </p>

                    </div>


                    <FaArrowRight
                        className="card-arrow"
                    />

                </div>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div
                    className="client-card"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        navigate(routes.notifications)
                    }
                    onKeyDown={(e) =>
                        gererNavigationClavier(
                            e,
                            routes.notifications
                        )
                    }
                >

                    <div className="client-card-icon">

                        <FaBell />

                    </div>


                    <div className="client-card-main">

                        <div className="client-card-title">

                            <h3>
                                Notifications
                            </h3>


                            <span className="card-counter">

                                {chargementCompteurs
                                    ? "..."
                                    : statistiques.notifications}

                            </span>

                        </div>


                        <p>
                            Consultez vos notifications.
                        </p>

                    </div>


                    <FaArrowRight
                        className="card-arrow"
                    />

                </div>


            </section>


            {/* =================================================
                INFORMATIONS CLIENT
            ================================================= */}

            <section className="client-profile-summary">


                <div className="section-title">


                    <div>

                        <span>
                            PROFIL
                        </span>


                        <h2>
                            Mes informations
                        </h2>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(routes.profil)
                        }
                    >

                        Modifier

                    </button>


                </div>


                <div className="profile-info">


                    {/* NOM */}

                    <div>

                        <strong>
                            Nom
                        </strong>


                        <span>
                            {utilisateur.nom || "-"}
                        </span>

                    </div>


                    {/* PRÉNOM */}

                    <div>

                        <strong>
                            Prénom
                        </strong>


                        <span>
                            {utilisateur.prenom || "-"}
                        </span>

                    </div>


                    {/* EMAIL */}

                    <div>

                        <strong>
                            Email
                        </strong>


                        <span>
                            {utilisateur.email || "-"}
                        </span>

                    </div>


                    {/* TÉLÉPHONE */}

                    <div>

                        <strong>
                            Téléphone
                        </strong>


                        <span>
                            {telephone}
                        </span>

                    </div>


                </div>


            </section>


        </div>

    );

}


export default EspaceClient;