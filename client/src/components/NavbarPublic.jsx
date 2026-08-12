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
    FaChevronDown,
    FaHistory
} from "react-icons/fa";

import api from "../api/api";

import "./NavbarPublic.css";


function NavbarPublic() {


    const navigate = useNavigate();


    const [nombreNotifications, setNombreNotifications] = useState(0);

    const [menuProfil, setMenuProfil] = useState(false);

    const [menuPlus, setMenuPlus] = useState(false);

    const [utilisateur, setUtilisateur] = useState(null);

    const [modalPhoto, setModalPhoto] = useState(false);

    const [fichier, setFichier] = useState(null);

    const [profil, setProfil] = useState(null);


    // ============================
    // CHARGER PROFIL
    // ============================

    useEffect(() => {

        if (!utilisateur) return;


        const chargerProfil = async () => {

            try {

                const res = await api.get(
                    `/utilisateurs/${utilisateur.id_utilisateur}`
                );

                setProfil(res.data);

            }
            catch (err) {

                console.log(err);

            }

        };


        chargerProfil();


        const interval = setInterval(() => {

            chargerProfil();

        }, 5000);


        return () => clearInterval(interval);

    }, [utilisateur]);


    // ============================
    // RECUPERER UTILISATEUR
    // ============================

    useEffect(() => {

        const recupererUtilisateur = () => {

            const data = JSON.parse(
                localStorage.getItem("utilisateur")
            );


            const user =
                data?.utilisateur
                    ? data.utilisateur
                    : data;


            setUtilisateur(user || null);

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


    // ============================
    // VOIR PHOTO PROFIL
    // ============================

    const voirPhotoProfil = () => {

        if (!utilisateur?.photo) {

            alert(
                "Aucune photo de profil disponible"
            );

            return;

        }


        window.open(
            `http://localhost:8081/uploads/${utilisateur.photo}`,
            "_blank"
        );

    };


    // ============================
    // CHANGER PHOTO
    // ============================

    const changerPhoto = async () => {

        if (!fichier) {

            alert("Choisissez une image");

            return;

        }


        const formData = new FormData();


        formData.append(
            "photo",
            fichier
        );


        try {

            const res = await api.put(

                `/utilisateurs/photo/${utilisateur.id_utilisateur}`,

                formData,

                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }

            );


            console.log(
                "Photo modifiée",
                res.data
            );


            const nouveauUtilisateur = {

                ...utilisateur,

                photo: res.data.photo

            };


            localStorage.setItem(
                "utilisateur",
                JSON.stringify(nouveauUtilisateur)
            );


            setUtilisateur(
                nouveauUtilisateur
            );


            setModalPhoto(false);


            setFichier(null);


            alert(
                "Photo modifiée avec succès"
            );

        }
        catch (error) {

            console.log(error);

            alert(
                "Erreur changement photo"
            );

        }

    };


    // ============================
    // NOTIFICATIONS
    // ============================

    useEffect(() => {

        const chargerNotifications = async () => {

            if (!utilisateur)
                return;


            try {

                const res = await api.get(
                    `/notifications/utilisateur/${utilisateur.id_utilisateur}`
                );


                const total =
                    res.data.filter(
                        n => Number(n.lu) === 0
                    ).length;


                setNombreNotifications(total);

            }
            catch (error) {

                console.log(error);

            }

        };


        chargerNotifications();

    }, [utilisateur]);


    // ============================
    // DECONNEXION
    // ============================

    const deconnexion = () => {

        localStorage.removeItem("utilisateur");

        localStorage.removeItem("token");


        setUtilisateur(null);

        setMenuProfil(false);

        setMenuPlus(false);


        navigate("/");

        window.location.reload();

    };


    // ============================
    // PHOTO PROFIL
    // ============================

    const photoProfil = utilisateur?.photo

        ?

        `http://localhost:8081/uploads/${utilisateur.photo}`

        :

        null;


    // ============================
    // AFFICHAGE
    // ============================

    return (

        <nav className="navbar-public">


            {/* ============================
                LOGO
            ============================ */}

            <div className="logo-public">

                <span>
                    🌍
                </span>

                <span>
                    Plateforme Touristique
                </span>


                {/* ============================
                    NOTIFICATIONS
                ============================ */}

                {
                    utilisateur &&
                    utilisateur.role !== "Administrateur" &&

                    <div
                        className="notification-container"
                        onClick={() =>
                            navigate("/mes-notifications")
                        }
                    >

                        <FaBell />

                        {
                            nombreNotifications > 0 &&

                            <span className="notification-badge">

                                {nombreNotifications}

                            </span>
                        }

                    </div>
                }

            </div>


            {/* ============================
                NAVIGATION
            ============================ */}

            <ul>


                {/* ============================
                    ACCUEIL
                ============================ */}

                <li>

                    <NavLink to="/">

                        <FaHome />

                        Accueil

                    </NavLink>

                </li>


                {/* ============================
                    DESTINATIONS
                ============================ */}

                <li>

                    <NavLink to="/destinations-public">

                        <FaGlobe />

                        Destinations

                    </NavLink>

                </li>


                {/* ============================
                    OFFRES
                ============================ */}

                <li>

                    <NavLink to="/offres-public">

                        <FaSuitcase />

                        Offres

                    </NavLink>

                </li>


                {/* ==================================================
                    AVIS POUR UTILISATEUR NON CONNECTÉ
                ================================================== */}

                {
                    !utilisateur &&

                    <li>

                        <NavLink to="/avis-public">

                            <FaStar />

                            Avis

                        </NavLink>

                    </li>
                }


                {/* ============================
                    CONTACT
                ============================ */}

                <li>

                    <NavLink to="/contact">

                        <FaEnvelope />

                        Contact

                    </NavLink>

                </li>


                {/* ==================================================
                    MENU PLUS POUR UTILISATEUR CONNECTÉ
                ================================================== */}

                {
                    utilisateur &&
                    utilisateur.role !== "Administrateur" &&

                    <li className="plus-menu-container">

                        <button
                            type="button"
                            className="plus-button"
                            onClick={() =>
                                setMenuPlus(!menuPlus)
                            }
                        >

                            <span>
                                Plus
                            </span>

                            <FaChevronDown
                                className={
                                    menuPlus
                                        ? "plus-arrow rotate"
                                        : "plus-arrow"
                                }
                            />

                        </button>


                        {
                            menuPlus &&

                            <div className="plus-menu">


                                {/* ============================
                                    AVIS
                                ============================ */}

                                <NavLink
                                    to="/avis-public"
                                    onClick={() =>
                                        setMenuPlus(false)
                                    }
                                >

                                    <FaStar />

                                    <span>
                                        Avis
                                    </span>

                                </NavLink>


                                {/* ============================
                                    RECOMMANDATIONS IA
                                ============================ */}

                                <NavLink
                                    to="/recommandations-client"
                                    onClick={() =>
                                        setMenuPlus(false)
                                    }
                                >

                                    <FaRobot />

                                    <span>
                                        Recommandations IA
                                    </span>

                                </NavLink>


                                {/* ============================
                                    HISTORIQUE
                                ============================ */}

                                <NavLink
                                    to="/mes-reservations"
                                    onClick={() =>
                                        setMenuPlus(false)
                                    }
                                >

                                    <FaHistory />

                                    <span>
                                        Historique
                                    </span>

                                </NavLink>


                            </div>

                        }

                    </li>
                }


            </ul>


            {/* ============================
                PROFIL
            ============================ */}

            {
                utilisateur &&
                utilisateur.role !== "Administrateur"

                    ?

                    <div className="profil-container">


                        {/* ============================
                            BOUTON PROFIL
                        ============================ */}

                        <button
                            type="button"
                            className="profil-button"
                            onClick={() =>
                                setMenuProfil(!menuProfil)
                            }
                        >

                            {
                                photoProfil

                                    ?

                                    <img
                                        src={photoProfil}
                                        className="profil-photo"
                                        alt="Profil"
                                    />

                                    :

                                    <FaUser />
                            }


                            <span>
                                {utilisateur.prenom}
                            </span>

                        </button>


                        {/* ============================
                            MENU PROFIL
                        ============================ */}

                        {
                            menuProfil &&

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
                                        Changer photo de profil
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
                                        Voir photo de profil
                                    </span>

                                </button>


                                {/* DECONNEXION */}

                                <button
                                    type="button"
                                    onClick={deconnexion}
                                    className="logout"
                                >

                                    <FaSignOutAlt />

                                    <span>
                                        Se déconnecter
                                    </span>

                                </button>


                            </div>

                        }


                    </div>


                    :


                    /* ============================
                       CONNEXION
                    ============================ */

                    <NavLink
                        to="/login-client"
                        className="btn-login-client"
                    >

                        Connexion

                    </NavLink>

            }


            {/* ============================
                MODAL PHOTO
            ============================ */}

            {
                modalPhoto &&

                <div className="modal-photo">

                    <div className="modal-photo-content">


                        <h3>
                            Changer photo de profil
                        </h3>


                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
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

            }


        </nav>

    );

}


export default NavbarPublic;