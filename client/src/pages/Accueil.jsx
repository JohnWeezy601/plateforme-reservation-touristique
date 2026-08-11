import "./Accueil.css";
import { Link } from "react-router-dom";


function Accueil(){


return (

<div className="home-page">



<section className="hero">


<h1>

Découvrez les plus belles destinations

</h1>



<p>

Réservez vos séjours touristiques
facilement avec notre plateforme.

</p>




<Link to="/destinations-public">

<button>

Explorer maintenant

</button>

</Link>


</section>






<section className="home-info">


<h2>

Pourquoi choisir notre plateforme ?

</h2>




<div className="cards">





<div>

🌍

<h3>

Destinations

</h3>

<p>

Découvrez des lieux exceptionnels.

</p>

</div>







<div>

🏨

<h3>

Offres touristiques

</h3>

<p>

Des séjours adaptés à vos besoins.

</p>

</div>







<div>

⭐

<h3>

Recommandations IA

</h3>

<p>

Des suggestions personnalisées selon vos préférences.

</p>

</div>





</div>


</section>






{/* SECTION CONTACT */}


<section className="home-contact">



<h2>

Besoin d'informations ?

</h2>




<p>

Notre équipe est disponible pour répondre à vos questions
et vous accompagner dans vos réservations.

</p>





<Link to="/contact">


<button className="contact-button">


Contactez-nous


</button>


</Link>




</section>






</div>


);


}


export default Accueil;