
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

import {
    FaCreditCard,
    FaUpload,
    FaCheckCircle,
    FaArrowLeft,
    FaHome,
    FaListAlt,
    FaMobileAlt,
    FaUniversity,
    FaPaypal,
    FaLock
} from "react-icons/fa";

import "./PaiementPublic.css";

// Logos Mobile Money
import orangeMoney from "../assets/paiement/orange-money.png";
import mvola from "../assets/paiement/mvola.png";
import airtelMoney from "../assets/paiement/airtel-money.png";


function PaiementPublic() {

    const { id_reservation } = useParams();

    const navigate = useNavigate();


    // =========================================================
    // ÉTATS
    // =========================================================

    const [reservation, setReservation] = useState(null);

    const [preuve, setPreuve] = useState(null);

    const [paiementSucces, setPaiementSucces] = useState(false);

    const [chargement, setChargement] = useState(true);

    const [erreur, setErreur] = useState("");


    const [form, setForm] = useState({

        montant: "",

        mode_paiement: "Carte bancaire",

        // =========================
        // CARTE BANCAIRE
        // =========================

        nom_titulaire: "",

        numero_carte: "",

        date_expiration: "",

        cvv: "",


        // =========================
        // MOBILE MONEY
        // =========================

        operateur: "",

        numero_destinataire: "",

        nom_destinataire: "",


        // =========================
        // VIREMENT
        // =========================

        banque: "",

        compte: "",

        nom_compte: ""

    });


    // =========================================================
    // CHARGER LA RÉSERVATION
    // =========================================================

    useEffect(() => {

        const chargerReservation = async () => {

            try {

                setChargement(true);

                setErreur("");


                const res = await api.get(
                    `/reservations/${id_reservation}`
                );


                console.log(
                    "Réservation paiement :",
                    res.data
                );


                setReservation(res.data);


                /*
                 * On utilise montant_total en priorité.
                 * Si montant_total n'existe pas,
                 * on utilise prix.
                 */

                const montantReservation =
                    res.data.montant_total ??
                    res.data.prix ??
                    "";


                setForm(prev => ({

                    ...prev,

                    montant: montantReservation

                }));

            }

            catch (error) {

                console.error(
                    "Erreur chargement réservation :",
                    error
                );


                setErreur(
                    "Impossible de charger les informations de la réservation."
                );

            }

            finally {

                setChargement(false);

            }

        };


        if (id_reservation) {

            chargerReservation();

        }

    }, [id_reservation]);


    // =========================================================
    // MODIFICATION FORMULAIRE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm(prev => ({

            ...prev,

            [name]: value

        }));


        setErreur("");

    };


    // =========================================================
    // CHANGER MODE PAIEMENT
    // =========================================================

    const changerModePaiement = (mode) => {

        setForm(prev => ({

            ...prev,

            mode_paiement: mode

        }));


        setErreur("");

    };


    // =========================================================
    // CHOISIR OPÉRATEUR
    // =========================================================

    const choisirOperateur = (operateur) => {

        setForm(prev => ({

            ...prev,

            operateur,

            numero_destinataire: "",

            nom_destinataire: ""

        }));


        setErreur("");

    };


    // =========================================================
    // OBTENIR LOGO OPÉRATEUR
    // =========================================================

    const getLogoOperateur = () => {

        if (form.operateur === "Orange Money") {

            return orangeMoney;

        }

        if (form.operateur === "MVola") {

            return mvola;

        }

        if (form.operateur === "Airtel Money") {

            return airtelMoney;

        }

        return null;

    };


    // =========================================================
    // FORMATER MONTANT
    // =========================================================

    const formaterMontant = (montant) => {

        if (
            montant === null ||
            montant === undefined ||
            montant === ""
        ) {

            return "0";

        }


        return Number(montant).toLocaleString(
            "fr-FR"
        );

    };


    // =========================================================
    // VALIDATION
    // =========================================================

    const validerFormulaire = () => {

        if (!form.montant || Number(form.montant) <= 0) {

            setErreur(
                "Veuillez indiquer un montant valide."
            );

            return false;

        }


        // =========================
        // CARTE BANCAIRE
        // =========================

        if (
            form.mode_paiement === "Carte bancaire"
        ) {

            if (!form.nom_titulaire.trim()) {

                setErreur(
                    "Veuillez saisir le nom du titulaire de la carte."
                );

                return false;

            }


            if (!form.numero_carte.trim()) {

                setErreur(
                    "Veuillez saisir le numéro de carte."
                );

                return false;

            }


            if (!form.date_expiration.trim()) {

                setErreur(
                    "Veuillez saisir la date d'expiration."
                );

                return false;

            }


            if (!form.cvv.trim()) {

                setErreur(
                    "Veuillez saisir le CVV."
                );

                return false;

            }

        }


        // =========================
        // MOBILE MONEY
        // =========================

        if (
            form.mode_paiement === "Mobile Money"
        ) {

            if (!form.operateur) {

                setErreur(
                    "Veuillez choisir un opérateur Mobile Money."
                );

                return false;

            }


            if (
                !form.numero_destinataire.trim()
            ) {

                setErreur(
                    "Veuillez saisir le numéro destinataire."
                );

                return false;

            }


            if (
                !form.nom_destinataire.trim()
            ) {

                setErreur(
                    "Veuillez saisir le nom du destinataire."
                );

                return false;

            }

        }


        // =========================
        // VIREMENT
        // =========================

        if (
            form.mode_paiement === "Virement"
        ) {

            if (!form.banque.trim()) {

                setErreur(
                    "Veuillez saisir le nom de la banque."
                );

                return false;

            }


            if (!form.compte.trim()) {

                setErreur(
                    "Veuillez saisir le numéro du compte."
                );

                return false;

            }


            if (!form.nom_compte.trim()) {

                setErreur(
                    "Veuillez saisir le titulaire du compte."
                );

                return false;

            }

        }


        // =========================
        // PREUVE
        // =========================

        if (!preuve) {

            setErreur(
                "Veuillez sélectionner une preuve de paiement."
            );

            return false;

        }


        return true;

    };


    // =========================================================
    // ENVOYER PAIEMENT
    // =========================================================

    const envoyerPaiement = async (e) => {

        e.preventDefault();


        setErreur("");


        if (!validerFormulaire()) {

            return;

        }


        try {

            const data = new FormData();


            // =========================
            // INFORMATIONS PRINCIPALES
            // =========================

            data.append(
                "id_reservation",
                id_reservation
            );


            data.append(
                "montant",
                form.montant
            );


            data.append(
                "mode_paiement",
                form.mode_paiement
            );


            data.append(
                "statut",
                "En attente"
            );


            // =========================
            // CARTE BANCAIRE
            // =========================

            if (
                form.mode_paiement === "Carte bancaire"
            ) {

                /*
                 * Ces données servent uniquement
                 * à la simulation académique.
                 *
                 * On ne les envoie pas au backend
                 * pour éviter de stocker des données
                 * bancaires sensibles.
                 */

            }


            // =========================
            // MOBILE MONEY
            // =========================

            if (
                form.mode_paiement === "Mobile Money"
            ) {

                data.append(
                    "operateur",
                    form.operateur
                );


                data.append(
                    "numero_destinataire",
                    form.numero_destinataire
                );


                data.append(
                    "nom_destinataire",
                    form.nom_destinataire
                );

            }


            // =========================
            // VIREMENT
            // =========================

            if (
                form.mode_paiement === "Virement"
            ) {

                data.append(
                    "banque",
                    form.banque
                );


                data.append(
                    "compte",
                    form.compte
                );


                data.append(
                    "nom_compte",
                    form.nom_compte
                );

            }


            // =========================
            // PREUVE
            // =========================

            data.append(
                "preuve",
                preuve
            );


            console.log(
                "Envoi paiement..."
            );


            // =========================
            // API
            // =========================

            await api.post(
                "/paiements",
                data,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );


            // =========================
            // SUCCÈS
            // =========================

            setPaiementSucces(true);

        }

        catch (error) {

            console.error(
                "Erreur paiement :",
                error
            );


            if (
                error.response?.data?.message
            ) {

                setErreur(
                    error.response.data.message
                );

            }

            else {

                setErreur(
                    "Une erreur est survenue lors de l'envoi du paiement."
                );

            }

        }

    };


    // =========================================================
    // CHARGEMENT
    // =========================================================

    if (chargement) {

        return (

            <div className="paiement-public-page">

                <div className="paiement-box paiement-loading">

                    <div className="paiement-loader"></div>

                    <h2>
                        Chargement de votre réservation...
                    </h2>

                </div>

            </div>

        );

    }


    // =========================================================
    // ERREUR CHARGEMENT
    // =========================================================

    if (
        erreur &&
        !reservation
    ) {

        return (

            <div className="paiement-public-page">

                <div className="paiement-box paiement-error">

                    <div className="paiement-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Impossible de continuer
                    </h2>

                    <p>
                        {erreur}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <FaArrowLeft />
                        Retour
                    </button>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAIEMENT RÉUSSI
    // =========================================================

    if (paiementSucces) {

        return (

            <div className="paiement-public-page">

                <div className="paiement-success-page">

                    <div className="success-icon">

                        <FaCheckCircle />

                    </div>


                    <h1>
                        Paiement envoyé avec succès !
                    </h1>


                    <p className="success-message">

                        Votre paiement a bien été envoyé.

                        <br />

                        Votre demande est maintenant
                        <strong>
                            {" "}en attente de validation.
                        </strong>

                    </p>


                    {reservation && (

                        <div className="success-reservation">

                            <div>

                                <span>
                                    Réservation
                                </span>

                                <strong>
                                    #{id_reservation}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Offre
                                </span>

                                <strong>
                                    {
                                        reservation.titre ||
                                        "Offre touristique"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Montant
                                </span>

                                <strong className="success-price">

                                    {
                                        formaterMontant(
                                            form.montant
                                        )
                                    } Ar

                                </strong>

                            </div>

                        </div>

                    )}


                    <div className="success-actions">

                        <button
                            className="success-primary"
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/mes-reservations"
                                )
                            }
                        >

                            <FaListAlt />

                            Mes réservations

                        </button>


                        <button
                            className="success-secondary"
                            type="button"
                            onClick={() =>
                                navigate("/")
                            }
                        >

                            <FaHome />

                            Accueil

                        </button>

                    </div>


                    <p className="success-footer">

                        ✓ Votre paiement a été enregistré avec succès.

                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // FORMULAIRE PRINCIPAL
    // =========================================================

    return (

        <div className="paiement-public-page">

            <div className="paiement-box">


                {/* =================================================
                    RETOUR
                ================================================= */}

                <button
                    className="btn-retour"
                    type="button"
                    onClick={() => navigate(-1)}
                    title="Retour à la réservation"
                >

                    <FaArrowLeft />

                </button>


                {/* =================================================
                    TITRE
                ================================================= */}

                <div className="paiement-title">

                    <div className="paiement-title-icon">

                        <FaCreditCard />

                    </div>

                    <div>

                        <h1>
                            Effectuer votre paiement
                        </h1>

                        <p>
                            Finalisez votre réservation
                            en toute sécurité.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    RÉSUMÉ
                ================================================= */}

                {reservation && (

                    <div className="resume-reservation">

                        <div className="resume-header">

                            <h2>
                                Résumé réservation
                            </h2>

                        </div>


                        <div className="resume-line">

                            <span>
                                🎒 Offre
                            </span>

                            <strong>
                                {
                                    reservation.titre ||
                                    "Offre touristique"
                                }
                            </strong>

                        </div>


                        <div className="resume-line">

                            <span>
                                📍 Destination
                            </span>

                            <strong>
                                {
                                    reservation.destination ||
                                    reservation.nom_destination ||
                                    "Non renseignée"
                                }
                            </strong>

                        </div>


                        <div className="resume-line resume-total">

                            <span>
                                💰 Montant
                            </span>

                            <strong>

                                {
                                    formaterMontant(
                                        form.montant
                                    )
                                } Ar

                            </strong>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ERREUR FORMULAIRE
                ================================================= */}

                {erreur && (

                    <div className="paiement-error-message">

                        ⚠️ {erreur}

                    </div>

                )}


                {/* =================================================
                    FORMULAIRE
                ================================================= */}

                <form
                    onSubmit={envoyerPaiement}
                    className="paiement-form"
                >


                    {/* =================================================
                        MODE DE PAIEMENT
                    ================================================= */}

                    <div className="mode-paiement-section">

                        <label className="section-label">
                            Mode de paiement
                        </label>


                        <div className="modes-paiement">


                            {/* CARTE */}

                            <button
                                type="button"
                                className={
                                    form.mode_paiement ===
                                    "Carte bancaire"
                                        ? "mode-paiement active"
                                        : "mode-paiement"
                                }
                                onClick={() =>
                                    changerModePaiement(
                                        "Carte bancaire"
                                    )
                                }
                            >

                                <FaCreditCard />

                                <span>
                                    Carte bancaire
                                </span>

                            </button>


                            {/* MOBILE MONEY */}

                            <button
                                type="button"
                                className={
                                    form.mode_paiement ===
                                    "Mobile Money"
                                        ? "mode-paiement active"
                                        : "mode-paiement"
                                }
                                onClick={() =>
                                    changerModePaiement(
                                        "Mobile Money"
                                    )
                                }
                            >

                                <FaMobileAlt />

                                <span>
                                    Mobile Money
                                </span>

                            </button>


                            {/* PAYPAL */}

                            <button
                                type="button"
                                className={
                                    form.mode_paiement ===
                                    "PayPal"
                                        ? "mode-paiement active"
                                        : "mode-paiement"
                                }
                                onClick={() =>
                                    changerModePaiement(
                                        "PayPal"
                                    )
                                }
                            >

                                <FaPaypal />

                                <span>
                                    PayPal
                                </span>

                            </button>


                            {/* VIREMENT */}

                            <button
                                type="button"
                                className={
                                    form.mode_paiement ===
                                    "Virement"
                                        ? "mode-paiement active"
                                        : "mode-paiement"
                                }
                                onClick={() =>
                                    changerModePaiement(
                                        "Virement"
                                    )
                                }
                            >

                                <FaUniversity />

                                <span>
                                    Virement
                                </span>

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        CARTE BANCAIRE
                    ================================================= */}

                    {form.mode_paiement ===
                        "Carte bancaire" && (

                        <div className="info-paiement carte-section">

                            <div className="payment-section-title">

                                <FaCreditCard />

                                <div>

                                    <h3>
                                        Paiement carte bancaire
                                    </h3>

                                    <p>
                                        Paiement sécurisé par carte bancaire.
                                    </p>

                                </div>

                            </div>


                            <div className="simulation-message">

                                <FaLock />

                                <span>
                                    Mode simulation pour projet académique.
                                    Aucune donnée bancaire réelle n'est traitée.
                                </span>

                            </div>


                            <label>
                                Nom du titulaire
                            </label>

                            <input
                                type="text"
                                name="nom_titulaire"
                                placeholder="Nom du titulaire de la carte"
                                value={
                                    form.nom_titulaire
                                }
                                onChange={
                                    handleChange
                                }
                                autoComplete="off"
                            />


                            <label>
                                Numéro de carte
                            </label>

                            <input
                                type="text"
                                name="numero_carte"
                                placeholder="0000 0000 0000 0000"
                                value={
                                    form.numero_carte
                                }
                                onChange={
                                    handleChange
                                }
                                maxLength={19}
                                inputMode="numeric"
                                autoComplete="off"
                            />


                            <div className="card-fields-row">

                                <div>

                                    <label>
                                        Date d'expiration
                                    </label>

                                    <input
                                        type="text"
                                        name="date_expiration"
                                        placeholder="MM/AA"
                                        value={
                                            form.date_expiration
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={5}
                                        autoComplete="off"
                                    />

                                </div>


                                <div>

                                    <label>
                                        CVV
                                    </label>

                                    <input
                                        type="password"
                                        name="cvv"
                                        placeholder="123"
                                        value={
                                            form.cvv
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={4}
                                        inputMode="numeric"
                                        autoComplete="off"
                                    />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        MOBILE MONEY
                    ================================================= */}

                    {form.mode_paiement ===
                        "Mobile Money" && (

                        <div className="info-paiement mobile-section">

                            <div className="payment-section-title">

                                <FaMobileAlt />

                                <div>

                                    <h3>
                                        Paiement Mobile Money
                                    </h3>

                                    <p>
                                        Sélectionnez votre opérateur.
                                    </p>

                                </div>

                            </div>


                            {!form.operateur && (

                                <div className="operateurs-mobile">


                                    <button
                                        type="button"
                                        className="operateur-card"
                                        onClick={() =>
                                            choisirOperateur(
                                                "Orange Money"
                                            )
                                        }
                                    >

                                        <img
                                            src={orangeMoney}
                                            alt="Orange Money"
                                        />

                                        <span>
                                            Orange Money
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className="operateur-card"
                                        onClick={() =>
                                            choisirOperateur(
                                                "MVola"
                                            )
                                        }
                                    >

                                        <img
                                            src={mvola}
                                            alt="MVola"
                                        />

                                        <span>
                                            MVola
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className="operateur-card"
                                        onClick={() =>
                                            choisirOperateur(
                                                "Airtel Money"
                                            )
                                        }
                                    >

                                        <img
                                            src={airtelMoney}
                                            alt="Airtel Money"
                                        />

                                        <span>
                                            Airtel Money
                                        </span>

                                    </button>

                                </div>

                            )}


                            {form.operateur && (

                                <div className="operateur-info">

                                    {getLogoOperateur() && (

                                        <img
                                            src={
                                                getLogoOperateur()
                                            }
                                            alt={
                                                form.operateur
                                            }
                                            className="logo-operateur-selectionne"
                                        />

                                    )}


                                    <h4>
                                        {form.operateur}
                                    </h4>


                                    <label>
                                        Numéro destinataire
                                    </label>

                                    <input
                                        type="text"
                                        name="numero_destinataire"
                                        placeholder="034 XX XXX XX"
                                        value={
                                            form.numero_destinataire
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        inputMode="tel"
                                    />


                                    <label>
                                        Nom du destinataire
                                    </label>

                                    <input
                                        type="text"
                                        name="nom_destinataire"
                                        placeholder="Nom du bénéficiaire"
                                        value={
                                            form.nom_destinataire
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />


                                    <button
                                        type="button"
                                        className="changer-operateur"
                                        onClick={() =>
                                            choisirOperateur("")
                                        }
                                    >

                                        Changer d'opérateur

                                    </button>

                                </div>

                            )}

                        </div>

                    )}


                    {/* =================================================
                        PAYPAL
                    ================================================= */}

                    {form.mode_paiement ===
                        "PayPal" && (

                        <div className="info-paiement paypal-section">

                            <div className="payment-section-title">

                                <FaPaypal />

                                <div>

                                    <h3>
                                        Paiement PayPal
                                    </h3>

                                    <p>
                                        Utilisez les informations
                                        PayPal indiquées ci-dessous.
                                    </p>

                                </div>

                            </div>


                            <div className="paypal-box">

                                <div className="paypal-icon">
                                    <FaPaypal />
                                </div>

                                <div>

                                    <span>
                                        Compte PayPal
                                    </span>

                                    <strong>
                                        plateforme.touristique@email.com
                                    </strong>

                                </div>

                            </div>


                            <p className="paypal-note">

                                Après avoir effectué le paiement,
                                veuillez joindre votre preuve de paiement.

                            </p>

                        </div>

                    )}


                    {/* =================================================
                        VIREMENT
                    ================================================= */}

                    {form.mode_paiement ===
                        "Virement" && (

                        <div className="info-paiement virement-section">

                            <div className="payment-section-title">

                                <FaUniversity />

                                <div>

                                    <h3>
                                        Virement bancaire
                                    </h3>

                                    <p>
                                        Effectuez le virement puis
                                        joignez votre justificatif.
                                    </p>

                                </div>

                            </div>


                            <label>
                                Banque
                            </label>

                            <input
                                type="text"
                                name="banque"
                                placeholder="Nom de la banque"
                                value={
                                    form.banque
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <label>
                                Compte bancaire
                            </label>

                            <input
                                type="text"
                                name="compte"
                                placeholder="Numéro du compte"
                                value={
                                    form.compte
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <label>
                                Titulaire du compte
                            </label>

                            <input
                                type="text"
                                name="nom_compte"
                                placeholder="Nom du titulaire"
                                value={
                                    form.nom_compte
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    )}


                    {/* =================================================
                        MONTANT
                    ================================================= */}

                    <div className="montant-section">

                        <label>
                            Montant payé
                        </label>

                        <div className="montant-input-wrapper">

                            <input
                                type="number"
                                name="montant"
                                value={
                                    form.montant
                                }
                                onChange={
                                    handleChange
                                }
                                min="1"
                                required
                            />

                            <span>
                                Ar
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        PREUVE
                    ================================================= */}

                    <div className="preuve-section">

                        <label>
                            Preuve de paiement
                        </label>


                        <div className="upload-paiement">

                            <FaUpload />

                            <div className="upload-text">

                                <strong>
                                    Sélectionner une preuve
                                </strong>

                                <span>
                                    JPG, PNG ou PDF
                                </span>

                            </div>


                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => {

                                    const fichier =
                                        e.target.files?.[0];

                                    setPreuve(
                                        fichier || null
                                    );

                                    setErreur("");

                                }}
                            />

                        </div>


                        {preuve && (

                            <div className="preuve-selectionnee">

                                <div className="preuve-header">

                                    <FaCheckCircle />

                                    <span>
                                        {preuve.name}
                                    </span>

                                </div>


                                {preuve.type.startsWith(
                                    "image/"
                                ) && (

                                    <div className="preuve-preview">

                                        <img
                                            src={
                                                URL.createObjectURL(
                                                    preuve
                                                )
                                            }
                                            alt="Aperçu de la preuve"
                                        />

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        BOUTON
                    ================================================= */}

                    <button
                        type="submit"
                        className="btn-envoyer-paiement"
                    >

                        {form.mode_paiement ===
                            "Mobile Money" ? (

                            <FaMobileAlt />

                        ) : form.mode_paiement ===
                            "Virement" ? (

                            <FaUniversity />

                        ) : form.mode_paiement ===
                            "PayPal" ? (

                            <FaPaypal />

                        ) : (

                            <FaCreditCard />

                        )}


                        Envoyer le paiement

                    </button>


                </form>

            </div>

        </div>

    );

}


export default PaiementPublic;
