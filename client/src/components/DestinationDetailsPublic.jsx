import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import api from "../api/api";

import "./DestinationDetailsPublic.css";


// =====================================
// BOUTON RECENTRER LA CARTE
// =====================================

function RecentrerCarte({ latitude, longitude }) {

    const map = useMap();

    const recentrer = () => {

        map.setView(
            [latitude, longitude],
            12,
            {
                animate: true
            }
        );

    };

    return (
        <button
            type="button"
            className="btn-recentrer-carte"
            onClick={recentrer}
        >
            📍 Recentrer
        </button>
    );
}


// =====================================
// DETAIL DESTINATION
// =====================================

function DestinationDetailsPublic() {

    const { id } = useParams();

    const [destination, setDestination] = useState(null);

    const [autresDestinations, setAutresDestinations] = useState([]);


    // ==============================
    // Charger destination
    // ==============================

    const chargerDestination = async () => {

        try {

            const res = await api.get(
                `/destinations/${id}`
            );

            setDestination(res.data);

        }
        catch (error) {

            console.log(
                "Erreur détail destination :",
                error
            );

        }

    };


    // ==============================
    // Charger autres destinations
    // ==============================

    const chargerAutres = async () => {

        try {

            const res = await api.get(
                "/destinations"
            );

            const autres = res.data.filter(
                (d) =>
                    d.id_destination !== Number(id)
            );

            setAutresDestinations(autres);

        }
        catch (error) {

            console.log(error);

        }

    };


    useEffect(() => {

        chargerDestination();

        chargerAutres();

    }, [id]);


    if (!destination) {

        return (
            <div>
                Chargement...
            </div>
        );

    }
     console.log("DESTINATION :", destination);
console.log("LATITUDE :", destination.latitude);
console.log("LONGITUDE :", destination.longitude);


    return (

        <div className="destination-details">

            {/* ======================
                IMAGE
            ====================== */}

            <img
                src={`http://localhost:8081/uploads/${destination.image}`}
                alt={destination.nom}
                className="detail-main-image"
            />


            {/* ======================
                INFORMATIONS
            ====================== */}

            <h1>
                {destination.nom}
            </h1>

            <p>
                {destination.region}, {destination.pays}
            </p>

            <p>
                {destination.description}
            </p>


            {/* ======================
                CARTE
            ====================== */}

            <div className="destination-map">

                <MapContainer

                    center={[
                        Number(destination.latitude),
                        Number(destination.longitude)
                    ]}

                    zoom={12}

                    style={{
                        height: "100%",
                        width: "100%"
                    }}

                >

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />


                <Marker
    position={[
        Number(destination.latitude),
        Number(destination.longitude)
    ]}
    draggable={true}
    eventHandlers={{
        dragend: (e) => {

            const position = e.target.getLatLng();

            console.log(
                "Nouvelle position :",
                position.lat,
                position.lng
            );

        }
    }}
>
    <Popup>
        <strong>
            {destination.nom}
        </strong>
    </Popup>
</Marker>


                    {/* =========================
                        BOUTON RECENTRER
                    ========================= */}

                    <RecentrerCarte

                        latitude={
                            Number(destination.latitude)
                        }

                        longitude={
                            Number(destination.longitude)
                        }

                    />

                </MapContainer>

            </div>


            {/* ======================
                AUTRES DESTINATIONS
            ====================== */}

            <h2>
                Autres destinations
            </h2>

            {
                autresDestinations.map((d) => (

                    <div
                        className="small-destination-card"
                        key={d.id_destination}
                    >

                        <img
                            src={
                                `http://localhost:8081/uploads/${d.image}`
                            }
                            alt={d.nom}
                        />

                        <h3>
                            {d.nom}
                        </h3>

                        <p>
                            {d.region}
                        </p>

                    </div>

                ))
            }

        </div>

    );

}


export default DestinationDetailsPublic;