import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaCheckCircle,
    FaCalendarAlt,
    FaUsers,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaClipboardList,
    FaClock,
    FaHome,
    FaExclamationCircle
} from "react-icons/fa";

import api from "../api/api";

import "./ReservationPublic.css";


function ReservationPublic() {

    const { id } = useParams();

    const navigate = useNavigate();


    // =====================================================
    // ÉTATS
    // =====================================================

    const [offre, setOffre] = useState(null);

    const [nombrePersonnes, setNombrePersonnes] =
        useState(1);

    const [dateDebut, setDateDebut] =
        useState("");

    const [dateFin, setDateFin] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [reservationEffectuee, setReservationEffectuee] =
        useState(false);

    const [erreur, setErreur] =
        useState("");


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const getUtilisateurConnecte = () => {

        const userStorage =
            localStorage.getItem("utilisateur");


        if (!userStorage) {
            return null;
        }


        try {

            const data =
                JSON.parse(userStorage);


            return data?.utilisateur
                ? data.utilisateur
                : data;

        }
        catch (error) {

            console.log(
                "Erreur lecture utilisateur :",
                error
            );

            localStorage.removeItem(
                "utilisateur"
            );

            return null;
        }

    };


    // =====================================================
    // CHARGER L'OFFRE
    // =====================================================

    useEffect(() => {

        const chargerOffre = async () => {

            try {

                const response =
                    await api.get(
                        `/offres/${id}`
                    );


                console.log(
                    "Offre chargée :",
                    response.data
                );


                setOffre(
                    response.data
                );

            }
            catch (error) {

                console.log(
                    "Erreur chargement offre :",
                    error
                );

                setErreur(
                    "Impossible de charger cette offre."
                );

            }

        };


        chargerOffre();

    }, [id]);


    // =====================================================
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate(-1);

    };


    // =====================================================
    // RETOUR AUX OFFRES
    // =====================================================

    const retourAuxOffres = () => {

        navigate(
            "/offres-public"
        );

    };


    // =====================================================
    // MES RÉSERVATIONS
    // =====================================================

    const allerMesReservations = () => {

        navigate(
            "/mes-reservations"
        );

    };


    // =====================================================
    // FORMATAGE PRIX EURO
    // =====================================================

    const formaterPrix = (prix) => {

        return Number(
            prix || 0
        ).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    // =====================================================
    // DATE MINIMUM
    // =====================================================

    const obtenirDateAujourdhui = () => {

        const date =
            new Date();


        const annee =
            date.getFullYear();


        const mois =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const jour =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${annee}-${mois}-${jour}`;

    };


    // =====================================================
    // RÉSERVATION
    // =====================================================

    const reserver = async () => {

        const user =
            getUtilisateurConnecte();


        console.log(
            "Utilisateur avant réservation :",
            user
        );


        // =================================================
        // UTILISATEUR NON CONNECTÉ
        // =================================================

        if (!user) {

            const retourApresLogin =
                `/reservation-public/${id}`;


            sessionStorage.setItem(
                "retourApresLogin",
                retourApresLogin
            );


            navigate(
                "/login-client"
            );


            return;

        }


        // =================================================
        // VÉRIFICATION UTILISATEUR
        // =================================================

        if (!user.id_utilisateur) {

            alert(
                "Impossible d'identifier votre compte. Veuillez vous reconnecter."
            );

            return;

        }


        // =================================================
        // VÉRIFICATION DATES
        // =================================================

        if (
            !dateDebut ||
            !dateFin
        ) {

            alert(
                "Veuillez sélectionner les dates du séjour."
            );

            return;

        }


        // =================================================
        // VÉRIFICATION ORDRE DES DATES
        // =================================================

        if (
            new Date(dateFin) <=
            new Date(dateDebut)
        ) {

            alert(
                "La date de fin doit être postérieure à la date de début."
            );

            return;

        }


        // =================================================
        // VÉRIFICATION NOMBRE PERSONNES
        // =================================================

        const nombre =
            Number(
                nombrePersonnes
            );


        if (
            !nombre ||
            nombre < 1
        ) {

            alert(
                "Le nombre de personnes doit être supérieur à 0."
            );

            return;

        }


        if (
            offre.capacite &&
            nombre > Number(offre.capacite)
        ) {

            alert(
                `Le nombre maximum de personnes pour cette offre est de ${offre.capacite}.`
            );

            return;

        }


        try {

            setLoading(true);

            setErreur("");


            // =================================================
            // CALCUL MONTANT
            // =================================================
            //
            // Le prix est déjà en EURO.
            // Aucune conversion Ar -> Euro.
            //

            const montant =
                Number(offre.prix || 0) *
                nombre;


            // =================================================
            // CRÉER RÉSERVATION
            // =================================================

            const response =
                await api.post(
                    "/reservations",
                    {

                        id_utilisateur:
                            user.id_utilisateur,

                        id_offre:
                            offre.id_offre,

                        date_debut_sejour:
                            dateDebut,

                        date_fin_sejour:
                            dateFin,

                        nombre_personnes:
                            nombre,

                        montant_total:
                            montant

                    }
                );


            console.log(
                "Réponse réservation :",
                response.data
            );


            // La réservation reste en attente
            // de validation par l'administrateur.

            setReservationEffectuee(
                true
            );

        }
        catch (error) {

            console.log(
                "Erreur réservation :",
                error
            );


            const message =
                error.response?.data?.message;


            setErreur(
                message ||
                "Une erreur est survenue lors de l'enregistrement de votre réservation."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // CHARGEMENT OFFRE
    // =====================================================

    if (!offre) {

        return (

            <div className="reservation-page-loading">

                <div className="reservation-loading-card">

                    <div className="loading-spinner"></div>

                    <h2>
                        Chargement de l'offre...
                    </h2>

                    <p>
                        Veuillez patienter quelques instants.
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ÉCRAN APRÈS RÉSERVATION
    // =====================================================

    if (reservationEffectuee) {

        const montantReservation =
            Number(offre.prix || 0) *
            Number(nombrePersonnes || 1);


        return (

            <div className="reservation-public-page">

                <div className="reservation-success-container">


                    <div className="success-icon-container">

                        <FaCheckCircle />

                    </div>


                    <h1>
                        Réservation envoyée !
                    </h1>


                    <p className="success-introduction">

                        Votre demande de réservation a bien été
                        enregistrée.

                    </p>


                    <div className="pending-status">

                        <div className="pending-status-icon">

                            <FaClock />

                        </div>


                        <div>

                            <strong>
                                En attente de validation
                            </strong>

                            <p>

                                Votre réservation doit maintenant
                                être traitée par l'administrateur.

                            </p>

                        </div>

                    </div>


                    <div className="success-information">


                        <div className="success-info-item">

                            <FaClipboardList />

                            <div>

                                <span>
                                    Réservation
                                </span>

                                <strong>
                                    Demande enregistrée
                                </strong>

                            </div>

                        </div>


                        <div className="success-info-item">

                            <FaCalendarAlt />

                            <div>

                                <span>
                                    Séjour
                                </span>

                                <strong>

                                    {dateDebut}
                                    {" "}
                                    →
                                    {" "}
                                    {dateFin}

                                </strong>

                            </div>

                        </div>


                        <div className="success-info-item">

                            <FaUsers />

                            <div>

                                <span>
                                    Participants
                                </span>

                                <strong>

                                    {nombrePersonnes}
                                    {" "}
                                    personne
                                    {Number(nombrePersonnes) > 1 ? "s" : ""}

                                </strong>

                            </div>

                        </div>


                        <div className="success-info-item">

                            <FaMoneyBillWave />

                            <div>

                                <span>
                                    Montant
                                </span>

                                <strong>

                                    {formaterPrix(
                                        montantReservation
                                    )}
                                    {" "}€

                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="success-notice">

                        <FaExclamationCircle />

                        <p>

                            <strong>
                                Que se passe-t-il maintenant ?
                            </strong>

                            <br />

                            L'administrateur va examiner votre
                            demande. Vous recevrez une notification
                            dès que votre réservation sera
                            confirmée ou rejetée.

                            <br />

                            <span>
                                Le paiement sera disponible
                                uniquement après confirmation
                                de votre réservation.
                            </span>

                        </p>

                    </div>


                    <div className="success-actions">

                        <button
                            type="button"
                            className="success-primary-button"
                            onClick={allerMesReservations}
                        >

                            <FaClipboardList />

                            Voir mes réservations

                        </button>


                        <button
                            type="button"
                            className="success-secondary-button"
                            onClick={retourAuxOffres}
                        >

                            <FaHome />

                            Retour aux offres

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // =====================================================
    // FORMULAIRE DE RÉSERVATION
    // =====================================================

    const montantTotal =
        Number(offre.prix || 0) *
        Number(nombrePersonnes || 1);


    return (

        <div className="reservation-public-page">

            <div className="reservation-container">


                {/* =================================================
                    BOUTON RETOUR
                ================================================= */}

                <button
                    type="button"
                    className="reservation-back-button"
                    onClick={retour}
                >

                    <FaArrowLeft />

                    Retour

                </button>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="reservation-header">

                    <div>

                        <span className="reservation-eyebrow">
                            Réservation
                        </span>

                        <h1>
                            Réserver cette offre
                        </h1>

                        <p>
                            Complétez les informations ci-dessous
                            pour envoyer votre demande de réservation.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ERREUR
                ================================================= */}

                {erreur && (

                    <div className="reservation-error">

                        <FaExclamationCircle />

                        <span>
                            {erreur}
                        </span>

                        <button
                            type="button"
                            onClick={() => setErreur("")}
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =================================================
                    CONTENU
                ================================================= */}

                <div className="reservation-layout">


                    {/* =================================================
                        OFFRE
                    ================================================= */}

                    <div className="reservation-offer-card">


                        <div className="reservation-offer-image">

                            <img
                                src={
                                    offre.image
                                        ? `${import.meta.env.VITE_SERVER_URL}/uploads/${offre.image}`
                                        : "/image-default.jpg"
                                }
                                alt={
                                    offre.titre ||
                                    "Offre touristique"
                                }
                            />


                            <div className="offer-price-badge">

                                {formaterPrix(offre.prix)}

                                <span>
                                    € / personne
                                </span>

                            </div>

                        </div>


                        <div className="reservation-offer-content">

                            <span className="offer-label">
                                Offre sélectionnée
                            </span>


                            <h2>
                                {offre.titre}
                            </h2>


                            {offre.destination && (

                                <div className="offer-location">

                                    <FaMapMarkerAlt />

                                    <span>
                                        {offre.destination}
                                    </span>

                                </div>

                            )}


                            <p className="offer-description">

                                {offre.description ||
                                    "Découvrez cette offre touristique et profitez d'une expérience inoubliable."
                                }

                            </p>


                            <div className="offer-details">


                                <div className="offer-detail">

                                    <FaMoneyBillWave />

                                    <div>

                                        <span>
                                            Prix
                                        </span>

                                        <strong>

                                            {formaterPrix(
                                                offre.prix
                                            )}
                                            {" "}€

                                        </strong>

                                    </div>

                                </div>


                                {offre.capacite && (

                                    <div className="offer-detail">

                                        <FaUsers />

                                        <div>

                                            <span>
                                                Capacité
                                            </span>

                                            <strong>

                                                {offre.capacite}
                                                {" "}
                                                personnes

                                            </strong>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FORMULAIRE
                    ================================================= */}

                    <div className="reservation-form-card">

                        <div className="form-card-header">

                            <div className="form-header-icon">

                                <FaClipboardList />

                            </div>


                            <div>

                                <h2>
                                    Informations du séjour
                                </h2>

                                <p>
                                    Indiquez vos dates et le nombre
                                    de participants.
                                </p>

                            </div>

                        </div>


                        <div className="reservation-form">


                            {/* DATE DÉBUT */}

                            <div className="form-group">

                                <label htmlFor="dateDebut">

                                    <FaCalendarAlt />

                                    Date de début

                                </label>


                                <input
                                    id="dateDebut"
                                    type="date"
                                    min={
                                        obtenirDateAujourdhui()
                                    }
                                    value={dateDebut}
                                    onChange={(e) => {

                                        setDateDebut(
                                            e.target.value
                                        );

                                        if (
                                            dateFin &&
                                            e.target.value >= dateFin
                                        ) {

                                            setDateFin("");

                                        }

                                    }}
                                />

                            </div>


                            {/* DATE FIN */}

                            <div className="form-group">

                                <label htmlFor="dateFin">

                                    <FaCalendarAlt />

                                    Date de fin

                                </label>


                                <input
                                    id="dateFin"
                                    type="date"
                                    min={
                                        dateDebut ||
                                        obtenirDateAujourdhui()
                                    }
                                    value={dateFin}
                                    onChange={(e) =>
                                        setDateFin(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* NOMBRE PERSONNES */}

                            <div className="form-group">

                                <label htmlFor="nombrePersonnes">

                                    <FaUsers />

                                    Nombre de personnes

                                </label>


                                <input
                                    id="nombrePersonnes"
                                    type="number"
                                    min="1"
                                    max={
                                        offre.capacite ||
                                        undefined
                                    }
                                    value={nombrePersonnes}
                                    onChange={(e) =>
                                        setNombrePersonnes(
                                            e.target.value
                                        )
                                    }
                                />


                                {offre.capacite && (

                                    <small>

                                        Maximum :
                                        {" "}
                                        {offre.capacite}
                                        {" "}
                                        personnes

                                    </small>

                                )}

                            </div>


                            {/* =================================================
                                TOTAL
                            ================================================= */}

                            <div className="reservation-total">


                                <div>

                                    <span>
                                        Prix par personne
                                    </span>

                                    <strong>

                                        {formaterPrix(
                                            offre.prix
                                        )}
                                        {" "}€

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Nombre de personnes
                                    </span>

                                    <strong>
                                        × {nombrePersonnes}
                                    </strong>

                                </div>


                                <div className="total-final">

                                    <span>
                                        Total
                                    </span>

                                    <strong>

                                        {formaterPrix(
                                            montantTotal
                                        )}
                                        {" "}€

                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                INFORMATION
                            ================================================= */}

                            <div className="form-information">

                                <FaClock />

                                <p>

                                    Après l'envoi de votre
                                    réservation, celle-ci sera
                                    <strong>
                                        {" "}en attente de validation
                                    </strong>
                                    {" "}par l'administrateur.

                                </p>

                            </div>


                            {/* =================================================
                                BOUTON
                            ================================================= */}

                            <button
                                type="button"
                                className="reservation-submit-button"
                                onClick={reserver}
                                disabled={loading}
                            >

                                {loading ? (

                                    <>

                                        <span className="button-spinner"></span>

                                        Enregistrement...

                                    </>

                                ) : (

                                    <>

                                        <FaCheckCircle />

                                        Confirmer ma réservation

                                    </>

                                )}

                            </button>


                            <p className="form-security-text">

                                Votre demande sera enregistrée
                                de manière sécurisée.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default ReservationPublic;
