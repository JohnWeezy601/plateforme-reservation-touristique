import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "./Register.css";


function Register() {


    const navigate = useNavigate();


    const [voirMotDePasse, setVoirMotDePasse] = useState(false);


    const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");



    const [form, setForm] = useState({

        nom:"",
        prenom:"",
        email:"",
        telephone:"",
        mot_de_passe:"",
        role:"Touriste"

    });





    const handleChange = (e)=>{


        setForm({

            ...form,

            [e.target.name]:e.target.value

        });


    };






    const handleSubmit = async(e)=>{


        e.preventDefault();



        if(form.mot_de_passe !== confirmationMotDePasse){


            alert(
                "Les mots de passe ne correspondent pas"
            );


            return;

        }





        try{


            await api.post(

                "/utilisateurs/register",

                form

            );



            alert(
                "Inscription réussie"
            );



           navigate("/login-client");



        }

        catch(error){


            console.log(error);


            alert(
                "Erreur lors de l'inscription"
            );


        }


    };







return(


<div className="register-container">



<div className="register-card">





<h1>
🌴 Créer un compte
</h1>




<p className="register-subtitle">

Rejoignez Travel Explorer

</p>





<form 
className="register-form"
onSubmit={handleSubmit}
>





<div className="form-group">

<label>
Nom
</label>

<input

type="text"

name="nom"

placeholder="Votre nom"

value={form.nom}

onChange={handleChange}

required

/>

</div>







<div className="form-group">

<label>
Prénom
</label>

<input

type="text"

name="prenom"

placeholder="Votre prénom"

value={form.prenom}

onChange={handleChange}

required

/>

</div>







<div className="form-group">

<label>
Email
</label>

<input

type="email"

name="email"

placeholder="exemple@gmail.com"

value={form.email}

onChange={handleChange}

required

/>

</div>







<div className="form-group">

<label>
Téléphone
</label>

<input

type="text"

name="telephone"

placeholder="0340000000"

value={form.telephone}

onChange={handleChange}

/>

</div>








<div className="form-group">

<label>
Mot de passe
</label>


<div className="password-field">


<input

type={
voirMotDePasse
?
"text"
:
"password"
}

name="mot_de_passe"

placeholder="Votre mot de passe"

value={form.mot_de_passe}

onChange={handleChange}

required

/>



<span

className="password-eye"

onClick={()=>setVoirMotDePasse(!voirMotDePasse)}

>


{

voirMotDePasse

?

<FaEyeSlash/>

:

<FaEye/>

}


</span>



</div>


</div>









<div className="form-group">

<label>
Confirmer le mot de passe
</label>



<div className="password-field">


<input

type={
voirMotDePasse
?
"text"
:
"password"
}

placeholder="Confirmer votre mot de passe"

value={confirmationMotDePasse}

onChange={(e)=>
setConfirmationMotDePasse(
e.target.value
)
}

required

/>





<span

className="password-eye"

onClick={()=>setVoirMotDePasse(!voirMotDePasse)}

>

{

voirMotDePasse

?

<FaEyeSlash/>

:

<FaEye/>

}


</span>



</div>


</div>








<div className="form-group">

<label>
Type de compte
</label>



<select

name="role"

value={form.role}

onChange={handleChange}

>


<option value="Touriste">

Touriste

</option>



<option value="Prestataire">

Prestataire

</option>



</select>



</div>








<button type="submit">

Créer mon compte

</button>







</form>







<div className="register-link">


<p>

Vous avez déjà un compte ?

<Link to="/login-client">

Se connecter

</Link>


</p>


</div>







</div>


</div>


);



}


export default Register;