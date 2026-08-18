import NavbarPublic from "./NavbarPublic";
import Footer from "./Footer";
import AssistantTouristique from "./AssistantTouristique";

import "./PublicLayout.css";


function PublicLayout({ children }) {

    return (

        <div className="public-layout">


            {/* NAVBAR */}

            <div className="public-navbar-wrapper">

                <NavbarPublic />

            </div>


            {/* CONTENU */}

            <main className="public-page-content">

                {children}

            </main>


            {/* ASSISTANT IA */}

            <AssistantTouristique />


            {/* FOOTER */}

            <div className="public-footer-wrapper">

                <Footer />

            </div>


        </div>

    );

}


export default PublicLayout;