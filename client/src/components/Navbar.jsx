import { useEffect, useState } from "react";

import {
    FaBars,
    FaBell,
    FaCog
} from "react-icons/fa";


import api from "../api/api";

import "./Navbar.css";



function Navbar({setSidebarMode}){


const [admin,setAdmin]=useState(null);

const [notifications,setNotifications]=useState(0);





// =============================
// CHARGER ADMIN
// =============================

useEffect(()=>{


const chargerAdmin=async()=>{


try{


const res=await api.get("/utilisateurs");



const user=res.data.find(

u=>u.role==="Administrateur"

);



setAdmin(user);



}

catch(error){

console.log(
"Erreur chargement admin :",
error
);

}


};



chargerAdmin();


},[]);







// =============================
// CHARGER NOTIFICATIONS
// =============================


useEffect(()=>{


const chargerNotifications=async()=>{


try{


const res=await api.get(

"/notifications/utilisateur/6"

);




// compter seulement les notifications non lues

const total=res.data.filter(

notif=>notif.lu===0

).length;



setNotifications(total);



}

catch(error){


console.log(
"Erreur notifications :",
error
);


}


};



// chargement initial

chargerNotifications();



// actualisation toutes les 10 secondes

const interval=setInterval(()=>{

chargerNotifications();

},10000);



return()=>clearInterval(interval);



},[]);








return(


<div className="navbar">





{/* =====================
     ICONES GAUCHE
===================== */}


<div className="navbar-left">



<button

className="navbar-icon"

onClick={()=>setSidebarMode("menu")}

title="Menu"

>

<FaBars/>

</button>



</div>









{/* =====================
     ICONES DROITE
===================== */}



<div className="navbar-right">






{/* NOTIFICATION */}


<button

className="navbar-icon notification-button"

onClick={()=>setSidebarMode("notification")}

title="Communication"

>


<FaBell/>



{

notifications>0 &&


<span className="notification-count">

{notifications}

</span>


}



</button>







{/* PARAMETRES */}


<button

className="navbar-icon"

onClick={()=>setSidebarMode("parametre")}

title="Paramètres"

>


<FaCog/>


</button>









{/* PROFIL ADMIN */}


<div className="admin-profile">





{

admin?.photo ?



<img

src={
`${import.meta.env.VITE_SERVER_URL}/uploads/${admin.photo}`
}

className="admin-avatar"

/>



:


<div className="admin-avatar default">


👤


</div>


}








<div className="admin-info">


<h4>


{

admin

?

`${admin.nom} ${admin.prenom}`

:

"Admin"


}


</h4>



<span>

Administrateur

</span>


</div>



</div>





</div>







</div>


);


}



export default Navbar;
