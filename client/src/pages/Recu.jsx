import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    QRCodeSVG
} from "qrcode.react";

import api from "../api/api";

import "./Recu.css";


function Recu() {


    const { id } = useParams();


    const [recu, setRecu] = useState(null);


    // =============================
    // CHARGER LES DONNEES DU RECU
    // =============================

    useEffect(() => {


        const chargerRecu = async () => {


            try {


                const res = await api.get(
                    `/recu/${id}`
                );


                console.log(
                    "Données reçu :",
                    res.data
                );


                setRecu(res.data);


            }
            catch (error) {


                console.log(
                    "Erreur chargement reçu :",
                    error
                );


            }


        };


        chargerRecu();


    }, [id]);




    if (!recu) {


        return (


            <div className="chargement">


                <h2>
                    Chargement reçu...
                </h2>


            </div>


        );


    }




    /*
    =========================================
    URL DE VERIFICATION DU RECU
    =========================================

    Le QR Code utilise maintenant
    le token de vérification sécurisé.

    Exemple :

    https://plateforme-touristique.onrender.com/verification/
    351a6a273bfd8234f54532921c634a55442f85f24a0bce73e94990c64e3dcc40

    =========================================
    */

    const urlVerification =
        `${window.location.origin}/verification/${recu.token_verification}`;




    return (


        <div className="recu-container">


            <div className="recu-card">



                {/* =========================================
                    EN-TÊTE
                ========================================= */}

                <div className="recu-header">


                    <h1>
                        🌍 Plateforme Touristique
                    </h1>


                    <h2>
                        REÇU DE PAIEMENT
                    </h2>


                    <p className="date-recu">

                        Date du reçu :
                        {" "}

                        {new Date()
                            .toLocaleDateString(
                                "fr-FR"
                            )}

                    </p>


                </div>




                <div className="ligne"></div>




                {/* =========================================
                    INFORMATIONS CLIENT
                ========================================= */}

                <section>


                    <h3>
                        👤 Informations client
                    </h3>


                    <div className="carte-identite">


                        <div className="photo-zone">


                            <img
                                src={
                                    recu.photo
                                        ? recu.photo
                                        : "/avatar.png"
                                }
                                alt="Photo client"
                                className="photo-client"
                            />


                        </div>




                        <div className="infos-client">


                            <p>

                                <strong>
                                    Nom :
                                </strong>

                                {" "}

                                {recu.nom}

                            </p>


                            <p>

                                <strong>
                                    Prénom :
                                </strong>

                                {" "}

                                {recu.prenom}

                            </p>


                            <p>

                                <strong>
                                    Email :
                                </strong>

                                {" "}

                                {recu.email}

                            </p>


                            <p>

                                <strong>
                                    Téléphone :
                                </strong>

                                {" "}

                                {recu.telephone || "-"}

                            </p>


                        </div>


                    </div>


                </section>




                {/* =========================================
                    PRESTATAIRE
                ========================================= */}

                <section className="prestataire-section">


                    <h3>
                        📍 Prestataire / Lieu du séjour
                    </h3>


                    <div className="prestataire-box">


                        {/* NOM ENTREPRISE */}

                        <div className="prestataire-main">


                            <div className="prestataire-icon">

                                🏨

                            </div>


                            <div>

                                <span className="prestataire-label">

                                    PRESTATAIRE

                                </span>


                                <h4 className="prestataire-nom">

                                    {
                                        recu.nom_prestataire
                                            ||
                                        "Prestataire non renseigné"
                                    }

                                </h4>

                            </div>


                        </div>




                        {/* INFORMATIONS PRESTATAIRE */}

                        {

                            recu.nom_prestataire && (

                                <div className="prestataire-details">


                                    {

                                        recu.adresse_prestataire && (

                                            <p>

                                                <strong>
                                                    🏠 Adresse :
                                                </strong>

                                                {" "}

                                                {recu.adresse_prestataire}

                                            </p>

                                        )

                                    }




                                    {

                                        recu.ville_prestataire && (

                                            <p>

                                                <strong>
                                                    🏙️ Ville :
                                                </strong>

                                                {" "}

                                                {recu.ville_prestataire}

                                            </p>

                                        )

                                    }




                                    {

                                        recu.telephone_prestataire && (

                                            <p>

                                                <strong>
                                                    📞 Téléphone :
                                                </strong>

                                                {" "}

                                                {recu.telephone_prestataire}

                                            </p>

                                        )

                                    }




                                    {

                                        recu.email_prestataire && (

                                            <p>

                                                <strong>
                                                    ✉️ Email :
                                                </strong>

                                                {" "}

                                                {recu.email_prestataire}

                                            </p>

                                        )

                                    }


                                </div>

                            )

                        }




                        {/* DESTINATION */}

                        <div className="prestataire-destination">


                            <span>
                                📍
                            </span>


                            <span>

                                Destination :

                                {" "}

                                <strong>
                                    {recu.nom_destination}
                                </strong>

                            </span>


                        </div>




                        {/* AVERTISSEMENT SI PRESTATAIRE ABSENT */}

                        {

                            !recu.nom_prestataire && (

                                <div className="prestataire-warning">

                                    ⚠️

                                    {" "}

                                    Le prestataire n'est pas
                                    renseigné pour cette offre.

                                </div>

                            )

                        }


                    </div>


                </section>




                {/* =========================================
                    DETAILS RESERVATION
                ========================================= */}

                <section>


                    <h3>
                        🏝 Détails réservation
                    </h3>


                    <div className="info">


                        <p>

                            <strong>
                                Réservation N° :
                            </strong>

                            {" "}

                            {recu.id_reservation}

                        </p>




                        <p>

                            <strong>
                                Offre :
                            </strong>

                            {" "}

                            {recu.titre}

                        </p>




                        <p>

                            <strong>
                                Destination :
                            </strong>

                            {" "}

                            {recu.nom_destination}

                        </p>




                        <p>

                            <strong>
                                Nombre personnes :
                            </strong>

                            {" "}

                            {recu.nombre_personnes}

                        </p>




                        <p>

                            <strong>
                                Date début :
                            </strong>

                            {" "}

                            {

                                recu.date_debut_sejour

                                    ?

                                    new Date(
                                        recu.date_debut_sejour
                                    )
                                        .toLocaleDateString(
                                            "fr-FR"
                                        )

                                    :

                                    "-"

                            }

                        </p>




                        <p>

                            <strong>
                                Date fin :
                            </strong>

                            {" "}

                            {

                                recu.date_fin_sejour

                                    ?

                                    new Date(
                                        recu.date_fin_sejour
                                    )
                                        .toLocaleDateString(
                                            "fr-FR"
                                        )

                                    :

                                    "-"

                            }

                        </p>


                    </div>


                </section>




                {/* =========================================
                    PAIEMENT
                ========================================= */}

                <section>


                    <h3>
                        💳 Paiement
                    </h3>


                    <div className="paiement-box">


                        <p>


                            <strong>
                                Montant :
                            </strong>


                            <span className="montant">


                                {

                                    Number(
                                        recu.montant
                                    )
                                        .toLocaleString(
                                            "fr-FR"
                                        )

                                }


                                {" "}€


                            </span>


                        </p>




                        <p>


                            <strong>
                                Statut :
                            </strong>


                            <span className="statut">


                                {recu.statut_paiement}


                            </span>


                        </p>


                    </div>


                </section>




                {/* =========================================
                    QR CODE
                ========================================= */}

                <section className="verification-recu">


                    <h3>
                        🔐 Vérification du reçu
                    </h3>


                    <div className="qr-container">


                        <QRCodeSVG


                            value={
                                urlVerification
                            }


                            size={180}


                            level="H"


                            includeMargin={true}


                        />


                        <p className="qr-title">


                            Reçu officiel


                        </p>


                        <p className="qr-description">


                            Scannez ce QR Code pour
                            vérifier l'authenticité
                            de ce reçu.


                        </p>


                    </div>


                </section>




                {/* =========================================
                    MESSAGE
                ========================================= */}

                <div className="message">


                    <strong>

                        Merci pour votre confiance 🌍

                    </strong>


                    <p>

                        Bon voyage et excellent séjour !

                    </p>


                    {

                        recu.nom_prestataire && (

                            <p>

                                📍

                                {" "}

                                Pour votre séjour, veuillez
                                vous rendre auprès de :

                                {" "}

                                <strong>

                                    {recu.nom_prestataire}

                                </strong>

                                {" "}

                                à votre arrivée.

                            </p>

                        )

                    }


                </div>




                {/* =========================================
                    ACTIONS
                ========================================= */}

                <div className="actions">


                    <button

                        className="btn-print"

                        onClick={() =>
                            window.print()
                        }

                    >

                        🖨 Imprimer / Enregistrer PDF

                    </button>




                    <button

                        className="btn-retour"

                        onClick={() =>
                            window.location.href =
                                "/mes-notifications"
                        }

                    >

                        ↩ Retour

                    </button>


                </div>


            </div>


        </div>


    );


}


export default Recu;