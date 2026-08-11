import {NavLink, useNavigate} from "react-router-dom";


import {

FaHome,
FaUsers,
FaGlobe,
FaTags,
FaHotel,
FaSuitcase,
FaCalendarCheck,
FaMoneyBill,
FaStar,
FaEnvelope,
FaBell,
FaUserCog,
FaSignOutAlt

}
from "react-icons/fa";


import "./Sidebar.css";





function Sidebar({mode}){


const navigate = useNavigate();





// ==========================
// MENU PRINCIPAL
// ==========================


const menu=[


{
name:"Tableau de bord",
path:"/dashboard",
icon:<FaHome/>
},


{
name:"Utilisateurs",
path:"/utilisateurs",
icon:<FaUsers/>
},


{
name:"Destinations",
path:"/destinations",
icon:<FaGlobe/>
},


{
name:"Catégories",
path:"/categories",
icon:<FaTags/>
},


{
name:"Prestataires",
path:"/prestataires",
icon:<FaHotel/>
},


{
name:"Offres",
path:"/offres",
icon:<FaSuitcase/>
},


{
name:"Réservations",
path:"/reservations",
icon:<FaCalendarCheck/>
},


{
name:"Paiements",
path:"/paiements",
icon:<FaMoneyBill/>
},


{
name: "Recommandations IA", 
path: "/recommandations",
 icon: <FaStar /> 
}

];






// ==========================
// COMMUNICATION
// ==========================


const communication=[


{
name:"Notifications",
path:"/notifications",
icon:<FaBell/>
},


{
name:"Contacts",
path:"/contacts",
icon:<FaEnvelope/>
},


{
name:"Avis",
path:"/avis",
icon:<FaStar/>
}


];







// ==========================
// PARAMETRES
// ==========================


const parametres=[


{
name:"Profil administrateur",
path:"/profil-admin",
icon:<FaUserCog/>
},



{
name:"Déconnexion",
logout:true,
icon:<FaSignOutAlt/>
}

];








let elements=[];



if(mode==="menu")

elements=menu;



if(mode==="notification")

elements=communication;



if(mode==="parametre")

elements=parametres;









// ==========================
// DECONNEXION
// ==========================


const deconnexion=()=>{


localStorage.removeItem("utilisateur");


localStorage.removeItem("token");



// empêcher retour navigateur

navigate(

"/login-client",

{
replace:true
}

);


};









return(


<div className="sidebar">







<div className="sidebar-brand">


<div className="brand-icon">

🌍

</div>


<div>


<h2>
Plateforme
</h2>


<p>
Réservation touristique
</p>


</div>



</div>










<ul className="sidebar-menu">


{


elements.map((item,index)=>(



<li key={index}>


{


item.logout ?




<button

className="menu-link logout-link"

onClick={deconnexion}

>



<span className="menu-icon">

{item.icon}

</span>



<span>

{item.name}

</span>



</button>






:



<NavLink

to={item.path}

className="menu-link"


>



<span className="menu-icon">

{item.icon}

</span>



<span>

{item.name}

</span>



</NavLink>



}



</li>


))


}



</ul>






</div>


);


}



export default Sidebar;