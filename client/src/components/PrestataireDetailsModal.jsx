import { FaTimes, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import "./PrestataireDetailsModal.css";


function PrestataireDetailModal({
    open,
    close,
    prestataire
}){


if(!open || !prestataire)
return null;



return (

<div className="detail-overlay">


<div className="detail-box">



<div className="detail-header">


<h2>

<FaBuilding/>

Détails du prestataire

</h2>



<button
onClick={close}
>

<FaTimes/>

</button>


</div>





<div className="detail-body">



<div className="detail-item">

<strong>
Entreprise :
</strong>

<span>
{prestataire.nom_entreprise}
</span>

</div>





<div className="detail-item">

<strong>
Description :
</strong>

<span>
{prestataire.description || "Aucune description"}
</span>

</div>






<div className="detail-item">

<strong>
Adresse :
</strong>

<span>

<FaMapMarkerAlt/>

{prestataire.adresse || "Non renseignée"}

</span>


</div>






<div className="detail-item">

<strong>
Ville :
</strong>

<span>
{prestataire.ville}
</span>

</div>







<div className="detail-item">

<strong>
Téléphone :
</strong>

<span>

<FaPhone/>

{prestataire.telephone}

</span>


</div>







<div className="detail-item">

<strong>
Email :
</strong>

<span>

<FaEnvelope/>

{prestataire.email}

</span>


</div>








<div className="detail-item">

<strong>
Statut :
</strong>


<span 
className={

`detail-statut ${
prestataire.statut==="Validé"
?
"valide"
:
prestataire.statut==="Refusé"
?
"refuse"
:
"attente"

}`

}
>


{prestataire.statut}


</span>


</div>








<div className="detail-item">


<strong>
Utilisateur associé :
</strong>


<span>

<FaUser/>

{
prestataire.nom
?
`${prestataire.nom} ${prestataire.prenom || ""}`
:
"Non disponible"

}


</span>


</div>





</div>





</div>


</div>


);


}


export default PrestataireDetailModal;