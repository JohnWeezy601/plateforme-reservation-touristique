import {
useEffect,
useState
} from "react";

import {
useNavigate
} from "react-router-dom";


import {
    FaBell,
    FaCheckCircle,
    FaTimesCircle,
    FaFileDownload,
    FaStar,
    FaCalendarTimes
} from "react-icons/fa";


import api from "../api/api";


import "./NotificationsClient.css";



function NotificationsClient(){

    const navigate = useNavigate();


const [notifications,setNotifications]=useState([]);
const [afficherToutes,setAfficherToutes] = useState(false);



const dataUtilisateur =
JSON.parse(
localStorage.getItem("utilisateur")
);



const utilisateur =
dataUtilisateur?.utilisateur
?
dataUtilisateur.utilisateur
:
dataUtilisateur;







// ==============================
// CHARGER NOTIFICATIONS
// ==============================


const chargerNotifications = async()=>{


if(!utilisateur?.id_utilisateur)
return;



try{


const res = await api.get(

`/notifications/utilisateur/${utilisateur.id_utilisateur}`

);



console.log(
"Notifications actualisées :",
JSON.stringify(res.data,null,2)
);



setNotifications(res.data);



}
catch(error){


console.log(
"Erreur notification :",
error
);


}



};







// ==============================
// RAFRAICHISSEMENT AUTOMATIQUE
// ==============================


useEffect(() => {

    
    chargerNotifications();

    
    const interval = setInterval(() => {

        chargerNotifications();

    }, 2000);

    
    const handleVisibility = () => {

        if (document.visibilityState === "visible") {

            chargerNotifications();

        }

    };

    document.addEventListener(
        "visibilitychange",
        handleVisibility
    );

    return () => {

        clearInterval(interval);

        document.removeEventListener(
            "visibilitychange",
            handleVisibility
        );

    };

}, []);









// ==============================
// MARQUER LU
// ==============================


const marquerCommeLu = (id) => {

    // Mise à jour immédiate
    setNotifications(prev =>
        prev.map(n =>
            n.id_notification === id
                ? { ...n, lu: 1 }
                : n
        )
    );

    // Mise à jour de la base en arrière-plan
    api.put(`/notifications/lu/${id}`)
        .catch(error =>
            console.log("Erreur lecture :", error)
        );
};




// ==============================
// SUPPRIMER NOTIFICATION
// ==============================

const supprimerNotification = async (id) => {

    try {

        await api.delete(
            `/notifications/${id}`
        );

        setNotifications(prev =>
            prev.filter(
                n => n.id_notification !== id
            )
        );

    }
    catch(error) {

        console.log(
            "Erreur suppression notification :",
            error
        );

        alert(
            "Erreur lors de la suppression de la notification"
        );

    }

};




// ==============================
// OUVRIR RECU
// ==============================


const telechargerRecu=(lien)=>{


const id = lien.split("/").pop();



window.open(

`/recu/${id}`,

"_blank"

);



};









// ==============================
// CLICK NOTIFICATION
// ==============================


const ouvrirNotification=async(n)=>{



// supprimer badge nouveau


if(Number(n.lu)===0){


await marquerCommeLu(

n.id_notification

);


}







// AVIS


if(

n.titre

?.toLowerCase()

.includes("avis")

){


window.location.href="/avis-public";


return;


}






// ==============================
// RESERVATION
// ==============================

if(

    n.titre
    ?.toLowerCase()
    .includes("rejet")

){

    navigate("/mes-reservations");

    return;

}


// ==============================
// RESERVATION CONFIRMEE
// ==============================


if (
    n.type === "Reservation" &&
    n.message
        ?.toLowerCase()
        .includes("confirmée")
) {

    console.log(
        "Notification réservation confirmée :",
        n
    );

    if (n.lien) {

        console.log(
            "Redirection vers paiement :",
            n.lien
        );

        navigate(n.lien);

    } else {

        console.log(
            "Aucun lien de paiement dans la notification"
        );

        alert(
            "Le lien de paiement n'est pas disponible pour cette réservation."
        );

    }

    return;
}







// PAIEMENT

if(

n.type==="Paiement"

){


return;


}



};









// ==============================
// ICONES
// ==============================


const getIcone=(n)=>{


const titre =
n.titre?.toLowerCase();




if(

titre?.includes("paiement")

){


return (

<FaCheckCircle className="success"/>

);


}






if(

titre?.includes("rejet")

){


return (

<FaTimesCircle className="danger"/>

);


}






if(

titre?.includes("expiration")

){


return (

<FaCalendarTimes className="warning"/>

);


}






if(

titre?.includes("avis")

){


return (

<FaStar className="star"/>

);


}






return (

<FaBell/>

);



};









// ==============================
// AFFICHAGE
// ==============================


return(


<div className="notifications-client">



<h1>

Mes notifications

</h1>







{

notifications.length===0 ?



<p className="empty">

Aucune notification

</p>



:



(afficherToutes
    ? notifications
    : notifications.slice(0, 5)
).map(n=>(




<div


key={n.id_notification}



className={

Number(n.lu)===0

?

"notification-card unread"

:

"notification-card"

}




onClick={()=>ouvrirNotification(n)}



>


<button
    className="delete-notification-btn"
    onClick={(e) => {

        e.stopPropagation();

        supprimerNotification(
            n.id_notification
        );

    }}
>
    🗑
</button>




<div className="notification-icon">


{

getIcone(n)

}


</div>









<div className="notification-body">





<h3>

{n.titre}

</h3>






<p>

{n.message}

</p>







<small>


{

new Date(

n.date_notification

)

.toLocaleString("fr-FR")


}



</small>









{

n.type==="Paiement"

&&

n.lien

&&





<button


className="download-btn"



onClick={(e)=>{


e.stopPropagation();



telechargerRecu(n.lien);



}}



>



<FaFileDownload/>


Télécharger reçu



</button>



}





</div>








</div>




))


}




{
    notifications.length > 5 && (

        <button
            className="btn-afficher-notifications"
            onClick={() =>
                setAfficherToutes(!afficherToutes)
            }
        >

            {
                afficherToutes
                ? "Afficher seulement les récentes"
                : "Afficher les notifications précédentes"
            }

        </button>

    )
}


</div>



);



}



export default NotificationsClient;