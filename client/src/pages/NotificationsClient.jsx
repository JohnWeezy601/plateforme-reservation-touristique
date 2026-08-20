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


    const [notifications, setNotifications] =
        useState([]);


    const [afficherToutes, setAfficherToutes] =
        useState(false);


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
    // DÉTERMINER SI C'EST UNE NOTIFICATION DE PAIEMENT
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


        // -------------------------------------------------
        // Un paiement échoué ou non validé n'est jamais
        // considéré comme un paiement validé.
        // -------------------------------------------------

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

            titre.includes("paiement confirme")

            ||

            message.includes("paiement est confirme")

            ||

            message.includes("paiement confirme")

            ||

            message.includes("paiement valide")

            ||

            message.includes("paiement paye")

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


            // ---------------------------------------------
            // RÉSERVATION CONFIRMÉE
            // ---------------------------------------------

            if (

                titre.includes("confirm")

                ||

                message.includes("confirm")

            ) {

                return true;

            }


            // ---------------------------------------------
            // RÉSERVATION REJETÉE
            // ---------------------------------------------

            if (

                titre.includes("rejet")

                ||

                message.includes("rejet")

            ) {

                return true;

            }


            // ---------------------------------------------
            // RÉSERVATION ANNULÉE
            // ---------------------------------------------

            if (

                titre.includes("annul")

                ||

                message.includes("annul")

            ) {

                return true;

            }


            // ---------------------------------------------
            // AUTRES NOTIFICATIONS DE RÉSERVATION
            // ---------------------------------------------

            return false;

        }


        // =================================================
        // AVIS ET AUTRES NOTIFICATIONS
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

            clearInterval(
                interval
            );


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

                                n.id_notification !==
                                id

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
    // OUVRIR LA PAGE DU REÇU
    // =====================================================

    const telechargerRecu = (lien) => {

        if (!lien) {

            console.log(
                "Aucun lien de reçu disponible."
            );

            alert(
                "Le lien du reçu est indisponible."
            );

            return;

        }


        console.log(
            "Lien du reçu reçu depuis la notification :",
            lien
        );


        let idPaiement = null;


        // =================================================
        // CAS 1
        // URL complète
        //
        // Exemple :
        // http://localhost:8081/api/recu/23
        // =================================================

        if (

            lien.startsWith("http://")

            ||

            lien.startsWith("https://")

        ) {

            try {

                const url =
                    new URL(lien);


                const morceaux =
                    url.pathname
                        .split("/")
                        .filter(Boolean);


                idPaiement =
                    morceaux[
                        morceaux.length - 1
                    ];

            }
            catch (error) {

                console.log(
                    "Erreur analyse URL du reçu :",
                    error
                );

            }

        }


        // =================================================
        // CAS 2
        // URL relative
        //
        // Exemple :
        // /api/recu/23
        // =================================================

        else {

            const morceaux =
                lien
                    .split("/")
                    .filter(Boolean);


            idPaiement =
                morceaux[
                    morceaux.length - 1
                ];

        }


        // =================================================
        // VÉRIFICATION
        // =================================================

        if (!idPaiement) {

            console.log(
                "Impossible de récupérer l'ID du paiement."
            );


            alert(
                "Impossible de récupérer l'identifiant du paiement."
            );


            return;

        }


        console.log(
            "ID paiement du reçu :",
            idPaiement
        );


        // =================================================
        // OUVRIR LA PAGE REACT DU REÇU
        // =================================================

        navigate(
            `/recu/${idPaiement}`
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


            // =================================================
            // NORMALISATION
            // =================================================

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


                // Le reçu est ouvert uniquement avec
                // le lien "Télécharger reçu".

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

    const getIcone =
        (n) => {


            // =================================================
            // PAIEMENT
            // =================================================

            if (
                estNotificationPaiement(n)
            ) {


                // ---------------------------------------------
                // PAIEMENT ÉCHOUÉ
                // ---------------------------------------------

                if (
                    paiementEstEchoue(n)
                ) {

                    return (

                        <FaTimesCircle
                            className="danger"
                        />

                    );

                }


                // ---------------------------------------------
                // PAIEMENT VALIDÉ
                // ---------------------------------------------

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
            // AUTRES NOTIFICATIONS
            // =================================================

            const titre =
                normaliserTexte(
                    n.titre
                );


            // =================================================
            // REJET / ANNULATION
            // =================================================

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


            // =================================================
            // EXPIRATION
            // =================================================

            if (
                titre.includes("expiration")
            ) {

                return (

                    <FaCalendarTimes
                        className="warning"
                    />

                );

            }


            // =================================================
            // AVIS
            // =================================================

            if (
                titre.includes("avis")
            ) {

                return (

                    <FaStar
                        className="star"
                    />

                );

            }


            // =================================================
            // PAR DÉFAUT
            // =================================================

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

                                notifications.slice(
                                    0,
                                    5
                                )

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
                                            ouvrirNotification(
                                                n
                                            )
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
                                                LIEN REÇU
                                                UNIQUEMENT PAIEMENT VALIDÉ
                                            ================================= */}

                                            {

                                                estNotificationPaiement(n)

                                                &&

                                                paiementEstValide(n)

                                                &&

                                                n.lien

                                                &&

                                                (

                                                    <span

                                                        className="download-recu-link"

                                                        role="button"

                                                        tabIndex={0}

                                                        onClick={(e) => {

                                                            e.stopPropagation();


                                                            telechargerRecu(
                                                                n.lien
                                                            );

                                                        }}

                                                        onKeyDown={(e) => {

                                                            if (
                                                                e.key === "Enter"
                                                                ||
                                                                e.key === " "
                                                            ) {

                                                                e.preventDefault();


                                                                e.stopPropagation();


                                                                telechargerRecu(
                                                                    n.lien
                                                                );

                                                            }

                                                        }}

                                                    >

                                                        <FaFileDownload />

                                                        Télécharger votre reçu

                                                    </span>

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