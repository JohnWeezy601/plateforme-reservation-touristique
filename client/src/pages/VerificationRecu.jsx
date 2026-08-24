import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import api from "../api/api";

import "./VerificationRecu.css";


function VerificationRecu() {


    const { token } = useParams();


    const [verification, setVerification] = useState(null);

    const [chargement, setChargement] = useState(true);

    const [confirmationEnCours, setConfirmationEnCours] =
        useState(false);

    const [confirmationReussie, setConfirmationReussie] =
        useState(false);

    const [erreurConfirmation, setErreurConfirmation] =
        useState("");



    // =========================================
    // VERIFICATION DU RECU
    // =========================================

    useEffect(() => {


        const verifierRecu = async () => {

            try {

                const res = await api.get(
                    `/verification-recu/${token}`
                );


                console.log(
                    "Résultat vérification :",
                    res.data
                );


                setVerification(res.data);

            }
            catch (error) {

                console.log(
                    "Erreur vérification :",
                    error
                );


                if (error.response?.data) {

                    setVerification(
                        error.response.data
                    );

                }
                else {

                    setVerification({

                        valide: false,

                        utilise: false,

                        message:
                            "Impossible de vérifier ce reçu."

                    });

                }

            }
            finally {

                setChargement(false);

            }

        };


        verifierRecu();


    }, [token]);



    // =========================================
    // CONFIRMER L'ARRIVEE DU CLIENT
    // =========================================

    const confirmerArrivee = async () => {


        // =========================================
        // PROTECTION TOKEN
        // =========================================

        if (!token) {

            setErreurConfirmation(
                "Token de vérification manquant."
            );

            return;

        }


        // =========================================
        // EVITER DOUBLE CLIC
        // =========================================

        if (confirmationEnCours) {

            return;

        }


        // =========================================
        // CONFIRMATION UTILISATEUR
        // =========================================

        const confirmation =
            window.confirm(

                "Confirmer l'arrivée de ce client ?\n\n" +

                "Cette opération est définitive. " +

                "Le reçu sera marqué comme utilisé et " +

                "ne pourra plus être présenté une seconde fois."

            );


        if (!confirmation) {

            return;

        }


        setConfirmationEnCours(true);

        setErreurConfirmation("");


        try {


            // =========================================
            // APPEL BACKEND
            // =========================================

            const res = await api.post(

                `/verification-recu/${token}/utiliser`

            );


            console.log(
                "Confirmation arrivée :",
                res.data
            );


            // =========================================
            // CONFIRMATION REUSSIE
            // =========================================

            if (res.data?.succes === true) {


                setConfirmationReussie(true);


                /*
                IMPORTANT :

                On conserve les informations de la
                réservation et on change seulement
                l'état local du reçu.
                */

                setVerification({

                    ...verification,

                    valide: false,

                    utilise: true,

                    message:
                        res.data.message ||
                        "L'arrivée du client a été confirmée."

                });


                return;

            }


            // =========================================
            // REPONSE INATTENDUE
            // =========================================

            setErreurConfirmation(

                res.data?.message ||

                "La confirmation de l'arrivée a échoué."

            );


        }
        catch (error) {


            console.error(

                "Erreur confirmation arrivée :",

                error

            );


            const data =
                error.response?.data;


            // =========================================
            // RECU DEJA UTILISE
            // =========================================

            if (

                error.response?.status === 409 ||

                data?.utilise === true

            ) {


                setVerification({

                    ...verification,

                    valide: false,

                    utilise: true,

                    message:

                        data?.message ||

                        "Ce reçu a déjà été utilisé."

                });


                setConfirmationReussie(false);


                return;

            }


            // =========================================
            // AUTRE ERREUR
            // =========================================

            setErreurConfirmation(

                data?.message ||

                "Une erreur est survenue lors de la confirmation de l'arrivée."

            );

        }
        finally {

            setConfirmationEnCours(false);

        }

    };



    // =========================================
    // CHARGEMENT
    // =========================================

    if (chargement) {


        return (

            <div className="verification-page">

                <div className="verification-card chargement-verification">

                    <div className="spinner"></div>

                    <h2>
                        Vérification en cours...
                    </h2>

                    <p>
                        Vérification de l'authenticité du reçu.
                    </p>

                </div>

            </div>

        );

    }



    // =========================================
    // ARRIVEE CONFIRMEE
    // IMPORTANT :
    // CE BLOC DOIT ETRE AVANT
    // "RECU DEJA UTILISE"
    // =========================================

    if (confirmationReussie) {


        const reservation =
            verification?.reservation;


        return (

            <div className="verification-page">

                <div className="verification-card verification-valide">


                    {/* =========================================
                        ICONE
                    ========================================= */}

                    <div className="verification-icon">

                        ✅

                    </div>



                    {/* =========================================
                        TITRE
                    ========================================= */}

                    <h1>

                        Arrivée confirmée

                    </h1>


                    <p className="verification-message">

                        L'arrivée du client a été enregistrée
                        avec succès.

                    </p>


                    <div className="ligne-verification"></div>



                    {/* =========================================
                        INFORMATIONS
                    ========================================= */}

                    {reservation && (

                        <div className="verification-informations">


                            {/* RESERVATION */}

                            <div className="verification-row">

                                <span>
                                    Réservation
                                </span>

                                <strong>

                                    #{reservation.id_reservation}

                                </strong>

                            </div>



                            {/* CLIENT */}

                            <div className="verification-row">

                                <span>
                                    Client
                                </span>

                                <strong>

                                    {reservation.nom}{" "}

                                    {reservation.prenom}

                                </strong>

                            </div>



                            {/* OFFRE */}

                            <div className="verification-row">

                                <span>
                                    Offre
                                </span>

                                <strong>

                                    {reservation.titre}

                                </strong>

                            </div>



                            {/* DESTINATION */}

                            <div className="verification-row">

                                <span>
                                    Destination
                                </span>

                                <strong>

                                    {reservation.nom_destination}

                                </strong>

                            </div>



                            {/* PRESTATAIRE */}

                            <div className="verification-row">

                                <span>
                                    Prestataire
                                </span>

                                <strong>

                                    {reservation.nom_prestataire}

                                </strong>

                            </div>



                            {/* NOMBRE PERSONNES */}

                            <div className="verification-row">

                                <span>
                                    Nombre de personnes
                                </span>

                                <strong>

                                    {reservation.nombre_personnes}

                                </strong>

                            </div>



                            {/* DATE DEBUT */}

                            <div className="verification-row">

                                <span>
                                    Date début
                                </span>

                                <strong>

                                    {
                                        reservation.date_debut_sejour

                                            ?

                                            new Date(
                                                reservation.date_debut_sejour
                                            ).toLocaleDateString(
                                                "fr-FR"
                                            )

                                            :

                                            "-"
                                    }

                                </strong>

                            </div>



                            {/* DATE FIN */}

                            <div className="verification-row">

                                <span>
                                    Date fin
                                </span>

                                <strong>

                                    {
                                        reservation.date_fin_sejour

                                            ?

                                            new Date(
                                                reservation.date_fin_sejour
                                            ).toLocaleDateString(
                                                "fr-FR"
                                            )

                                            :

                                            "-"
                                    }

                                </strong>

                            </div>



                            {/* PAIEMENT */}

                            <div className="verification-row">

                                <span>
                                    Paiement
                                </span>

                                <strong className="paiement-confirme">

                                    ✅ PAYÉ

                                </strong>

                            </div>


                        </div>

                    )}



                    {/* =========================================
                        CONFIRMATION FINALE
                    ========================================= */}

                    <div className="confirmation-box">


                        <strong>

                            ✓ Arrivée enregistrée avec succès

                        </strong>


                        <p>

                            Le prestataire a confirmé
                            l'arrivée du client.

                        </p>


                        <p>

                            🔐 Le reçu est maintenant marqué
                            comme <strong>UTILISÉ</strong>.

                        </p>


                        <p>

                            Il ne pourra plus être utilisé
                            pour une nouvelle arrivée.

                        </p>


                    </div>



                    {/* =========================================
                        STATUT
                    ========================================= */}

                    <div className="confirmation-arrivee">


                        <h3>

                            🔒 Reçu sécurisé

                        </h3>


                        <p>

                            Cette réservation a été consommée
                            avec succès. Toute nouvelle
                            présentation de ce QR Code sera
                            automatiquement refusée.

                        </p>


                        <div className="verification-status-utilise">

                            ✓ REÇU UTILISÉ

                        </div>


                    </div>



                    {/* =========================================
                        FOOTER
                    ========================================= */}

                    <div className="verification-footer">

                        🌍 Plateforme Touristique

                    </div>


                </div>

            </div>

        );

    }



    // =========================================
    // RECU DEJA UTILISE
    // =========================================

    if (

        !verification?.valide &&

        verification?.utilise === true

    ) {


        return (

            <div className="verification-page">

                <div className="verification-card verification-utilise">


                    <div className="verification-icon">

                        ⚠️

                    </div>


                    <h1>

                        Reçu déjà utilisé

                    </h1>


                    <p className="verification-message">

                        {

                            verification?.message ||

                            "Ce reçu a déjà été présenté et validé précédemment."

                        }

                    </p>



                    <div className="confirmation-box">


                        <strong>

                            ⚠️ Attention

                        </strong>


                        <p>

                            Ce reçu a déjà été présenté
                            et validé précédemment.

                        </p>


                        <p>

                            Il ne peut pas être utilisé
                            une seconde fois.

                        </p>


                    </div>



                    <div className="verification-footer">

                        🌍 Plateforme Touristique

                    </div>


                </div>

            </div>

        );

    }



    // =========================================
    // RECU INVALIDE
    // =========================================

    if (!verification?.valide) {


        return (

            <div className="verification-page">

                <div className="verification-card verification-invalide">


                    <div className="verification-icon">

                        ❌

                    </div>


                    <h1>

                        Reçu non valide

                    </h1>


                    <p className="verification-message">

                        {

                            verification?.message ||

                            "Ce reçu ne peut pas être vérifié."

                        }

                    </p>


                    <div className="verification-footer">

                        🌍 Plateforme Touristique

                    </div>


                </div>

            </div>

        );

    }



    // =========================================
    // RECU VALIDE
    // =========================================

    const reservation =
        verification.reservation;



    // =========================================
    // PAGE PRINCIPALE
    // =========================================

    return (

        <div className="verification-page">

            <div className="verification-card verification-valide">


                {/* =========================================
                    ICONE
                ========================================= */}

                <div className="verification-icon">

                    ✅

                </div>



                {/* =========================================
                    TITRE
                ========================================= */}

                <h1>

                    Reçu valide

                </h1>


                <p className="verification-message">

                    Ce reçu est authentique et peut être utilisé.

                </p>


                <div className="ligne-verification"></div>



                {/* =========================================
                    INFORMATIONS
                ========================================= */}

                <div className="verification-informations">


                    {/* RESERVATION */}

                    <div className="verification-row">

                        <span>
                            Réservation
                        </span>

                        <strong>

                            #{reservation.id_reservation}

                        </strong>

                    </div>



                    {/* CLIENT */}

                    <div className="verification-row">

                        <span>
                            Client
                        </span>

                        <strong>

                            {reservation.nom}{" "}

                            {reservation.prenom}

                        </strong>

                    </div>



                    {/* OFFRE */}

                    <div className="verification-row">

                        <span>
                            Offre
                        </span>

                        <strong>

                            {reservation.titre}

                        </strong>

                    </div>



                    {/* DESTINATION */}

                    <div className="verification-row">

                        <span>
                            Destination
                        </span>

                        <strong>

                            {reservation.nom_destination}

                        </strong>

                    </div>



                    {/* PRESTATAIRE */}

                    <div className="verification-row">

                        <span>
                            Prestataire
                        </span>

                        <strong>

                            {reservation.nom_prestataire}

                        </strong>

                    </div>



                    {/* NOMBRE PERSONNES */}

                    <div className="verification-row">

                        <span>
                            Nombre de personnes
                        </span>

                        <strong>

                            {reservation.nombre_personnes}

                        </strong>

                    </div>



                    {/* DATE DEBUT */}

                    <div className="verification-row">

                        <span>
                            Date début
                        </span>

                        <strong>

                            {

                                reservation.date_debut_sejour

                                    ?

                                    new Date(
                                        reservation.date_debut_sejour
                                    ).toLocaleDateString(
                                        "fr-FR"
                                    )

                                    :

                                    "-"

                            }

                        </strong>

                    </div>



                    {/* DATE FIN */}

                    <div className="verification-row">

                        <span>
                            Date fin
                        </span>

                        <strong>

                            {

                                reservation.date_fin_sejour

                                    ?

                                    new Date(
                                        reservation.date_fin_sejour
                                    ).toLocaleDateString(
                                        "fr-FR"
                                    )

                                    :

                                    "-"

                            }

                        </strong>

                    </div>



                    {/* PAIEMENT */}

                    <div className="verification-row">

                        <span>
                            Paiement
                        </span>

                        <strong className="paiement-confirme">

                            ✅ PAYÉ

                        </strong>

                    </div>


                </div>



                {/* =========================================
                    ETAT DU RECU
                ========================================= */}

                <div className="confirmation-box">


                    <strong>

                        ✓ Reçu authentifié

                    </strong>


                    <p>

                        Les informations correspondent
                        à une réservation enregistrée
                        sur la Plateforme Touristique.

                    </p>


                    <p>

                        Le paiement associé à cette
                        réservation a bien été confirmé.

                    </p>


                </div>



                {/* =========================================
                    ERREUR CONFIRMATION
                ========================================= */}

                {

                    erreurConfirmation && (

                        <div className="verification-error">

                            ⚠️{" "}

                            {erreurConfirmation}

                        </div>

                    )

                }



                {/* =========================================
                    CONFIRMATION ARRIVEE
                ========================================= */}

                <div className="confirmation-arrivee">


                    <h3>

                        🏨 Confirmation de l'arrivée

                    </h3>


                    <p>

                        Après avoir vérifié l'identité du client
                        et les informations de la réservation,
                        le prestataire peut confirmer son arrivée.

                    </p>


                    <button

                        type="button"

                        className="btn-confirmer-arrivee"

                        onClick={confirmerArrivee}

                        disabled={confirmationEnCours}

                    >

                        {

                            confirmationEnCours

                                ?

                                "⏳ Confirmation en cours..."

                                :

                                "✓ Confirmer l'arrivée"

                        }

                    </button>


                    <small>

                        🔒 Cette action est définitive.
                        Après confirmation, le reçu sera
                        marqué comme utilisé et ne pourra
                        plus être présenté une seconde fois.

                    </small>


                </div>



                {/* =========================================
                    FOOTER
                ========================================= */}

                <div className="verification-footer">

                    🌍 Plateforme Touristique

                </div>


            </div>

        </div>

    );

}


export default VerificationRecu;