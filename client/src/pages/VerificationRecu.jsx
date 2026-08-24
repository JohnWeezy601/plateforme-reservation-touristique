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

                        Veuillez patienter.

                    </p>


                </div>


            </div>


        );

    }


    // =========================================
    // RECU INVALIDE OU DEJA UTILISE
    // =========================================

    if (!verification?.valide) {


        const recuDejaUtilise =
            verification?.utilise === true;


        return (


            <div className="verification-page">


                <div

                    className={

                        `verification-card ${
                            recuDejaUtilise
                                ? "verification-utilise"
                                : "verification-invalide"
                        }`

                    }

                >


                    {/* =========================================
                        ICONE
                    ========================================= */}

                    <div className="verification-icon">


                        {

                            recuDejaUtilise

                                ? "⚠️"

                                : "❌"

                        }


                    </div>


                    {/* =========================================
                        TITRE
                    ========================================= */}

                    <h1>


                        {

                            recuDejaUtilise

                                ? "Reçu déjà utilisé"

                                : "Reçu non valide"

                        }


                    </h1>


                    {/* =========================================
                        MESSAGE
                    ========================================= */}

                    <p className="verification-message">


                        {

                            verification?.message ||

                            "Ce reçu ne peut pas être vérifié."

                        }


                    </p>


                    {/* =========================================
                        MESSAGE SPECIFIQUE
                    ========================================= */}

                    {

                        recuDejaUtilise && (


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


                        )

                    }


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
    // RECU VALIDE
    // =========================================

    const reservation =
        verification.reservation;


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


                    Ce reçu est authentique.


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


                    {/* NOMBRE DE PERSONNES */}

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
                    CONFIRMATION
                ========================================= */}

                <div className="confirmation-box">


                    <strong>


                        ✓ Réservation confirmée


                    </strong>


                    <p>


                        Ce document a été vérifié avec succès
                        par la Plateforme Touristique.


                    </p>


                    <p>


                        🔐 Le reçu a été marqué comme utilisé.


                    </p>


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