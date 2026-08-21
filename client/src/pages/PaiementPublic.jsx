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
    FaLock,
    FaUniversity,
    FaMobileAlt,
    FaReceipt,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUsers,
    FaShieldAlt,
    FaExchangeAlt,
    FaUser,
    FaFileInvoiceDollar
} from "react-icons/fa";

import "./PaiementPublic.css";

import orangeMoney from "../assets/paiement/orange-money.png";
import mvola from "../assets/paiement/mvola.png";
import airtelMoney from "../assets/paiement/airtel-money.png";


function PaiementPublic() {

    const { id_reservation } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // ÉTATS
    // ==========================================

    const [reservation, setReservation] =
        useState(null);

    const [preuve, setPreuve] =
        useState(null);

    const [paiementSucces, setPaiementSucces] =
        useState(false);

    const [envoiEnCours, setEnvoiEnCours] =
        useState(false);


    // ==========================================
    // FORMULAIRE
    // ==========================================

    const [form, setForm] = useState({

        montant: "",

        mode_paiement:
            "Carte bancaire",

        // Mobile Money
        operateur: "",
        numero_destinataire: "",
        nom_destinataire: "",

        // Virement
        banque: "",
        compte: "",
        nom_compte: "",
        iban_rib: ""

    });


    // ==========================================
    // CHARGER RÉSERVATION
    // ==========================================

    useEffect(() => {

        const chargerReservation =
            async () => {

                try {

                    const res =
                        await api.get(
                            `/reservations/${id_reservation}`
                        );


                    console.log(
                        "Réservation chargée :",
                        res.data
                    );


                    setReservation(
                        res.data
                    );


                    setForm(prev => ({

                        ...prev,

                        montant:
                            res.data.montant_total

                    }));

                }

                catch (error) {

                    console.error(
                        "Erreur chargement réservation :",
                        error
                    );

                }

            };


        if (id_reservation) {

            chargerReservation();

        }

    }, [id_reservation]);


    // ==========================================
    // CHANGEMENT CHAMP
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm(prev => ({

            ...prev,

            [name]: value

        }));

    };


    // ==========================================
    // CHANGER MODE
    // ==========================================

    const changerModePaiement =
        (mode) => {

            setForm(prev => ({

                ...prev,

                mode_paiement: mode,

                operateur: "",

                numero_destinataire: "",

                nom_destinataire: "",

                banque: "",

                compte: "",

                nom_compte: "",

                iban_rib: ""

            }));


            setPreuve(null);

        };


    // ==========================================
    // CHOISIR OPÉRATEUR
    // ==========================================

    const choisirOperateur =
        (operateur) => {

            setForm(prev => ({

                ...prev,

                operateur,

                numero_destinataire: "",

                nom_destinataire: ""

            }));

        };


    // ==========================================
    // FORMAT PRIX
    // ==========================================

    const formatPrix =
        (prix) => {

            return Number(
                prix || 0
            ).toLocaleString(
                "fr-FR"
            );

        };


    // ==========================================
    // PREUVE
    // ==========================================

    const handlePreuveChange =
        (e) => {

            const fichier =
                e.target.files?.[0];


            if (!fichier) {

                setPreuve(null);

                return;

            }


            const tailleMax =
                5 * 1024 * 1024;


            if (
                fichier.size >
                tailleMax
            ) {

                alert(
                    "Le fichier est trop volumineux. Taille maximale : 5 Mo."
                );


                e.target.value = "";

                setPreuve(null);

                return;

            }


            const typesAutorises = [

                "image/jpeg",

                "image/jpg",

                "image/png",

                "image/webp",

                "application/pdf"

            ];


            if (
                !typesAutorises.includes(
                    fichier.type
                )
            ) {

                alert(
                    "Format non autorisé. Utilisez JPG, JPEG, PNG, WEBP ou PDF."
                );


                e.target.value = "";

                setPreuve(null);

                return;

            }


            setPreuve(
                fichier
            );

        };


    // ==========================================
    // ENVOYER PAIEMENT
    // ==========================================

    const envoyerPaiement =
        async (e) => {

            e.preventDefault();


            // ==================================
            // MONTANT
            // ==================================

            if (
                !form.montant ||
                Number(form.montant) <= 0
            ) {

                alert(
                    "Le montant du paiement est invalide."
                );

                return;

            }


            // ==================================
            // MOBILE MONEY
            // ==================================

            if (
                form.mode_paiement ===
                "Mobile Money"
            ) {

                if (!form.operateur) {

                    alert(
                        "Veuillez choisir un opérateur Mobile Money."
                    );

                    return;

                }


                if (
                    !form.numero_destinataire.trim()
                ) {

                    alert(
                        "Veuillez saisir le numéro destinataire."
                    );

                    return;

                }


                if (
                    !form.nom_destinataire.trim()
                ) {

                    alert(
                        "Veuillez saisir le nom du bénéficiaire."
                    );

                    return;

                }

            }


            // ==================================
            // VIREMENT
            // ==================================

            if (
                form.mode_paiement ===
                "Virement"
            ) {

                if (
                    !form.nom_compte.trim()
                ) {

                    alert(
                        "Veuillez saisir le nom du titulaire du compte."
                    );

                    return;

                }


                if (
                    !form.banque.trim()
                ) {

                    alert(
                        "Veuillez saisir le nom de votre banque."
                    );

                    return;

                }


                if (
                    !form.compte.trim()
                ) {

                    alert(
                        "Veuillez saisir votre numéro de compte."
                    );

                    return;

                }


                if (
                    !form.iban_rib.trim()
                ) {

                    alert(
                        "Veuillez saisir votre IBAN ou RIB."
                    );

                    return;

                }

            }


            // ==================================
            // PREUVE
            // ==================================

            if (

                (
                    form.mode_paiement ===
                    "Mobile Money"

                    ||

                    form.mode_paiement ===
                    "Virement"
                )

                &&

                !preuve

            ) {

                alert(
                    "Veuillez joindre une preuve de paiement."
                );

                return;

            }


            setEnvoiEnCours(true);


            try {

                // ==================================
                // FORMDATA
                // ==================================

                const data =
                    new FormData();


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


                // ==================================
                // MOBILE MONEY
                // ==================================

                if (
                    form.mode_paiement ===
                    "Mobile Money"
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


                // ==================================
                // VIREMENT
                // ==================================

                if (
                    form.mode_paiement ===
                    "Virement"
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


                    data.append(
                        "iban_rib",
                        form.iban_rib
                    );

                }


                // ==================================
                // PREUVE
                // ==================================

                if (preuve) {

                    data.append(
                        "preuve",
                        preuve
                    );

                }


                // ==================================
                // DEBUG
                // ==================================

                console.log(
                    "================================"
                );

                console.log(
                    "PAIEMENT"
                );

                console.log(
                    "Réservation :",
                    id_reservation
                );

                console.log(
                    "Montant :",
                    form.montant
                );

                console.log(
                    "Mode :",
                    form.mode_paiement
                );

                console.log(
                    "Preuve :",
                    preuve
                );

                console.log(
                    "================================"
                );


                // ==================================
                // ENVOI
                // ==================================

                const response =
                    await api.post(
                        "/paiements",
                        data
                    );


                console.log(
                    "Paiement enregistré :",
                    response.data
                );


                setPaiementSucces(
                    true
                );

            }

            catch (error) {

                console.error(
                    "Erreur paiement :",
                    error
                );


                console.error(
                    "STATUT SERVEUR :",
                    error?.response?.status
                );


                console.error(
                    "RÉPONSE SERVEUR :",
                    error?.response?.data
                );


                alert(

                    error?.response?.data?.message

                    ||

                    "Erreur lors de l'envoi du paiement."

                );

            }

            finally {

                setEnvoiEnCours(
                    false
                );

            }

        };


    // ==========================================
    // PAGE SUCCÈS
    // ==========================================

    if (paiementSucces) {

        return (

            <div className="paiement-public-page">

                <div className="paiement-success-card">

                    <div className="success-icon">

                        <FaCheckCircle />

                    </div>


                    <h1>
                        Paiement envoyé avec succès !
                    </h1>


                    <p className="success-message">

                        Votre paiement a bien été enregistré.

                        <br />

                        Il est maintenant en attente de

                        <strong>
                            {" "}validation par notre équipe.
                        </strong>

                    </p>


                    {reservation && (

                        <div className="success-reservation">

                            <div className="success-info">

                                <span>
                                    Réservation
                                </span>

                                <strong>
                                    #{id_reservation}
                                </strong>

                            </div>


                            <div className="success-info">

                                <span>
                                    Offre
                                </span>

                                <strong>
                                    {reservation.titre}
                                </strong>

                            </div>


                            <div className="success-info">

                                <span>
                                    Mode de paiement
                                </span>

                                <strong>
                                    {form.mode_paiement}
                                </strong>

                            </div>


                            <div className="success-info">

                                <span>
                                    Montant
                                </span>

                                <strong className="success-price">

                                    {formatPrix(
                                        form.montant
                                    )} Ar

                                </strong>

                            </div>

                        </div>

                    )}


                    <div className="success-status">

                        <FaShieldAlt />

                        <div>

                            <strong>
                                Vérification en cours
                            </strong>

                            <span>

                                Vous recevrez une notification
                                dès que votre paiement sera validé.

                            </span>

                        </div>

                    </div>


                    <div className="success-actions">

                        <button
                            className="success-primary"
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
                            onClick={() =>
                                navigate("/")
                            }
                        >

                            <FaHome />

                            Accueil

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // FORMULAIRE
    // ==========================================

    return (

        <div className="paiement-public-page">

            <div className="paiement-container">


                {/* HEADER */}

                <div className="paiement-header">

                    <button
                        className="btn-retour"
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <FaArrowLeft />

                    </button>


                    <div>

                        <div className="header-title">

                            <FaLock />

                            <h1>
                                Paiement sécurisé
                            </h1>

                        </div>


                        <p>

                            Finalisez votre réservation
                            en toute sécurité.

                        </p>

                    </div>

                </div>


                <div className="paiement-layout">


                    {/* ==================================
                        FORMULAIRE
                    ================================== */}

                    <div className="paiement-form-card">

                        <form
                            onSubmit={
                                envoyerPaiement
                            }
                        >


                            {/* ÉTAPE 1 */}

                            <div className="section-title">

                                <div className="section-number">
                                    1
                                </div>

                                <div>

                                    <h2>
                                        Mode de paiement
                                    </h2>

                                    <p>
                                        Choisissez votre méthode de paiement
                                    </p>

                                </div>

                            </div>


                            <div className="payment-methods">


                                {/* CARTE */}

                                <button
                                    type="button"
                                    className={`payment-method ${
                                        form.mode_paiement ===
                                        "Carte bancaire"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        changerModePaiement(
                                            "Carte bancaire"
                                        )
                                    }
                                >

                                    <div className="method-icon">

                                        <FaCreditCard />

                                    </div>

                                    <div>

                                        <strong>
                                            Carte bancaire
                                        </strong>

                                        <span>
                                            Visa, Mastercard
                                        </span>

                                    </div>

                                    <div className="radio-indicator" />

                                </button>


                                {/* MOBILE MONEY */}

                                <button
                                    type="button"
                                    className={`payment-method ${
                                        form.mode_paiement ===
                                        "Mobile Money"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        changerModePaiement(
                                            "Mobile Money"
                                        )
                                    }
                                >

                                    <div className="method-icon mobile-icon">

                                        <FaMobileAlt />

                                    </div>

                                    <div>

                                        <strong>
                                            Mobile Money
                                        </strong>

                                        <span>
                                            Orange Money, MVola, Airtel
                                        </span>

                                    </div>

                                    <div className="radio-indicator" />

                                </button>


                                {/* VIREMENT */}

                                <button
                                    type="button"
                                    className={`payment-method ${
                                        form.mode_paiement ===
                                        "Virement"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        changerModePaiement(
                                            "Virement"
                                        )
                                    }
                                >

                                    <div className="method-icon bank-icon">

                                        <FaUniversity />

                                    </div>

                                    <div>

                                        <strong>
                                            Virement bancaire
                                        </strong>

                                        <span>
                                            Paiement par virement
                                        </span>

                                    </div>

                                    <div className="radio-indicator" />

                                </button>

                            </div>


                            {/* ==================================
                                CARTE
                            ================================== */}

                            {form.mode_paiement ===
                                "Carte bancaire" && (

                                <div className="payment-content">

                                    <div className="content-header">

                                        <div className="content-icon">

                                            <FaCreditCard />

                                        </div>

                                        <div>

                                            <h3>
                                                Paiement par carte bancaire
                                            </h3>

                                            <p>
                                                Mode simulation pour votre projet.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="card-simulation">

                                        <div className="card-top">

                                            <span>
                                                CARTE BANCAIRE
                                            </span>

                                            <FaCreditCard />

                                        </div>


                                        <div className="card-number">

                                            •••• •••• •••• 3456

                                        </div>


                                        <div className="card-bottom">

                                            <span>
                                                CARTE DE DÉMONSTRATION
                                            </span>

                                            <strong>
                                                VISA
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="simulation-info">

                                        <FaShieldAlt />

                                        <span>

                                            Aucun numéro de carte réel
                                            n'est demandé dans cette version.

                                        </span>

                                    </div>

                                </div>

                            )}


                            {/* ==================================
                                MOBILE MONEY
                            ================================== */}

                            {form.mode_paiement ===
                                "Mobile Money" && (

                                <div className="payment-content">

                                    <div className="content-header">

                                        <div className="content-icon">

                                            <FaMobileAlt />

                                        </div>

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

                                                <strong>
                                                    Orange Money
                                                </strong>

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

                                                <strong>
                                                    MVola
                                                </strong>

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

                                                <strong>
                                                    Airtel Money
                                                </strong>

                                            </button>

                                        </div>

                                    )}


                                    {form.operateur && (

                                        <div className="operateur-selection">

                                            <div className="operateur-selection-header">

                                                <img
                                                    src={
                                                        form.operateur ===
                                                        "Orange Money"
                                                            ? orangeMoney
                                                            : form.operateur ===
                                                              "MVola"
                                                                ? mvola
                                                                : airtelMoney
                                                    }
                                                    alt={
                                                        form.operateur
                                                    }
                                                />


                                                <div>

                                                    <strong>
                                                        {form.operateur}
                                                    </strong>

                                                    <span>
                                                        Opérateur sélectionné
                                                    </span>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        choisirOperateur("")
                                                    }
                                                >

                                                    Changer

                                                </button>

                                            </div>


                                            <div className="form-grid">

                                                <div className="form-group">

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
                                                        required
                                                    />

                                                </div>


                                                <div className="form-group">

                                                    <label>
                                                        Nom du bénéficiaire
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
                                                        required
                                                    />

                                                </div>

                                            </div>


                                            <div className="payment-instruction">

                                                <FaMobileAlt />

                                                <div>

                                                    <strong>
                                                        Après le paiement
                                                    </strong>

                                                    <span>

                                                        Conservez votre reçu
                                                        ou capture d'écran.
                                                        Vous devrez l'envoyer
                                                        comme preuve.

                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            )}


                            {/* ==================================
                                VIREMENT RÉEL
                            ================================== */}

                            {form.mode_paiement ===
                                "Virement" && (

                                <div className="payment-content">

                                    <div className="content-header">

                                        <div className="content-icon">

                                            <FaUniversity />

                                        </div>

                                        <div>

                                            <h3>
                                                Virement bancaire
                                            </h3>

                                            <p>
                                                Saisissez les informations
                                                du compte utilisé pour le virement.
                                            </p>

                                        </div>

                                    </div>


                                    {/* INFORMATIONS BÉNÉFICIAIRE */}

                                    <div className="bank-details">

                                        <div className="bank-detail">

                                            <span>
                                                Bénéficiaire
                                            </span>

                                            <strong>
                                                Plateforme Réservation Touristique
                                            </strong>

                                        </div>


                                        <div className="bank-detail">

                                            <span>
                                                Référence
                                            </span>

                                            <strong>
                                                RESERVATION #{id_reservation}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* FORMULAIRE PAYEUR */}

                                    <div className="transfer-form">

                                        <h4>

                                            <FaFileInvoiceDollar />

                                            Informations du virement

                                        </h4>


                                        <div className="form-grid">


                                            <div className="form-group">

                                                <label>
                                                    Nom du titulaire du compte *
                                                </label>

                                                <div className="input-icon">

                                                    <FaUser />

                                                    <input
                                                        type="text"
                                                        name="nom_compte"
                                                        placeholder="Nom et prénom"
                                                        value={
                                                            form.nom_compte
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    Banque *
                                                </label>

                                                <div className="input-icon">

                                                    <FaUniversity />

                                                    <input
                                                        type="text"
                                                        name="banque"
                                                        placeholder="Nom de votre banque"
                                                        value={
                                                            form.banque
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    Numéro de compte *
                                                </label>

                                                <input
                                                    type="text"
                                                    name="compte"
                                                    placeholder="Numéro de votre compte"
                                                    value={
                                                        form.compte
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    IBAN / RIB *
                                                </label>

                                                <input
                                                    type="text"
                                                    name="iban_rib"
                                                    placeholder="Votre IBAN ou RIB"
                                                    value={
                                                        form.iban_rib
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>

                                        </div>


                                        <div className="payment-instruction">

                                            <FaExchangeAlt />

                                            <div>

                                                <strong>
                                                    Après le virement
                                                </strong>

                                                <span>

                                                    Effectuez le virement
                                                    vers le compte de la
                                                    plateforme puis joignez
                                                    votre justificatif.

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* ==================================
                                MONTANT
                            ================================== */}

                            <div className="section-title section-margin">

                                <div className="section-number">
                                    2
                                </div>

                                <div>

                                    <h2>
                                        Montant du paiement
                                    </h2>

                                    <p>
                                        Vérifiez le montant avant de continuer.
                                    </p>

                                </div>

                            </div>


                            <div className="amount-box">

                                <span>
                                    Montant à payer
                                </span>

                                <strong>

                                    {formatPrix(
                                        form.montant
                                    )} Ar

                                </strong>

                            </div>


                            {/* ==================================
                                PREUVE
                            ================================== */}

                            {(
                                form.mode_paiement ===
                                "Mobile Money"

                                ||

                                form.mode_paiement ===
                                "Virement"

                            ) && (

                                <>

                                    <div className="section-title section-margin">

                                        <div className="section-number">
                                            3
                                        </div>

                                        <div>

                                            <h2>
                                                Preuve de paiement
                                            </h2>

                                            <p>

                                                Cette preuve est obligatoire
                                                pour ce mode de paiement.

                                            </p>

                                        </div>

                                    </div>


                                    <label className="preuve-label">

                                        <FaReceipt />

                                        Justificatif de paiement

                                        <span>
                                            *
                                        </span>

                                    </label>


                                    <div className="upload-paiement">

                                        <FaUpload />

                                        <div>

                                            <strong>
                                                Ajouter votre preuve
                                            </strong>

                                            <span>
                                                Image ou PDF — 5 Mo maximum
                                            </span>

                                        </div>


                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                            required
                                            onChange={
                                                handlePreuveChange
                                            }
                                        />

                                    </div>


                                    {preuve && (

                                        <div className="preuve-selectionnee">

                                            <div className="preuve-header">

                                                <FaCheckCircle />

                                                <div>

                                                    <strong>
                                                        Preuve sélectionnée
                                                    </strong>

                                                    <span>
                                                        {preuve.name}
                                                    </span>

                                                </div>

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
                                                        alt="Aperçu de la preuve de paiement"
                                                    />

                                                </div>

                                            )}

                                        </div>

                                    )}

                                </>

                            )}


                            {/* ==================================
                                BOUTON
                            ================================== */}

                            <button
                                type="submit"
                                className="btn-payer"
                                disabled={
                                    envoiEnCours
                                }
                            >

                                {envoiEnCours ? (

                                    <>
                                        Envoi en cours...
                                    </>

                                ) : (

                                    <>

                                        <FaLock />

                                        Envoyer le paiement

                                    </>

                                )}

                            </button>


                            <div className="secure-footer">

                                <FaShieldAlt />

                                <span>

                                    Vos informations sont traitées
                                    de manière sécurisée.

                                </span>

                            </div>

                        </form>

                    </div>


                    {/* ==================================
                        RÉSUMÉ
                    ================================== */}

                    <aside className="reservation-summary">

                        <div className="summary-header">

                            <h2>
                                Votre réservation
                            </h2>

                            <span>
                                #{id_reservation}
                            </span>

                        </div>


                        {reservation && (

                            <>

                                <div className="reservation-image">

                                    {reservation.image ? (

                                        <img
                                            src={
                                                reservation.image
                                            }
                                            alt={
                                                reservation.titre
                                            }
                                        />

                                    ) : (

                                        <div className="image-placeholder">

                                            <FaReceipt />

                                        </div>

                                    )}

                                </div>


                                <div className="summary-offer">

                                    <h3>
                                        {reservation.titre}
                                    </h3>


                                    <div>

                                        <FaMapMarkerAlt />

                                        <span>
                                            {reservation.destination}
                                        </span>

                                    </div>

                                </div>


                                <div className="summary-details">

                                    <div>

                                        <FaCalendarAlt />

                                        <span>

                                            {reservation.date_debut_sejour}

                                            {" → "}

                                            {reservation.date_fin_sejour}

                                        </span>

                                    </div>


                                    <div>

                                        <FaUsers />

                                        <span>

                                            {
                                                reservation.nombre_personnes
                                            }

                                            {" personne"}

                                            {Number(
                                                reservation.nombre_personnes
                                            ) > 1
                                                ? "s"
                                                : ""}

                                        </span>

                                    </div>

                                </div>


                                <div className="summary-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>

                                        {formatPrix(
                                            reservation.montant_total
                                        )} Ar

                                    </strong>

                                </div>

                            </>

                        )}


                        <div className="summary-security">

                            <FaLock />

                            <div>

                                <strong>
                                    Paiement sécurisé
                                </strong>

                                <span>

                                    Votre paiement sera vérifié
                                    avant confirmation.

                                </span>

                            </div>

                        </div>


                        <div className="summary-status">

                            <FaCheckCircle />

                            <span>

                                Validation manuelle par l'administration

                            </span>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    );

}


export default PaiementPublic;