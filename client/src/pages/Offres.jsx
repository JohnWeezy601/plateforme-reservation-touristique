import { useEffect, useState } from "react";
import api from "../api/api";
import "./Offres.css";


function Offres(){


const [offres,setOffres]=useState([]);

const [destinations,setDestinations]=useState([]);

const [categories,setCategories]=useState([]);

const [prestataires,setPrestataires]=useState([]);


const [modal,setModal]=useState(false);

const [menuOuvert,setMenuOuvert]=useState(null);


const [modeModification,setModeModification]=useState(false);

const [idModification,setIdModification]=useState(null);



const [image,setImage]=useState(null);



const [offre,setOffre]=useState({

id_prestataire:"",
id_destination:"",
id_categorie:"",
titre:"",
description:"",
prix:"",
capacite:"",
disponibilite:"",
date_debut:"",
date_fin:""

});





// =================================
// CHARGEMENT DONNEES
// =================================


const chargerDonnees=async()=>{


try{


const [
offresRes,
destinationsRes,
categoriesRes,
prestatairesRes

]=await Promise.all([


api.get("/offres"),

api.get("/destinations"),

api.get("/categories"),

api.get("/prestataires")


]);



setOffres(offresRes.data);

setDestinations(destinationsRes.data);

setCategories(categoriesRes.data);

setPrestataires(prestatairesRes.data);



}

catch(error){


console.log(
"Erreur chargement :",
error
);


}



};





useEffect(()=>{


chargerDonnees();


},[]);







// =================================
// CHANGEMENT INPUT
// =================================


const handleChange=(e)=>{


setOffre({

...offre,

[e.target.name]:e.target.value


});


};








// =================================
// IMAGE
// =================================


const handleImage=(e)=>{


setImage(e.target.files[0]);


};









// =================================
// RESET FORMULAIRE
// =================================


const resetForm=()=>{


setOffre({

id_prestataire:"",
id_destination:"",
id_categorie:"",
titre:"",
description:"",
prix:"",
capacite:"",
disponibilite:"",
date_debut:"",
date_fin:""

});


setImage(null);

setModeModification(false);

setIdModification(null);


};









// =================================
// OUVRIR AJOUT
// =================================


const ouvrirAjout=()=>{


resetForm();

setModal(true);


};









// =================================
// ENREGISTRER
// =================================


const enregistrerOffre=async()=>{


try{


const formData=new FormData();



Object.keys(offre).forEach((key)=>{


formData.append(

key,

offre[key]

);


});




if(image){

formData.append(
"image",
image
);

}





if(modeModification){



await api.put(

`/offres/${idModification}`,

formData,

{

headers:{

"Content-Type":"multipart/form-data"

}

}

);



alert(
"Offre modifiée avec succès"
);



}

else{



await api.post(

"/offres",

formData,

{

headers:{

"Content-Type":"multipart/form-data"

}

}

);



alert(
"Offre ajoutée avec succès"
);



}






// ACTUALISATION AUTOMATIQUE

await chargerDonnees();



resetForm();

setModal(false);



}

catch(error){


console.log(

"Erreur enregistrement :",

error.response?.data || error

);



alert(
"Erreur lors de l'enregistrement"
);


}



};









// =================================
// MODIFICATION
// =================================


const modifierOffre=(item)=>{


setOffre({


id_prestataire:item.id_prestataire,

id_destination:item.id_destination,

id_categorie:item.id_categorie,

titre:item.titre,

description:item.description,

prix:item.prix,

capacite:item.capacite,

disponibilite:item.disponibilite,

date_debut:item.date_debut?.substring(0,10),

date_fin:item.date_fin?.substring(0,10)


});



setIdModification(
item.id_offre
);



setModeModification(true);


setModal(true);



};








// =================================
// SUPPRESSION
// =================================


const supprimerOffre=async(id)=>{


if(!window.confirm(
"Supprimer cette offre ?"
))

return;



try{


await api.delete(

`/offres/${id}`

);



alert(
"Offre supprimée"
);



await chargerDonnees();



}


catch(error){


console.log(error);


alert(
"Erreur suppression"
);


}


};







return (

<div className="offres-admin">


<div className="offres-header">


<div>

<h1>
🎒 Gestion des offres
</h1>


<p>
Gérez vos séjours touristiques
</p>


</div>




<button

className="btn-add-offre"

onClick={ouvrirAjout}

>

+ Nouvelle offre

</button>


</div>






<div className="offres-list-card">


<h2>
Liste des offres publiées
</h2>



<div className="offres-admin-list">


{

offres.map((item)=>(


<div
className="offre-admin-card"
key={item.id_offre}
>


<img

src={
item.image
?
`http://localhost:8081/uploads/${item.image}`
:
"/image-default.jpg"
}

/>



{/* MENU SUR IMAGE */}

<div className="menu-offre">


<button

className="btn-menu-offre"

onClick={()=>setMenuOuvert(

menuOuvert === item.id_offre

?

null

:

item.id_offre

)}

>

⋮

</button>




{

menuOuvert === item.id_offre &&

<div className="menu-actions">


<button
onClick={()=>modifierOffre(item)}
>
✏ Modifier
</button>



<button
onClick={()=>supprimerOffre(item.id_offre)}
>
🗑 Supprimer
</button>


</div>


}


</div>





<div className="info-offre">


<h3>
{item.titre}
</h3>


<p>
📍 {item.destination}
</p>


<p>
🏷️ {item.categorie}
</p>


<p>
🏢 {item.prestataire}
</p>


<p>
💰 {item.prix} Ar
</p>



</div>


</div>


))


}


</div>


{/* ==========================
    MODALE AJOUT / MODIFICATION
========================== */}


{

modal &&


<div className="modal-overlay">


<div className="modal-offre">



<div className="modal-header">


<h2>

{

modeModification

?

"✏️ Modifier l'offre"

:

"➕ Nouvelle offre"

}

</h2>



<button

className="close-modal"

onClick={()=>{

setModal(false);

resetForm();

}}

>

✕

</button>



</div>







<div className="form-grid">



<input

type="text"

name="titre"

placeholder="Titre de l'offre"

value={offre.titre}

onChange={handleChange}

/>








<select

name="id_prestataire"

value={offre.id_prestataire}

onChange={handleChange}

>


<option value="">

Choisir un prestataire

</option>



{

prestataires.map((p)=>(


<option

key={p.id_prestataire}

value={p.id_prestataire}

>


{p.nom_entreprise}


</option>


))


}


</select>










<select

name="id_destination"

value={offre.id_destination}

onChange={handleChange}

>


<option value="">

Choisir une destination

</option>



{

destinations.map((d)=>(


<option

key={d.id_destination}

value={d.id_destination}

>

{d.nom}

</option>


))


}



</select>










<select

name="id_categorie"

value={offre.id_categorie}

onChange={handleChange}

>


<option value="">

Choisir une catégorie

</option>



{

categories.map((c)=>(


<option

key={c.id_categorie}

value={c.id_categorie}

>

{c.nom}

</option>


))


}



</select>










<input

type="number"

name="prix"

placeholder="Prix (Ar)"

value={offre.prix}

onChange={handleChange}

/>







<input

type="number"

name="capacite"

placeholder="Capacité"

value={offre.capacite}

onChange={handleChange}

/>








<input

type="number"

name="disponibilite"

placeholder="Disponibilité"

value={offre.disponibilite}

onChange={handleChange}

/>








<input

type="date"

name="date_debut"

value={offre.date_debut}

onChange={handleChange}

/>







<input

type="date"

name="date_fin"

value={offre.date_fin}

onChange={handleChange}

/>




</div>







<textarea

name="description"

placeholder="Description de l'offre"

value={offre.description}

onChange={handleChange}

rows="5"

/>








<div className="upload-zone">


<label>

📷 Image de l'offre

</label>



<input

type="file"

accept="image/*"

onChange={handleImage}

/>



{

image &&

<p>

{image.name}

</p>

}



</div>








<button

className="btn-save"

onClick={enregistrerOffre}

>


{

modeModification

?

"Enregistrer les modifications"

:

"Publier l'offre"

}



</button>






</div>


</div>


}



</div>

</div>
);

}



export default Offres;

