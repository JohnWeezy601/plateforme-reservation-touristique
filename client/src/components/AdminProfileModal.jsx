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


    return (
        <div
            className="admin-modal-overlay"
            onClick={close}
        >

            <div
                className="admin-modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}

                <div className="admin-modal-header">

                    <h2>
                        Modifier mon profil
                    </h2>

                    <button
                        type="button"
                        onClick={close}
                    >
                        <FaTimes />
                    </button>

                </div>


                {/* PROFIL ADMIN */}

                <div className="admin-profile-preview">

                    <div className="admin-profile-photo">

                        {admin?.photo ? (

                            <img
                                src={
                                    admin.photo.startsWith("http")
                                        ? admin.photo
                                        : `${import.meta.env.VITE_SERVER_URL}/uploads/${admin.photo}`
                                }
                                alt="Photo de profil"
                            />

                        ) : (

                            <div className="admin-profile-photo-default">
                                👤
                            </div>

                        )}

                    </div>


                    <div className="admin-profile-preview-info">

                        <h3>
                            {admin?.nom} {admin?.prenom}
                        </h3>

                        <span>
                            Administrateur
                        </span>

                    </div>

                </div>


                {/* FORMULAIRE */}

                <form onSubmit={save}>

                    <div className="form-group">

                        <label>
                            Nom
                        </label>

                        <input
                            type="text"
                            name="nom"
                            defaultValue={admin?.nom || ""}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Prénom
                        </label>

                        <input
                            type="text"
                            name="prenom"
                            defaultValue={admin?.prenom || ""}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            defaultValue={admin?.email || ""}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Téléphone
                        </label>

                        <input
                            type="text"
                            name="telephone"
                            defaultValue={admin?.telephone || ""}
                        />

                    </div>


                    <button
                        type="submit"
                        className="admin-save-btn"
                    >

                        <FaSave />

                        Sauvegarder les modifications

                    </button>

                </form>

            </div>

        </div>
    );
}


export default AdminProfileModal;