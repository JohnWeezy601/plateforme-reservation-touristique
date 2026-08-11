import { FaTimes, FaSave } from "react-icons/fa";
import "./Modal.css";

function UserModal({ open, close, user, save }) {

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className="modal-box">

                <div className="modal-header">

                    <h2>
                        {user
                            ? "Modifier utilisateur"
                            : "Ajouter utilisateur"}
                    </h2>

                    <button
                        type="button"
                        onClick={close}
                    >
                        <FaTimes />
                    </button>

                </div>

                <form onSubmit={save}>

                    <input
                        name="nom"
                        placeholder="Nom"
                        defaultValue={user?.nom || ""}
                        required
                    />

                    <input
                        name="prenom"
                        placeholder="Prénom"
                        defaultValue={user?.prenom || ""}
                        required
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        defaultValue={user?.email || ""}
                        required
                    />

                    <input
                        name="telephone"
                        placeholder="Téléphone"
                        defaultValue={user?.telephone || ""}
                    />

                    {!user && (

                        <input
                            name="mot_de_passe"
                            type="password"
                            placeholder="Mot de passe"
                            required
                        />

                    )}

                    <select
                        name="role"
                        defaultValue={user?.role || "Touriste"}
                    >

                        <option value="Touriste">
                            Touriste
                        </option>

                        <option value="Prestataire">
                            Prestataire
                        </option>

                        <option value="Administrateur">
                            Administrateur
                        </option>

                    </select>

                    <button
                        type="submit"
                        className="save-btn"
                    >
                        <FaSave />
                        Enregistrer
                    </button>

                </form>

            </div>

        </div>

    );

}

export default UserModal;