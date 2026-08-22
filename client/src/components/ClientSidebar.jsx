import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FaHome,
    FaUser,
    FaCalendarAlt,
    FaCreditCard,
    FaStar,
    FaBell,
    FaSignOutAlt
} from "react-icons/fa";

import "./ClientSidebar.css";


function ClientSidebar() {

    const navigate = useNavigate();

    const location = useLocation();


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const [utilisateur] = useState(() => {

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
    // MENU CLIENT
    // =====================================================

    const menu = [

        {
            icon: <FaHome />,
            label: "Accueil",
            path: routes.accueil
        },

        {
            icon: <FaUser />,
            label: "Mon profil",
            path: routes.profil
        },

        {
            icon: <FaCalendarAlt />,
            label: "Mes réservations",
            path: routes.reservations
        },

        {
            icon: <FaCreditCard />,
            label: "Mes transactions",
            path: routes.transactions
        },

        {
            icon: <FaStar />,
            label: "Mes avis",
            path: routes.avis
        },

        {
            icon: <FaBell />,
            label: "Notifications",
            path: routes.notifications
        }

    ];


    // =====================================================
    // VÉRIFIER MENU ACTIF
    // =====================================================

    const isActive = (path) => {

        return location.pathname === path;

    };


    // =====================================================
    // DÉCONNEXION
    // =====================================================

    const deconnexion = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("utilisateur");

        window.dispatchEvent(
            new Event("utilisateurDeconnecte")
        );

        navigate(routes.login);

    };


    // =====================================================
    // SI PAS D'UTILISATEUR
    // =====================================================

    if (!utilisateur) {
        return null;
    }


    // =====================================================
    // PHOTO UTILISATEUR
    // =====================================================

    const photoUtilisateur =
        utilisateur.photo || null;


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <aside className="client-sidebar">


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="client-sidebar-logo">

                <span className="client-logo-icon">
                    🏝️
                </span>

                <span>
                    Plateforme Touristique
                </span>

            </div>


            {/* =================================================
                INFORMATIONS CLIENT
            ================================================= */}

            <div className="client-sidebar-user">

                <div className="client-sidebar-photo">

                    {photoUtilisateur ? (

                        <img
                            src={photoUtilisateur}
                            alt="Photo profil"
                        />

                    ) : (

                        <FaUser />

                    )}

                </div>


                <strong>

                    {utilisateur.prenom ||
                        utilisateur.nom ||
                        "Client"}

                </strong>


                <span>

                    {utilisateur.email || "-"}

                </span>

            </div>


            {/* =================================================
                MENU
            ================================================= */}

            <nav className="client-sidebar-menu">

                {menu.map((item) => (

                    <button
                        key={item.path}
                        type="button"
                        className={
                            isActive(item.path)
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate(item.path)
                        }
                    >

                        <span className="client-sidebar-menu-icon">
                            {item.icon}
                        </span>

                        <span className="client-sidebar-menu-label">
                            {item.label}
                        </span>

                    </button>

                ))}

            </nav>


            {/* =================================================
                DÉCONNEXION
            ================================================= */}

            <button
                type="button"
                className="client-sidebar-logout"
                onClick={deconnexion}
            >

                <span>
                    <FaSignOutAlt />
                </span>

                <span>
                    Déconnexion
                </span>

            </button>


        </aside>

    );

}


export default ClientSidebar;