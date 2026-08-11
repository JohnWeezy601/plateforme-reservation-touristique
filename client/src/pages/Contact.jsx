import { useState } from "react";
import api from "../api/api";
import "./Contact.css";

import {
    FaEnvelope,
    FaUser,
    FaPaperPlane,
    FaPhone,
    FaMapMarkerAlt
} from "react-icons/fa";


function Contact(){


    const [form,setForm] = useState({

        nom:"",
        email:"",
        sujet:"",
        message:""

    });





    const handleChange = (e)=>{

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };






    const envoyerMessage = async(e)=>{


        e.preventDefault();


        try{


            await api.post(
                "/contacts",
                form
            );



            alert(
                "Message envoyé avec succès"
            );



            setForm({

                nom:"",
                email:"",
                sujet:"",
                message:""

            });


        }


        catch(error){


            console.log(error);


            alert(
                "Erreur lors de l'envoi du message"
            );


        }


    };







    return(


        <div className="contact-page">



            <div className="contact-container">



                {/* ======================
                    INFORMATIONS CONTACT
                ======================= */}


                <div className="contact-info">


                    <h2>

                        NOS COORDONNÉES

                    </h2>



                    <p>

                        Vous avez consulté notre plateforme
                        touristique et souhaitez en savoir plus ?

                    </p>



                    <p>

                        N’hésitez pas à nous contacter pour poser
                        vos questions, demander des informations,
                        laisser vos commentaires ou simplement
                        nous saluer.

                    </p>





                    <h3>

                        🌴 Travel Explorer

                    </h3>





                    <div className="info-item">

                        <FaMapMarkerAlt/>

                        <span>

                            Antananarivo, Madagascar

                        </span>

                    </div>






                    <div className="info-item">

                        <FaPhone/>

                        <span>

                            +261 34 00 000 00

                        </span>

                    </div>






                    <div className="info-item">

                        <FaEnvelope/>

                        <span>

                            contact@travelexplorer.com

                        </span>

                    </div>



                </div>









                {/* ======================
                    FORMULAIRE CONTACT
                ======================= */}



                <div className="contact-box">



                    <h1>

                        <FaEnvelope/>

                        Contactez-nous

                    </h1>





                    <form

                        className="contact-form"

                        onSubmit={envoyerMessage}

                    >





                        <div className="input-group">


                            <FaUser/>


                            <input

                                type="text"

                                name="nom"

                                placeholder="Votre nom"

                                value={form.nom}

                                onChange={handleChange}

                                required

                            />


                        </div>







                        <div className="input-group">


                            <FaEnvelope/>


                            <input

                                type="email"

                                name="email"

                                placeholder="Votre email"

                                value={form.email}

                                onChange={handleChange}

                                required

                            />


                        </div>







                        <input


                            type="text"

                            name="sujet"

                            placeholder="Sujet"

                            value={form.sujet}

                            onChange={handleChange}

                            required


                        />









                        <textarea


                            name="message"

                            placeholder="Votre message"

                            rows="5"

                            value={form.message}

                            onChange={handleChange}

                            required


                        />








                        <button

                            type="submit"

                            className="contact-submit"

                        >


                            <FaPaperPlane/>


                            Envoyer


                        </button>





                    </form>





                </div>





            </div>





        </div>


    );


}


export default Contact;