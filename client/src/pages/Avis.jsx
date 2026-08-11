import { useEffect, useState } from "react";

import {
    FaSearch,
    FaEllipsisV,
    FaEdit,
    FaTrash,
    FaTimes,
    FaCheck,
    FaTimesCircle
} from "react-icons/fa";

import api from "../api/api";

import "./Avis.css";


function Avis(){


const [avis,setAvis]=useState([]);

const [recherche,setRecherche]=useState("");

const [menuOuvert,setMenuOuvert]=useState(null);

const [modal,setModal]=useState(false);


const [form,setForm]=useState({

id_avis:"",
note:"",
commentaire:""

});






// ===============================
// CHARGER AVIS
// ===============================

useEffect(()=>{

chargerAvis();

},[]);





const chargerAvis = async () => {

try{

const res = await api.get("/avis/admin");

console.log("Avis admin :", res.data);

setAvis(res.data);

}
catch(error){

console.log("Erreur chargement avis :", error);

}

};









// ===============================
// MODIFICATION
// ===============================


const ouvrirModification=(item)=>{


setForm({

id_avis:item.id_avis,

note:item.note,

commentaire:item.commentaire

});


setModal(true);


setMenuOuvert(null);


};







const handleChange=(e)=>{


setForm({

...form,

[e.target.name]:e.target.value

});


};








const enregistrer=async(e)=>{


e.preventDefault();


try{


await api.put(

`/avis/${form.id_avis}`,

{

note:form.note,

commentaire:form.commentaire

}

);



setModal(false);


chargerAvis();



}catch(error){


console.log(error);


}



};









// ===============================
// SUPPRESSION
// ===============================


const supprimer=async(id)=>{


if(!window.confirm(

"Voulez-vous supprimer cet avis ?"

))

return;



try{


await api.delete(`/avis/${id}`);


chargerAvis();



}catch(error){

console.log(error);

}


};









// ===============================
// CHANGER STATUT
// ===============================


const changerStatut=async(id,statut)=>{


try{


await api.put(

`/avis/statut/${id}`,

{

statut:statut

}

);



chargerAvis();


setMenuOuvert(null);



}catch(error){

console.log(error);

}


};









// ===============================
// RECHERCHE
// ===============================


const avisFiltres=avis.filter((item)=>{


const texte=`

${item.nom}

${item.prenom}

${item.titre}

${item.commentaire}

${item.statut}

`.toLowerCase();



return texte.includes(

recherche.toLowerCase()

);



});









return(


<div className="avis-page">






<div className="avis-header">


<h1>

⭐ Gestion des avis

</h1>



<p>

Consulter et modérer les avis des touristes

</p>



</div>









<div className="toolbar">


<div className="search-box">


<FaSearch/>


<input


placeholder="Rechercher un avis..."


value={recherche}


onChange={(e)=>setRecherche(e.target.value)}


/>


</div>



</div>









<div className="avis-card">



<table>



<thead>


<tr>


<th>
Utilisateur
</th>


<th>
Offre
</th>


<th>
Note
</th>


<th>
Commentaire
</th>


<th>
Date
</th>


<th>
Statut
</th>


<th>
Action
</th>


</tr>


</thead>








<tbody>



{

avisFiltres.map((item)=>(



<tr key={item.id_avis}>


<td>

{item.nom} {item.prenom}

</td>





<td>

{item.titre}

</td>





<td>


<span className="stars">

{"⭐".repeat(item.note)}

</span>


</td>







<td>

{item.commentaire}

</td>







<td>


{new Date(item.date_avis)

.toLocaleDateString()}


</td>








<td>


<span

className={

`status ${

item.statut?.replace(" ","")

}`

}

>


{item.statut}


</span>


</td>









<td className="action-cell">



<button

className="dots"

onClick={()=>setMenuOuvert(

menuOuvert===item.id_avis

?

null

:

item.id_avis

)}


>


<FaEllipsisV/>


</button>









{

menuOuvert===item.id_avis &&



<div className="action-menu">





{

item.statut==="En attente" &&

<>


<button

className="publish"

onClick={()=>changerStatut(

item.id_avis,

"Publié"

)}

>

<FaCheck/>

Publier


</button>







<button

className="reject"

onClick={()=>changerStatut(

item.id_avis,

"Refusé"

)}

>


<FaTimesCircle/>

Refuser


</button>


</>


}







<button

onClick={()=>ouvrirModification(item)}

>


<FaEdit/>

Modifier


</button>







<button

className="delete"

onClick={()=>supprimer(item.id_avis)}

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









{/* MODAL MODIFICATION */}




{

modal &&



<div className="modal-overlay">



<div className="modal">



<button

className="close"

onClick={()=>setModal(false)}

>

<FaTimes/>

</button>






<h2>

Modifier un avis

</h2>






<form onSubmit={enregistrer}>


<select

name="note"

value={form.note}

onChange={handleChange}

required

>


<option value="">

Choisir note

</option>


<option value="1">

⭐

</option>


<option value="2">

⭐⭐

</option>


<option value="3">

⭐⭐⭐

</option>


<option value="4">

⭐⭐⭐⭐

</option>


<option value="5">

⭐⭐⭐⭐⭐

</option>


</select>







<textarea

name="commentaire"

value={form.commentaire}

onChange={handleChange}

placeholder="Modifier commentaire"

required

/>







<button

className="save"

>

Enregistrer

</button>





</form>






</div>


</div>



}







</div>



);


}


export default Avis;