import { useEffect, useState } from "react";
import api from "../api/api";
import "./ProfilAdmin.css";

import AdminProfileModal from "../components/AdminProfileModal";

import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaUserShield,
    FaCalendarAlt,
    FaEdit,
    FaCamera
} from "react-icons/fa";


function ProfilAdmin(){


    const [admin,setAdmin] = useState(null);

    const [openModal,setOpenModal] = useState(false);

    const [preview,setPreview] = useState(null);



    // récupérer l'administrateur

    const getAdmin = async()=>{

        try{

            const res = await api.get("/utilisateurs");


            const utilisateurAdmin = res.data.find(

                (user)=> user.role === "Administrateur"

            );


            setAdmin(utilisateurAdmin);


        }
        catch(error){

            console.log(error);

        }

    };




    useEffect(()=>{

        getAdmin();

    },[]);





    // ==========================
    // CHANGER PHOTO
    // ==========================


    const changerPhoto = async(e)=>{


        const fichier = e.target.files[0];


        if(!fichier) return;



        setPreview(
            URL.createObjectURL(fichier)
        );



        const formData = new FormData();


        formData.append(
            "photo",
            fichier
        );



        try{


            await api.put(

                `/utilisateurs/photo/${admin.id_utilisateur}`,

                formData,

                {

                    headers:{

                        "Content-Type":"multipart/form-data"

                    }

                }

            );



            alert("Photo modifiée avec succès");


            getAdmin();



        }

       catch(error){

    console.log("ERREUR UPLOAD :", error.response?.data || error);

    alert(
        error.response?.data?.message ||
        "Erreur lors du changement de photo"
    );

}


    };






    // ==========================
    // MODIFIER PROFIL
    // ==========================


    const modifierProfil = async(e)=>{


        e.preventDefault();



        const formData = new FormData(e.target);



        const data = {


            nom:formData.get("nom"),

            prenom:formData.get("prenom"),

            email:formData.get("email"),

            telephone:formData.get("telephone"),

            role:admin.role


        };



        try{


            await api.put(

                `/utilisateurs/${admin.id_utilisateur}`,

                data

            );



            alert("Profil modifié avec succès");


            setOpenModal(false);


            getAdmin();


        }

        catch(error){


            console.log(error);

            alert("Erreur modification profil");


        }


    };






    if(!admin){


        return (

            <div className="profile-loading">

                Chargement du profil...

            </div>

        );

    }







    return (

        <div className="profile-container">


            <div className="profile-card">



                <div className="profile-header">



                    {/* PHOTO ADMIN */}

                    <div className="profile-photo-container">


                        {

                        preview ?


                        <img

                        src={preview}

                        className="profile-image"

                        alt="Aperçu"

                        />


                        :


                        admin.photo ?


                        <img

                        src={`http://localhost:8081/uploads/${admin.photo}`}

                        className="profile-image"

                        alt="Profil Admin"

                        />


                        :


                        <FaUserCircle className="profile-avatar"/>


                        }



                        {/* ICON CAMERA */}

                        <label

                        className="btn-photo"

                        title="Changer la photo"

                        >


                            <FaCamera/>


                            <input

                            type="file"

                            hidden

                            accept="image/*"

                            onChange={changerPhoto}

                            />


                        </label>


                    </div>







                    <div>


                        <h2>

                            {admin.nom} {admin.prenom}

                        </h2>


                        <span>

                            Administrateur

                        </span>


                    </div>



                </div>








                <div className="profile-info">



                    <div className="info-item">


                        <FaEnvelope/>


                        <div>

                            <label>Email</label>

                            <p>

                                {admin.email}

                            </p>

                        </div>


                    </div>







                    <div className="info-item">


                        <FaPhone/>


                        <div>

                            <label>Téléphone</label>

                            <p>

                                {admin.telephone}

                            </p>

                        </div>


                    </div>







                    <div className="info-item">


                        <FaUserShield/>


                        <div>

                            <label>Rôle</label>

                            <p>

                                {admin.role}

                            </p>

                        </div>


                    </div>







                    <div className="info-item">


                        <FaCalendarAlt/>


                        <div>

                            <label>Date inscription</label>


                            <p>

                            {
                            new Date(admin.date_inscription)
                            .toLocaleDateString()
                            }

                            </p>


                        </div>


                    </div>



                </div>








                <button

                className="btn-profile-edit"

                onClick={()=>setOpenModal(true)}

                >


                    <FaEdit/>

                    Modifier profil


                </button>





            </div>







            <AdminProfileModal


                open={openModal}


                close={()=>setOpenModal(false)}


                admin={admin}


                save={modifierProfil}


            />



        </div>

    );


}


export default ProfilAdmin;