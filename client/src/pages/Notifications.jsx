
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Notifications.css";

import {
    FaBell,
    FaCreditCard,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaTrash,
    FaEye
} from "react-icons/fa";


function Notifications() {

    const [notifications, setNotifications] = useState([]);

    const [menuOuvert, setMenuOuvert] = useState(null);

    const [afficherAnciens, setAfficherAnciens] = useState(false);

    const navigate = useNavigate();


    // ==========================
    // Utilisateur connecté
    // ==========================

    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur")
    );

    const idUtilisateur =
        utilisateur?.id_utilisateur;


    // ==========================
    // Charger notifications
    // ==========================

    const chargerNotifications = async () => {

        if (!idUtilisateur)
            return;

        try {

            const res = await api.get(
                `/notifications/utilisateur/${idUtilisateur}`
            );

            setNotifications(res.data);

        }
        catch (error) {

            console.log(
                "Erreur chargement notifications",
                error
            );

        }

    };


    // ==========================
    // Marquer comme lu
    // ==========================

    const marquerCommeLu = async (id) => {

        try {

            await api.put(
                `/notifications/lu/${id}`
            );

            setNotifications(prev =>

                prev.map(notification =>

                    notification.id_notification === id

                        ?

                        {
                            ...notification,
                            lu: 1
                        }

                        :

                        notification

                )

            );

        }
        catch (error) {

            console.log(
                "Erreur marquer comme lue",
                error
            );

        }

    };


    // ==========================
    // Supprimer notification
    // ==========================

    const supprimerNotification = async (id) => {

        const confirmation =
            window.confirm(
                "Supprimer cette notification ?"
            );

        if (!confirmation)
            return;

        try {

            await api.delete(
                `/notifications/${id}`
            );

            setNotifications(prev =>

                prev.filter(
                    notification =>
                        notification.id_notification !== id
                )

            );

        }
        catch (error) {

            console.log(
                "Erreur suppression notification",
                error
            );

        }

    };


    // ==========================
    // Actualisation automatique
    // ==========================

    useEffect(() => {

        if (!idUtilisateur)
            return;

        chargerNotifications();

        const interval =
            setInterval(() => {

                chargerNotifications();

            }, 2000);

        return () => {

            clearInterval(interval);

        };

    }, [idUtilisateur]);


    // ==========================
    // Nombre affiché
    // ==========================

    const notificationsAffichees =
        afficherAnciens

            ?

            notifications

            :

            notifications.slice(0, 5);


    // ==========================
    // Icône notification
    // ==========================

    const getNotificationIcon = (notification) => {

        const type =
            String(notification.type || "")
                .toLowerCase();


        // Paiement

        if (type === "paiement") {

            const titre =
                String(notification.titre || "")
                    .toLowerCase();


            if (
                titre.includes("valid")
            ) {

                return (
                    <div className="notification-icon paiement valide">

                        <FaCheckCircle />

                    </div>
                );

            }


            if (
                titre.includes("non valid")
            ) {

                return (
                    <div className="notification-icon paiement non-valide">

                        <FaTimesCircle />

                    </div>
                );

            }


            if (
                titre.includes("échou")
                ||
                titre.includes("echec")
            ) {

                return (
                    <div className="notification-icon paiement echoue">

                        <FaTimesCircle />

                    </div>
                );

            }


            return (
                <div className="notification-icon paiement">

                    <FaCreditCard />

                </div>
            );

        }


        // Notification classique

        return (
            <div className="notification-icon">

                <FaBell />

            </div>
        );

    };


    // ==========================
    // Cliquer notification
    // ==========================

    const cliquerNotification = async (notification) => {

        // Marquer comme lue

        if (
            Number(notification.lu) === 0
        ) {

            await marquerCommeLu(
                notification.id_notification
            );

        }


        // Ouvrir / fermer le menu

        setMenuOuvert(

            menuOuvert === notification.id_notification

                ?

                null

                :

                notification.id_notification

        );


        // Si paiement admin

        if (
            String(notification.type || "")
                .toLowerCase()
                ===
            "paiement"
        ) {

            // On peut aller vers la page Paiements

            if (
                utilisateur?.role === "Administrateur"
                ||
                utilisateur?.id_role === 6
            ) {

                navigate("/paiements");

            }

        }

    };


    return (

        <div className="notifications-page">


            {/* ==========================
                EN-TÊTE
            ========================== */}

            <div className="notifications-header">

                <div>

                    <h1>

                        <FaBell />

                        Notifications

                    </h1>

                    <p>

                        Historique des notifications

                    </p>

                </div>


                {

                    notifications.filter(
                        notification =>
                            Number(notification.lu) === 0
                    ).length > 0

                    &&

                    <span className="notifications-count">

                        {
                            notifications.filter(
                                notification =>
                                    Number(notification.lu) === 0
                            ).length
                        }

                        &nbsp;

                        non lue(s)

                    </span>

                }

            </div>


            {/* ==========================
                LISTE
            ========================== */}

            {

                notificationsAffichees.length === 0

                    ?

                    (

                        <div className="notification-vide">

                            <FaBell />

                            <p>

                                Aucune notification.

                            </p>

                        </div>

                    )

                    :

                    (

                        <div className="notifications-list">

                            {

                                notificationsAffichees.map(
                                    (notification) => {

                                        const estPaiement =

                                            String(
                                                notification.type || ""
                                            )
                                                .toLowerCase()
                                            ===
                                            "paiement";


                                        return (

                                            <div

                                                key={
                                                    notification.id_notification
                                                }

                                                className={

                                                    notification.lu === 1

                                                        ?

                                                        `notification-card ${
                                                            estPaiement
                                                                ? "notification-paiement"
                                                                : ""
                                                        }`

                                                        :

                                                        `notification-card non-lue ${
                                                            estPaiement
                                                                ? "notification-paiement"
                                                                : ""
                                                        }`

                                                }

                                                onClick={() =>
                                                    cliquerNotification(
                                                        notification
                                                    )
                                                }

                                            >


                                                {/* ==========================
                                                    ICÔNE
                                                ========================== */}

                                                {
                                                    getNotificationIcon(
                                                        notification
                                                    )
                                                }


                                                {/* ==========================
                                                    CONTENU
                                                ========================== */}

                                                <div className="notification-content">


                                                    <div className="notification-title-row">


                                                        <h3>

                                                            {
                                                                notification.titre
                                                            }

                                                        </h3>


                                                        {

                                                            estPaiement

                                                            &&

                                                            <span className="badge-paiement">

                                                                Paiement

                                                            </span>

                                                        }


                                                    </div>


                                                    <p>

                                                        {
                                                            notification.message
                                                        }

                                                    </p>


                                                    <small>

                                                        {

                                                            new Date(
                                                                notification.date_notification
                                                            )
                                                                .toLocaleString(
                                                                    "fr-FR"
                                                                )

                                                        }


                                                        {

                                                            Number(
                                                                notification.lu
                                                            ) === 1

                                                            &&

                                                            <span className="notification-lue">

                                                                &nbsp; ✓ Lue

                                                            </span>

                                                        }

                                                    </small>


                                                    {/* ==========================
                                                        ACTIONS
                                                    ========================== */}

                                                    {

                                                        menuOuvert ===
                                                        notification.id_notification

                                                        &&

                                                        <div
                                                            className="notification-actions"
                                                        >

                                                            {

                                                                notification.lu === 0

                                                                &&

                                                                <span

                                                                    onClick={
                                                                        (e) => {

                                                                            e.stopPropagation();

                                                                            marquerCommeLu(
                                                                                notification.id_notification
                                                                            );

                                                                        }
                                                                    }

                                                                >

                                                                    <FaEye />

                                                                    Marquer comme lue

                                                                </span>

                                                            }


                                                            {

                                                                estPaiement

                                                                &&

                                                                <span

                                                                    onClick={
                                                                        (e) => {

                                                                            e.stopPropagation();

                                                                            navigate(
                                                                                "/paiements"
                                                                            );

                                                                        }
                                                                    }

                                                                >

                                                                    <FaCreditCard />

                                                                    Voir les paiements

                                                                </span>

                                                            }


                                                            <span

                                                                className="supprimer-text"

                                                                onClick={
                                                                    (e) => {

                                                                        e.stopPropagation();

                                                                        supprimerNotification(
                                                                            notification.id_notification
                                                                        );

                                                                    }
                                                                }

                                                            >

                                                                <FaTrash />

                                                                Supprimer

                                                            </span>

                                                        </div>

                                                    }


                                                </div>


                                            </div>

                                        );

                                    }

                                )

                            }

                        </div>

                    )

            }


            {/* ==========================
                ANCIENNES NOTIFICATIONS
            ========================== */}

            {

                notifications.length > 5

                &&

                <div className="notification-plus">

                    <span

                        onClick={() =>
                            setAfficherAnciens(
                                !afficherAnciens
                            )
                        }

                    >

                        {

                            afficherAnciens

                                ?

                                "Afficher les notifications récentes"

                                :

                                "Afficher les anciennes notifications"

                        }

                    </span>

                </div>

            }


        </div>

    );

}


export default Notifications;

