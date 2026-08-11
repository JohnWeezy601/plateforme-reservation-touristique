import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import {
    Autoplay,
    Navigation,
    Pagination
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./OffresPublic.css";


function OffresPublic(){


    const [offres,setOffres] = useState([]);

    const navigate = useNavigate();




    useEffect(()=>{


        const chargerOffres = async()=>{


            try{


                const res = await api.get("/offres");

                setOffres(res.data);


            }

            catch(error){

                console.log(
                    "Erreur chargement offres",
                    error
                );

            }


        };


        chargerOffres();


    },[]);







    const reserver=(id)=>{


        const utilisateur =
        localStorage.getItem("utilisateur");



        if(utilisateur){


            navigate(
                `/reservation-public/${id}`
            );


        }

        else{


            navigate(
                `/login-client?redirect=/reservation-public/${id}`
            );


        }


    };






    return(


        <div className="offres-public">



            <h1>
                Nos offres touristiques
            </h1>



            <p className="intro">

                Découvrez nos meilleurs séjours et destinations.

            </p>






            {

            offres.length > 0 &&



            <Swiper


                modules={[
                    Autoplay,
                    Navigation,
                    Pagination
                ]}


                spaceBetween={25}


                slidesPerView={3}



                navigation



                pagination={{
                    clickable:true
                }}



                autoplay={{

                    delay:2500,

                    disableOnInteraction:false

                }}



                speed={800}



                loop={true}



                className="offres-slider"



                breakpoints={{

                    0:{
                        slidesPerView:1
                    },


                    768:{
                        slidesPerView:2
                    },


                    1200:{
                        slidesPerView:3
                    }

                }}



            >




            {

            offres.map((offre)=>(



                <SwiperSlide

                key={offre.id_offre}

                >



                <div className="offre-card">



                    <img

                    src={

                    offre.image

                    ?

                    `http://localhost:8081/uploads/${offre.image}`

                    :

                    "/image-default.jpg"

                    }


                    alt={offre.titre}

                    />





                    <div className="offre-content">



                        <h2>

                            {offre.titre}

                        </h2>




                        <p>

                            📍 {offre.destination}

                        </p>





                        <p className="description">

                            {offre.description}

                        </p>





                        <h3>

                            💰 {

                            Number(offre.prix)

                            .toLocaleString("fr-FR")

                            }

                            Ar

                        </h3>






                        <button

                        onClick={()=>reserver(offre.id_offre)}

                        >

                            Réserver

                        </button>





                    </div>





                </div>



                </SwiperSlide>



            ))


            }



            </Swiper>


            }



        </div>


    );


}


export default OffresPublic;