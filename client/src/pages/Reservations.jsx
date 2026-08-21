import { useEffect, useState } from "react";
import api from "../api/api";import {
    FaCheck,
    FaTrash,
    FaTimes,
    FaEllipsisV
} from "react-icons/fa";
import "./Reservations.css";


function Reservations(){


const [reservations,setReservations] = useState([]);
const [menuOuvert,setMenuOuvert] = useState(null);
const [recherche,setRecherche] = useState("");
const TEMPS_REFRESH = 5000;
const [page,setPage] = useState(1);
const nombreParPage = 5;


const reservationsFiltrees = reservations.filter((reservation)=>{

return (

reservation.nom?.toLowerCase().includes(recherche.toLowerCase())

||

reservation.prenom?.toLowerCase().includes(recherche.toLowerCase())

||

reservation.email?.toLowerCase().includes(recherche.toLowerCase())

||

reservation.titre?.toLowerCase().includes(recherche.toLowerCase())

);

});



const indexDernier = page * nombreParPage;
const indexPremier = indexDernier - nombreParPage;


const reservationsPage = reservationsFiltrees.slice(
    indexPremier,
    indexDernier
);


const nombrePages = Math.ceil(
    reservationsFiltrees.length / nombreParPage
);


const chargerReservations = async()=>{

try{

const res = await api.get("/reservations");

setReservations(res.data);


}
catch(error){

console.log(
"Erreur chargement réservations",
error
);

}

};

useEffect(()=>{

    // Chargement initial
    chargerReservations();


    // Rafraîchissement automatique
    const interval = setInterval(()=>{

        chargerReservations();

    }, TEMPS_REFRESH);


    // Nettoyage
    return ()=>{

        clearInterval(interval);

    };


},[]);


// ==============================
// URL IMAGE
// ==============================

const getImageUrl = (image) => {

    if (!image) {
        return null;
    }

    // Image déjà hébergée sur Cloudinary
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // Ancienne image locale
    return `${import.meta.env.VITE_SERVER_URL}/uploads/${image}`;

};


// ==============================
// Confirmer réservation
// ==============================


const confirmerReservation = async(id)=>{


try{


await api.put(

`/reservations/${id}`,

{

statut:"Confirmée"

}

);



// Actualisation automatique

chargerReservations();



}

catch(error){


console.log(

"Erreur confirmation réservation",

error

);


}


};



// ==============================
// Annuler réservation
// ==============================

const annulerReservation = async(id)=>{


try{


await api.put(

`/reservations/${id}`,

{

statut:"Annulée"

}

);



chargerReservations();



}

catch(error){


console.log(

"Erreur annulation réservation",

error

);


}



};






// ==============================
// Supprimer réservation
// ==============================


const supprimerReservation = async(id)=>{


const confirmation = window.confirm(

"Voulez-vous supprimer cette réservation ?"

);



if(!confirmation){

return;

}



try{


await api.delete(

`/reservations/${id}`

);




// suppression immédiate dans affichage

setReservations(

reservations.filter(

(reservation)=>

reservation.id_reservation !== id

)

);



}

catch(error){


console.log(

"Erreur suppression réservation",

error

);


}



};









// ==============================
// Classe couleur statut
// ==============================


const getStatutClass=(statut)=>{


if(statut==="Confirmée"){

return "confirmee";

}



if(statut==="Annulée"){

return "annulee";

}



return "attente";


};









return (


<div className="reservations-admin">







{/* HEADER */}


<div className="reservation-header">


<h1>
Gestion des réservations
</h1>


<p>
Suivez les demandes clients, les séjours réservés
et les paiements associés.
</p>


</div>









{/* STATISTIQUES */}


<div className="reservation-stats">



<div className="stat-card">


<div>

<h2>

{reservations.length}

</h2>


<p>
Total réservations
</p>


</div>


</div>







<div className="stat-card">


<div>

<h2>

{

reservations.filter(

r=>r.statut==="En attente"

).length

}

</h2>


<p>
En attente
</p>


</div>


</div>







<div className="stat-card">


<div>

<h2>

{

reservations.filter(

r=>r.statut==="Confirmée"

).length

}

</h2>


<p>
Confirmées
</p>


</div>


</div>




</div>













{/* TABLEAU */}

<div className="table-responsive">
<div className="reservation-table-card">


<div className="table-title">


<input

type="text"

placeholder="Rechercher une réservation..."

value={recherche}

onChange={(e)=>setRecherche(e.target.value)}

className="search-reservation"

/>


</div>







<table>


<thead>

<tr>


<th>ID</th>

<th>Client</th>

<th>Offre</th>

<th>Date</th>

<th>Personnes</th>

<th>Montant</th>

<th>Statut</th>

<th>Actions</th>


</tr>


</thead>







<tbody>





{

reservations.length===0 ?



<tr>

<td colSpan="8">


<div className="empty">


<p>
Aucune réservation disponible
</p>


</div>


</td>


</tr>





:



reservationsPage.map((reservation)=>(



<tr key={reservation.id_reservation}>







<td>


<strong>

#{reservation.id_reservation}

</strong>


</td>









<td>


<div className="client">


<div className="avatar">


{

reservation.nom?.charAt(0)

}


</div>





<div>


<strong>

{reservation.nom}

{" "}

{reservation.prenom}

</strong>



<br/>


<span>

{reservation.email}

</span>


</div>



</div>


</td>









<td>


<div className="offre-info">



{

reservation.image &&


<img

src={getImageUrl(reservation.image)}

alt={reservation.titre}

/>

}



<div>


<strong>

{reservation.titre}

</strong>



<br/>


<span>

    {
        Number(reservation.prix)
            .toLocaleString("fr-FR")
    }

    {" "}€

</span>


</div>


</div>


</td>









<td>


{

new Date(

reservation.date_reservation

)

.toLocaleDateString("fr-FR")


}


</td>









<td>


{reservation.nombre_personnes}


</td>









<td>


<strong className="money">

    {
        Number(
            reservation.montant_total
        )
        .toLocaleString("fr-FR")
    }

    {" "}€

</strong>


</td>









<td>


<span

className={

`statut ${getStatutClass(reservation.statut)}`

}


>


{reservation.statut}


</span>


</td>









<td className="actions">


<button

className="menu-btn"

onClick={()=>


setMenuOuvert(

menuOuvert === reservation.id_reservation

? null

: reservation.id_reservation

)


}

>

<FaEllipsisV/>

</button>





{

menuOuvert === reservation.id_reservation &&


<div className="action-menu">


<button

onClick={()=>{


confirmerReservation(

reservation.id_reservation

);


setMenuOuvert(null);


}}

disabled={reservation.statut==="Confirmée"}

>


<FaCheck/>

Confirmer

</button>





<button

onClick={()=>{


annulerReservation(

reservation.id_reservation

);


setMenuOuvert(null);


}}

disabled={reservation.statut==="Annulée"}

>


<FaTimes/>

Annuler

</button>







<button

onClick={()=>{


supprimerReservation(

reservation.id_reservation

);


setMenuOuvert(null);


}}

>


<FaTrash/>

Supprimer

</button>



</div>


}



</td>







</tr>



))


}



</tbody>



</table>
</div>

<div className="pagination">


<button

disabled={page===1}

onClick={()=>setPage(page-1)}

>
←
</button>



{

Array.from(
{length:nombrePages},
(_,index)=>(

<button

key={index}

className={
page===index+1
?
"active-page"
:
""
}

onClick={()=>setPage(index+1)}

>

{index+1}

</button>

)

)

}



<button

disabled={page===nombrePages}

onClick={()=>setPage(page+1)}

>
→
</button>


</div>







</div>







</div>


);


}



export default Reservations;
