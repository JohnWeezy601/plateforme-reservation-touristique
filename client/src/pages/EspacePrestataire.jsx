import { useEffect, useState } from "react";
import api from "../api/api";
import "./EspacePrestataire.css";

import {
    FaBuilding,
    FaHotel,
    FaCalendarCheck,
    FaClock,
    FaMoneyBillWave
} from "react-icons/fa";


function EspacePrestataire() {


    const [utilisateur, setUtilisateur] = useState(null);

    const [prestataire, setPrestataire] = useState(null);

    const [chargement, setChargement] = useState(true);


    // =====================================
    // STATISTIQUES
    // =====================================

    const [statistiques, setStatistiques] = useState({

        offres: 0,

        reservations: 0,

        reservationsEnAttente: 0,

        revenus: 0

    });


    // =====================================
    // CHARGEMENT INITIAL
    // =====================================

    useEffect(() => {


        const utilisateurStocke =
            localStorage.getItem("utilisateur");


        if (!utilisateurStocke) {

            setChargement(false);

            return;

        }


        try {


            const utilisateurData =
                JSON.parse(utilisateurStocke);


            setUtilisateur(
                utilisateurData
            );


            // =====================================
            // ID UTILISATEUR
            // =====================================

            const idUtilisateur =
                utilisateurData.id ||
                utilisateurData.id_utilisateur;


            if (!idUtilisateur) {

                console.error(
                    "ID utilisateur introuvable"
                );

                setChargement(false);

                return;

            }


            chargerPrestataire(
                idUtilisateur
            );


        }
        catch(error) {


            console.error(
                "Erreur lecture utilisateur :",
                error
            );


            setChargement(false);

        }


    }, []);



    // =====================================
    // CHARGER PRESTATAIRE + STATISTIQUES
    // =====================================

    const chargerPrestataire = async (
        idUtilisateur
    ) => {


        try {


            // =====================================
            // RECUPERER LE PRESTATAIRE
            // =====================================

            const res = await api.get(

                `/prestataires/utilisateur/${idUtilisateur}`

            );


            console.log(
                "PRESTATAIRE CONNECTE :",
                res.data
            );


            setPrestataire(
                res.data
            );


            // =====================================
            // RECUPERER LES STATISTIQUES
            // =====================================

            const statistiquesRes =
                await api.get(

                    `/prestataires/${res.data.id_prestataire}/statistiques`

                );


            console.log(
                "STATISTIQUES PRESTATAIRE :",
                statistiquesRes.data
            );


            setStatistiques({

                offres:
                    Number(
                        statistiquesRes.data.offres || 0
                    ),

                reservations:
                    Number(
                        statistiquesRes.data.reservations || 0
                    ),

                reservationsEnAttente:
                    Number(
                        statistiquesRes.data.reservationsEnAttente || 0
                    ),

                revenus:
                    Number(
                        statistiquesRes.data.revenus || 0
                    )

            });


        }
        catch(error) {


            console.error(

                "Erreur récupération prestataire/statistiques :",

                error

            );


        }
        finally {


            setChargement(false);


        }

    };



    // =====================================
    // CHARGEMENT
    // =====================================

    if (chargement) {


        return (

            <div className="prestataire-loading">

                Chargement...

            </div>

        );

    }



    // =====================================
    // PAGE
    // =====================================

    return (


        <div className="prestataire-dashboard">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="prestataire-dashboard-header">


                <div>


                    <h1>


                        <FaBuilding />


                        Bonjour{" "}


                        {
                            prestataire?.nom_entreprise ||

                            utilisateur?.prenom ||

                            "Prestataire"
                        }


                    </h1>


                    <p>

                        Gérez votre activité touristique
                        depuis votre espace prestataire.

                    </p>


                </div>


            </div>



            {/* =====================================
                STATISTIQUES
            ===================================== */}

            <div className="prestataire-statistiques">


                {/* =================================
                    MES OFFRES
                ================================= */}

                <div className="prestataire-card">


                    <div className="prestataire-card-icon">

                        <FaHotel />

                    </div>


                    <div>


                        <span>

                            Mes offres

                        </span>


                        <strong>

                            {statistiques.offres}

                        </strong>


                    </div>


                </div>



                {/* =================================
                    RESERVATIONS
                ================================= */}

                <div className="prestataire-card">


                    <div className="prestataire-card-icon">

                        <FaCalendarCheck />

                    </div>


                    <div>


                        <span>

                            Réservations

                        </span>


                        <strong>

                            {statistiques.reservations}

                        </strong>


                    </div>


                </div>



                {/* =================================
                    EN ATTENTE
                ================================= */}

                <div className="prestataire-card">


                    <div className="prestataire-card-icon">

                        <FaClock />

                    </div>


                    <div>


                        <span>

                            En attente

                        </span>


                        <strong>

                            {statistiques.reservationsEnAttente}

                        </strong>


                    </div>


                </div>



                {/* =================================
                    REVENUS
                ================================= */}

                <div className="prestataire-card">


                    <div className="prestataire-card-icon">

                        <FaMoneyBillWave />

                    </div>


                    <div>


                        <span>

                            Revenus

                        </span>


                        <strong>

                            {
                                statistiques.revenus.toLocaleString(
                                    "fr-FR"
                                )
                            }{" "}

                            €

                        </strong>


                    </div>


                </div>


            </div>



            {/* =====================================
                INFORMATIONS ENTREPRISE
            ===================================== */}

            <div className="prestataire-info">


                <h2>

                    Informations de votre entreprise

                </h2>



                <div className="prestataire-info-grid">


                    {/* ENTREPRISE */}

                    <div>


                        <span>

                            Entreprise

                        </span>


                        <strong>

                            {
                                prestataire?.nom_entreprise ||
                                "-"
                            }

                        </strong>


                    </div>



                    {/* VILLE */}

                    <div>


                        <span>

                            Ville

                        </span>


                        <strong>

                            {
                                prestataire?.ville ||
                                "-"
                            }

                        </strong>


                    </div>



                    {/* TELEPHONE */}

                    <div>


                        <span>

                            Téléphone

                        </span>


                        <strong>

                            {
                                prestataire?.telephone ||
                                "-"
                            }

                        </strong>


                    </div>



                    {/* EMAIL */}

                    <div>


                        <span>

                            Email

                        </span>


                        <strong>

                            {
                                prestataire?.email ||
                                "-"
                            }

                        </strong>


                    </div>



                    {/* ADRESSE */}

                    <div>


                        <span>

                            Adresse

                        </span>


                        <strong>

                            {
                                prestataire?.adresse ||
                                "-"
                            }

                        </strong>


                    </div>



                    {/* STATUT */}

                    <div>


                        <span>

                            Statut

                        </span>


                        <strong>

                            {
                                prestataire?.statut ||
                                "-"
                            }

                        </strong>


                    </div>


                </div>


            </div>


        </div>

    );

}


export default EspacePrestataire;