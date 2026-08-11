import { useEffect, useState } from "react";
import api from "../api/api";
import "./Notifications.css";


function Notifications() {


    const [notifications,setNotifications] = useState([]);

    const [menuOuvert,setMenuOuvert] = useState(null);

    const [afficherAnciens,setAfficherAnciens] = useState(false);



    // ==========================
    // Utilisateur connecté
    // ==========================

    const utilisateur = JSON.parse(
        localStorage.getItem("utilisateur")
    );


    const idUtilisateur = utilisateur?.id_utilisateur;




    // ==========================
    // Charger notifications
    // ==========================

    const chargerNotifications = async()=>{


        if(!idUtilisateur)
            return;



        try{


            const res = await api.get(

                `/notifications/utilisateur/${idUtilisateur}`

            );


            setNotifications(res.data);


        }
        catch(error){


            console.log(
                "Erreur chargement notifications",
                error
            );


        }


    };






    // ==========================
    // Marquer comme lu
    // ==========================

  const marquerCommeLu = async(id)=>{


    try{


        await api.put(

            `/notifications/lu/${id}`

        );



        // Mise à jour instantanée sans rechargement

        setNotifications(prev =>

            prev.map(notification =>

                notification.id_notification === id

                ?

                {
                    ...notification,
                    lu:1
                }

                :

                notification

            )

        );



    }
    catch(error){

        console.log(
            "Erreur marquer comme lue",
            error
        );

    }


};







    // ==========================
    // Supprimer notification
    // ==========================

   const supprimerNotification = async(id)=>{


    const confirmation = window.confirm(

        "Supprimer cette notification ?"

    );


    if(!confirmation)
        return;



    try{


        await api.delete(

            `/notifications/${id}`

        );



        // suppression immédiate

        setNotifications(prev =>

            prev.filter(

                notification =>

                notification.id_notification !== id

            )

        );



    }
    catch(error){


        console.log(

            "Erreur suppression notification",

            error

        );


    }


};



    // ==========================
    // Actualisation automatique
    // ==========================

   useEffect(()=>{


    if(!idUtilisateur)
        return;



    // Chargement initial

    chargerNotifications();



    // Actualisation automatique toutes les 5 secondes

    const interval = setInterval(()=>{


        chargerNotifications();


    },5000);




    return ()=>{


        clearInterval(interval);


    };


},[idUtilisateur]);




    // ==========================
    // Nombre affiché
    // ==========================

    const notificationsAffichees = afficherAnciens

    ?

    notifications

    :

    notifications.slice(0,5);









    return(


        <div className="notifications-page">


            <h1>
                Notifications
            </h1>


            <p>
                Historique des notifications
            </p>





            {

            notificationsAffichees.length===0

            ?


            <div className="notification-vide">

                Aucune notification.

            </div>



            :



            notificationsAffichees.map((notification)=>(



                <div

                key={notification.id_notification}


                className={

                    notification.lu===1

                    ?

                    "notification-card"

                    :

                    "notification-card non-lue"

                }


                onClick={()=>{


                    setMenuOuvert(

                        menuOuvert===notification.id_notification

                        ?

                        null

                        :

                        notification.id_notification

                    );


                }}



                >



                    <div>


                        <h3>

                            {notification.titre}

                        </h3>



                        <p>

                            {notification.message}

                        </p>




                      <small>

{
new Date(
notification.date_notification
)
.toLocaleString("fr-FR")
}


{

Number(notification.lu) === 1 &&


<span className="notification-lue">

&nbsp; ✓ Lue

</span>


}


</small>



                        {

                        menuOuvert===notification.id_notification &&



                        <div className="notification-actions">



                            {

                            notification.lu===0 &&



                            <span

                            onClick={(e)=>{


                                e.stopPropagation();


                                marquerCommeLu(

                                    notification.id_notification

                                );


                            }}


                            >

                                Marquer comme lue

                            </span>

                            }




                            <span

                            className="supprimer-text"


                            onClick={(e)=>{


                                e.stopPropagation();


                                supprimerNotification(

                                    notification.id_notification

                                );


                            }}


                            >

                                Supprimer

                            </span>



                        </div>


                        }



                    </div>



                </div>



            ))


            }





            {

            notifications.length>5 &&



            <div className="notification-plus">


                <span

                onClick={()=>setAfficherAnciens(!afficherAnciens)}

                >

                {

                afficherAnciens

                ?

                "Afficher les notifications récentes"

                :

                "Afficher les anciennes notifications"

                }


                </span>


            </div>


            }



        </div>


    );


}


export default Notifications;