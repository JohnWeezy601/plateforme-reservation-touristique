import { BrowserRouter, Routes, Route } from "react-router-dom";



import Register from "./pages/Register";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Utilisateurs from "./pages/Utilisateurs";
import Destinations from "./pages/Destinations";
import Categories from "./pages/Categories";
import Prestataires from "./pages/Prestataires";
import Offres from "./pages/Offres";
import Reservations from "./pages/Reservations";
import Paiements from "./pages/Paiements";
import Avis from "./pages/Avis";
import ProfilAdmin from "./pages/ProfilAdmin";
import Contacts from "./pages/Contacts";
import Notifications from "./pages/Notifications";
import Recommandations from "./pages/Recommandations";
import Contact from "./pages/Contact";


import PublicLayout from "./components/PublicLayout";

import Accueil from "./pages/Accueil";
import DestinationsPublic from "./pages/DestinationsPublic";
import DestinationDetailsPublic from "./pages/DestinationDetailsPublic";
import OffresPublic from "./pages/OffresPublic";
import DetailOffre from "./pages/DetailOffre";
import ReservationPublic from "./pages/ReservationPublic";
import LoginClient from "./pages/LoginClient";
import MesReservations from "./pages/MesReservations";
import PaiementPublic from "./pages/PaiementPublic";
import AvisPublic from "./pages/AvisPublic";
import NotificationsClient from "./pages/NotificationsClient";
import Recu from "./pages/Recu.jsx";
import RecommandationsClient from "./pages/RecommandationsClient";


import EspaceClient from "./pages/EspaceClient";
import ProfilClient from "./pages/ProfilClient";
import TransactionsClient from "./pages/TransactionsClient";
import AvisClient from "./pages/AvisClient";
import EspaceClientLayout from "./components/EspaceClientLayout";
import VerificationRecu from "./pages/VerificationRecu";

function App() {


return (


<BrowserRouter>


<Routes>



{/* AUTHENTIFICATION */}









<Route

path="/register"

element={<Register />}

/>





{/* DASHBOARD AVEC SIDEBAR + NAVBAR */}


{/* ===============================
    ESPACE ADMINISTRATION PROTEGE
================================ */}


<Route

path="/dashboard"

element={

<ProtectedRoute>

<Layout>

<Dashboard/>

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/utilisateurs"

element={

<ProtectedRoute>

<Layout>

<Utilisateurs />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/destinations"

element={

<ProtectedRoute>

<Layout>

<Destinations />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/categories"

element={

<ProtectedRoute>

<Layout>

<Categories />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/prestataires"

element={

<ProtectedRoute>

<Layout>

<Prestataires />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/offres"

element={

<ProtectedRoute>

<Layout>

<Offres />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/reservations"

element={

<ProtectedRoute>

<Layout>

<Reservations />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/paiements"

element={

<ProtectedRoute>

<Layout>

<Paiements />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/avis"

element={

<ProtectedRoute>

<Layout>

<Avis />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/profil-admin"

element={

<ProtectedRoute>

<Layout>

<ProfilAdmin />

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/contacts"

element={

<ProtectedRoute>

<Layout>

<Contacts/>

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/notifications"

element={

<ProtectedRoute>

<Layout>

<Notifications/>

</Layout>

</ProtectedRoute>

}

/>



<Route

path="/recommandations"

element={

<ProtectedRoute>

<Layout>

<Recommandations/>

</Layout>

</ProtectedRoute>

}

/>



{/* ==========================
    PARTIE PUBLIQUE VISITEUR
========================== */}


<Route

path="/"

element={

<PublicLayout>

<Accueil/>

</PublicLayout>

}

/>



<Route

path="/destinations-public"

element={

<PublicLayout>

<DestinationsPublic/>

</PublicLayout>

}

/>




<Route

path="/contact"

element={

<PublicLayout>

<Contact/>

</PublicLayout>

}

/>


<Route

path="/avis-public"

element={

<PublicLayout>

<AvisPublic/>

</PublicLayout>

}

/>

<Route

path="/mes-notifications"

element={

<PublicLayout>

<NotificationsClient/>

</PublicLayout>

}

/>


<Route 
path="/recu/:id" 
element={<Recu/>}
/>



<Route

path="/destinations/:id"

element={

<PublicLayout>

<DestinationDetailsPublic/>

</PublicLayout>

}

/>


<Route

path="/offres-public"

element={

<PublicLayout>

<OffresPublic/>

</PublicLayout>

}

/>




<Route

path="/detail-offre/:id"

element={

<PublicLayout>

<DetailOffre/>

</PublicLayout>

}

/>




<Route

path="/reservation-public/:id"

element={

<PublicLayout>

<ReservationPublic/>

</PublicLayout>

}

/>



<Route

path="/paiement-public/:id_reservation"

element={

<PublicLayout>

<PaiementPublic/>

</PublicLayout>

}

/>





<Route

path="/login-client"

element={

<PublicLayout>

<LoginClient/>

</PublicLayout>

}

/>




<Route
path="/mes-reservations"
  element={
        <PublicLayout>
            <MesReservations/>
        </PublicLayout>
    }
/>




{/* =========================================
    ESPACE CLIENT
========================================= */}

<Route element={<EspaceClientLayout />}>

    {/* Accueil espace client */}
    <Route
        path="/espace-client"
        element={<EspaceClient />}
    />

    {/* Mon profil */}
    <Route
        path="/espace-client/profil"
        element={<ProfilClient />}
    />

    {/* Mes réservations */}
    <Route
        path="/espace-client/reservations"
        element={<MesReservations />}
    />

    {/* Mes transactions */}
    <Route
        path="/espace-client/transactions"
        element={<TransactionsClient />}
    />

    {/* Mes avis */}
    <Route
        path="/espace-client/avis"
        element={<AvisClient />}
    />

    {/* Notifications */}
    <Route
        path="/espace-client/notifications"
        element={<NotificationsClient />}
    />

</Route>


<Route
    path="/recommandations-client"
    element={
        <PublicLayout>
            <RecommandationsClient/>
        </PublicLayout>
    }
/>

<Route
    path="/verification/:id"
    element={<VerificationRecu />}
/>

</Routes>


</BrowserRouter>


);


}



export default App;