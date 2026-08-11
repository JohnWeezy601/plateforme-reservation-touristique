import { useEffect, useState } from "react";
import api from "../api/api";
import "./Contacts.css";

import {
    FaEnvelope,
    FaCheck,
    FaTrash,
    FaPaperPlane
} from "react-icons/fa";



function Contacts(){


    const [contacts,setContacts] = useState([]);

    const [loading,setLoading] = useState(true);


    const [selectedContact,setSelectedContact] = useState(null);



    const [reply,setReply] = useState({

        sujet:"",
        message:""

    });





    // ==========================
    // CHARGER LES CONTACTS
    // ==========================


    const getContacts = async()=>{


        try{


            const res = await api.get("/contacts");


            setContacts(res.data);



        }
        catch(error){


            console.log(error);


        }
        finally{


            setLoading(false);


        }


    };





    useEffect(()=>{


        getContacts();


    },[]);







    // ==========================
    // VOIR MESSAGE
    // ==========================


    const voirContact = async(contact)=>{


        setSelectedContact(contact);


        setReply({

            sujet:"",
            message:""

        });




        // Nouveau devient Lu automatiquement


        if(contact.statut==="Nouveau"){


            try{


                await api.put(

                    `/contacts/${contact.id_contact}`,

                    {

                        statut:"Lu"

                    }

                );


                getContacts();


            }
            catch(error){


                console.log(error);


            }


        }


    };







    // ==========================
    // CHANGER STATUT
    // ==========================


    const changerStatut = async()=>{


        if(!selectedContact)
            return;



        let nouveauStatut;



        if(selectedContact.statut==="Nouveau"){


            nouveauStatut="Lu";


        }
        else if(selectedContact.statut==="Lu"){


            nouveauStatut="Traité";


        }
        else{


            return;


        }





        try{


            await api.put(

                `/contacts/${selectedContact.id_contact}`,

                {

                    statut:nouveauStatut

                }

            );



            setSelectedContact({

                ...selectedContact,

                statut:nouveauStatut

            });



            getContacts();



        }
        catch(error){


            console.log(error);


        }


    };









    // ==========================
    // REPONSE
    // ==========================


    const handleReplyChange=(e)=>{


        setReply({

            ...reply,

            [e.target.name]:e.target.value

        });


    };









    const envoyerReponse = async () => {

    if (!selectedContact) {

        alert("Aucun contact sélectionné");

        return;

    }

    if (reply.message.trim() === "") {

        alert("Veuillez écrire une réponse");

        return;

    }

    try {

        await api.post("/reponses", {

            id_contact: selectedContact.id_contact,

            message: reply.message

        });

        alert("Réponse envoyée avec succès.");

        setReply({

            sujet: "",
            message: ""

        });

        // Recharger les contacts
        getContacts();

        // Mettre le statut à jour dans l'affichage
        setSelectedContact({

            ...selectedContact,

            statut: "Traité"

        });

    }

    catch (error) {

        console.log(error);

        alert("Erreur lors de l'envoi.");

    }

};








    // ==========================
    // SUPPRIMER
    // ==========================


    const supprimerContact=async()=>{


        if(!selectedContact)
            return;



        const confirmation =
        window.confirm(
            "Supprimer ce message ?"
        );



        if(!confirmation)
            return;




        try{


            await api.delete(

                `/contacts/${selectedContact.id_contact}`

            );



            setSelectedContact(null);


            getContacts();



        }
        catch(error){


            console.log(error);


        }


    };









    if(loading){


        return(

            <div>

                Chargement des messages...

            </div>

        );


    }









return(


<div className="messenger-container">






{/* ==========================
    LISTE GAUCHE
========================== */}



<div className="chat-sidebar">



<div className="sidebar-header">


<h2>

<FaEnvelope/>

 Messages

</h2>


</div>






<div className="chat-list">



{

contacts.map((contact)=>(


<div

key={contact.id_contact}

className={

`chat-item 

${selectedContact?.id_contact===contact.id_contact

?"active"

:""}

`

}


onClick={()=>voirContact(contact)}


>



<div className="avatar">


{

contact.nom

.charAt(0)

.toUpperCase()

}


</div>





<div className="chat-info">


<h4>

{contact.nom}

</h4>



<p>

{contact.email}

</p>



<span

className={`status ${contact.statut}`}

>

{contact.statut}

</span>



<small>

{

new Date(

contact.date_envoi

)

.toLocaleDateString()

}

</small>



</div>




</div>


))


}



</div>


</div>








{/* ==========================
    CONVERSATION DROITE
========================== */}



<div className="chat-content">



{

selectedContact ?


(


<>



<div className="chat-header">


<div className="avatar large">


{

selectedContact.nom

.charAt(0)

.toUpperCase()

}


</div>



<div>

<h2>

{selectedContact.nom}

</h2>


<p>

{selectedContact.email}

</p>


</div>


</div>









<div className="conversation">



<div className="message-bubble client">


<h4>

Client

</h4>



<strong>

{selectedContact.sujet}

</strong>



<p>

{selectedContact.message}

</p>



<small>

{

new Date(

selectedContact.date_envoi

)

.toLocaleString()

}

</small>


</div>



</div>








<div className="reply-box">


<h3>

Répondre

</h3>



<input

type="text"

name="sujet"

placeholder="Sujet"

value={reply.sujet}

onChange={handleReplyChange}

/>





<textarea

name="message"

rows="5"

placeholder="Votre réponse..."

value={reply.message}

onChange={handleReplyChange}

/>





<button

className="btn-send-reply"

onClick={envoyerReponse}

>

<FaPaperPlane/>

 Envoyer


</button>



</div>









<div className="chat-actions">


<button
    className="btn-cancel"
    onClick={() => setSelectedContact(null)}
>
    Annuler
</button>

<button

className="btn-check"

onClick={changerStatut}

>

<FaCheck/>

 Changer statut

</button>





<button

className="btn-delete"

onClick={supprimerContact}

>

<FaTrash/>

 Supprimer

</button>



</div>



</>


)

:



<div className="empty-chat">


<h2>

Sélectionnez un message

</h2>


<p>

Choisissez une conversation pour voir le détail

</p>


</div>



}




</div>






</div>


);



}



export default Contacts;