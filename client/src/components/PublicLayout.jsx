import NavbarPublic from "./NavbarPublic";
import Footer from "./Footer";


function PublicLayout({children}){


return (

    <>

        <NavbarPublic/>


        {children}


        <Footer/>


    </>


);


}


export default PublicLayout;