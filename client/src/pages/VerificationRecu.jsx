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

    const { id } = useParams();

    const [verification, setVerification] = useState(null);

    const [chargement, setChargement] = useState(true);


    useEffect(() => {

        const verifierRecu = async () => {

            try {

                const res = await api.get(
                    `/verification-recu/${id}`
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

    }, [id]);


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
    // ERREUR / REÇU INVALIDE
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

                        Plateforme Touristique

                    </div>

                </div>

            </div>

        );

    }


    // =========================================
    // REÇU VALIDE
    // =========================================

    const reservation =
        verification.reservation;


    return (

        <div className="verification-page">

            <div className="verification-card verification-valide">


                {/* =========================================
                    ICÔNE
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


                    <div className="verification-row">

                        <span>
                            Réservation
                        </span>

                        <strong>
                            #{reservation.id_reservation}
                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Client
                        </span>

                        <strong>

                            {reservation.nom}{" "}
                            {reservation.prenom}

                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Offre
                        </span>

                        <strong>
                            {reservation.titre}
                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Destination
                        </span>

                        <strong>
                            {reservation.nom_destination}
                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Prestataire
                        </span>

                        <strong>
                            {reservation.nom_prestataire}
                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Nombre de personnes
                        </span>

                        <strong>
                            {reservation.nombre_personnes}
                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Date début
                        </span>

                        <strong>

                            {
                                reservation.date_debut_sejour
                                    ? new Date(
                                        reservation.date_debut_sejour
                                    ).toLocaleDateString("fr-FR")
                                    : "-"
                            }

                        </strong>

                    </div>


                    <div className="verification-row">

                        <span>
                            Date fin
                        </span>

                        <strong>

                            {
                                reservation.date_fin_sejour
                                    ? new Date(
                                        reservation.date_fin_sejour
                                    ).toLocaleDateString("fr-FR")
                                    : "-"
                            }

                        </strong>

                    </div>


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
                    MESSAGE FINAL
                ========================================= */}

                <div className="confirmation-box">

                    <strong>

                        ✓ Réservation confirmée

                    </strong>

                    <p>

                        Ce document a été vérifié avec succès
                        par la Plateforme Touristique.

                    </p>

                </div>


                <div className="verification-footer">

                    🌍 Plateforme Touristique

                </div>


            </div>

        </div>

    );

}


export default VerificationRecu;