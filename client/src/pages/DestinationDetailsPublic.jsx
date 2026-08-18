import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { Swiper, SwiperSlide } from "swiper/react";

import {
    Autoplay,
    Navigation,
    Pagination
} from "swiper/modules";


import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import api from "../api/api";

import "./DestinationDetailsPublic.css";


function DestinationDetailsPublic(){


const {id}=useParams();

const navigate = useNavigate();



const [destination,setDestination]=useState(null);

const [autresDestinations,setAutresDestinations]=useState([]);

const [offres,setOffres]=useState([]);
const [offresOuvertes,setOffresOuvertes]=useState({});

const formatPrixEuro = (prix) => {

    if (
        prix === null ||
        prix === undefined ||
        prix === ""
    ) {
        return "Prix sur demande";
    }

    return Number(prix).toLocaleString(
        "fr-FR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

};




// ==============================
// Charger destination
// ==============================

const chargerDestination=async()=>{


try{


const res=await api.get(

`/destinations/${id}`

);


setDestination(res.data);


}

catch(error){

console.log(
"Erreur détail destination :",
error
);

}


};





// ==============================
// Charger offres destination
// ==============================


const chargerOffres=async()=>{


try{


const res=await api.get(

`/destinations/${id}/offres`

);



console.log(
"OFFRES DESTINATION :",
res.data
);



setOffres(res.data);



}

catch(error){


console.log(

"Erreur chargement offres :",

error

);


}



};






// ==============================
// Charger autres destinations
// ==============================


const chargerAutres=async()=>{


try{


const res=await api.get(

"/destinations"

);



const autres=res.data.filter(

(d)=>d.id_destination !== Number(id)

);



setAutresDestinations(autres);



}

catch(error){

console.log(error);

}



};







useEffect(()=>{


chargerDestination();

chargerAutres();

chargerOffres();


},[id]);








if(!destination){


return(

<h2 className="loading-detail">

Chargement...

</h2>

);


}







return(


<div className="destination-detail-page">





<div className="destination-detail-main">





<img

src={
`${import.meta.env.VITE_SERVER_URL}/uploads/${destination.image}`
}

alt={destination.nom}

className="detail-main-image"

/>





<h1>

{destination.nom}

</h1>






<div className="detail-info-location">


<FaMapMarkerAlt/>


{destination.region},

{destination.pays}


</div>







<p className="detail-description">


{destination.description}


</p>







<div className="detail-map">


<MapContainer

center={[

Number(destination.latitude),

Number(destination.longitude)

]}

zoom={12}

style={{

height:"100%",

width:"100%"

}}

>


<TileLayer

url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

/>



<Marker

position={[

Number(destination.latitude),

Number(destination.longitude)

]}

>


<Popup>

{destination.nom}

</Popup>


</Marker>



</MapContainer>



</div>









{/* =====================
OFFRES DISPONIBLES
===================== */}


<div className="offers-section">


<h2>

Nos offres disponibles

</h2>




{

offres.length === 0 ?


<p>

Aucune offre disponible pour cette destination.

</p>



:



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

delay:3000,

disableOnInteraction:false

}}




speed={800}




loop={true}





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



<div className="offer-card">





<img

src={

offre.image

?

`${import.meta.env.VITE_SERVER_URL}/uploads/${offre.image}`

:

"/image-default.jpg"

}


alt={offre.titre}


/>






<div className="offer-content">





<h3>

{offre.titre}

</h3>





<div className="offer-description-wrapper">

    <p
        className={
            offresOuvertes[offre.id_offre]
                ? "offer-description"
                : "offer-description offer-description-limitee"
        }
    >
        {offre.description}
    </p>

    {offre.description &&
        offre.description.length > 120 && (

            <span
                className="offer-voir-plus"
                onClick={() =>
                    setOffresOuvertes({
                        ...offresOuvertes,
                        [offre.id_offre]:
                            !offresOuvertes[offre.id_offre]
                    })
                }
            >
                {offresOuvertes[offre.id_offre]
                    ? "Voir moins"
                    : "Voir plus"}
            </span>

        )}

</div>







<p>

🏨

<strong>

{offre.prestataire}

</strong>

</p>






<h3>

    💰 {formatPrixEuro(offre.prix)} €

</h3>








<button


onClick={()=>{


const utilisateur =

localStorage.getItem("utilisateur");



if(utilisateur){


navigate(

`/reservation-public/${offre.id_offre}`

);


}

else{


navigate(

`/login-client?redirect=/reservation-public/${offre.id_offre}`

);


}



}}



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




</div>









<div className="other-destinations">



<h2>

Autres destinations

</h2>





{

autresDestinations.map((d)=>(



<div

className="small-destination-card"

key={d.id_destination}

onClick={()=>navigate(
    `/destinations/${d.id_destination}`
)}

>


<img

src={
`${import.meta.env.VITE_SERVER_URL}/uploads/${d.image}`
}

/>



<div>

<h3>

{d.nom}

</h3>


<p>

{d.region}

</p>


</div>


</div>



))


}



</div>







</div>


);



}


export default DestinationDetailsPublic;
