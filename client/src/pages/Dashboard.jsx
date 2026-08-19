
import { useEffect, useState } from "react";
import api from "../api/api";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./Dashboard.css";


function Dashboard() {

    // =====================================================
    // ÉTATS
    // =====================================================

    const [stats, setStats] = useState(null);

    const [admin, setAdmin] = useState(null);

    const [chargementAdmin, setChargementAdmin] =
        useState(true);


    // =====================================================
    // RÉCUPÉRER L'ADMIN CONNECTÉ
    // =====================================================

    const chargerProfilAdmin = async () => {

        try {

            const stockage =
                localStorage.getItem("utilisateur");


            if (!stockage) {

                console.log(
                    "Aucun utilisateur connecté"
                );

                setAdmin(null);

                return;

            }


            const data =
                JSON.parse(stockage);


            /*
                Selon ton système de connexion,
                localStorage peut contenir :

                {
                    utilisateur: {...},
                    token: "..."
                }

                ou directement :

                {
                    id: ...,
                    nom: ...,
                    ...
                }
            */

            const utilisateur =
                data?.utilisateur
                    ? data.utilisateur
                    : data;


            const id =
                utilisateur?.id_utilisateur ||
                utilisateur?.id;


            if (!id) {

                console.log(
                    "ID administrateur introuvable"
                );

                setAdmin(null);

                return;

            }


            // =================================================
            // RÉCUPÉRER LE PROFIL COMPLET DEPUIS MYSQL
            // =================================================

            const res =
                await api.get(
                    `/utilisateurs/${id}`
                );


            setAdmin(res.data);


        }
        catch (error) {

            console.log(
                "Erreur récupération profil admin :",
                error
            );

            setAdmin(null);

        }
        finally {

            setChargementAdmin(false);

        }

    };


    // =====================================================
    // CHARGER STATISTIQUES DASHBOARD
    // =====================================================

    const chargerDashboard = async () => {

        try {

            const res =
                await api.get(
                    "/dashboard/statistiques"
                );


            setStats(res.data);

        }
        catch (error) {

            console.log(
                "Erreur dashboard :",
                error
            );

        }

    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        chargerDashboard();

        chargerProfilAdmin();

    }, []);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (!stats) {

        return (
            <div className="dashboard-loading">

                Chargement du tableau de bord...

            </div>
        );

    }


    // =====================================================
    // COULEURS GRAPHIQUE
    // =====================================================

    const couleurs = [

        "#2563eb",
        "#16a34a",
        "#f59e0b",
        "#dc2626"

    ];


    // =====================================================
    // PHOTO ADMIN
    // =====================================================

    const photoAdmin =
        admin?.photo || null;


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">


                <div>

                    <h1>
                        📊 Tableau de bord administrateur
                    </h1>

                    <p>
                        Vue générale de la plateforme touristique
                    </p>

                </div>


                {/* =================================================
                    PROFIL ADMIN
                ================================================= */}

                <div className="admin-profile">


                    {chargementAdmin ? (

                        <span>
                            Chargement...
                        </span>

                    ) : admin ? (

                        <>

                            {/* PHOTO */}

                            {photoAdmin ? (

                                <img
                                    src={photoAdmin}
                                    alt="Administrateur"
                                    className="dashboard-admin-photo"
                                />

                            ) : (

                                <div className="dashboard-admin-avatar">
                                    👤
                                </div>

                            )}


                            {/* INFORMATIONS */}

                            <div className="dashboard-admin-info">

                                <strong>

                                    {admin.prenom || ""}{" "}

                                    {admin.nom || ""}

                                </strong>

                                <span>
                                    Administrateur
                                </span>

                            </div>

                        </>

                    ) : (

                        <>

                            <span>
                                👤
                            </span>

                            <span>
                                Administrateur
                            </span>

                        </>

                    )}

                </div>


            </div>


            {/* =================================================
                CARTES STATISTIQUES
            ================================================= */}

            <div className="stats-grid">


                {/* UTILISATEURS */}

                <div className="stat-card blue">

                    <div className="icon">
                        👥
                    </div>

                    <h2>
                        {stats.totalUtilisateurs}
                    </h2>

                    <p>
                        Utilisateurs
                    </p>

                </div>


                {/* DESTINATIONS */}

                <div className="stat-card green">

                    <div className="icon">
                        🌍
                    </div>

                    <h2>
                        {stats.totalDestinations}
                    </h2>

                    <p>
                        Destinations
                    </p>

                </div>


                {/* RÉSERVATIONS */}

                <div className="stat-card orange">

                    <div className="icon">
                        📅
                    </div>

                    <h2>
                        {stats.totalReservations}
                    </h2>

                    <p>
                        Réservations
                    </p>

                </div>


                {/* PAIEMENTS */}

                <div className="stat-card purple">

                    <div className="icon">
                        💳
                    </div>

                    <h2>
                        {stats.totalPaiements}
                    </h2>

                    <p>
                        Paiements
                    </p>

                </div>


                {/* REVENUS */}

                <div className="stat-card red">

                    <div className="icon">
                        💰
                    </div>

                    <h2>

                        {Number(
                            stats.revenus
                        ).toLocaleString("fr-FR")}

                        {" "}Ar

                    </h2>

                    <p>
                        Revenus
                    </p>

                </div>


                {/* RÉSERVATIONS RÉCENTES */}

                <div className="stat-card blue">

                    <div className="icon">
                        📈
                    </div>

                    <h2>
                        {stats.dernieresReservations.length}
                    </h2>

                    <p>
                        Réservations récentes
                    </p>

                </div>


                {/* DESTINATIONS POPULAIRES */}

                <div className="stat-card green">

                    <div className="icon">
                        ⭐
                    </div>

                    <h2>
                        {stats.destinationsPopulaires.length}
                    </h2>

                    <p>
                        Destinations populaires
                    </p>

                </div>


                {/* NOTIFICATIONS */}

                <div className="stat-card orange">

                    <div className="icon">
                        🔔
                    </div>

                    <h2>
                        {stats.notifications.length}
                    </h2>

                    <p>
                        Notifications
                    </p>

                </div>


            </div>


            {/* =================================================
                GRAPHIQUES
            ================================================= */}

            <div className="charts-container">


                {/* =================================================
                    RÉSERVATIONS PAR MOIS
                ================================================= */}

                <div className="chart-box">

                    <h2>
                        📅 Réservations par mois
                    </h2>


                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={stats.reservationsMois}
                        >

                            <XAxis
                                dataKey="mois"
                            />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="total"
                                fill="#2563eb"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                {/* =================================================
                    DESTINATIONS POPULAIRES
                ================================================= */}

                <div className="chart-box">

                    <h2>
                        🌍 Destinations populaires
                    </h2>


                    <ResponsiveContainer
                        width="90%"
                        height={250}
                    >

                        <PieChart>

                            <Pie
                                data={
                                    stats.destinationsPopulaires
                                }
                                dataKey="total"
                                nameKey="nom"
                                outerRadius={100}
                            >

                                {stats.destinationsPopulaires.map(
                                    (item, index) => (

                                        <Cell
                                            key={
                                                item.id_destination ||
                                                index
                                            }
                                            fill={
                                                couleurs[
                                                    index %
                                                    couleurs.length
                                                ]
                                            }
                                        />

                                    )
                                )}

                            </Pie>

                            <Tooltip />

                        </PieChart>

                    </ResponsiveContainer>

                </div>


            </div>


        </div>

    );

}


export default Dashboard
