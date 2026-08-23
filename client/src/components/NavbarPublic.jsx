import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import {
    FaHome,
    FaGlobe,
    FaSuitcase,
    FaEnvelope,
    FaStar,
    FaUser,
    FaSignOutAlt,
    FaBell,
    FaRobot,
    FaBars,
    FaCog,
    FaCreditCard,
    FaCalendarAlt
} from "react-icons/fa";

import api from "../api/api";

import "./NavbarPublic.css";


function NavbarPublic() {

    const navigate = useNavigate();


    // =====================================================
    // ÉTATS
    // =====================================================

    const [nombreNotifications, setNombreNotifications] =
        useState(0);

    const [menuProfil, setMenuProfil] =
        useState(false);

    const [menuPrincipal, setMenuPrincipal] =
        useState(false);

    const [utilisateur, setUtilisateur] =
        useState(null);

    const [profil, setProfil] =
        useState(null);


    // =====================================================
    // CHARGER LE PROFIL
    // =====================================================

    useEffect(() => {

        if (!utilisateur?.id_utilisateur) {

            setProfil(null);

            return;

        }


        const chargerProfil = async () => {

            try {

                const res = await api.get(
                    `/utilisateurs/${utilisateur.id_utilisateur}`
                );

                setProfil(res.data);

            }
            catch (error) {

                console.log(
                    "Erreur chargement profil :",
                    error
                );

            }

        };


        chargerProfil();


        const interval = setInterval(
            chargerProfil,
            5000
        );


        return () => {

            clearInterval(interval);

        };

    }, [utilisateur]);


    // =====================================================
    // RÉCUPÉRER L'UTILISATEUR
    // =====================================================

    useEffect(() => {

        const recupererUtilisateur = () => {

            try {

                const stockage =
                    localStorage.getItem("utilisateur");


                if (!stockage) {

                    setUtilisateur(null);

                    return;

                }


                const data =
                    JSON.parse(stockage);


                const user =
                    data?.utilisateur
                        ? data.utilisateur
                        : data;


                setUtilisateur(
                    user || null
                );

            }
            catch (error) {

                console.log(
                    "Erreur lecture utilisateur :",
                    error
                );

                setUtilisateur(null);

            }

        };


        recupererUtilisateur();


        window.addEventListener(
            "utilisateurConnecte",
            recupererUtilisateur
        );


        window.addEventListener(
            "utilisateurDeconnecte",
            recupererUtilisateur
        );


        return () => {

            window.removeEventListener(
                "utilisateurConnecte",
                recupererUtilisateur
            );


            window.removeEventListener(
                "utilisateurDeconnecte",
                recupererUtilisateur
            );

        };

    }, []);


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    useEffect(() => {

        if (
            !utilisateur ||
            utilisateur.role === "Administrateur"
        ) {

            setNombreNotifications(0);

            return;

        }


        const chargerNotifications = async () => {

            try {

                const res =
                    await api.get(
                        `/notifications/utilisateur/${utilisateur.id_utilisateur}`
                    );


                const notifications =
                    Array.isArray(res.data)
                        ? res.data
                        : [];


                const total =
                    notifications.filter(
                        notification =>
                            Number(notification.lu) === 0
                    ).length;


                setNombreNotifications(
                    total
                );

            }
            catch (error) {

                console.log(
                    "Erreur notifications :",
                    error
                );

            }

        };


        chargerNotifications();


        const interval =
            setInterval(
                chargerNotifications,
                5000
            );


        return () => {

            clearInterval(interval);

        };

    }, [utilisateur]);


    // =====================================================
    // FERMER LES MENUS
    // =====================================================

    const fermerMenus = () => {

        setMenuPrincipal(false);

        setMenuProfil(false);

    };


    // =====================================================
    // DÉCONNEXION
    // =====================================================

    const deconnexion = () => {

        localStorage.removeItem(
            "utilisateur"
        );

        localStorage.removeItem(
            "token"
        );


        setUtilisateur(null);

        setProfil(null);

        setMenuPrincipal(false);

        setMenuProfil(false);


        window.dispatchEvent(
            new Event(
                "utilisateurDeconnecte"
            )
        );


        navigate("/");

    };


    // =====================================================
    // PHOTO PROFIL
    // =====================================================

    const photoUtilisateur =
        profil?.photo ||
        utilisateur?.photo ||
        null;


    const photoProfil =
        photoUtilisateur
            ? (
                photoUtilisateur.startsWith("http")
                    ? photoUtilisateur
                    : `http://localhost:8081/uploads/${photoUtilisateur}`
            )
            : null;


    // =====================================================
    // CLIENT CONNECTÉ ?
    // =====================================================

    const clientConnecte =
        utilisateur &&
        utilisateur.role !== "Administrateur";


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <nav className="navbar-public">


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="logo-public">

                <span className="logo-icon">
                    🌍
                </span>

                <span className="logo-text">
                    Plateforme Touristique
                </span>

            </div>


            {/* =================================================
                NAVIGATION VISITEUR
            ================================================= */}

            {!clientConnecte && (

                <ul className="navbar-navigation">

                    <li>

                        <NavLink to="/">

                            <FaHome />

                            <span>
                                Accueil
                            </span>

                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/destinations-public">

                            <FaGlobe />

                            <span>
                                Destinations
                            </span>

                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/offres-public">

                            <FaSuitcase />

                            <span>
                                Offres
                            </span>

                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/avis-public">

                            <FaStar />

                            <span>
                                Avis
                            </span>

                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/contact">

                            <FaEnvelope />

                            <span>
                                Contact
                            </span>

                        </NavLink>

                    </li>

                </ul>

            )}


            {/* =================================================
                ACTIONS CLIENT CONNECTÉ
            ================================================= */}

            {clientConnecte && (

                <div className="client-actions">


                    {/* =================================================
                        MENU PRINCIPAL
                    ================================================= */}

                    <div className="menu-principal-container">

                        <button
                            type="button"
                            className="menu-principal-button"
                            onClick={() => {

                                setMenuPrincipal(
                                    prev => !prev
                                );

                                setMenuProfil(false);

                            }}
                            aria-label="Menu"
                        >

                            <FaBars />

                        </button>


                        {menuPrincipal && (

                            <div className="menu-principal">


                                <NavLink
                                    to="/"
                                    onClick={fermerMenus}
                                >

                                    <FaHome />

                                    <span>
                                        Accueil
                                    </span>

                                </NavLink>


                                <NavLink
                                    to="/destinations-public"
                                    onClick={fermerMenus}
                                >

                                    <FaGlobe />

                                    <span>
                                        Destinations
                                    </span>

                                </NavLink>


                                <NavLink
                                    to="/offres-public"
                                    onClick={fermerMenus}
                                >

                                    <FaSuitcase />

                                    <span>
                                        Offres
                                    </span>

                                </NavLink>


                                <NavLink
                                    to="/contact"
                                    onClick={fermerMenus}
                                >

                                    <FaEnvelope />

                                    <span>
                                        Contact
                                    </span>

                                </NavLink>


                                <NavLink
                                    to="/recommandations-client"
                                    onClick={fermerMenus}
                                >

                                    <FaRobot />

                                    <span>
                                        Recommandations IA
                                    </span>

                                </NavLink>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        AVIS PUBLIC
                    ================================================= */}

                    <button
                        type="button"
                        className="navbar-icon-button avis-button"
                        onClick={() => {

                            fermerMenus();

                            navigate("/avis-public");

                        }}
                        aria-label="Avis"
                    >

                        <FaStar />

                    </button>


                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <button
                        type="button"
                        className="navbar-icon-button notification-button"
                        onClick={() => {

                            fermerMenus();

                            navigate(
                                "/mes-notifications"
                            );

                        }}
                        aria-label="Notifications"
                    >

                        <FaBell />


                        {nombreNotifications > 0 && (

                            <span className="notification-badge">

                                {nombreNotifications}

                            </span>

                        )}

                    </button>


                    {/* =================================================
                        PROFIL
                    ================================================= */}

                    <div className="profil-container">


                        <button
                            type="button"
                            className="profil-button"
                            onClick={() => {

                                setMenuProfil(
                                    prev => !prev
                                );

                                setMenuPrincipal(false);

                            }}
                            aria-label="Profil"
                            aria-expanded={menuProfil}
                        >

                            {photoProfil ? (

                                <img
                                    src={photoProfil}
                                    className="profil-photo"
                                    alt="Profil"
                                />

                            ) : (

                                <FaUser />

                            )}

                        </button>


                        {/* =================================================
                            MENU DÉROULANT PROFIL
                        ================================================= */}

                        {menuProfil && (

                            <div className="profil-menu">


                                {/* =================================================
                                    INFORMATIONS UTILISATEUR
                                ================================================= */}

                                <div className="profil-menu-header">

                                    <div className="profil-menu-photo">

                                        {photoProfil ? (

                                            <img
                                                src={photoProfil}
                                                alt="Profil"
                                            />

                                        ) : (

                                            <FaUser />

                                        )}

                                    </div>


                                    <div className="profil-menu-user">

                                        <strong>

                                            {utilisateur?.prenom || ""}
                                            {" "}
                                            {utilisateur?.nom || ""}

                                        </strong>


                                        <span>

                                            {utilisateur?.email || ""}

                                        </span>

                                    </div>

                                </div>


                                <div className="profil-menu-separator" />


                                {/* =================================================
                                    MON COMPTE
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/espace-client"
                                        );

                                    }}
                                >

                                    <FaUser />

                                    <span>
                                        Mon compte
                                    </span>

                                </button>


                                {/* =================================================
                                    MES RÉSERVATIONS
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/mes-reservations"
                                        );

                                    }}
                                >

                                    <FaCalendarAlt />

                                    <span>
                                        Mes réservations
                                    </span>

                                </button>


                                {/* =================================================
                                    MES TRANSACTIONS
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/espace-client/transactions"
                                        );

                                    }}
                                >

                                    <FaCreditCard />

                                    <span>
                                        Mes transactions
                                    </span>

                                </button>


                                {/* =================================================
                                    MES AVIS
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/espace-client/avis"
                                        );

                                    }}
                                >

                                    <FaStar />

                                    <span>
                                        Mes avis
                                    </span>

                                </button>


                                {/* =================================================
                                    NOTIFICATIONS
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/mes-notifications"
                                        );

                                    }}
                                >

                                    <FaBell />

                                    <span>
                                        Notifications
                                    </span>


                                    {nombreNotifications > 0 && (

                                        <span className="profil-notification-badge">

                                            {nombreNotifications}

                                        </span>

                                    )}

                                </button>


                                <div className="profil-menu-separator" />


                                {/* =================================================
                                    PARAMÈTRES DU COMPTE
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        fermerMenus();

                                        navigate(
                                            "/espace-client/profil"
                                        );

                                    }}
                                >

                                    <FaCog />

                                    <span>
                                        Paramètres du compte
                                    </span>

                                </button>


                                {/* =================================================
                                    DÉCONNEXION
                                ================================================= */}

                                <button
                                    type="button"
                                    className="logout"
                                    onClick={deconnexion}
                                >

                                    <FaSignOutAlt />

                                    <span>
                                        Se déconnecter
                                    </span>

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                BOUTON CONNEXION
            ================================================= */}

            {!clientConnecte && (

                <NavLink
                    to="/login-client"
                    className="btn-login-client"
                >

                    Connexion

                </NavLink>

            )}

        </nav>

    );

}


export default NavbarPublic;