import { useEffect, useState } from "react";
import api from "../api/api";
import "./Categories.css";


function Categories(){


const [categories,setCategories]=useState([]);

const [showForm,setShowForm]=useState(false);

const [menuOuvert,setMenuOuvert]=useState(null);


const [categorie,setCategorie]=useState({

nom:"",
description:""

});


const [modifier,setModifier]=useState(false);

const [idModifier,setIdModifier]=useState(null);



const [recherche,setRecherche]=useState("");

const [page,setPage]=useState(1);

const categoriesParPage=5;



const [showDelete,setShowDelete]=useState(false);

const [idSupprimer,setIdSupprimer]=useState(null);





// =============================
// Charger catégories
// =============================


const chargerCategories=async()=>{


try{


const res=await api.get("/categories");


setCategories(res.data);



}

catch(error){


console.log(
"Erreur chargement catégories",
error
);


}



};



useEffect(()=>{


chargerCategories();


},[]);








// =============================
// Changement formulaire
// =============================


const handleChange=(e)=>{


setCategorie({

...categorie,

[e.target.name]:e.target.value

});


};









// =============================
// Ajouter / Modifier
// =============================


const enregistrerCategorie=async()=>{


try{


if(modifier){


await api.put(

`/categories/${idModifier}`,

categorie

);


alert(
"Catégorie modifiée avec succès"
);



}

else{


await api.post(

"/categories",

categorie

);


alert(
"Catégorie ajoutée avec succès"
);


}



setCategorie({

nom:"",
description:""

});


setModifier(false);

setIdModifier(null);

setShowForm(false);


chargerCategories();


}


catch(error){


console.log(error);


alert(
"Erreur opération catégorie"
);


}



};









// =============================
// Modifier
// =============================


const modifierCategorie=(item)=>{


setCategorie({

nom:item.nom,

description:item.description || ""

});


setModifier(true);

setIdModifier(
item.id_categorie
);


setShowForm(true);

setMenuOuvert(null);



};










// =============================
// Supprimer
// =============================


const supprimerCategorie=async(id)=>{


try{


await api.delete(

`/categories/${id}`

);



alert(
"Catégorie supprimée"
);



chargerCategories();


}

catch(error){


console.log(error);


alert(
"Impossible de supprimer la catégorie"
);



}



};









// =============================
// Recherche
// =============================


const categoriesFiltrees = categories.filter((item)=>

item.nom
.toLowerCase()
.includes(
recherche.toLowerCase()
)

);






// =============================
// Pagination
// =============================


const indexDernier =
page * categoriesParPage;


const indexPremier =
indexDernier - categoriesParPage;



const categoriesAffichees =
categoriesFiltrees.slice(

indexPremier,

indexDernier

);





const nombrePages =
Math.ceil(

categoriesFiltrees.length /

categoriesParPage

);










return(


<div className="categories-admin">






<div className="categories-header">


<div>

<h1>
🏷️ Gestion des catégories
</h1>


<p>
Gérez les catégories touristiques.
</p>


</div>








</div>











<div className="categorie-table-card">

<div className="categorie-toolbar">

    <input

        className="categorie-search-input"

        type="text"

        placeholder="🔎 Rechercher une catégorie..."

        value={recherche}

        onChange={(e)=>{

            setRecherche(e.target.value);

            setPage(1);

        }}

    />



    <button

        className="btn-add-categorie"

        onClick={()=>{

            setShowForm(true);

            setModifier(false);

            setCategorie({

                nom:"",
                description:""

            });

        }}

    >

        + Nouvelle catégorie

    </button>

</div>



<table>


<thead>

<tr>


<th>
Nom
</th>


<th>
Description
</th>


<th>
Action
</th>


</tr>


</thead>





<tbody>


{

categoriesAffichees.map((item)=>(


<tr

key={item.id_categorie}

>


<td>

{item.nom}

</td>



<td>

{item.description}

</td>




<td>


<div className="menu-categorie">


<button

className="btn-menu-categorie"

onClick={()=>{


setMenuOuvert(

menuOuvert===item.id_categorie

?

null

:

item.id_categorie

)


}}

>

⋮

</button>







{
menuOuvert === item.id_categorie &&

<div className="menu-actions-categorie">


<button
className="btn-modifier"
onClick={()=>modifierCategorie(item)}
>
✏️ Modifier
</button>



<button
className="btn-supprimer"
onClick={()=>supprimerCategorie(item.id_categorie)}
>
🗑️ Supprimer
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









<div className="pagination">


{

Array.from({

length:nombrePages

}).map((_,i)=>(


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


))


}


</div>







</div>














{/* MODAL AJOUT / MODIFICATION */}



{

showForm &&


<div className="modal-overlay">


<div className="modal-categorie">



<button

className="close-modal"

onClick={()=>setShowForm(false)}

>

✖

</button>





<h2>

{

modifier

?

"Modifier catégorie"

:

"Ajouter catégorie"

}

</h2>




<input

type="text"

name="nom"

placeholder="Nom catégorie"

value={categorie.nom}

onChange={handleChange}

/>





<textarea

name="description"

placeholder="Description"

value={categorie.description}

onChange={handleChange}

/>






<button

className="btn-save-categorie"

onClick={enregistrerCategorie}

>

{

modifier

?

"Enregistrer"

:

"Ajouter"

}


</button>





</div>



</div>


}









{/* MODAL SUPPRESSION */}



{

showDelete &&


<div className="modal-overlay">


<div className="modal-delete">


<h3>
Supprimer catégorie ?
</h3>


<p>
Cette action est définitive.
</p>




<button

className="btn-delete"

onClick={()=>{


supprimerCategorie(idSupprimer);

setShowDelete(false);


}}

>

Supprimer

</button>




<button

className="btn-cancel"

onClick={()=>setShowDelete(false)}

>

Annuler

</button>



</div>



</div>


}





</div>


);


}



export default Categories;