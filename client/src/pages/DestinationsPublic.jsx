import { useEffect, useState } from "react";

import api from "../api/api";

import DestinationCard from "../components/DestinationCard";

import "./DestinationsPublic.css";



function DestinationsPublic() {


    const [destinations, setDestinations] = useState([]);




    // ==========================
    // URL IMAGE
    // ==========================

    const getImageUrl = (image) => {

        if (!image) {

            return "/image-default.jpg";

        }

        // Image Cloudinary
        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }

        // Anciennes images locales
        return `${import.meta.env.VITE_SERVER_URL}/uploads/${image}`;

    };




    // ==========================
    // Charger destinations
    // ==========================

    const chargerDestinations = async () => {


        try {


            const res =
                await api.get("/destinations");



            console.log(
                "DESTINATIONS PUBLIC :",
                res.data
            );



            // =================================================
            // Préparer les images
            // =================================================

            const destinationsAvecImages =
                Array.isArray(res.data)
                    ? res.data.map((destination) => ({

                        ...destination,

                        imageUrl:
                            getImageUrl(
                                destination.image
                            )

                    }))
                    : [];



            setDestinations(
                destinationsAvecImages
            );


        }

        catch (error) {


            console.log(
                "Erreur chargement destinations :",
                error
            );


        }


    };




    useEffect(() => {


        chargerDestinations();


    }, []);






    return (


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

                    destinations.map(
                        (destination) => (



                            <DestinationCard


                                key={
                                    destination.id_destination
                                }


                                destination={
                                    destination
                                }


                            />



                        )
                    )

                }



            </div>





        </div>


    );


}



export default DestinationsPublic;