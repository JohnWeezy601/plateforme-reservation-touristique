import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./EspacePrestataireLayout.css";

function EspacePrestataireLayout() {

    const [utilisateur, setUtilisateur] = useState(null);

    const [chargement, setChargement] = useState(true);


    useEffect(() => {

        const utilisateurConnecte =
            localStorage.getItem("utilisateur");


        if (utilisateurConnecte) {

            try {

                const utilisateurParse =
                    JSON.parse(utilisateurConnecte);

                setUtilisateur(
                    utilisateurParse
                );

            }
            catch(error) {

                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

                setUtilisateur(null);

            }

        }
        else {

            setUtilisateur(null);

        }


        setChargement(false);

    }, []);


    // =====================================================
    // ATTENDRE LA LECTURE DU LOCALSTORAGE
    // =====================================================

    if (chargement) {

        return null;

    }


    // =====================================================
    // UTILISATEUR NON CONNECTÉ
    // =====================================================

    if (!utilisateur) {

        return (
            <Navigate
                to="/login-client"
                replace
            />
        );

    }


    // =====================================================
    // VÉRIFICATION DU RÔLE
    // =====================================================

    if (utilisateur.role !== "Prestataire") {

        return (
            <Navigate
                to="/login-client"
                replace
            />
        );

    }


    // =====================================================
    // ESPACE PRESTATAIRE
    // =====================================================

    return (

        <div className="espace-prestataire">

            <Outlet />

        </div>

    );

}


export default EspacePrestataireLayout;