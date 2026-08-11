import { 
    FaTimes, 
    FaMapMarkerAlt, 
    FaGlobeAfrica 
} from "react-icons/fa";

import "./DestinationDetailsModal.css";


function DestinationDetailsModal({

    open,

    close,

    destination

}) {


    if(!open || !destination)
        return null;



    return(


        <div className="detail-overlay">



            <div className="detail-modal">





                {/* IMAGE */}

                <div className="detail-image-container">


                    {

                    destination.image ?


                    <img

                    src={
                    `http://localhost:8081/uploads/${destination.image}`
                    }

                    alt={
                    destination.nom
                    }

                    />


                    :


                    <p>

                    Aucune image disponible

                    </p>


                    }



                </div>








                {/* CONTENU */}


                <div className="detail-content">





                    <h2>

                        {destination.nom}

                    </h2>







                    <div className="detail-info">



                        <div className="detail-item">


                            <FaMapMarkerAlt/>


                            <span>


                            <strong>
                            Région :
                            </strong>

                            {" "}

                            {destination.region}


                            </span>



                        </div>








                        <div className="detail-item">


                            <FaGlobeAfrica/>


                            <span>


                            <strong>
                            Pays :
                            </strong>

                            {" "}

                            {destination.pays}


                            </span>



                        </div>



                    </div>









                    {/* DESCRIPTION */}



                    <div className="detail-description">


                        <h3>

                        Description

                        </h3>



                        <p>


                        {

                        destination.description

                        ?

                        destination.description

                        :

                        "Aucune description disponible"

                        }


                        </p>



                    </div>





                </div>










                {/* FOOTER */}



                <div className="detail-footer">



                    <button

                    className="btn-close-detail"

                    onClick={close}

                    >


                        <FaTimes/>

                        Fermer


                    </button>



                </div>






            </div>




        </div>



    );


}



export default DestinationDetailsModal;