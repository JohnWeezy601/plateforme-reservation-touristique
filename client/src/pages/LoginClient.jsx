
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

import "./LoginClient.css";

import {
    FaEye,
    FaEyeSlash,
    FaFacebookF
} from "react-icons/fa";

import { GoogleLogin } from "@react-oauth/google";


function LoginClient(){


    const navigate = useNavigate();


    const [email,setEmail] = useState("");

    const [motDePasse,setMotDePasse] = useState("");

    const [loading,setLoading] = useState(false);

    const [voirMotDePasse,setVoirMotDePasse] = useState(false);

    const [facebookReady,setFacebookReady] = useState(false);


    // =====================================================
    // CHARGER LE SDK FACEBOOK
    // =====================================================

    useEffect(() => {

        // Facebook est déjà chargé
        if(window.FB){

            setFacebookReady(true);

            return;

        }


        // Éviter de charger plusieurs fois le SDK
        if(
            document.getElementById(
                "facebook-jssdk"
            )
        ){

            return;

        }


        window.fbAsyncInit = function(){

            window.FB.init({

                appId:
                    "1385966007059754",

                cookie:
                    true,

                xfbml:
                    true,

                version:
                    "v23.0"

            });


            setFacebookReady(true);

        };


        const script =
            document.createElement("script");


        script.id =
            "facebook-jssdk";


        script.src =
            "https://connect.facebook.net/fr_FR/sdk.js";


        script.async =
            true;


        script.defer =
            true;


        script.crossOrigin =
            "anonymous";


        document.body.appendChild(
            script
        );


        return () => {

            window.fbAsyncInit =
                undefined;

        };

    }, []);


    // =====================================================
    // FONCTION COMMUNE POUR FINALISER LA CONNEXION
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
            // REDIRECTION
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

        }

        catch(error){

            console.log(

                "Erreur connexion",

                error

            );


            alert(

                error.response?.data?.message ||

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

    const connexionGoogle = async(
        credentialResponse
    ) => {

        try{

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

                error.response?.data?.message ||

                "Impossible de se connecter avec Google"

            );

        }

        finally{

            setLoading(false);

        }

    };


    // =====================================================
// CONNEXION FACEBOOK
// =====================================================

const connexionFacebook = () => {

    if (!window.FB) {

        alert(
            "Facebook n'est pas encore chargé. Veuillez patienter quelques secondes."
        );

        return;
    }

    if (loading) {
        return;
    }

    setLoading(true);

    console.log(
        "Connexion Facebook..."
    );


    try {

        window.FB.login(

            (response) => {

                console.log(
                    "Réponse Facebook :",
                    response
                );


                // =====================================================
                // UTILISATEUR A ANNULÉ
                // =====================================================

                if (
                    !response ||
                    !response.authResponse
                ) {

                    console.log(
                        "Connexion Facebook annulée"
                    );

                    setLoading(false);

                    return;
                }


                const accessToken =
                    response.authResponse.accessToken;


                if (!accessToken) {

                    console.log(
                        "Token Facebook manquant"
                    );

                    setLoading(false);

                    alert(
                        "Impossible de récupérer le token Facebook"
                    );

                    return;
                }


                // =====================================================
                // APPEL BACKEND
                // =====================================================

                api.post(

                    "/utilisateurs/facebook",

                    {
                        accessToken:
                            accessToken
                    }

                )

                .then((res) => {

                    console.log(
                        "Connexion Facebook réussie :",
                        res.data
                    );


                    finaliserConnexion(
                        res
                    );

                })

                .catch((error) => {

                    console.log(
                        "Erreur backend Facebook :",
                        error
                    );


                    alert(

                        error.response?.data?.message ||

                        "Impossible de se connecter avec Facebook"

                    );

                })

                .finally(() => {

                    setLoading(false);

                });

            },

            {
                scope:
                    "public_profile,email"
            }

        );

    }

    catch(error) {

        console.log(
            "Erreur Facebook :",
            error
        );

        setLoading(false);

        alert(
            "Impossible d'ouvrir la connexion Facebook"
        );

    }

};

    // =====================================================
    // AFFICHAGE
    // =====================================================

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


                    {/* =====================================================
                        EMAIL
                    ===================================================== */}

                    <label>
                        Email
                    </label>


                    <input

                        type="email"

                        placeholder="Votre email"

                        value={email}

                        onChange={(e)=>
                            setEmail(
                                e.target.value
                            )
                        }

                    />


                    {/* =====================================================
                        MOT DE PASSE
                    ===================================================== */}

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


                    {/* =====================================================
                        CONNEXION CLASSIQUE
                    ===================================================== */}

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
                        GOOGLE
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


                    {/* =====================================================
                        FACEBOOK
                    ===================================================== */}

                   {/* =====================================================
    FACEBOOK
===================================================== */}

<div className="facebook-login-container">

    <button
        type="button"
        className="facebook-login-button"
        onClick={connexionFacebook}
        disabled={
            loading ||
            !facebookReady
        }
    >

        <FaFacebookF />

        <span>
            {
                !facebookReady
                    ? "Chargement de Facebook..."
                    : "Continuer avec Facebook"
            }
        </span>

    </button>

</div>


                    {/* =====================================================
                        INSCRIPTION
                    ===================================================== */}

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

