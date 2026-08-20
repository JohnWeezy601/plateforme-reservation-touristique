import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

import {
    FaCreditCard,
    FaUpload,
    FaCheckCircle,
    FaArrowLeft,
    FaHome,
    FaListAlt
} from "react-icons/fa";

import "./PaiementPublic.css";

// Logos Mobile Money
import orangeMoney from "../assets/paiement/orange-money.png";
import mvola from "../assets/paiement/mvola.png";
import airtelMoney from "../assets/paiement/airtel-money.png";


function PaiementPublic() {

    const { id_reservation } = useParams();

    const navigate = useNavigate();

    console.log(
        "ID RESERVATION PAIEMENT :",
        id_reservation
    );


    const [reservation, setReservation] = useState(null);

    const [preuve, setPreuve] = useState(null);

    // NOUVEAU : état du paiement réussi
    const [paiementSucces, setPaiementSucces] = useState(false);

    const [form, setForm] = useState({

        montant: "",

        mode_paiement: "Carte bancaire",

        // Mobile Money
        operateur: "",
        numero_destinataire: "",
        nom_destinataire: "",

        // Virement
        banque: "",
        compte: "",
        nom_compte: ""

    });


    // =================================
    // Charger réservation
    // =================================

    useEffect(() => {

        const chargerReservation = async () => {

            try {

                const res = await api.get(
                    `/reservations/${id_reservation}`
                );

                setReservation(res.data);

                setForm(prev => ({
                    ...prev,
                    montant: res.data.montant_total
                }));

            }

            catch (error) {

                console.log(
                    "Erreur chargement réservation :",
                    error
                );

            }

        };

        chargerReservation();

    }, [id_reservation]);


    // =================================
    // Modifier champs formulaire
    // =================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // =================================
    // Choisir opérateur Mobile Money
    // =================================

    const choisirOperateur = (operateur) => {

        setForm({
            ...form,

            operateur: operateur,

            numero_destinataire: "",

            nom_destinataire: ""

        });

    };


    // =================================
    // Envoyer paiement
    // =================================

    const envoyerPaiement = async (e) => {

        e.preventDefault();

        try {

            const data = new FormData();


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


            // -----------------------------
            // Mobile Money
            // -----------------------------

            if (form.mode_paiement === "Mobile Money") {

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


            // -----------------------------
            // Virement
            // -----------------------------

            if (form.mode_paiement === "Virement") {

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


            // -----------------------------
            // Preuve paiement
            // -----------------------------

            if (preuve) {

                data.append(
                    "preuve",
                    preuve
                );

            }


            // -----------------------------
            // ENVOI API
            // -----------------------------

            await api.post(
                "/paiements",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );


            // =================================
            // PAIEMENT RÉUSSI
            // =================================

            setPaiementSucces(true);


        }

        catch (error) {

            console.log(
                "Erreur paiement :",
                error
            );

            alert(
                "Erreur lors du paiement"
            );

        }

    };


    // =================================
    // AFFICHAGE SUCCÈS
    // =================================

    if (paiementSucces) {

        return (

            <div className="paiement-public-page">

                <div className="paiement-success-page">

                    {/* Cercle vert */}

                    <div className="success-icon">

                        <FaCheckCircle />

                    </div>


                    {/* Titre */}

                    <h1>
                        Paiement effectué avec succès !
                    </h1>


                    {/* Message */}

                    <p className="success-message">

                        Votre paiement a bien été envoyé.

                        <br />

                        Votre demande de paiement est maintenant
                        <strong> en attente de validation.</strong>

                    </p>


                    {/* Informations réservation */}

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
                                    {reservation.titre}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Montant
                                </span>

                                <strong className="success-price">

                                    {Number(form.montant).toLocaleString("fr-FR")} Ar

                                </strong>

                            </div>

                        </div>

                    )}


                    {/* Actions */}

                    <div className="success-actions">

                        <button
                            className="success-primary"
                            onClick={() =>
                                navigate("/mes-reservations")
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


                    <p className="success-footer">

                        ✓ Votre paiement a été enregistré avec succès.

                    </p>

                </div>

            </div>

        );

    }


    // =================================
    // AFFICHAGE FORMULAIRE
    // =================================

    return (

        <div className="paiement-public-page">

            <div className="paiement-box">

                <button
                    className="btn-retour"
                    onClick={() => navigate(-1)}
                    title="Retour à la réservation"
                >

                    <FaArrowLeft />

                </button>


                <h1>
                    💳 Effectuer votre paiement
                </h1>


                {/* =============================
                    RESUME RESERVATION
                ============================= */}

                {reservation && (

                    <div className="resume-reservation">

                        <h2>
                            Résumé réservation
                        </h2>


                        <p>

                            🎒 Offre :

                            <strong>
                                {reservation.titre}
                            </strong>

                        </p>


                        <p>

                            📍 Destination :

                            {reservation.destination}

                        </p>


                        <p>

                            💰 Montant :

                            <strong>

                                {Number(reservation.prix).toLocaleString("fr-FR")} Ar

                            </strong>

                        </p>

                    </div>

                )}


                <div className="formulaire-scroll">

                    <form onSubmit={envoyerPaiement}>

                        {/* =============================
                            MODE DE PAIEMENT
                        ============================= */}

                        <label>
                            Mode de paiement
                        </label>


                        <select
                            name="mode_paiement"
                            value={form.mode_paiement}
                            onChange={handleChange}
                        >

                            <option value="Carte bancaire">
                                Carte bancaire
                            </option>

                            <option value="Mobile Money">
                                Mobile Money
                            </option>

                            <option value="PayPal">
                                PayPal
                            </option>

                            <option value="Virement">
                                Virement
                            </option>

                        </select>


                        {/* =============================
                            MOBILE MONEY
                        ============================= */}

                        {form.mode_paiement === "Mobile Money" && (

                            <div className="info-paiement">

                                <h3>
                                    📱 Paiement Mobile Money
                                </h3>


                                <label>
                                    Choisir un opérateur
                                </label>


                                {!form.operateur && (

                                    <div className="operateurs-mobile">

                                        <div
                                            className="operateur-card"
                                            onClick={() =>
                                                choisirOperateur("Orange Money")
                                            }
                                        >

                                            <img
                                                src={orangeMoney}
                                                alt="Orange Money"
                                            />

                                            <span>
                                                Orange Money
                                            </span>

                                        </div>


                                        <div
                                            className="operateur-card"
                                            onClick={() =>
                                                choisirOperateur("MVola")
                                            }
                                        >

                                            <img
                                                src={mvola}
                                                alt="MVola"
                                            />

                                            <span>
                                                MVola
                                            </span>

                                        </div>


                                        <div
                                            className="operateur-card"
                                            onClick={() =>
                                                choisirOperateur("Airtel Money")
                                            }
                                        >

                                            <img
                                                src={airtelMoney}
                                                alt="Airtel Money"
                                            />

                                            <span>
                                                Airtel Money
                                            </span>

                                        </div>

                                    </div>

                                )}


                                {form.operateur && (

                                    <div className="operateur-info">

                                        <img
                                            src={
                                                form.operateur === "Orange Money"
                                                    ? orangeMoney
                                                    : form.operateur === "MVola"
                                                        ? mvola
                                                        : airtelMoney
                                            }
                                            alt={form.operateur}
                                            className="logo-operateur-selectionne"
                                        />


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
                                            value={form.numero_destinataire}
                                            onChange={handleChange}
                                        />


                                        <label>
                                            Nom du destinataire
                                        </label>


                                        <input
                                            type="text"
                                            name="nom_destinataire"
                                            placeholder="Nom du bénéficiaire"
                                            value={form.nom_destinataire}
                                            onChange={handleChange}
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


                        {/* =============================
                            VIREMENT BANCAIRE
                        ============================= */}

                        {form.mode_paiement === "Virement" && (

                            <div className="info-paiement">

                                <h3>
                                    🏦 Informations bancaires
                                </h3>


                                <label>
                                    Banque
                                </label>


                                <input
                                    type="text"
                                    name="banque"
                                    placeholder="Nom de la banque"
                                    value={form.banque}
                                    onChange={handleChange}
                                />


                                <label>
                                    Compte bancaire
                                </label>


                                <input
                                    type="text"
                                    name="compte"
                                    placeholder="Numéro du compte"
                                    value={form.compte}
                                    onChange={handleChange}
                                />


                                <label>
                                    Titulaire du compte
                                </label>


                                <input
                                    type="text"
                                    name="nom_compte"
                                    placeholder="Nom du titulaire"
                                    value={form.nom_compte}
                                    onChange={handleChange}
                                />

                            </div>

                        )}


                        {/* =============================
                            CARTE BANCAIRE
                        ============================= */}

                        {form.mode_paiement === "Carte bancaire" && (

                            <div className="info-paiement">

                                <h3>
                                    💳 Paiement carte bancaire
                                </h3>

                                <p>
                                    Paiement sécurisé par carte bancaire.
                                </p>

                                <p>
                                    <i>
                                        Mode simulation pour projet académique.
                                    </i>
                                </p>

                            </div>

                        )}


                        {/* =============================
                            PAYPAL
                        ============================= */}

                        {form.mode_paiement === "PayPal" && (

                            <div className="info-paiement">

                                <h3>
                                    🅿️ Paiement PayPal
                                </h3>

                                <p>
                                    Compte PayPal :
                                </p>

                                <p>
                                    plateforme.touristique@email.com
                                </p>

                            </div>

                        )}


                        {/* =============================
                            MONTANT
                        ============================= */}

                        <label>
                            Montant payé
                        </label>


                        <input
                            type="number"
                            name="montant"
                            value={form.montant}
                            onChange={handleChange}
                            required
                        />


                        {/* =============================
                            PREUVE
                        ============================= */}

                        <label>
                            Preuve de paiement
                        </label>


                        <div className="upload-paiement">

                            <FaUpload />

                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                    setPreuve(e.target.files[0])
                                }
                            />

                        </div>


                        {preuve && (

                            <div className="preuve-selectionnee">

                                <div className="preuve-header">

                                    <FaCheckCircle />

                                    <span>
                                        Preuve sélectionnée : {preuve.name}
                                    </span>

                                </div>


                                {preuve.type.startsWith("image/") && (

                                    <div className="preuve-preview">

                                        <img
                                            src={URL.createObjectURL(preuve)}
                                            alt="Aperçu de la preuve de paiement"
                                        />

                                    </div>

                                )}

                            </div>

                        )}


                        {/* =============================
                            BOUTON
                        ============================= */}

                        <button type="submit">

                            <FaCreditCard />

                            Envoyer le paiement

                        </button>


                    </form>

                </div>

            </div>

        </div>

    );

}


export default PaiementPublic;