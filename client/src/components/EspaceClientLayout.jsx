import { Outlet } from "react-router-dom";

import "./EspaceClientLayout.css";


function EspaceClientLayout() {

    return (

        <div className="client-layout">

            {/* =========================================
                MENU CLIENT
                Le design sera repris depuis EspaceClient
            ========================================= */}

            <aside className="client-sidebar">

                {/* 
                    Ici nous allons mettre exactement
                    le menu actuellement présent dans
                    EspaceClient.jsx
                */}

            </aside>


            {/* =========================================
                CONTENU
            ========================================= */}

            <main className="client-content">

                <Outlet />

            </main>

        </div>

    );

}


export default EspaceClientLayout;