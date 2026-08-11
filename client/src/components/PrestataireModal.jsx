import { FaTimes, FaSave } from "react-icons/fa";
import "./Modal.css";


function PrestataireModal({
    open,
    close,
    prestataire,
    utilisateurs,
    save
}) {


if(!open) return null;


return (

<div className="modal-overlay">


<div className="modal-box">


<div className="modal-header">


<h2>

{
prestataire
?
"Modifier prestataire"
:
"Ajouter prestataire"
}

</h2>


<button
type="button"
onClick={close}
>

<FaTimes/>

</button>


</div>





<form onSubmit={save}>


<select
name="id_utilisateur"
defaultValue={
prestataire?.id_utilisateur || ""
}

required
>


<option value="">
Choisir un utilisateur
</option>


{

utilisateurs.map((u)=>(

<option
key={u.id_utilisateur}
value={u.id_utilisateur}
>

{u.nom} {u.prenom}

</option>

))

}


</select>





<input

name="nom_entreprise"

placeholder="Nom entreprise"

defaultValue={
prestataire?.nom_entreprise || ""
}

required

/>





<textarea

name="description"

placeholder="Description"

defaultValue={
prestataire?.description || ""
}

/>





<input

name="adresse"

placeholder="Adresse"

defaultValue={
prestataire?.adresse || ""
}

/>





<input

name="ville"

placeholder="Ville"

defaultValue={
prestataire?.ville || ""
}

/>





<input

name="telephone"

placeholder="Téléphone"

defaultValue={
prestataire?.telephone || ""
}

/>





<input

name="email"

type="email"

placeholder="Email"

defaultValue={
prestataire?.email || ""
}

/>






<select

name="statut"

defaultValue={
prestataire?.statut || "En attente"
}

>


<option value="En attente">
En attente
</option>


<option value="Validé">
Validé
</option>


<option value="Refusé">
Refusé
</option>



</select>






<button
className="save-btn"
type="submit"
>

<FaSave/>

Enregistrer


</button>



</form>



</div>


</div>


);


}


export default PrestataireModal;