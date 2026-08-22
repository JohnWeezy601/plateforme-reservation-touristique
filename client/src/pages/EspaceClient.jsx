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
    FaChartLine
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

        login:
            "/login-client"

    };


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

                /*
                 * Récupération des informations
                 * complètes depuis le backend.
                 *
                 * Cela permet notamment de récupérer :
                 *
                 * - nom
                 * - prenom
                 * - email
                 * - telephone
                 * - photo
                 */

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


                    /*
                     * On sauvegarde également
                     * les informations actualisées
                     * dans localStorage.
                     */

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
    // UTILISATEUR NON CONNECTÉ
    // =====================================================

    if (!utilisateur) {

        navigate(routes.login);

        return null;

    }


    // =====================================================
    // TÉLÉPHONE
    // =====================================================

    /*
     * La colonne principale de ta base MySQL est :
     *
     * telephone
     *
     * On garde quelques variantes pour éviter
     * les problèmes si certaines données anciennes
     * utilisent un autre nom.
     */

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
    // DONNÉES LOCALES
    // =====================================================

    const getLocalData = (keys) => {

        for (const key of keys) {

            const data =
                localStorage.getItem(key);

            if (!data) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(data);


                if (Array.isArray(parsed)) {

                    return parsed;

                }

            }
            catch {

                return [];

            }

        }


        return [];

    };


    const reservations =
        getLocalData([
            "mesReservations",
            "reservations"
        ]);


    const transactions =
        getLocalData([
            "mesTransactions",
            "transactions"
        ]);


    const avis =
        getLocalData([
            "mesAvis",
            "avis"
        ]);


    const notifications =
        getLocalData([
            "mesNotifications",
            "notifications"
        ]);


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
            taux

        };

    }, [
        reservations.length,
        transactions.length,
        avis.length,
        notifications.length
    ]);


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <div className="espace-client-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="espace-client-header">


                <div>

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
                            {statistiques.taux}%
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

                        {statistiques.totalActions} action

                        {statistiques.totalActions > 1
                            ? "s"
                            : ""}

                        {" "}enregistrée

                        {statistiques.totalActions > 1
                            ? "s"
                            : ""}

                        {" "}dans votre espace.

                    </p>


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
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {

                            navigate(
                                routes.profil
                            );

                        }

                    }}
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
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {

                            navigate(
                                routes.reservations
                            );

                        }

                    }}
                >

                    <div className="client-card-icon">

                        <FaCalendarAlt />

                    </div>


                    <div>

                        <h3>
                            Mes réservations
                        </h3>


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
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {

                            navigate(
                                routes.transactions
                            );

                        }

                    }}
                >

                    <div className="client-card-icon">

                        <FaCreditCard />

                    </div>


                    <div>

                        <h3>
                            Mes transactions
                        </h3>


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
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {

                            navigate(
                                routes.avis
                            );

                        }

                    }}
                >

                    <div className="client-card-icon">

                        <FaStar />

                    </div>


                    <div>

                        <h3>
                            Mes avis
                        </h3>


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
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {

                            navigate(
                                routes.notifications
                            );

                        }

                    }}
                >

                    <div className="client-card-icon">

                        <FaBell />

                    </div>


                    <div>

                        <h3>
                            Notifications
                        </h3>


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
                UNE SEULE SECTION
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


                    {/* =================================================
                        PHOTO
                    ================================================= */}

                    <div className="profile-photo-info">

                        <strong>
                            Photo
                        </strong>


                        <div className="profile-photo-wrapper">

                            {photoUtilisateur ? (

                                <img
                                    src={photoUtilisateur}
                                    alt="Photo de profil"
                                />

                            ) : (

                                <FaUser />

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        NOM
                    ================================================= */}

                    <div>

                        <strong>
                            Nom
                        </strong>


                        <span>
                            {utilisateur.nom || "-"}
                        </span>

                    </div>


                    {/* =================================================
                        PRÉNOM
                    ================================================= */}

                    <div>

                        <strong>
                            Prénom
                        </strong>


                        <span>
                            {utilisateur.prenom || "-"}
                        </span>

                    </div>


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div>

                        <strong>
                            Email
                        </strong>


                        <span>
                            {utilisateur.email || "-"}
                        </span>

                    </div>


                    {/* =================================================
                        TÉLÉPHONE
                    ================================================= */}

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