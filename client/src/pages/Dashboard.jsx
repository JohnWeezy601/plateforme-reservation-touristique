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
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import {
    FaUsers,
    FaMapMarkedAlt,
    FaCalendarCheck,
    FaCreditCard,
    FaMoneyBillWave,
    FaChartLine,
    FaStar,
    FaBell,
    FaArrowUp,
    FaArrowDown,
    FaHotel,
    FaMapMarkerAlt
} from "react-icons/fa";

import "./Dashboard.css";


function Dashboard() {

    const [stats, setStats] = useState(null);


    // =====================================================
    // CHARGER LES STATISTIQUES
    // =====================================================

    const chargerDashboard = async () => {

        try {

            const res = await api.get(
                "/dashboard/statistiques"
            );

            setStats(res.data);

        } catch (error) {

            console.log(
                "Erreur dashboard :",
                error
            );

        }

    };


    useEffect(() => {

        chargerDashboard();

    }, []);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (!stats) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>
                    Chargement du tableau de bord...
                </p>

            </div>

        );

    }


    // =====================================================
    // COULEURS GRAPHIQUE
    // =====================================================

    const couleurs = [
        "#2563eb",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4"
    ];


    // =====================================================
    // FORMATAGE REVENUS
    // =====================================================

    const revenus = Number(
        stats.revenus || 0
    ).toLocaleString("fr-FR");


    // =====================================================
    // DERNIERES RESERVATIONS
    // =====================================================

    const dernieresReservations =
        stats.dernieresReservations || [];


    // =====================================================
    // DESTINATIONS POPULAIRES
    // =====================================================

    const destinationsPopulaires =
        stats.destinationsPopulaires || [];


    return (

        <div className="dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div className="dashboard-title">

                    <h1>
                        Tableau de bord
                    </h1>

                    <p>
                        Bienvenue dans votre espace
                        d'administration touristique
                    </p>

                </div>


                <div className="dashboard-admin">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div className="admin-info">

                        <strong>
                            Administrateur
                        </strong>

                        <span>
                            Gestionnaire de la plateforme
                        </span>

                    </div>

                </div>

            </div>



            {/* =================================================
                CARTES STATISTIQUES
            ================================================= */}

            <div className="stats-grid">


                {/* UTILISATEURS */}

                <div className="stat-card">

                    <div className="stat-top">

                        <div className="stat-icon blue">
                            <FaUsers />
                        </div>

                        <span className="stat-percent positive">
                            <FaArrowUp />
                            12%
                        </span>

                    </div>

                    <div className="stat-content">

                        <span>
                            Total utilisateurs
                        </span>

                        <strong>
                            {stats.totalUtilisateurs || 0}
                        </strong>

                    </div>

                    <p className="stat-description">
                        Utilisateurs inscrits
                    </p>

                </div>



                {/* DESTINATIONS */}

                <div className="stat-card">

                    <div className="stat-top">

                        <div className="stat-icon green">
                            <FaMapMarkedAlt />
                        </div>

                        <span className="stat-percent positive">
                            <FaArrowUp />
                            8%
                        </span>

                    </div>

                    <div className="stat-content">

                        <span>
                            Destinations
                        </span>

                        <strong>
                            {stats.totalDestinations || 0}
                        </strong>

                    </div>

                    <p className="stat-description">
                        Destinations disponibles
                    </p>

                </div>



                {/* RESERVATIONS */}

                <div className="stat-card">

                    <div className="stat-top">

                        <div className="stat-icon orange">
                            <FaCalendarCheck />
                        </div>

                        <span className="stat-percent positive">
                            <FaArrowUp />
                            15%
                        </span>

                    </div>

                    <div className="stat-content">

                        <span>
                            Réservations
                        </span>

                        <strong>
                            {stats.totalReservations || 0}
                        </strong>

                    </div>

                    <p className="stat-description">
                        Réservations effectuées
                    </p>

                </div>



                {/* REVENUS */}

                <div className="stat-card">

                    <div className="stat-top">

                        <div className="stat-icon purple">
                            <FaMoneyBillWave />
                        </div>

                        <span className="stat-percent positive">
                            <FaArrowUp />
                            18%
                        </span>

                    </div>

                    <div className="stat-content">

                        <span>
                            Revenus
                        </span>

                        <strong className="revenue-value">
                            {revenus}
                        </strong>

                        <small>
                            Ar
                        </small>

                    </div>

                    <p className="stat-description">
                        Revenus générés
                    </p>

                </div>


            </div>



            {/* =================================================
                DEUXIEME LIGNE DE STATISTIQUES
            ================================================= */}

            <div className="mini-stats">


                <div className="mini-stat">

                    <div className="mini-icon blue">
                        <FaCreditCard />
                    </div>

                    <div>
                        <span>
                            Paiements
                        </span>

                        <strong>
                            {stats.totalPaiements || 0}
                        </strong>
                    </div>

                </div>



                <div className="mini-stat">

                    <div className="mini-icon green">
                        <FaHotel />
                    </div>

                    <div>
                        <span>
                            Prestataires
                        </span>

                        <strong>
                            {stats.totalPrestataires || 0}
                        </strong>
                    </div>

                </div>



                <div className="mini-stat">

                    <div className="mini-icon orange">
                        <FaStar />
                    </div>

                    <div>
                        <span>
                            Destinations populaires
                        </span>

                        <strong>
                            {destinationsPopulaires.length}
                        </strong>
                    </div>

                </div>



                <div className="mini-stat">

                    <div className="mini-icon red">
                        <FaBell />
                    </div>

                    <div>
                        <span>
                            Notifications
                        </span>

                        <strong>
                            {stats.notifications?.length || 0}
                        </strong>
                    </div>

                </div>


            </div>



            {/* =================================================
                GRAPHIQUES
            ================================================= */}

            <div className="dashboard-charts">


                {/* ============================================
                    GRAPH RESERVATIONS
                ============================================ */}

                <div className="dashboard-box reservations-chart">

                    <div className="box-header">

                        <div>

                            <h2>
                                Réservations
                            </h2>

                            <p>
                                Évolution des réservations
                                par mois
                            </p>

                        </div>

                        <div className="box-icon">
                            <FaChartLine />
                        </div>

                    </div>


                    <div className="chart-wrapper">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={
                                    stats.reservationsMois || []
                                }
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 5
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e5e7eb"
                                />

                                <XAxis
                                    dataKey="mois"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#64748b",
                                        fontSize: 12
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#64748b",
                                        fontSize: 12
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "#f1f5f9"
                                    }}
                                    contentStyle={{
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow:
                                            "0 10px 30px rgba(0,0,0,0.10)"
                                    }}
                                />

                                <Bar
                                    dataKey="total"
                                    name="Réservations"
                                    fill="#2563eb"
                                    radius={[
                                        6,
                                        6,
                                        0,
                                        0
                                    ]}
                                    barSize={34}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>



                {/* ============================================
                    DESTINATIONS POPULAIRES
                ============================================ */}

                <div className="dashboard-box destination-chart">

                    <div className="box-header">

                        <div>

                            <h2>
                                Destinations populaires
                            </h2>

                            <p>
                                Les destinations les plus
                                demandées
                            </p>

                        </div>

                        <div className="box-icon green-icon">
                            <FaMapMarkerAlt />
                        </div>

                    </div>


                    <div className="pie-wrapper">

                        <ResponsiveContainer
                            width="100%"
                            height={250}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        destinationsPopulaires
                                    }
                                    dataKey="total"
                                    nameKey="nom"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={3}
                                >

                                    {destinationsPopulaires.map(
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


                    <div className="destination-list">

                        {destinationsPopulaires
                            .slice(0, 4)
                            .map((destination, index) => (

                                <div
                                    className="destination-item"
                                    key={
                                        destination.id_destination ||
                                        index
                                    }
                                >

                                    <div className="destination-name">

                                        <span
                                            className="destination-dot"
                                            style={{
                                                backgroundColor:
                                                    couleurs[
                                                        index %
                                                        couleurs.length
                                                    ]
                                            }}
                                        ></span>

                                        <span>
                                            {
                                                destination.nom ||
                                                "Destination"
                                            }
                                        </span>

                                    </div>

                                    <strong>
                                        {
                                            destination.total ||
                                            0
                                        }
                                    </strong>

                                </div>

                            ))}

                    </div>

                </div>

            </div>



            {/* =================================================
                DERNIERES RESERVATIONS
            ================================================= */}

            <div className="dashboard-box reservations-table-box">

                <div className="box-header">

                    <div>

                        <h2>
                            Dernières réservations
                        </h2>

                        <p>
                            Les dernières réservations
                            enregistrées sur la plateforme
                        </p>

                    </div>

                    <button className="view-all-btn">
                        Voir tout
                    </button>

                </div>


                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Réservation
                                </th>

                                <th>
                                    Client
                                </th>

                                <th>
                                    Offre
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Montant
                                </th>

                                <th>
                                    Statut
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {dernieresReservations.length > 0 ? (

                                dernieresReservations
                                    .slice(0, 6)
                                    .map((reservation, index) => (

                                        <tr
                                            key={
                                                reservation.id_reservation ||
                                                index
                                            }
                                        >

                                            <td>

                                                <div className="reservation-id">

                                                    <div className="reservation-icon">
                                                        <FaCalendarCheck />
                                                    </div>

                                                    <strong>
                                                        #
                                                        {
                                                            reservation.id_reservation ||
                                                            index + 1
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="client-info">

                                                    <div className="client-avatar">
                                                        {
                                                            (
                                                                reservation.nom ||
                                                                reservation.nom_client ||
                                                                "C"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        }
                                                    </div>

                                                    <span>
                                                        {
                                                            reservation.nom_client ||
                                                            reservation.nom ||
                                                            "Client"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="offer-name">

                                                    {
                                                        reservation.titre_offre ||
                                                        reservation.offre ||
                                                        reservation.titre ||
                                                        "Offre touristique"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span className="date-text">

                                                    {
                                                        reservation.date_reservation ||
                                                        reservation.date ||
                                                        "-"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <strong className="amount">

                                                    {
                                                        Number(
                                                            reservation.montant ||
                                                            reservation.prix ||
                                                            0
                                                        ).toLocaleString(
                                                            "fr-FR"
                                                        )
                                                    }

                                                    {" "}Ar

                                                </strong>

                                            </td>


                                            <td>

                                                <span
                                                    className={`status-badge ${
                                                        (
                                                            reservation.statut ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .includes(
                                                                "confirm"
                                                            ) ||
                                                        (
                                                            reservation.statut ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .includes(
                                                                "pay"
                                                            )
                                                            ? "status-success"
                                                            : (
                                                                reservation.statut ||
                                                                ""
                                                            )
                                                                .toLowerCase()
                                                                .includes(
                                                                    "annul"
                                                                )
                                                                ? "status-danger"
                                                                : "status-warning"
                                                    }`}
                                                >

                                                    {
                                                        reservation.statut ||
                                                        "En attente"
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="empty-table"
                                    >

                                        Aucune réservation
                                        récente.

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* =================================================
                PIED DE PAGE DASHBOARD
            ================================================= */}

            <div className="dashboard-footer">

                <span>
                    Plateforme intelligente de gestion
                    des réservations touristiques
                </span>

                <span>
                    Administration
                </span>

            </div>


        </div>

    );

}


export default Dashboard;