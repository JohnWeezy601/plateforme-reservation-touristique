import { useEffect, useState } from "react";

import api from "../api/api";

import DestinationCard from "../components/DestinationCard";

import "./DestinationsPublic.css";



function DestinationsPublic(){


    const [destinations,setDestinations] = useState([]);





    // ==========================
    // Charger destinations
    // ==========================

    const chargerDestinations = async()=>{


        try{


            const res = await api.get("/destinations");



            console.log(

                "DESTINATIONS PUBLIC :",

                res.data

            );



            setDestinations(res.data);



        }

        catch(error){


            console.log(

                "Erreur chargement destinations :",

                error

            );


        }


    };







    useEffect(()=>{


        chargerDestinations();


    },[]);









    return(


        <div className="destination-public-container">






            <div className="destination-public-header">



                <h1>

                    Découvrez nos destinations

                </h1>



                <p>

                    Explorez les plus belles destinations touristiques de Madagascar.

                </p>



            </div>









            <div className="destination-grid">



                {


                destinations.map((destination)=>(



                    <DestinationCard



                    key={

                        destination.id_destination

                    }



                    destination={destination}



                    />



                ))



                }



            </div>







        </div>


    );


}



export default DestinationsPublic;