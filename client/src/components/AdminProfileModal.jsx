import {
    FaTimes,
    FaSave
} from "react-icons/fa";

import "./AdminProfileModal.css";


function AdminProfileModal({
    open,
    close,
    admin,
    save
}) {

    if (!open) {
        return null;
    }

console.log("========== ADMIN MODAL ==========");
console.log("ADMIN :", admin);
console.log("PHOTO :", admin?.photo);
console.log("PHOTO TYPE :", typeof admin?.photo);
console.log("================================");
    // ==========================================
    // PHOTO ADMIN
    // ==========================================

    const photoAdmin = admin?.photo || null;


    return (
        <div
            className="admin-modal-overlay"
            onClick={close}
        >

            <div
                className="admin-modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                {/* =================================
                    HEADER
                ================================= */}

                <div className="admin-modal-header">

                    <h2>
                        Modifier mon profil
                    </h2>

                    <button
                        type="button"
                        onClick={close}
                        aria-label="Fermer"
                    >
                        <FaTimes />
                    </button>

                </div>


                {/* =================================
                    PROFIL ADMIN
                ================================= */}

                <div className="admin-profile-preview">

                    {/* PROFIL ADMIN */}

                <div className="admin-profile">


                    {photoAdmin ? (

                        <img
                            src={photoAdmin}
                            className="admin-avatar"
                            alt="Photo administrateur"
                        />

                    ) : (

                        <div className="admin-avatar default">
                            👤
                        </div>


                        )}

                    </div>


                    <div className="admin-profile-preview-info">

                        <h3>
                            {admin?.nom || ""}
                            {" "}
                            {admin?.prenom || ""}
                        </h3>

                        <span>
                            Administrateur
                        </span>

                    </div>

                </div>


                {/* =================================
                    FORMULAIRE
                ================================= */}

                <form onSubmit={save}>

                    {/* NOM */}

                    <div className="form-group">

                        <label htmlFor="admin-nom">
                            Nom
                        </label>

                        <input
                            id="admin-nom"
                            type="text"
                            name="nom"
                            defaultValue={admin?.nom || ""}
                            required
                        />

                    </div>


                    {/* PRÉNOM */}

                    <div className="form-group">

                        <label htmlFor="admin-prenom">
                            Prénom
                        </label>

                        <input
                            id="admin-prenom"
                            type="text"
                            name="prenom"
                            defaultValue={admin?.prenom || ""}
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="admin-email">
                            Email
                        </label>

                        <input
                            id="admin-email"
                            type="email"
                            name="email"
                            defaultValue={admin?.email || ""}
                            required
                        />

                    </div>


                    {/* TÉLÉPHONE */}

                    <div className="form-group">

                        <label htmlFor="admin-telephone">
                            Téléphone
                        </label>

                        <input
                            id="admin-telephone"
                            type="text"
                            name="telephone"
                            defaultValue={admin?.telephone || ""}
                        />

                    </div>


                    {/* RÔLE */}

                    <div className="form-group">

                        <label htmlFor="admin-role">
                            Rôle
                        </label>

                        <input
                            id="admin-role"
                            type="text"
                            value="Administrateur"
                            readOnly
                            className="admin-role-input"
                        />

                    </div>


                    {/* BOUTON */}

                    <button
                        type="submit"
                        className="admin-save-btn"
                    >

                        <FaSave />

                        <span>
                            Sauvegarder les modifications
                        </span>

                    </button>

                </form>

            </div>

        </div>
    );
}


export default AdminProfileModal;