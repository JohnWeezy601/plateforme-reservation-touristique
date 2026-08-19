
import { useEffect, useState } from "react";
import api from "../api/api";
import "./ProfilAdmin.css";

import AdminProfileModal from "../components/AdminProfileModal";

import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaUserShield,
    FaCalendarAlt,
    FaEdit,
    FaCamera
} from "react-icons/fa";


function ProfilAdmin() {

    const [admin, setAdmin] = useState(null);

    const [openModal, setOpenModal] = useState(false);

    const [preview, setPreview] = useState(null);


    // =====================================================
    // RÉCUPÉRER L'ADMINISTRATEUR
    // =====================================================

    const getAdmin = async () => {

        try {

            const res = await api.get("/utilisateurs");

            const utilisateurAdmin = res.data.find(
                (user) => user.role === "Administrateur"
            );

            setAdmin(utilisateurAdmin || null);

        }

        catch (error) {

            console.log(
                "Erreur récupération administrateur :",
                error
            );

        }

    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        getAdmin();

    }, []);


    // =====================================================
    // CHANGER PHOTO
    // =====================================================

    const changerPhoto = async (e) => {

        const fichier = e.target.files[0];

        if (!fichier || !admin) {
            return;
        }


        // =================================================
        // APERÇU LOCAL TEMPORAIRE
        // =================================================

        const imagePreview = URL.createObjectURL(fichier);

        setPreview(imagePreview);


        // =================================================
        // FORM DATA
        // =================================================

        const formData = new FormData();

        formData.append(
            "photo",
            fichier
        );


        try {

            const res = await api.put(

                `/utilisateurs/photo/${admin.id_utilisateur}`,

                formData,

                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }

            );


            console.log(
                "PHOTO CLOUDINARY :",
                res.data.photo
            );


            alert(
                "Photo modifiée avec succès"
            );


            // =================================================
            // RECHARGER L'ADMIN
            // =================================================

            await getAdmin();


            // =================================================
            // SUPPRIMER L'APERÇU TEMPORAIRE
            // =================================================

            setPreview(null);


            URL.revokeObjectURL(imagePreview);

        }

        catch (error) {

            console.log(
                "ERREUR UPLOAD :",
                error.response?.data || error
            );


            alert(
                error.response?.data?.message ||
                "Erreur lors du changement de photo"
            );


            // Garder l'image précédente
            setPreview(null);

            URL.revokeObjectURL(imagePreview);

        }

    };


    // =====================================================
    // MODIFIER PROFIL
    // =====================================================

    const modifierProfil = async (e) => {

        e.preventDefault();


        if (!admin) {
            return;
        }


        const formData = new FormData(e.target);


        const data = {

            nom: formData.get("nom"),

            prenom: formData.get("prenom"),

            email: formData.get("email"),

            telephone: formData.get("telephone"),

            role: admin.role

        };


        try {

            await api.put(

                `/utilisateurs/${admin.id_utilisateur}`,

                data

            );


            alert(
                "Profil modifié avec succès"
            );


            setOpenModal(false);


            // Recharger les données
            await getAdmin();

        }

        catch (error) {

            console.log(
                "Erreur modification profil :",
                error.response?.data || error
            );


            alert(
                error.response?.data?.message ||
                "Erreur modification profil"
            );

        }

    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (!admin) {

        return (

            <div className="profile-loading">

                Chargement du profil...

            </div>

        );

    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="profile-container">


            <div className="profile-card">


                {/* =================================================
                    HEADER PROFIL
                ================================================= */}

                <div className="profile-header">


                    {/* =================================================
                        PHOTO ADMIN
                    ================================================= */}

                    <div className="profile-photo-container">


                        {

                            preview

                                ?

                                (
                                    <img
                                        src={preview}
                                        className="profile-image"
                                        alt="Aperçu"
                                    />
                                )

                                :

                                admin.photo

                                    ?

                                    (
                                        <img
                                            src={admin.photo}
                                            className="profile-image"
                                            alt="Profil Admin"
                                        />
                                    )

                                    :

                                    (
                                        <FaUserCircle
                                            className="profile-avatar"
                                        />
                                    )

                        }


                        {/* =================================================
                            BOUTON CHANGER PHOTO
                        ================================================= */}

                        <label
                            className="btn-photo"
                            title="Changer la photo"
                        >

                            <FaCamera />

                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={changerPhoto}
                            />

                        </label>


                    </div>


                    {/* =================================================
                        NOM ADMIN
                    ================================================= */}

                    <div>

                        <h2>

                            {admin.nom} {admin.prenom}

                        </h2>


                        <span>

                            Administrateur

                        </span>

                    </div>


                </div>


                {/* =================================================
                    INFORMATIONS
                ================================================= */}

                <div className="profile-info">


                    {/* EMAIL */}

                    <div className="info-item">

                        <FaEnvelope />

                        <div>

                            <label>
                                Email
                            </label>

                            <p>

                                {admin.email}

                            </p>

                        </div>

                    </div>


                    {/* TÉLÉPHONE */}

                    <div className="info-item">

                        <FaPhone />

                        <div>

                            <label>
                                Téléphone
                            </label>

                            <p>

                                {admin.telephone || "Non renseigné"}

                            </p>

                        </div>

                    </div>


                    {/* RÔLE */}

                    <div className="info-item">

                        <FaUserShield />

                        <div>

                            <label>
                                Rôle
                            </label>

                            <p>

                                {admin.role}

                            </p>

                        </div>

                    </div>


                    {/* DATE INSCRIPTION */}

                    <div className="info-item">

                        <FaCalendarAlt />

                        <div>

                            <label>
                                Date inscription
                            </label>

                            <p>

                                {
                                    admin.date_inscription
                                        ?
                                        new Date(
                                            admin.date_inscription
                                        ).toLocaleDateString()
                                        :
                                        "Non renseignée"
                                }

                            </p>

                        </div>

                    </div>


                </div>


                {/* =================================================
                    MODIFIER PROFIL
                ================================================= */}

                <button
                    className="btn-profile-edit"
                    onClick={() => setOpenModal(true)}
                >

                    <FaEdit />

                    Modifier profil

                </button>


            </div>


            {/* =================================================
                MODALE
            ================================================= */}

            <AdminProfileModal

                open={openModal}

                close={() => setOpenModal(false)}

                admin={admin}

                save={modifierProfil}

            />


        </div>

    );

}


export default ProfilAdmin;

