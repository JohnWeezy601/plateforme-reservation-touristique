import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function EspacePrestataireLayout() {

    const [utilisateur, setUtilisateur] = useState(null);

    useEffect(() => {

        const utilisateurConnecte =
            localStorage.getItem("utilisateur");

        if (utilisateurConnecte) {

            try {

                setUtilisateur(
                    JSON.parse(utilisateurConnecte)
                );

            }
            catch(error) {

                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

            }

        }

    }, []);


    if (!utilisateur) {

        return <Navigate to="/login-client" replace />;

    }


    if (utilisateur.role !== "Prestataire") {

        return <Navigate to="/login-client" replace />;

    }


    return (

        <div className="espace-prestataire">

            <Outlet />

        </div>

    );

}

export default EspacePrestataireLayout;