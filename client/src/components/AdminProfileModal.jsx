
import { FaTimes, FaSave } from "react-icons/fa";
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

                {/* =========================
                    HEADER
                ========================= */}

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


                {/* =========================
                    FORMULAIRE
                ========================= */}

                <form onSubmit={save}>

                    {/* NOM */}

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


                    {/* PRÉNOM */}

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


                    {/* EMAIL */}

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


                    {/* TÉLÉPHONE */}

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


                    {/* BOUTON */}

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

