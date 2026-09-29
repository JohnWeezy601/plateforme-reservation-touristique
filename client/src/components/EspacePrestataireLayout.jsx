import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    FaTachometerAlt,
    FaSuitcase,
    FaCalendarCheck,
    FaBuilding,
    FaSignOutAlt
} from "react-icons/fa";
import "./EspacePrestataireLayout.css";


function EspacePrestataireLayout() {

    const navigate = useNavigate();

    const [utilisateur, setUtilisateur] = useState(null);

    const [chargement, setChargement] = useState(true);


    // =====================================================
    // RÉCUPÉRER UTILISATEUR CONNECTÉ
    // =====================================================

    useEffect(() => {

        const utilisateurConnecte =
            localStorage.getItem("utilisateur");


        if (utilisateurConnecte) {

            try {

                const utilisateurParse =
                    JSON.parse(utilisateurConnecte);

                setUtilisateur(
                    utilisateurParse
                );

            }
            catch(error) {

                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

                setUtilisateur(null);

            }

        }
        else {

            setUtilisateur(null);

        }


        setChargement(false);

    }, []);


    // =====================================================
    // DÉCONNEXION
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("utilisateur");

        navigate(
            "/login-client",
            {
                replace: true
            }
        );

    };


    // =====================================================
    // ATTENDRE LA LECTURE DU LOCALSTORAGE
    // =====================================================

    if (chargement) {

        return null;

    }


    // =====================================================
    // UTILISATEUR NON CONNECTÉ
    // =====================================================

    if (!utilisateur) {

        return (
            <Navigate
                to="/login-client"
                replace
            />
        );

    }


    // =====================================================
    // VÉRIFICATION DU RÔLE
    // =====================================================

    if (utilisateur.role !== "Prestataire") {

        return (
            <Navigate
                to="/login-client"
                replace
            />
        );

    }


    // =====================================================
    // ESPACE PRESTATAIRE
    // =====================================================

    return (

        <div className="espace-prestataire">


            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="prestataire-sidebar">


                {/* =====================================================
                    LOGO / TITRE
                ===================================================== */}

                <div className="prestataire-logo">

                    <h2>
                        🌴 Travel Explorer
                    </h2>

                    <p>
                        Espace prestataire
                    </p>

                </div>


                {/* =====================================================
                    INFORMATIONS UTILISATEUR
                ===================================================== */}

                <div className="prestataire-user">

                    <div className="prestataire-avatar">

                        {utilisateur.photo ? (

                            <img
                                src={utilisateur.photo}
                                alt="Profil"
                            />

                        ) : (

                            <span>
                                {utilisateur.prenom
                                    ? utilisateur.prenom.charAt(0).toUpperCase()
                                    : "P"
                                }
                            </span>

                        )}

                    </div>


                    <div className="prestataire-user-info">

                        <strong>

                            {utilisateur.prenom}{" "}

                            {utilisateur.nom}

                        </strong>

                        <span>
                            Prestataire
                        </span>

                    </div>

                </div>


                {/* =====================================================
                    MENU
                ===================================================== */}

                <nav className="prestataire-menu">


                    <Link
                        to="/espace-prestataire"
                        className="prestataire-menu-link"
                    >

                        <FaTachometerAlt />

                        <span>
                            Tableau de bord
                        </span>

                    </Link>


                    <Link
                        to="/espace-prestataire/offres"
                        className="prestataire-menu-link"
                    >

                        <FaSuitcase />

                        <span>
                            Mes offres
                        </span>

                    </Link>


                    <Link
                        to="/espace-prestataire/reservations"
                        className="prestataire-menu-link"
                    >

                        <FaCalendarCheck />

                        <span>
                            Mes réservations
                        </span>

                    </Link>


                    <Link
                        to="/espace-prestataire/etablissement"
                        className="prestataire-menu-link"
                    >

                        <FaBuilding />

                        <span>
                            Mon établissement
                        </span>

                    </Link>


                </nav>


                {/* =====================================================
                    DÉCONNEXION
                ===================================================== */}

                <div className="prestataire-sidebar-bottom">

                    <button
                        type="button"
                        className="prestataire-logout"
                        onClick={handleLogout}
                    >

                        <FaSignOutAlt />

                        <span>
                            Déconnexion
                        </span>

                    </button>

                </div>


            </aside>


            {/* =====================================================
                CONTENU PRINCIPAL
            ===================================================== */}

            <main className="prestataire-content">

                <Outlet />

            </main>


        </div>

    );

}


export default EspacePrestataireLayout;