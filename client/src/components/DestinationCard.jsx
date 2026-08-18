import { FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DestinationCard.css";


function DestinationCard({ destination }) {


    const navigate = useNavigate();



    return (


        <div className="destination-card">



            {/* IMAGE */}

            <div className="destination-image-box">


                {
                    destination.image ?


                    <img

                    src={`${import.meta.env.VITE_SERVER_URL}/uploads/${destination.image}`}

                    alt={destination.nom}

                    />


                    :


                    <div className="no-image">

                        Pas d'image

                    </div>

                }


            </div>






            {/* CONTENU */}


            <div className="destination-card-content">



                <h2>

                    {destination.nom}

                </h2>







                <div className="destination-location">


                    <FaMapMarkerAlt/>


                    <span>

                        {destination.region}, {destination.pays}

                    </span>


                </div>







                <p>


                    {

                    destination.description

                    ?

                    destination.description.length > 100

                    ?

                    destination.description.substring(0,100)+"..."

                    :

                    destination.description


                    :

                    "Aucune description"


                    }


                </p>







                <button


                type="button"


                onClick={()=>{


                    console.log(

                        "OUVERTURE DETAIL :",

                        destination

                    );



                    navigate(

                        `/destinations/${destination.id_destination}`

                    );


                }}


                >



                    <FaEye/>


                    Voir détails



                </button>






            </div>




        </div>


    );


}


export default DestinationCard;
