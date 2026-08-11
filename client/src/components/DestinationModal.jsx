import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaImage } from "react-icons/fa";
import api from "../api/api";
import "./DestinationModal.css";


function DestinationModal({
    open,
    close,
    destination,
    refresh
}) {


    const [imagePreview, setImagePreview] = useState(null);

    const [loading,setLoading] = useState(false);



    useEffect(()=>{


        if(destination?.image){


            setImagePreview(
                `http://localhost:8081/uploads/${destination.image}`
            );


        }
        else{


            setImagePreview(null);


        }


    },[destination]);





    if(!open)
        return null;






    const sauvegarder = async(e)=>{


        e.preventDefault();


        if(loading)
            return;



        setLoading(true);



        const form = e.target;


        const formData = new FormData();




        formData.append(
            "nom",
            form.nom.value
        );


        formData.append(
            "region",
            form.region.value
        );


        formData.append(
            "pays",
            form.pays.value
        );


        formData.append(
            "description",
            form.description.value
        );





        if(destination?.image){


            formData.append(
                "oldImage",
                destination.image
            );


        }





        if(form.image.files[0]){


            formData.append(
                "image",
                form.image.files[0]
            );


        }







        try{


            let response;



            if(destination){



                response = await api.put(

                    `/destinations/${destination.id_destination}`,

                    formData,

                    {

                        headers:{

                            "Content-Type":
                            "multipart/form-data"

                        }

                    }

                );



            }
            else{



                response = await api.post(

                    "/destinations",

                    formData,

                    {

                        headers:{

                            "Content-Type":
                            "multipart/form-data"

                        }

                    }

                );



            }







            console.log(

                "REPONSE BACKEND :",

                response.data

            );






            alert(

                response.data.message

            );






            // fermer modal

            close();



            // recharger tableau

            await refresh();




        }


        catch(error){



            console.log(

                "Erreur destination :",

                error.response?.data || error

            );



            alert(

                error.response?.data?.message ||

                "Erreur lors de l'opération"

            );


        }


        finally{


            setLoading(false);


        }



    };











    return(


        <div className="modal-overlay">


            <div className="modal-box">





                <div className="modal-header">


                    <h2>


                    {

                        destination

                        ?

                        "Modifier destination"

                        :

                        "Ajouter destination"


                    }


                    </h2>




                    <button

                    type="button"

                    onClick={close}

                    >


                        <FaTimes/>


                    </button>



                </div>









                <form onSubmit={sauvegarder}>


                    <label>
                        Nom destination
                    </label>


                    <input

                    name="nom"

                    placeholder="Ex: Nosy Be"

                    defaultValue={
                        destination?.nom || ""
                    }

                    required

                    />








                    <label>
                        Région
                    </label>


                    <input

                    name="region"

                    placeholder="Ex: Diana"

                    defaultValue={
                        destination?.region || ""
                    }

                    />









                    <label>
                        Pays
                    </label>


                    <input

                    name="pays"

                    placeholder="Ex: Madagascar"

                    defaultValue={
                        destination?.pays || ""
                    }

                    />










                    <label>
                        Description
                    </label>


                    <textarea

                    name="description"

                    placeholder="Description destination"

                    defaultValue={
                        destination?.description || ""
                    }

                    />









                    <label>

                        <FaImage/>

                        Image destination

                    </label>





                    <input

                    type="file"

                    name="image"

                    accept="image/*"


                    onChange={(e)=>{


                        const fichier =
                        e.target.files[0];



                        if(fichier){


                            setImagePreview(

                                URL.createObjectURL(fichier)

                            );


                        }


                    }}


                    />









                    {

                    imagePreview &&


                    <div className="image-preview">


                        <img

                        src={imagePreview}

                        alt="Aperçu destination"

                        className="preview-img"

                        />


                    </div>


                    }









                    <button

                    className="btn-save"

                    type="submit"

                    disabled={loading}

                    >



                        <FaSave/>


                        {

                        loading

                        ?

                        "Enregistrement..."

                        :

                        "Enregistrer"

                        }



                    </button>







                </form>







            </div>



        </div>


    );



}


export default DestinationModal;