
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

import "./LoginClient.css";

import {
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import { GoogleLogin } from "@react-oauth/google";


function LoginClient(){


    const navigate = useNavigate();


    const [email,setEmail] = useState("");

    const [motDePasse,setMotDePasse] = useState("");

    const [loading,setLoading] = useState(false);

    const [voirMotDePasse,setVoirMotDePasse] = useState(false);


    // =====================================================
    // FONCTION COMMUNE POUR SAUVEGARDER L'UTILISATEUR
    // APRÈS CONNEXION GOOGLE
    // =====================================================

    const finaliserConnexion = (res) => {

        console.log(
            "Utilisateur connecté :",
            res.data
        );


        // =====================================================
        // TOKEN JWT
        // =====================================================

        localStorage.setItem(
            "token",
            res.data.token
        );


        // =====================================================
        // UTILISATEUR
        // =====================================================

        const utilisateurConnecte = {

            id_utilisateur:
                res.data.utilisateur.id,

            nom:
                res.data.utilisateur.nom,

            prenom:
                res.data.utilisateur.prenom,

            email:
                res.data.utilisateur.email,

            role:
                res.data.utilisateur.role,

            photo:
                res.data.utilisateur.photo

        };


        localStorage.setItem(

            "utilisateur",

            JSON.stringify(
                utilisateurConnecte
            )

        );


        window.dispatchEvent(
            new Event("utilisateurConnecte")
        );


        // =====================================================
        // REDIRECTION SELON LE RÔLE
        // =====================================================

        const role =
            utilisateurConnecte.role;


        console.log(
            "ROLE :",
            role
        );


        if(role === "Administrateur"){

            navigate(
                "/dashboard"
            );

        }

        else if(role === "Prestataire"){

            navigate(
                "/prestataire"
            );

        }

        else{

            const retour =
                sessionStorage.getItem(
                    "retourApresLogin"
                );


            console.log(
                "RETOUR APRES LOGIN :",
                retour
            );


            if(retour){

                sessionStorage.removeItem(
                    "retourApresLogin"
                );

                navigate(
                    retour
                );

            }

            else{

                navigate(
                    -1
                );

            }

        }

    };


    // =====================================================
    // CONNEXION CLASSIQUE
    // =====================================================

    const connexion = async(e)=>{


        e.preventDefault();


        try{


            setLoading(true);


            const res = await api.post(

                "/utilisateurs/login",

                {

                    email:
                        email,

                    mot_de_passe:
                        motDePasse

                }

            );


            console.log(
                "Utilisateur connecté :",
                res.data
            );


            // =====================================================
            // Sauvegarder le token JWT
            // =====================================================

            localStorage.setItem(
                "token",
                res.data.token
            );


            // =====================================================
            // Sauvegarder utilisateur
            // =====================================================

            const utilisateurConnecte = {

                id_utilisateur:
                    res.data.utilisateur.id,

                nom:
                    res.data.utilisateur.nom,

                prenom:
                    res.data.utilisateur.prenom,

                email:
                    res.data.utilisateur.email,

                role:
                    res.data.utilisateur.role,

                photo:
                    res.data.utilisateur.photo

            };


            localStorage.setItem(

                "utilisateur",

                JSON.stringify(
                    utilisateurConnecte
                )

            );


            window.dispatchEvent(
                new Event("utilisateurConnecte")
            );


            // =====================================================
            // REDIRECTION SELON LE RÔLE
            // =====================================================

            const role =
                utilisateurConnecte.role;


            console.log(
                "ROLE :",
                role
            );


            if(role === "Administrateur"){

                navigate(
                    "/dashboard"
                );

            }

            else if(role === "Prestataire"){

                navigate(
                    "/prestataire"
                );

            }

            else{

                const retour =
                    sessionStorage.getItem(
                        "retourApresLogin"
                    );


                console.log(
                    "RETOUR APRES LOGIN :",
                    retour
                );


                if(retour){

                    sessionStorage.removeItem(
                        "retourApresLogin"
                    );

                    navigate(
                        retour
                    );

                }

                else{

                    // Aucun chemin sauvegardé :
                    // revenir à la page précédente

                    navigate(
                        -1
                    );

                }

            }

        }

        catch(error){

            console.log(

                "Erreur connexion",

                error

            );


            alert(

                "Email ou mot de passe incorrect"

            );

        }

        finally{

            setLoading(
                false
            );

        }

    };


    // =====================================================
    // CONNEXION GOOGLE
    // =====================================================

    const connexionGoogle = async (credentialResponse) => {

        try {

            setLoading(true);


            console.log(
                "Connexion Google..."
            );


            const res = await api.post(

                "/utilisateurs/google",

                {

                    credential:
                        credentialResponse.credential

                }

            );


            console.log(
                "Connexion Google réussie :",
                res.data
            );


            finaliserConnexion(
                res
            );

        }

        catch(error){

            console.log(
                "Erreur connexion Google :",
                error
            );


            alert(
                "Impossible de se connecter avec Google"
            );

        }

        finally{

            setLoading(false);

        }

    };


    return(


        <div className="login-client">


            <div className="login-card">


                <h1>
                    Connexion
                </h1>


                <p>
                    Connectez-vous à votre espace personnel.
                </p>


                <form
                    onSubmit={connexion}
                >


                    <label>
                        Email
                    </label>


                    <input

                        type="email"

                        placeholder="Votre email"

                        value={email}

                        onChange={(e)=>
                            setEmail(e.target.value)
                        }

                    />


                    <label>
                        Mot de passe
                    </label>


                    <div className="password-field">


                        <input

                            type={
                                voirMotDePasse
                                ?
                                "text"
                                :
                                "password"
                            }

                            placeholder="Votre mot de passe"

                            value={motDePasse}

                            onChange={(e)=>
                                setMotDePasse(
                                    e.target.value
                                )
                            }

                        />


                        <span

                            className="password-eye"

                            onClick={()=>
                                setVoirMotDePasse(
                                    !voirMotDePasse
                                )
                            }

                        >

                            {

                                voirMotDePasse

                                ?

                                <FaEyeSlash/>

                                :

                                <FaEye/>

                            }

                        </span>


                    </div>


                    <button

                        type="submit"

                        disabled={loading}

                    >

                        {

                            loading

                            ?

                            "Connexion..."

                            :

                            "Se connecter"

                        }

                    </button>


                    {/* =====================================================
                        SÉPARATEUR
                    ===================================================== */}

                    <div className="login-separator">

                        <span>
                            OU
                        </span>

                    </div>


                    {/* =====================================================
                        CONNEXION GOOGLE
                    ===================================================== */}

                   <div className="google-login-container">

    <GoogleLogin

        onSuccess={
            connexionGoogle
        }

        onError={() => {

            console.log(
                "Échec de la connexion Google"
            );

            alert(
                "La connexion avec Google a échoué"
            );

        }}

        text="continue_with"

        shape="rectangular"

        theme="outline"

        size="large"

    />

</div>

                    <div className="register-link">

                        <p>

                            Vous n'avez pas de compte ?

                            {" "}

                            <span

                                className="register-link-text"

                                onClick={()=>
                                    navigate(
                                        "/register"
                                    )
                                }

                            >

                                Créer un compte

                            </span>

                        </p>

                    </div>


                </form>


            </div>


        </div>

    );

}


export default LoginClient;

