import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "./Layout.css";


function Layout({children}){


const [sidebarMode,setSidebarMode]=useState("menu");



return (

<div className="admin-layout">


<Sidebar 
mode={sidebarMode}
/>



<div className="main-container">


<Navbar
setSidebarMode={setSidebarMode}
/>



<div className="dashboard-content">

{children}

</div>


</div>


</div>

);


}


export default Layout;