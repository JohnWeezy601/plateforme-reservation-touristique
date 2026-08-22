import { Outlet } from "react-router-dom";

import ClientSidebar from "./ClientSidebar";

import "./EspaceClientLayout.css";


function EspaceClientLayout() {

    return (

        <div className="client-layout">

            <ClientSidebar />

            <main className="client-content">

                <Outlet />

            </main>

        </div>

    );

}


export default EspaceClientLayout;