import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./Register.css";


function Register() {


    const navigate = useNavigate();


    const [voirMotDePasse, setVoirMotDePasse] = useState(false);


    const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");


    const [form, setForm] = useState({

        nom:"",
        prenom:"",
        email:"",
        telephone:"",
        mot_de_passe:"",
        role:"Touriste",

        nom_entreprise:"",
        description:"",
        adresse:"",
        ville:""

    });


    const handleChange = (e)=>{


        setForm({

            ...form,

            [e.target.name]:e.target.value

        });


    };


    const handleSubmit = async(e)=>{


        e.preventDefault();


        if(form.mot_de_passe !== confirmationMotDePasse){


            alert(
                "Les mots de passe ne correspondent pas"
            );


            return;

        }


        try{


            await api.post(

                "/utilisateurs/register",

                form

            );


            alert(
                "Inscription réussie"
            );


            navigate("/login-client");


        }

        catch(error){


            console.log(error);


            if(
                error.response &&
                error.response.data &&
                error.response.data.message
            ){

                alert(
                    error.response.data.message
                );

            }

            else{

                alert(
                    "Erreur lors de l'inscription"
                );

            }


        }


    };


    return(


        <div className="register-container">


            <div className="register-card">


                <h1>

                    🌍 Créer un compte

                </h1>


                <p className="register-subtitle">

                    Rejoignez Reservation Touristique

                </p>


                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >


                    <div className="form-group">


                        <label>

                            Nom

                        </label>


                        <input

                            type="text"

                            name="nom"

                            placeholder="Votre nom"

                            value={form.nom}

                            onChange={handleChange}

                            required

                        />


                    </div>


                    <div className="form-group">


                        <label>

                            Prénom

                        </label>


                        <input

                            type="text"

                            name="prenom"

                            placeholder="Votre prénom"

                            value={form.prenom}

                            onChange={handleChange}

                            required

                        />


                    </div>


                    <div className="form-group">


                        <label>

                            Email

                        </label>


                        <input

                            type="email"

                            name="email"

                            placeholder="exemple@gmail.com"

                            value={form.email}

                            onChange={handleChange}

                            required

                        />


                    </div>


                    <div className="form-group">


                        <label>

                            Téléphone

                        </label>


                        <input

                            type="text"

                            name="telephone"

                            placeholder="0340000000"

                            value={form.telephone}

                            onChange={handleChange}

                        />


                    </div>


                    <div className="form-group">


                        <label>

                            Mot de passe

                        </label>


                        <div className="password-field">


                            <input

                                type={
                                    voirMotDePasse
                                    ? "text"
                                    : "password"
                                }

                                name="mot_de_passe"

                                placeholder="Votre mot de passe"

                                value={form.mot_de_passe}

                                onChange={handleChange}

                                required

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


                    </div>


                    <div className="form-group">


                        <label>

                            Confirmer le mot de passe

                        </label>


                        <div className="password-field">


                            <input

                                type={
                                    voirMotDePasse
                                    ? "text"
                                    : "password"
                                }

                                placeholder="Confirmer votre mot de passe"

                                value={confirmationMotDePasse}

                                onChange={(e)=>
                                    setConfirmationMotDePasse(
                                        e.target.value
                                    )
                                }

                                required

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


                    </div>


                    <div className="form-group">


                        <label>

                            Type de compte

                        </label>


                        <select

                            name="role"

                            value={form.role}

                            onChange={handleChange}

                            required

                        >


                            <option value="Touriste">

                                Touriste

                            </option>


                            <option value="Prestataire">

                                Prestataire

                            </option>


                        </select>


                    </div>


                    {form.role === "Prestataire" && (


                        <div className="prestataire-form">


                            <h2>

                                Informations du prestataire

                            </h2>


                            <p className="prestataire-description">

                                Veuillez renseigner les informations
                                de votre entreprise touristique.

                            </p>


                            <div className="form-group">


                                <label>

                                    Nom de l'entreprise

                                </label>


                                <input

                                    type="text"

                                    name="nom_entreprise"

                                    placeholder="Exemple : Hotel Palm Beach"

                                    value={form.nom_entreprise}

                                    onChange={handleChange}

                                    required

                                />


                            </div>


                            <div className="form-group">


                                <label>

                                    Description

                                </label>


                                <textarea

                                    name="description"

                                    placeholder="Décrivez votre entreprise ou votre activité touristique"

                                    value={form.description}

                                    onChange={handleChange}

                                    rows="4"

                                    required

                                />


                            </div>


                            <div className="form-group">


                                <label>

                                    Adresse

                                </label>


                                <input

                                    type="text"

                                    name="adresse"

                                    placeholder="Exemple : Au bord de la mer"

                                    value={form.adresse}

                                    onChange={handleChange}

                                    required

                                />


                            </div>


                            <div className="form-group">


                                <label>

                                    Ville

                                </label>


                                <input

                                    type="text"

                                    name="ville"

                                    placeholder="Exemple : Nosy Be"

                                    value={form.ville}

                                    onChange={handleChange}

                                    required

                                />


                            </div>


                            <div className="prestataire-info">


                                <strong>

                                    Validation du compte

                                </strong>


                                <p>

                                    Votre compte prestataire sera enregistré
                                    avec le statut « En attente ». Un
                                    administrateur devra valider votre compte.

                                </p>


                            </div>


                        </div>

                    )}


                    <button type="submit">

                        Créer mon compte

                    </button>


                </form>


                <div className="register-link">


                    <p>

                        Vous avez déjà un compte ?


                        <Link to="/login-client">

                            Se connecter

                        </Link>


                    </p>


                </div>


            </div>


        </div>


    );


}


export default Register;