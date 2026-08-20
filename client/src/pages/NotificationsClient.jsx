import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaBell,
    FaCheckCircle,
    FaTimesCircle,
    FaFileDownload,
    FaStar,
    FaCalendarTimes
} from "react-icons/fa";

import api from "../api/api";

import "./NotificationsClient.css";


function NotificationsClient() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);

    const [afficherToutes, setAfficherToutes] = useState(false);


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const dataUtilisateur =
        JSON.parse(
            localStorage.getItem("utilisateur")
        );

    const utilisateur =
        dataUtilisateur?.utilisateur
            ?
            dataUtilisateur.utilisateur
            :
            dataUtilisateur;


    // =====================================================
    // NORMALISER UN TEXTE
    // =====================================================

    const normaliserTexte = (texte) => {

        return String(texte || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim();

    };


    // =====================================================
    // NOTIFICATION DE PAIEMENT
    // =====================================================

    const estNotificationPaiement = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);

        const type =
            normaliserTexte(n.type);

        return (
            type === "paiement"
            ||
            titre.includes("paiement")
            ||
            message.includes("paiement")
        );

    };


    // =====================================================
    // PAIEMENT ÉCHOUÉ / NON VALIDÉ
    // =====================================================

    const paiementEstEchoue = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);

        return (

            titre.includes("echou")
            ||
            titre.includes("echec")
            ||
            titre.includes("non valide")
            ||
            titre.includes("non validee")
            ||
            message.includes("echou")
            ||
            message.includes("echec")
            ||
            message.includes("non valide")
            ||
            message.includes("non validee")

        );

    };


    // =====================================================
    // PAIEMENT VALIDÉ
    // =====================================================

    const paiementEstValide = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);


        // "Paiement non validé" ou "Paiement échoué"
        // ne doit jamais être considéré comme validé.

        if (
            paiementEstEchoue(n)
        ) {

            return false;

        }


        return (

            titre.includes("paiement valide")
            ||
            titre.includes("paiement paye")
            ||
            titre.includes("paiement payé")
            ||
            titre.includes("paiement confirme")
            ||
            message.includes("paiement est confirme")
            ||
            message.includes("paiement confirme")
            ||
            message.includes("paiement valide")
            ||
            message.includes("paiement paye")
            ||
            message.includes("paiement payé")

        );

    };


    // =====================================================
    // NOTIFICATION À AFFICHER
    // =====================================================

    const notificationDoitEtreAffichee = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);

        const type =
            normaliserTexte(n.type);


        // =================================================
        // PAIEMENT
        // =================================================

        if (
            estNotificationPaiement(n)
        ) {

            return true;

        }


        // =================================================
        // RÉSERVATION
        // =================================================

        if (

            type === "reservation"
            ||
            titre.includes("reservation")
            ||
            message.includes("reservation")

        ) {

            // Réservation confirmée

            if (

                titre.includes("confirm")
                ||
                message.includes("confirm")

            ) {

                return true;

            }


            // Réservation rejetée

            if (

                titre.includes("rejet")
                ||
                message.includes("rejet")

            ) {

                return true;

            }


            // Réservation annulée

            if (

                titre.includes("annul")
                ||
                message.includes("annul")

            ) {

                return true;

            }


            // Autres notifications de réservation
            return false;

        }


        // =================================================
        // AVIS ET AUTRES
        // =================================================

        return true;

    };


    // =====================================================
    // CHARGER LES NOTIFICATIONS
    // =====================================================

    const chargerNotifications = async () => {

        if (
            !utilisateur?.id_utilisateur
        ) {

            return;

        }


        try {

            const res =
                await api.get(
                    `/notifications/utilisateur/${utilisateur.id_utilisateur}`
                );


            console.log(
                "Notifications reçues du serveur :",
                res.data
            );


            const notificationsVisibles =
                Array.isArray(res.data)

                    ?

                    res.data.filter(
                        notification =>
                            notificationDoitEtreAffichee(
                                notification
                            )
                    )

                    :

                    [];


            console.log(
                "Notifications affichées :",
                notificationsVisibles
            );


            setNotifications(
                notificationsVisibles
            );

        }
        catch (error) {

            console.log(
                "Erreur notification :",
                error
            );

        }

    };


    // =====================================================
    // RAFRAÎCHISSEMENT AUTOMATIQUE
    // =====================================================

    useEffect(() => {

        chargerNotifications();


        const interval =
            setInterval(
                () => {
                    chargerNotifications();
                },
                2000
            );


        const handleVisibility = () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                chargerNotifications();

            }

        };


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        return () => {

            clearInterval(interval);

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

        };

    }, []);


    // =====================================================
    // MARQUER COMME LU
    // =====================================================

    const marquerCommeLu = (id) => {

        setNotifications(
            prev =>
                prev.map(
                    n =>
                        n.id_notification === id
                            ?
                            {
                                ...n,
                                lu: 1
                            }
                            :
                            n
                )
        );


        api.put(
            `/notifications/lu/${id}`
        )
            .catch(
                error =>
                    console.log(
                        "Erreur lecture :",
                        error
                    )
            );

    };


    // =====================================================
    // SUPPRIMER NOTIFICATION
    // =====================================================

    const supprimerNotification =
        async (id) => {

            try {

                await api.delete(
                    `/notifications/${id}`
                );


                setNotifications(
                    prev =>
                        prev.filter(
                            n =>
                                n.id_notification !== id
                        )
                );

            }
            catch (error) {

                console.log(
                    "Erreur suppression notification :",
                    error
                );


                alert(
                    "Erreur lors de la suppression de la notification"
                );

            }

        };


    // =====================================================
    // CONSTRUIRE L'URL DU REÇU
    // =====================================================

    const construireUrlRecu = (lien) => {

        if (!lien) {
            return null;
        }


        // -------------------------------------------------
        // Si le backend a déjà enregistré une URL complète
        // -------------------------------------------------

        if (
            lien.startsWith("http://")
            ||
            lien.startsWith("https://")
        ) {

            return lien;

        }


        // -------------------------------------------------
        // URL du backend
        // Exemple :
        // VITE_API_URL=http://localhost:8081/api
        // -------------------------------------------------

        const baseUrl =
            import.meta.env.VITE_API_URL
                ?.
                replace(/\/$/, "");


        if (!baseUrl) {

            console.error(
                "VITE_API_URL n'est pas défini."
            );

            return lien;

        }


        // -------------------------------------------------
        // Éviter /api/api
        // -------------------------------------------------

        if (
            lien.startsWith("/api/")
        ) {

            const baseSansApi =
                baseUrl.replace(
                    /\/api$/,
                    ""
                );

            return (
                baseSansApi +
                lien
            );

        }


        // -------------------------------------------------
        // Lien commençant par /
        // -------------------------------------------------

        if (
            lien.startsWith("/")
        ) {

            return (
                baseUrl +
                lien
            );

        }


        return (
            baseUrl +
            "/" +
            lien
        );

    };


    // =====================================================
    // TÉLÉCHARGER / OUVRIR LE REÇU
    // =====================================================

    const telechargerRecu = (lien) => {

        if (!lien) {

            console.log(
                "Aucun lien de reçu disponible."
            );

            return;

        }


        const urlRecu =
            construireUrlRecu(lien);


        console.log(
            "Lien enregistré dans notification :",
            lien
        );


        console.log(
            "URL finale du reçu :",
            urlRecu
        );


        if (!urlRecu) {

            alert(
                "Le lien du reçu est indisponible."
            );

            return;

        }


        // -------------------------------------------------
        // Ouvre directement la route backend :
        //
        // http://localhost:8081/api/recu/5
        //
        // Le backend retourne ensuite les données
        // du reçu.
        // -------------------------------------------------

        window.open(
            urlRecu,
            "_blank",
            "noopener,noreferrer"
        );

    };


    // =====================================================
    // OUVRIR NOTIFICATION
    // =====================================================

    const ouvrirNotification =
        async (n) => {


            // =================================================
            // MARQUER COMME LU
            // =================================================

            if (
                Number(n.lu) === 0
            ) {

                await marquerCommeLu(
                    n.id_notification
                );

            }


            const titre =
                normaliserTexte(
                    n.titre
                );


            const message =
                normaliserTexte(
                    n.message
                );


            const type =
                normaliserTexte(
                    n.type
                );


            // =================================================
            // AVIS
            // =================================================

            if (

                titre.includes("avis")
                ||
                message.includes("avis")

            ) {

                navigate(
                    "/avis-public"
                );

                return;

            }


            // =================================================
            // PAIEMENT ÉCHOUÉ / NON VALIDÉ
            // =================================================

            if (

                estNotificationPaiement(n)
                &&
                paiementEstEchoue(n)

            ) {

                console.log(
                    "Paiement échoué / non validé :",
                    n
                );


                navigate(
                    "/mes-reservations"
                );


                return;

            }


            // =================================================
            // PAIEMENT VALIDÉ
            // =================================================

            if (

                estNotificationPaiement(n)
                &&
                paiementEstValide(n)

            ) {

                console.log(
                    "Paiement validé :",
                    n
                );


                // Le bouton "Télécharger reçu"
                // gère directement le reçu.

                return;

            }


            // =================================================
            // RÉSERVATION ANNULÉE
            // =================================================

            if (

                (
                    type === "reservation"
                    ||
                    titre.includes("reservation")
                    ||
                    message.includes("reservation")
                )

                &&

                (
                    titre.includes("annul")
                    ||
                    message.includes("annul")
                )

            ) {

                navigate(
                    "/mes-reservations"
                );

                return;

            }


            // =================================================
            // RÉSERVATION REJETÉE
            // =================================================

            if (

                (
                    type === "reservation"
                    ||
                    titre.includes("reservation")
                    ||
                    message.includes("reservation")
                )

                &&

                (
                    titre.includes("rejet")
                    ||
                    message.includes("rejet")
                )

            ) {

                navigate(
                    "/mes-reservations"
                );

                return;

            }


            // =================================================
            // RÉSERVATION CONFIRMÉE
            // =================================================

            if (

                (
                    type === "reservation"
                    ||
                    titre.includes("reservation")
                    ||
                    message.includes("reservation")
                )

                &&

                (
                    titre.includes("confirm")
                    ||
                    message.includes("confirm")
                )

            ) {

                console.log(
                    "Réservation confirmée :",
                    n
                );


                if (n.lien) {

                    navigate(
                        n.lien
                    );

                }
                else {

                    alert(
                        "Le lien de paiement n'est pas disponible pour cette réservation."
                    );

                }


                return;

            }

        };


    // =====================================================
    // ICONES
    // =====================================================

    const getIcone = (n) => {


        // =================================================
        // PAIEMENT
        // =================================================

        if (
            estNotificationPaiement(n)
        ) {


            if (
                paiementEstEchoue(n)
            ) {

                return (
                    <FaTimesCircle
                        className="danger"
                    />
                );

            }


            if (
                paiementEstValide(n)
            ) {

                return (
                    <FaCheckCircle
                        className="success"
                    />
                );

            }


            return (
                <FaBell />
            );

        }


        // =================================================
        // AUTRES
        // =================================================

        const titre =
            normaliserTexte(
                n.titre
            );


        if (

            titre.includes("rejet")
            ||
            titre.includes("annul")

        ) {

            return (
                <FaTimesCircle
                    className="danger"
                />
            );

        }


        if (
            titre.includes("expiration")
        ) {

            return (
                <FaCalendarTimes
                    className="warning"
                />
            );

        }


        if (
            titre.includes("avis")
        ) {

            return (
                <FaStar
                    className="star"
                />
            );

        }


        return (
            <FaBell />
        );

    };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="notifications-client">


            <h1>
                Mes notifications
            </h1>


            {
                notifications.length === 0

                    ?

                    (
                        <p className="empty">
                            Aucune notification
                        </p>
                    )

                    :

                    (

                        (
                            afficherToutes
                                ?
                                notifications
                                :
                                notifications.slice(0, 5)
                        )

                            .map(
                                n => (

                                    <div
                                        key={
                                            n.id_notification
                                        }

                                        className={
                                            Number(n.lu) === 0
                                                ?
                                                "notification-card unread"
                                                :
                                                "notification-card"
                                        }

                                        onClick={() =>
                                            ouvrirNotification(n)
                                        }
                                    >


                                        {/* =================================
                                            SUPPRIMER
                                        ================================= */}

                                        <button
                                            className="delete-notification-btn"

                                            onClick={(e) => {

                                                e.stopPropagation();

                                                supprimerNotification(
                                                    n.id_notification
                                                );

                                            }}
                                        >
                                            🗑
                                        </button>


                                        {/* =================================
                                            ICONE
                                        ================================= */}

                                        <div className="notification-icon">

                                            {
                                                getIcone(n)
                                            }

                                        </div>


                                        {/* =================================
                                            CONTENU
                                        ================================= */}

                                        <div className="notification-body">


                                            <h3>
                                                {
                                                    n.titre
                                                }
                                            </h3>


                                            <p>
                                                {
                                                    n.message
                                                }
                                            </p>


                                            <small>

                                                {
                                                    new Date(
                                                        n.date_notification
                                                    )
                                                        .toLocaleString(
                                                            "fr-FR"
                                                        )
                                                }

                                            </small>


                                            {/* =================================
                                                BOUTON REÇU
                                            ================================= */}

                                            {
                                                estNotificationPaiement(n)
                                                &&
                                                paiementEstValide(n)
                                                &&
                                                n.lien
                                                &&

                                                (
                                                    <button
                                                        type="button"

                                                        className="download-btn"

                                                        onClick={(e) => {

                                                            e.stopPropagation();

                                                            telechargerRecu(
                                                                n.lien
                                                            );

                                                        }}
                                                    >

                                                        <FaFileDownload />

                                                        Télécharger reçu

                                                    </button>
                                                )
                                            }


                                        </div>

                                    </div>

                                )
                            )

                    )

            }


            {/* =====================================================
                AFFICHER PLUS
            ===================================================== */}

            {
                notifications.length > 5

                &&

                (
                    <button
                        className="btn-afficher-notifications"

                        onClick={() =>
                            setAfficherToutes(
                                !afficherToutes
                            )
                        }
                    >

                        {
                            afficherToutes
                                ?
                                "Afficher seulement les récentes"
                                :
                                "Afficher les notifications précédentes"
                        }

                    </button>
                )
            }


        </div>

    );

}


export default NotificationsClient;