
import { useEffect, useState } from "react";

import api from "../api/api";

import "./Utilisateurs.css";

import UserModal from "../components/UserModal";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaUsers,
    FaEllipsisV
} from "react-icons/fa";


function Utilisateurs() {

    const [utilisateurs, setUtilisateurs] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);

    const [recherche, setRecherche] = useState("");

    const [openModal, setOpenModal] = useState(false);

    // =====================================================
    // PAGINATION
    // =====================================================

    const [pageActuelle, setPageActuelle] = useState(1);

    const utilisateursParPage = 8;

    // Menu actions ouvert
    const [menuOuvert, setMenuOuvert] = useState(null);


    // =====================================================
    // RÉCUPÉRER UTILISATEURS
    // =====================================================

    const getUtilisateurs = async () => {

        try {

            const res = await api.get("/utilisateurs");

            setUtilisateurs(res.data);

        }
        catch (error) {

            console.log(error);

        }

    };


    useEffect(() => {

        getUtilisateurs();

    }, []);


    // =====================================================
    // SUPPRIMER UTILISATEUR
    // =====================================================

    const supprimer = async (id) => {

        if (window.confirm("Voulez-vous supprimer cet utilisateur ?")) {

            try {

                await api.delete(`/utilisateurs/${id}`);

                alert("Utilisateur supprimé avec succès");

                setMenuOuvert(null);

                await getUtilisateurs();

            }
            catch (error) {

                console.log(error);

            }

        }

    };


    // =====================================================
    // AJOUTER / MODIFIER UTILISATEUR
    // =====================================================

    const sauvegarderUtilisateur = async (e) => {

        e.preventDefault();

        const data = {

            nom: e.target.nom.value,

            prenom: e.target.prenom.value,

            email: e.target.email.value,

            telephone: e.target.telephone.value,

            role: e.target.role.value,

        };


        // Seulement pour ajout
        if (!selectedUser) {

            data.mot_de_passe =
                e.target.mot_de_passe.value;

        }


        try {

            if (selectedUser) {

                // Modification
                await api.put(
                    `/utilisateurs/${selectedUser.id_utilisateur}`,
                    data
                );

                alert("Utilisateur modifié avec succès");

            }
            else {

                // Ajout
                await api.post(
                    "/utilisateurs",
                    data
                );

                alert("Utilisateur ajouté avec succès");

            }


            setOpenModal(false);

            setSelectedUser(null);

            setMenuOuvert(null);

            await getUtilisateurs();

        }
        catch (error) {

            console.log(error);

            alert("Erreur lors de l'opération");

        }

    };


    // =====================================================
    // RECHERCHE
    // =====================================================

    const utilisateursFiltres = utilisateurs.filter((user) =>

        (user.nom || "")
            .toLowerCase()
            .includes(recherche.toLowerCase())

        ||

        (user.prenom || "")
            .toLowerCase()
            .includes(recherche.toLowerCase())

        ||

        (user.email || "")
            .toLowerCase()
            .includes(recherche.toLowerCase())

    );


    // =====================================================
    // CALCUL PAGINATION
    // =====================================================

    const totalPages = Math.ceil(
        utilisateursFiltres.length /
        utilisateursParPage
    );


    const indexDebut =
        (pageActuelle - 1) *
        utilisateursParPage;


    const indexFin =
        indexDebut +
        utilisateursParPage;


    const utilisateursAffiches =
        utilisateursFiltres.slice(
            indexDebut,
            indexFin
        );


    // =====================================================
    // CHANGEMENT DE RECHERCHE
    // =====================================================

    const changerRecherche = (e) => {

        setRecherche(e.target.value);

        // Retour à la première page
        setPageActuelle(1);

    };


    // =====================================================
    // CHANGER PAGE
    // =====================================================

    const changerPage = (page) => {

        if (
            page >= 1 &&
            page <= totalPages
        ) {

            setPageActuelle(page);

            // Fermer les menus
            setMenuOuvert(null);

        }

    };


    // =====================================================
    // OUVRIR MODIFICATION
    // =====================================================

    const modifierUtilisateur = (user) => {

        setSelectedUser(user);

        setOpenModal(true);

        setMenuOuvert(null);

    };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="user-container">


            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="user-header">

                <div>

                    <h2>

                        <FaUsers className="title-icon" />

                        Gestion des utilisateurs

                    </h2>

                    <p>
                        Gérez tous les utilisateurs de la plateforme.
                    </p>

                </div>


                {/* BOUTON AJOUTER */}

                <button
                    className="btn-add"
                    title="Ajouter utilisateur"
                    onClick={() => {

                        setSelectedUser(null);

                        setOpenModal(true);

                    }}
                >

                    <FaPlus />

                </button>

            </div>


            {/* =================================================
                RECHERCHE
            ================================================= */}

            <div className="toolbar">

                <div className="search-box">

                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={recherche}
                        onChange={changerRecherche}
                    />

                </div>

            </div>


            {/* =================================================
                TABLEAU
            ================================================= */}
             <div className="table-responsive">
            <div className="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Nom</th>

                            <th>Prénom</th>

                            <th>Email</th>

                            <th>Téléphone</th>

                            <th>Rôle</th>

                            <th>Actions</th>

                        </tr>

                    </thead>


                    <tbody>

                        {

                            utilisateursAffiches.length > 0 ? (

                                utilisateursAffiches.map((user) => (

                                    <tr
                                        key={user.id_utilisateur}
                                    >

                                        <td>
                                            {user.id_utilisateur}
                                        </td>


                                        <td>
                                            {user.nom}
                                        </td>


                                        <td>
                                            {user.prenom}
                                        </td>


                                        <td>
                                            {user.email}
                                        </td>


                                        <td>
                                            {user.telephone}
                                        </td>


                                        <td>

                                            <span className="role">

                                                {user.role}

                                            </span>

                                        </td>


                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <td className="actions-cell">

                                            <button
                                                className="btn-action-menu"
                                                title="Actions"
                                                onClick={() => {

                                                    setMenuOuvert(
                                                        menuOuvert ===
                                                        user.id_utilisateur
                                                            ? null
                                                            : user.id_utilisateur
                                                    );

                                                }}
                                            >

                                                <FaEllipsisV />

                                            </button>


                                            {

                                                menuOuvert ===
                                                user.id_utilisateur && (

                                                    <div className="action-menu">

                                                        <button
                                                            className="action-edit"
                                                            onClick={() =>
                                                                modifierUtilisateur(user)
                                                            }
                                                        >

                                                            <FaEdit />

                                                            Modifier

                                                        </button>


                                                        <button
                                                            className="action-delete"
                                                            onClick={() =>
                                                                supprimer(
                                                                    user.id_utilisateur
                                                                )
                                                            }
                                                        >

                                                            <FaTrash />

                                                            Supprimer

                                                        </button>

                                                    </div>

                                                )

                                            }

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="no-users"
                                    >

                                        Aucun utilisateur trouvé.

                                    </td>

                                </tr>

                            )

                        }

                    </tbody>

                </table>

            </div>
            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            {

                totalPages > 1 && (

                    <div className="pagination">

                        {/* PRÉCÉDENT */}

                        <button
                            className="pagination-arrow"
                            disabled={pageActuelle === 1}
                            onClick={() =>
                                changerPage(
                                    pageActuelle - 1
                                )
                            }
                        >

                            ‹

                        </button>


                        {/* NUMÉROS */}

                        {

                            Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (

                                <button
                                    key={page}
                                    className={
                                        page === pageActuelle
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        changerPage(page)
                                    }
                                >

                                    {page}

                                </button>

                            ))

                        }


                        {/* SUIVANT */}

                        <button
                            className="pagination-arrow"
                            disabled={
                                pageActuelle === totalPages
                            }
                            onClick={() =>
                                changerPage(
                                    pageActuelle + 1
                                )
                            }
                        >

                            ›

                        </button>

                    </div>

                )

            }


            {/* =================================================
                MODAL
            ================================================= */}

            <UserModal

                open={openModal}

                close={() => {

                    setOpenModal(false);

                    setSelectedUser(null);

                }}

                user={selectedUser}

                save={sauvegarderUtilisateur}

            />


        </div>

    );

}


export default Utilisateurs;
  