import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Loading from "./Loading";

import "./Layout.css";


function Layout({ children }) {

    const [sidebarMode, setSidebarMode] = useState("menu");

    const [loading, setLoading] = useState(false);

    const location = useLocation();


    useEffect(() => {

        // Démarrer le loading
        setLoading(true);


        // Petit délai pour afficher l'animation
        const timer = setTimeout(() => {

            setLoading(false);

        }, 700);


        return () => clearTimeout(timer);

    }, [location.pathname]);


    return (

        <div className="admin-layout">


            {/* SIDEBAR */}

            <Sidebar
                mode={sidebarMode}
            />


            <div className="main-container">


                {/* NAVBAR */}

                <Navbar
                    setSidebarMode={setSidebarMode}
                />


                <div className="dashboard-content">


                    {/* CONTENU DE LA PAGE */}

                    {children}


                    {/* LOADING */}

                  {loading && (
    <div className="global-page-loading">
        <Loading />
    </div>
)}


                </div>


            </div>


        </div>

    );

}


export default Layout;