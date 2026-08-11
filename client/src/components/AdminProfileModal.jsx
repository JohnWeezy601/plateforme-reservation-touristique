import { FaTimes, FaSave } from "react-icons/fa";
import "./AdminProfileModal.css";


function AdminProfileModal({open, close, admin, save}){


if(!open) return null;



return (

<div className="admin-modal-overlay">


<div className="admin-modal-box">


<div className="admin-modal-header">


<h2>
Modifier mon profil
</h2>


<button 
type="button"
onClick={close}
>

<FaTimes/>

</button>


</div>



<form onSubmit={save}>


<div className="form-group">

<label>
Nom
</label>

<input

name="nom"

defaultValue={admin?.nom || ""}

/>

</div>




<div className="form-group">

<label>
Prénom
</label>

<input

name="prenom"

defaultValue={admin?.prenom || ""}

/>

</div>




<div className="form-group">

<label>
Email
</label>

<input

type="email"

name="email"

defaultValue={admin?.email || ""}

/>

</div>




<div className="form-group">

<label>
Téléphone
</label>

<input

name="telephone"

defaultValue={admin?.telephone || ""}

/>

</div>




<button 
type="submit"
className="admin-save-btn"
>

<FaSave/>

Sauvegarder les modifications

</button>


</form>



</div>



</div>


);


}


export default AdminProfileModal;