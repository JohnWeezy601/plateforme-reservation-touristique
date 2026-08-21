
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.jsx";


// =====================================================
// GOOGLE CLIENT ID
// =====================================================

const GOOGLE_CLIENT_ID =
    "297495681701-vk4papmvb233cerqr55arvblfai286ur.apps.googleusercontent.com";


// =====================================================
// APPLICATION
// =====================================================

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <GoogleOAuthProvider
            clientId={GOOGLE_CLIENT_ID}
        >

            <App />

        </GoogleOAuthProvider>

    </StrictMode>

);

