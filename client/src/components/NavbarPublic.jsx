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
    FaCamera,
    FaEye,
    FaRobot,
    FaHistory,
    FaBars
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

    const [modalPhoto, setModalPhoto] =
        useState(false);

    const [fichier, setFichier] =
        useState(null);

    const [profil, setProfil] =
        useState(null);


    // =====================================================
    // CHARGER PROFIL
    // =====================================================

    useEffect(() => {

        if (!utilisateur) {

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


        const interval =
            setInterval(
                chargerProfil,
                5000
            );


        return () => {

            clearInterval(interval);

        };

    }, [utilisateur]);


    // =====================================================
    // RÉCUPÉRER UTILISATEUR
    // =====================================================

    useEffect(() => {

        const recupererUtilisateur = () => {

            try {

                const stockage =
                    localStorage.getItem(
                        "utilisateur"
                    );


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
    // VOIR PHOTO PROFIL
    // =====================================================

    const voirPhotoProfil = () => {

        const photo =
            profil?.photo ||
            utilisateur?.photo;


        if (!photo) {

            alert(
                "Aucune photo de profil disponible."
            );

            return;

        }


        window.open(
            `http://localhost:8081/uploads/${photo}`,
            "_blank"
        );

    };


    // =====================================================
    // CHANGER PHOTO
    // =====================================================

    const changerPhoto = async () => {

        if (!fichier) {

            alert(
                "Choisissez une image."
            );

            return;

        }


        if (!utilisateur?.id_utilisateur) {

            alert(
                "Utilisateur non identifié."
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "photo",
            fichier
        );


        try {

            const res =
                await api.put(

                    `/utilisateurs/photo/${utilisateur.id_utilisateur}`,

                    formData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }

                );


            const nouveauUtilisateur = {

                ...utilisateur,

                photo: res.data.photo

            };


            localStorage.setItem(
                "utilisateur",
                JSON.stringify(
                    nouveauUtilisateur
                )
            );


            setUtilisateur(
                nouveauUtilisateur
            );


            setProfil(
                prev => ({
                    ...prev,
                    photo: res.data.photo
                })
            );


            setModalPhoto(false);

            setFichier(null);


            alert(
                "Photo modifiée avec succès."
            );

        }
        catch (error) {

            console.log(
                "Erreur changement photo :",
                error
            );


            alert(
                "Erreur lors du changement de photo."
            );

        }

    };


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


        const chargerNotifications =
            async () => {

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
                                Number(
                                    notification.lu
                                ) === 0
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

    const photoProfil =
        profil?.photo ||
        utilisateur?.photo
            ? `http://localhost:8081/uploads/${
                profil?.photo ||
                utilisateur?.photo
            }`
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
                NAVIGATION CLIENT NON CONNECTÉ
            ================================================= */}

            {!clientConnecte && (

                <ul className="navbar-navigation">

                    <li>

                        <NavLink to="/">
                            <FaHome />
                            <span>Accueil</span>
                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/destinations-public">
                            <FaGlobe />
                            <span>Destinations</span>
                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/offres-public">
                            <FaSuitcase />
                            <span>Offres</span>
                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/avis-public">
                            <FaStar />
                            <span>Avis</span>
                        </NavLink>

                    </li>


                    <li>

                        <NavLink to="/contact">
                            <FaEnvelope />
                            <span>Contact</span>
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
                        MENU
                    ================================================= */}

                    <div className="menu-principal-container">

                        <button
                            type="button"
                            className="menu-principal-button"
                            onClick={() =>
                                setMenuPrincipal(
                                    !menuPrincipal
                                )
                            }
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
                                      AVIS
                      ================================================= */}

<button
    type="button"
    className="navbar-icon-button avis-button"
    onClick={() =>
        navigate("/avis-public")
    }
    aria-label="Avis"
>

    <FaStar />

</button>


                    {/* =================================================
                        NOTIFICATION
                    ================================================= */}

                    <button
                        type="button"
                        className="navbar-icon-button notification-button"
                        onClick={() =>
                            navigate(
                                "/mes-notifications"
                            )
                        }
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
                        HISTORIQUE
                    ================================================= */}

                    <button
                        type="button"
                        className="navbar-icon-button history-button"
                        onClick={() =>
                            navigate(
                                "/mes-reservations"
                            )
                        }
                        aria-label="Historique"
                    >

                        <FaHistory />

                    </button>


                    {/* =================================================
                        PROFIL
                    ================================================= */}

                    <div className="profil-container">


                        <button
                            type="button"
                            className="profil-button"
                            onClick={() =>
                                setMenuProfil(
                                    !menuProfil
                                )
                            }
                            aria-label="Profil"
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


                        {menuProfil && (

                            <div className="profil-menu">


                                {/* CHANGER PHOTO */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setMenuProfil(false);

                                        setModalPhoto(true);

                                    }}
                                >

                                    <FaCamera />

                                    <span>
                                        Changer photo
                                    </span>

                                </button>


                                {/* VOIR PHOTO */}

                                <button
                                    type="button"
                                    onClick={() => {

                                        setMenuProfil(false);

                                        voirPhotoProfil();

                                    }}
                                >

                                    <FaEye />

                                    <span>
                                        Voir ma photo
                                    </span>

                                </button>


                                {/* DÉCONNEXION */}

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
                CONNEXION
            ================================================= */}

            {!clientConnecte && (

                <NavLink
                    to="/login-client"
                    className="btn-login-client"
                >

                    Connexion

                </NavLink>

            )}


            {/* =================================================
                MODALE PHOTO
            ================================================= */}

            {modalPhoto && (

                <div
                    className="modal-photo"
                    onClick={() =>
                        setModalPhoto(false)
                    }
                >

                    <div
                        className="modal-photo-content"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            Changer photo de profil
                        </h3>


                        <input
                            type="file"
                            accept="image/*"
                            onChange={e =>
                                setFichier(
                                    e.target.files[0]
                                )
                            }
                        />


                        <div className="modal-actions">

                            <button
                                type="button"
                                className="btn-save-photo"
                                onClick={changerPhoto}
                            >
                                Enregistrer
                            </button>


                            <button
                                type="button"
                                className="btn-cancel-photo"
                                onClick={() => {

                                    setModalPhoto(false);

                                    setFichier(null);

                                }}
                            >
                                Annuler
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </nav>

    );

}


export default NavbarPublic;