import {
    NavLink,
    useNavigate
} from "react-router-dom";


import {
    useEffect,
    useState
} from "react";


import {
    FaHome,
    FaGlobe,
    FaSuitcase,
    FaEnvelope,
    FaStar,
    FaUser,
    FaSignOutAlt,
    FaBell,
    FaCamera,
    FaEye,
    FaRobot
} from "react-icons/fa";


import api from "../api/api";


import "./NavbarPublic.css";



function NavbarPublic(){


const navigate = useNavigate();


const [nombreNotifications,setNombreNotifications]=useState(0);


const [menuProfil,setMenuProfil]=useState(false);



const [utilisateur,setUtilisateur]=useState(null);
const [modalPhoto,setModalPhoto]=useState(false);

const [fichier,setFichier]=useState(null);
const [profil,setProfil] = useState(null);

useEffect(() => {

    if (!utilisateur) return;

    const chargerProfil = async () => {

        try {

            const res = await api.get(
                `/utilisateurs/${utilisateur.id_utilisateur}`
            );

            setProfil(res.data);

        }
        catch (err) {
            console.log(err);
        }

    };

    chargerProfil();

    const interval = setInterval(() => {

        chargerProfil();

    }, 5000);

    return () => clearInterval(interval);

}, [utilisateur]);


// ============================
// RECUPERER UTILISATEUR
// ============================
useEffect(() => {

    const recupererUtilisateur = () => {

        const data = JSON.parse(
            localStorage.getItem("utilisateur")
        );

        const user =
            data?.utilisateur
                ? data.utilisateur
                : data;

        setUtilisateur(user || null);
    };

    // Chargement initial
    recupererUtilisateur();

    // Écouter une nouvelle connexion
    window.addEventListener(
        "utilisateurConnecte",
        recupererUtilisateur
    );

    // Écouter une déconnexion
    window.addEventListener(
        "utilisateurDeconnecte",
        recupererUtilisateur
    );

    return () => {

        window.removeEventListener(
            "utilisateurConnecte",
            recupererUtilisateur
        );

        window.removeEventListener(
            "utilisateurDeconnecte",
            recupererUtilisateur
        );

    };

}, []);


const voirPhotoProfil=()=>{


if(!utilisateur?.photo){


alert("Aucune photo de profil disponible");


return;


}



window.open(

`http://localhost:8081/uploads/${utilisateur.photo}`,

"_blank"

);


};


const changerPhoto=async()=>{


if(!fichier){


alert("Choisissez une image");

return;


}



const formData = new FormData();


formData.append(
"photo",
fichier
);



try{


const res = await api.put(

`/utilisateurs/photo/${utilisateur.id_utilisateur}`,

formData,

{

headers:{

"Content-Type":"multipart/form-data"

}

}

);




console.log(
"Photo modifiée",
res.data
);



const nouveauUtilisateur={

...utilisateur,

photo:res.data.photo

};



localStorage.setItem(

"utilisateur",

JSON.stringify(nouveauUtilisateur)

);



setUtilisateur(nouveauUtilisateur);



setModalPhoto(false);



alert(
"Photo modifiée avec succès"
);



}
catch(error){


console.log(error);


alert(
"Erreur changement photo"
);


}


};





// ============================
// NOTIFICATIONS
// ============================


useEffect(()=>{


const chargerNotifications=async()=>{


if(!utilisateur)
return;



try{


const res = await api.get(

`/notifications/utilisateur/${utilisateur.id_utilisateur}`

);



const total =
res.data.filter(

n=>Number(n.lu)===0

).length;



setNombreNotifications(total);



}
catch(error){

console.log(error);

}



};



chargerNotifications();



},[utilisateur]);






// ============================
// DECONNEXION
// ============================


const deconnexion=()=>{


localStorage.removeItem("utilisateur");

localStorage.removeItem("token");


setUtilisateur(null);


setMenuProfil(false);


navigate("/");


window.location.reload();



};









// PHOTO PROFIL

const photoProfil = utilisateur?.photo

?

`http://localhost:8081/uploads/${utilisateur.photo}`

:

null;




return(


<nav className="navbar-public">





<div className="logo-public">


<span>
🌍
</span>


<span>
Plateforme Touristique
</span>





{
    utilisateur &&
    utilisateur.role !== "Administrateur" &&

    <div
        className="notification-container"
        onClick={()=>navigate("/mes-notifications")}
    >
        <FaBell />

        {
            nombreNotifications > 0 &&
            <span className="notification-badge">
                {nombreNotifications}
            </span>
        }
    </div>
}



</div>




<ul>


<li>

<NavLink to="/">

<FaHome/>

Accueil

</NavLink>

</li>



<li>

<NavLink to="/destinations-public">

<FaGlobe/>

Destinations

</NavLink>

</li>




<li>

<NavLink to="/offres-public">

<FaSuitcase/>

Offres

</NavLink>

</li>




<li>

<NavLink to="/avis-public">

<FaStar/>

Avis

</NavLink>

</li>




<li>

<NavLink to="/contact">

<FaEnvelope/>

Contact

</NavLink>

{/* =================================================
    RECOMMANDATIONS IA
================================================= */}

{
    utilisateur &&
    utilisateur.role !== "Administrateur" &&

    <NavLink
        to="/recommandations-client"
        className={({ isActive }) =>
            `navbar-link navbar-link-ia ${
                isActive ? "active" : ""
            }`
        }
    >

        <FaRobot />

        <span>
            Recommandations IA
        </span>

    </NavLink>
}


</li>



</ul>







{
    utilisateur && utilisateur.role !== "Administrateur" ?

    <div className="profil-container">

        {/* ============================
            BOUTON PROFIL
        ============================ */}

        <button
            className="profil-button"
            onClick={()=>setMenuProfil(!menuProfil)}
        >

            {
                photoProfil ?

                <img
                    src={photoProfil}
                    className="profil-photo"
                    alt="Profil"
                />

                :

                <FaUser />
            }

            <span>
                {utilisateur.prenom}
            </span>

        </button>


        {/* ============================
            MENU PROFIL
        ============================ */}

        {
            menuProfil &&

            <div className="profil-menu">

                <button
                    onClick={()=>{

                        setMenuProfil(false);

                        setModalPhoto(true);

                    }}
                >

                    <FaCamera />

                    <span>
                        Changer photo de profil
                    </span>

                </button>


                <button
                    onClick={()=>{

                        setMenuProfil(false);

                        voirPhotoProfil();

                    }}
                >

                    <FaEye />

                    <span>
                        Voir photo de profil
                    </span>

                </button>


                <button
                    onClick={deconnexion}
                    className="logout"
                >

                    <FaSignOutAlt />

                    <span>
                        Se déconnecter
                    </span>

                </button>

            </div>
        }

    </div>


    :

    <NavLink
        to="/login-client"
        className="btn-login-client"
    >

        Connexion

    </NavLink>


}


{

modalPhoto &&


<div className="modal-photo">


<div className="modal-photo-content">


<h3>

Changer photo de profil

</h3>



<input

type="file"

accept="image/*"

onChange={(e)=>

setFichier(e.target.files[0])

}

/>




<div className="modal-actions">


<button

className="btn-save-photo"

onClick={changerPhoto}

>

Enregistrer

</button>




<button

className="btn-cancel-photo"

onClick={()=>setModalPhoto(false)}

>

Annuler

</button>



</div>



</div>


</div>


}




</nav>



);



}



export default NavbarPublic;