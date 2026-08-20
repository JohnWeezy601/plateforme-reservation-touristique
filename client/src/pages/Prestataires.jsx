import { useEffect, useState } from "react";
import api from "../api/api";
import "./Prestataires.css";
import PrestataireDetailsModal from "../components/PrestataireDetailsModal";

import PrestataireModal from "../components/PrestataireModal";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaBuilding,
    FaEllipsisV,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaCheck,
    FaTimes
} from "react-icons/fa";


function Prestataires(){


const [prestataires,setPrestataires]=useState([]);

const [utilisateurs,setUtilisateurs]=useState([]);

const [recherche,setRecherche]=useState("");

const [openModal,setOpenModal]=useState(false);

const [selectedPrestataire,setSelectedPrestataire]=useState(null);


// MENU ACTION

const [menuOuvert,setMenuOuvert]=useState(null);

const [detailPrestataire,setDetailPrestataire]=useState(null);


// PAGINATION

const [page,setPage]=useState(1);

const elementsParPage=5;





// ==========================
// Charger prestataires
// ==========================

const chargerPrestataires=async()=>{

try{

const res=await api.get("/prestataires");


console.log("RESULTAT API PRESTATAIRES :", res.data);


setPrestataires(res.data);


}
catch(error){

console.log("ERREUR API PRESTATAIRES :", error);

}

};




// ==========================
// Charger utilisateurs
// ==========================

const chargerUtilisateurs=async()=>{

try{


const res=await api.get("/utilisateurs");


const data=res.data.filter(

(u)=>u.role==="Prestataire"

);


setUtilisateurs(data);


}
catch(error){

console.log(error);

}


};



useEffect(()=>{


chargerPrestataires();

chargerUtilisateurs();



const fermerMenu = (e)=>{


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


if(!window.confirm(
"Voulez-vous supprimer ce prestataire ?"
))
return;



try{


await api.delete(
`/prestataires/${id}`
);



alert("Prestataire supprimé");


chargerPrestataires();


}
catch(error){


console.log(error);


alert("Erreur suppression");


}


};





const changerStatut = async(id, statut)=>{

try{


const prestataire = prestataires.find(
(p)=>p.id_prestataire===id
);


if(!prestataire){

alert("Prestataire introuvable");

return;

}



await api.put(

`/prestataires/${id}`,

{

nom_entreprise:prestataire.nom_entreprise,

description:prestataire.description,

adresse:prestataire.adresse,

ville:prestataire.ville,

telephone:prestataire.telephone,

email:prestataire.email,

statut:statut

}

);



alert(
`Prestataire ${statut}`
);



chargerPrestataires();


}

catch(error){


console.log(error);


alert(
"Erreur changement statut"
);


}


};



// ==========================
// Ajouter Modifier
// ==========================


const sauvegarder=async(e)=>{


e.preventDefault();



const data={


id_utilisateur:
e.target.id_utilisateur.value,


nom_entreprise:
e.target.nom_entreprise.value,


description:
e.target.description.value,


adresse:
e.target.adresse.value,


ville:
e.target.ville.value,


telephone:
e.target.telephone.value,


email:
e.target.email.value,


statut:
e.target.statut.value



};





try{


if(selectedPrestataire){


await api.put(

`/prestataires/${selectedPrestataire.id_prestataire}`,

data

);


alert("Prestataire modifié");


}

else{


await api.post(

"/prestataires",

data

);


alert("Prestataire ajouté");


}





setOpenModal(false);


setSelectedPrestataire(null);



chargerPrestataires();



}
catch(error){


console.log(error);


alert("Erreur opération");


}



};









// ==========================
// Recherche
// ==========================


const filtres=prestataires.filter((p)=>


p.nom_entreprise

.toLowerCase()

.includes(
recherche.toLowerCase()
)


||


(p.ville || "")

.toLowerCase()

.includes(
recherche.toLowerCase()
)


);









// ==========================
// Pagination
// ==========================


const indexDernier = page * elementsParPage;


const indexPremier = indexDernier - elementsParPage;



const prestatairesAffiches = filtres.slice(

indexPremier,

indexDernier

);



const nombrePages = Math.ceil(

filtres.length / elementsParPage

);





return(


<div className="prestataire-container">






<div className="prestataire-header">


<div>


<h1>

<FaBuilding/>

Gestion des prestataires

</h1>


<p>
Gérer les hôtels et agences touristiques.
</p>


</div>





<button

className="btn-add"

onClick={(e)=>{

e.stopPropagation();


setSelectedPrestataire(null);

setOpenModal(true);


}}

>


<FaPlus/>


</button>



</div>









<div className="search-box">


<FaSearch/>


<input


placeholder="Rechercher..."


value={recherche}


onChange={(e)=>{


setRecherche(e.target.value);


setPage(1);


}}




/>


</div>







<div className="table-responsive">

<div className="table-container">



<table>



<thead>


<tr>


<th>ID</th>

<th>Entreprise</th>

<th>Ville</th>

<th>Téléphone</th>

<th>Email</th>

<th>Statut</th>

<th>Actions</th>


</tr>


</thead>





<tbody>



{


prestatairesAffiches.map((p)=>(



<tr key={p.id_prestataire}>


<td>
{p.id_prestataire}
</td>



<td>
{p.nom_entreprise}
</td>



<td>
{p.ville}
</td>



<td>
{p.telephone}
</td>



<td>
{p.email}
</td>




<td>

<span 
className={`statut ${
p.statut === "Validé"
? "valide"
:
p.statut === "Refusé"
? "refuse"
:
"attente"
}`}
>

{p.statut}

</span>

</td>






<td>



<div className="menu-action">


<button

className="btn-menu"

onClick={(e)=>{

e.stopPropagation();


if(menuOuvert===p.id_prestataire){

setMenuOuvert(null);

}
else{

setMenuOuvert(
p.id_prestataire
);

}

}}

>


<FaEllipsisV/>


</button>








{

menuOuvert===p.id_prestataire &&

<div

className="menu-content"

onClick={(e)=>e.stopPropagation()}

>

<button

onClick={()=>{

setDetailPrestataire(p);

setMenuOuvert(null);

}}

>

<FaEye/>

Voir détails

</button>




{

p.statut?.trim()==="En attente" &&

<>


<button

onClick={()=>{


changerStatut(

p.id_prestataire,

"Validé"

);


setMenuOuvert(null);


}}

>

<FaCheck/>

Valider

</button>





<button

onClick={()=>{


changerStatut(

p.id_prestataire,

"Refusé"

);


setMenuOuvert(null);


}}

>

<FaTimes/>

Refuser

</button>


</>

}





<button

onClick={(e)=>{

e.stopPropagation();

setSelectedPrestataire(p);


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

p.id_prestataire

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
</div>








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








<PrestataireModal


open={openModal}


close={()=>{


setOpenModal(false);


setSelectedPrestataire(null);



}}



prestataire={selectedPrestataire}


utilisateurs={utilisateurs}


save={sauvegarder}



/>


<PrestataireDetailsModal


open={detailPrestataire !== null}


close={()=>setDetailPrestataire(null)}


prestataire={detailPrestataire}



/>







</div>


);


}



export default Prestataires;