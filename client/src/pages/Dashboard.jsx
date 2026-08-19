import { useEffect, useState } from "react";
import api from "../api/api";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./Dashboard.css";


function Dashboard(){


const [stats,setStats] = useState(null);



// ===============================
// Charger statistiques dashboard
// ===============================

const chargerDashboard = async()=>{


try{


const res = await api.get(
"/dashboard/statistiques"
);


setStats(res.data);


}

catch(error){


console.log(
"Erreur dashboard :",
error
);


}


};





useEffect(()=>{


chargerDashboard();


},[]);






if(!stats){


return(


<div className="dashboard-loading">


Chargement du tableau de bord...


</div>


);


}





// ===============================
// Couleurs graphique
// ===============================


const couleurs=[

"#2563eb",

"#16a34a",

"#f59e0b",

"#dc2626"

];







return(


<div className="dashboard-page">





{/* =========================
        HEADER
========================= */}


<div className="dashboard-header">


<div>


<h1>

📊 Tableau de bord administrateur

</h1>


<p>

Vue générale de la plateforme touristique

</p>


</div>





<div className="admin-profile">


👤 Administrateur


</div>


</div>








{/* =========================
        CARTES STATISTIQUES
========================= */}



<div className="stats-grid">





<div className="stat-card blue">


<div className="icon">

👥

</div>


<h2>

{stats.totalUtilisateurs}

</h2>


<p>

Utilisateurs

</p>


</div>







<div className="stat-card green">


<div className="icon">

🌍

</div>


<h2>

{stats.totalDestinations}

</h2>


<p>

Destinations

</p>


</div>







<div className="stat-card orange">


<div className="icon">

📅

</div>


<h2>

{stats.totalReservations}

</h2>


<p>

Réservations

</p>


</div>








<div className="stat-card purple">


<div className="icon">

💳

</div>


<h2>

{stats.totalPaiements}

</h2>


<p>

Paiements

</p>


</div>








<div className="stat-card red">


<div className="icon">

💰

</div>


<h2>


{

Number(stats.revenus)

.toLocaleString("fr-FR")

}


 Ar


</h2>


<p>

Revenus

</p>


</div>








<div className="stat-card blue">


<div className="icon">

📈

</div>


<h2>

{

stats.dernieresReservations.length

}


</h2>


<p>

Réservations récentes

</p>


</div>








<div className="stat-card green">


<div className="icon">

⭐

</div>


<h2>

{

stats.destinationsPopulaires.length

}


</h2>


<p>

Destinations populaires

</p>


</div>








<div className="stat-card orange">


<div className="icon">

🔔

</div>


<h2>

{

stats.notifications.length

}


</h2>


<p>

Notifications

</p>


</div>






</div>





{/* =========================
        GRAPHIQUES
========================= */}



<div className="charts-container">





{/* Graphique réservations */}


<div className="chart-box">


<h2>

📅 Réservations par mois

</h2>




<ResponsiveContainer

width="100%"

height={300}

>


<BarChart

data={stats.reservationsMois}

>



<XAxis

dataKey="mois"

/>


<YAxis/>


<Tooltip/>



<Bar

dataKey="total"

fill="#2563eb"

/>



</BarChart>


</ResponsiveContainer>




</div>









{/* Graphique destinations populaires */}



<div className="chart-box">



<h2>

🌍 Destinations populaires

</h2>





<ResponsiveContainer

width="90%"

height={250}

>



<PieChart>



<Pie

data={stats.destinationsPopulaires}

dataKey="total"

nameKey="nom"

outerRadius={100}


>




{

stats.destinationsPopulaires.map(

(item,index)=>(


<Cell


key={

item.id_destination || index

}


fill={

couleurs[index % couleurs.length]

}


/>


)


)


}




</Pie>



<Tooltip/>



</PieChart>




</ResponsiveContainer>




</div>





</div>











</div>


);


}



export default Dashboard;