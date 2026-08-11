import { useEffect, useState } from "react";
import api from "../api/api";
import "./Destinations.css";

import DestinationModal from "../components/DestinationModal";
import DestinationDetailsModal from "../components/DestinationDetailsModal";

import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye,
    FaEllipsisV,
    FaChevronLeft,
    FaChevronRight,
    FaMapMarkerAlt
} from "react-icons/fa";



function Destinations(){



const [destinations,setDestinations]=useState([]);

const [recherche,setRecherche]=useState("");

const [openModal,setOpenModal]=useState(false);

const [selectedDestination,setSelectedDestination]=useState(null);

const [detailDestination,setDetailDestination]=useState(null);

const [menuOuvert,setMenuOuvert]=useState(null);

const [page,setPage]=useState(1);


const elementsParPage=5;




// ==========================
// Charger destinations
// ==========================

const chargerDestinations=async()=>{


try{


const res=await api.get("/destinations");


console.log(
"DESTINATIONS :",
res.data
);



setDestinations(res.data);



}
catch(error){


console.log(
"Erreur chargement destinations",
error
);


}


};




// ==========================
// Initialisation
// ==========================

useEffect(()=>{


chargerDestinations();



const fermerMenu=(e)=>{


if(!e.target.closest(".menu-action")){


setMenuOuvert(null);


}


};



document.addEventListener(
"click",
fermerMenu
);



return()=>{


document.removeEventListener(
"click",
fermerMenu
);


};



},[]);







// ==========================
// Supprimer
// ==========================


const supprimer=async(id)=>{


if(
!window.confirm(
"Voulez-vous supprimer cette destination ?"
)
)
return;



try{


const res=await api.delete(
`/destinations/${id}`
);



alert(
res.data.message
);



chargerDestinations();



}
catch(error){


console.log(
"Erreur suppression :",
error
);


alert(
"Erreur suppression destination"
);


}



};








// ==========================
// Recherche
// ==========================


const filtres=destinations.filter((d)=>


d.nom
.toLowerCase()
.includes(
recherche.toLowerCase()
)

||

(d.region || "")
.toLowerCase()
.includes(
recherche.toLowerCase()
)

||

(d.pays || "")
.toLowerCase()
.includes(
recherche.toLowerCase()
)



);






// ==========================
// Pagination
// ==========================


const indexDernier =
page * elementsParPage;


const indexPremier =
indexDernier - elementsParPage;



const destinationsAffichees =
filtres.slice(
indexPremier,
indexDernier
);



const nombrePages =
Math.ceil(
filtres.length / elementsParPage
);







return(



<div className="destination-container">







{/* HEADER */}


<div className="destination-header">


<div>


<h1>

<FaMapMarkerAlt/>

Gestion des destinations

</h1>


<p>
Gérer les destinations touristiques.
</p>


</div>





<button

className="btn-add"

onClick={()=>{


setSelectedDestination(null);

setOpenModal(true);


}}

>


<FaPlus/>


</button>



</div>









{/* RECHERCHE */}



<div className="search-box">


<FaSearch/>


<input


placeholder="Rechercher une destination..."


value={recherche}


onChange={(e)=>{


setRecherche(
e.target.value
);


setPage(1);


}}


/>



</div>









{/* TABLEAU */}



<div className="table-container">



<table>



<thead>


<tr>


<th>ID</th>

<th>Image</th>

<th>Nom</th>

<th>Région</th>

<th>Pays</th>

<th>Description</th>

<th>Actions</th>


</tr>


</thead>






<tbody>



{

destinationsAffichees.map((d)=>(



<tr key={d.id_destination}>


<td>

{d.id_destination}

</td>






<td>



{

d.image ?


<img


src={
`http://localhost:8081/uploads/${d.image}`
}


className="destination-image"


alt="destination"

/>


:


"Pas d'image"


}



</td>








<td>

{d.nom}

</td>






<td>

{d.region}

</td>






<td>

{d.pays}

</td>






<td>


{

d.description

?

d.description.substring(0,50)+"..."

:

"Aucune description"


}



</td>








<td>



<div className="menu-action">





<button


className="btn-menu"


onClick={(e)=>{


e.stopPropagation();



setMenuOuvert(

menuOuvert===d.id_destination

?

null

:

d.id_destination

);


}}



>


<FaEllipsisV/>


</button>







{

menuOuvert===d.id_destination &&



<div

className="menu-content"

onClick={(e)=>e.stopPropagation()}


>






<button


onClick={()=>{


setDetailDestination(d);

setMenuOuvert(null);


}}


>


<FaEye/>

Voir détails


</button>








<button


onClick={()=>{


setSelectedDestination(d);


setOpenModal(true);


setMenuOuvert(null);


}}


>


<FaEdit/>

Modifier


</button>









<button


onClick={()=>{


supprimer(
d.id_destination
);


setMenuOuvert(null);


}}



>


<FaTrash/>

Supprimer


</button>







</div>



}





</div>




</td>






</tr>


))



}



</tbody>



</table>



</div>









{/* PAGINATION */}



<div className="pagination">






<button


disabled={page===1}


onClick={()=>setPage(page-1)}


>


<FaChevronLeft/>


</button>








{


Array.from(

{length:nombrePages},

(_,i)=>(


<button


key={i}


className={

page===i+1

?

"active-page"

:

""

}


onClick={()=>setPage(i+1)}


>


{i+1}


</button>


)


)



}







<button


disabled={page===nombrePages}


onClick={()=>setPage(page+1)}


>


<FaChevronRight/>


</button>





</div>









{/* MODALE AJOUT / MODIFICATION */}



<DestinationModal



open={openModal}



close={()=>{


setOpenModal(false);


setSelectedDestination(null);


}}



destination={selectedDestination}



refresh={chargerDestinations}


/>









{/* MODALE DETAILS */}



<DestinationDetailsModal



open={
detailDestination !== null
}



close={()=>{


setDetailDestination(null);


}}



destination={detailDestination}


/>









</div>




);



}



export default Destinations;