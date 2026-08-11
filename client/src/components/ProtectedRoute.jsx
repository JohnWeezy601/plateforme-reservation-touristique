import { Navigate } from "react-router-dom";


function ProtectedRoute({children}){


const utilisateur = JSON.parse(
localStorage.getItem("utilisateur")
);



if(!utilisateur || utilisateur.role !== "Administrateur"){


return (

<Navigate
to="/login-client"
replace
/>

);


}



return children;


}


export default ProtectedRoute;