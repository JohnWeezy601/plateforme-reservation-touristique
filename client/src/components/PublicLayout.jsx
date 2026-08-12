import NavbarPublic from "./NavbarPublic";
import Footer from "./Footer";
import AssistantTouristique from "./AssistantTouristique";

function PublicLayout({ children }) {

    return (
        <>
            <NavbarPublic />

            {children}

            {/* 🤖 Assistant touristique IA */}
            <AssistantTouristique />

            <Footer />
        </>
    );
}

export default PublicLayout;