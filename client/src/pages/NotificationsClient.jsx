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
    // DÉTERMINER SI LE PAIEMENT EST ÉCHOUÉ / NON VALIDÉ
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

            titre.includes("non valide")

            ||

            message.includes("echou")

            ||

            message.includes("echec")

            ||

            message.includes("non valide")

            ||

            message.includes("non validee")

            ||

            message.includes("non valide")

        );

    };


    // =====================================================
    // DÉTERMINER SI LE PAIEMENT EST VALIDÉ
    // =====================================================

    const paiementEstValide = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);


        // -------------------------------------------------
        // IMPORTANT :
        // "non valide" ne doit JAMAIS être considéré
        // comme "valide".
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

            ||

            message.includes("paiement paye")

        );

    };


    // =====================================================
    // DÉTERMINER SI UNE NOTIFICATION DOIT ÊTRE AFFICHÉE
    // =====================================================

    const notificationDoitEtreAffichee = (n) => {

        const titre =
            normaliserTexte(n.titre);

        const message =
            normaliserTexte(n.message);

        const type =
            normaliserTexte(n.type);


        // =================================================
        // PAIEMENTS
        // =================================================

        if (
            estNotificationPaiement(n)
        ) {

            // -------------------------------------------------
            // Les paiements validés sont affichés
            // -------------------------------------------------

            if (
                paiementEstValide(n)
            ) {

                return true;

            }


            // -------------------------------------------------
            // Les paiements échoués / non validés sont affichés
            // afin que le client puisse aller dans
            // "Mes réservations".
            // -------------------------------------------------

            if (
                paiementEstEchoue(n)
            ) {

                return true;

            }


            // -------------------------------------------------
            // Autres notifications de paiement
            // -------------------------------------------------

            return true;

        }


        // =================================================
        // RESERVATIONS
        // =================================================

        if (

            type === "reservation"

            ||

            titre.includes("reservation")

            ||

            message.includes("reservation")

        ) {


            // ---------------------------------------------
            // RESERVATION CONFIRMEE PAR ADMIN
            // ---------------------------------------------

            if (

                titre.includes("confirm")

                ||

                message.includes("confirm")

            ) {

                return true;

            }


            // ---------------------------------------------
            // RESERVATION REJETEE PAR ADMIN
            // ---------------------------------------------

            if (

                titre.includes("rejet")

                ||

                message.includes("rejet")

            ) {

                return true;

            }


            // ---------------------------------------------
            // RESERVATION ANNULEE
            // ---------------------------------------------

            if (

                titre.includes("annul")

                ||

                message.includes("annul")

            ) {

                return true;

            }


            // ---------------------------------------------
            // TOUTE AUTRE NOTIFICATION DE RESERVATION
            //
            // Exemple :
            // Nouvelle réservation
            // Réservation en attente
            // Demande reçue
            //
            // NE PAS AFFICHER
            // ---------------------------------------------

            return false;

        }


        // =================================================
        // AVIS ET AUTRES NOTIFICATIONS ADMIN
        // =================================================

        return true;

    };


    // =====================================================
    // CHARGER NOTIFICATIONS
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
                JSON.stringify(
                    res.data,
                    null,
                    2
                )
            );


            // =================================================
            // FILTRER
            // =================================================

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
                "Notifications affichées au client :",
                JSON.stringify(
                    notificationsVisibles,
                    null,
                    2
                )
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


        // Mise à jour immédiate

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


        // Mise à jour base de données

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
    // TÉLÉCHARGER REÇU
    // =====================================================

    const telechargerRecu =
        (lien) => {

            if (!lien) {

                return;

            }


            const id =
                lien.split("/").pop();


            window.open(
                `/recu/${id}`,
                "_blank"
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

                titre.includes(
                    "avis"
                )

                ||

                message.includes(
                    "avis"
                )

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


                // -------------------------------------------------
                // Le clic sur la notification peut rester sans
                // redirection particulière.
                //
                // Le bouton "Télécharger reçu" est disponible
                // directement dans la notification.
                // -------------------------------------------------

                return;

            }


            // =================================================
            // RESERVATION ANNULEE
            // =================================================

            if (

                (

                    type === "reservation"

                    ||

                    titre.includes(
                        "reservation"
                    )

                    ||

                    message.includes(
                        "reservation"
                    )

                )

                &&

                (

                    titre.includes(
                        "annul"
                    )

                    ||

                    message.includes(
                        "annul"
                    )

                )

            ) {

                console.log(
                    "Réservation annulée :",
                    n
                );


                navigate(
                    "/mes-reservations"
                );


                return;

            }


            // =================================================
            // RESERVATION REJETEE
            // =================================================

            if (

                (

                    type === "reservation"

                    ||

                    titre.includes(
                        "reservation"
                    )

                    ||

                    message.includes(
                        "reservation"
                    )

                )

                &&

                (

                    titre.includes(
                        "rejet"
                    )

                    ||

                    message.includes(
                        "rejet"
                    )

                )

            ) {

                console.log(
                    "Réservation rejetée :",
                    n
                );


                navigate(
                    "/mes-reservations"
                );


                return;

            }


            // =================================================
            // RESERVATION CONFIRMEE
            // =================================================

            if (

                (

                    type === "reservation"

                    ||

                    titre.includes(
                        "reservation"
                    )

                    ||

                    message.includes(
                        "reservation"
                    )

                )

                &&

                (

                    titre.includes(
                        "confirm"
                    )

                    ||

                    message.includes(
                        "confirm"
                    )

                )

            ) {

                console.log(
                    "Réservation confirmée par admin :",
                    n
                );


                // -------------------------------------------------
                // SEULEMENT MAINTENANT le client peut aller
                // vers le paiement.
                // -------------------------------------------------

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


                // -------------------------------------------------
                // PAIEMENT ÉCHOUÉ
                // -------------------------------------------------

                if (
                    paiementEstEchoue(n)
                ) {

                    return (

                        <FaTimesCircle
                            className="danger"
                        />

                    );

                }


                // -------------------------------------------------
                // PAIEMENT VALIDÉ
                // -------------------------------------------------

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
            // REJET / ANNULATION
            // =================================================

            const titre =
                normaliserTexte(
                    n.titre
                );


            if (

                titre.includes(
                    "rejet"
                )

                ||

                titre.includes(
                    "annul"
                )

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

                titre.includes(
                    "expiration"
                )

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

                titre.includes(
                    "avis"
                )

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
                                                BOUTON REÇU
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