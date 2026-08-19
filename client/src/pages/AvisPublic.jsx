import {
    useEffect,
    useState
} from "react";

import api from "../api/api";

import {
    FaStar,
    FaEllipsisH
} from "react-icons/fa";

import "./AvisPublic.css";

function AvisPublic() {

    const [avis, setAvis] = useState([]);

    const [loading, setLoading] = useState(true);

    const [reponseActive, setReponseActive] = useState(null);

    const [texteReponse, setTexteReponse] = useState("");

    const [menu, setMenu] = useState(null);

    const [edition, setEdition] = useState(null);

    const [texteEdition, setTexteEdition] = useState("");

    // ==================================
    // AJOUT NOUVEL AVIS + PHOTOS
    // ==================================

    const [nouveauCommentaire, setNouveauCommentaire] = useState("");

    const [noteAvis, setNoteAvis] = useState(5);

    const [photosAvis, setPhotosAvis] = useState([]);

    const utilisateur =
        JSON.parse(
            localStorage.getItem("utilisateur")
        );

    // ==================================
    // URL DES PHOTOS D'AVIS
    // ==================================

    const getPhotoAvisUrl = (photo) => {

        if (!photo) {
            return "";
        }

        // ==================================
        // Photo Cloudinary
        // ==================================

        if (
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {

            return photo;

        }

        // ==================================
        // Photo locale
        // ==================================

        return (
            import.meta.env.VITE_SERVER_URL +
            "/uploads/avis/" +
            photo
        );

    };

    // ==================================
    // CHARGER LES AVIS + TOUTES LES PHOTOS
    // ==================================

    const chargerAvis = async () => {

        try {

            setLoading(true);

            // ==================================
            // 1 - Récupérer les avis
            // ==================================

            const res = await api.get("/avis");

            const avisRecus = res.data;

            // ==================================
            // 2 - Récupérer les photos de
            //     chaque avis
            // ==================================

            const avisAvecPhotos =
                await Promise.all(

                    avisRecus.map(
                        async (a) => {

                            try {

                                const photoResponse =
                                    await api.get(
                                        "/avis-photo/" +
                                        a.id_avis
                                    );

                                return {

                                    ...a,

                                    photos:
                                        Array.isArray(
                                            photoResponse.data
                                        )
                                            ?
                                            photoResponse.data
                                            :
                                            []

                                };

                            }
                            catch (photoError) {

                                console.log(
                                    "Erreur récupération photos avis",
                                    a.id_avis,
                                    photoError.response?.data ||
                                    photoError
                                );

                                return {

                                    ...a,

                                    photos: []

                                };

                            }

                        }
                    )

                );

            console.log(
                "AVIS AVEC PHOTOS :",
                avisAvecPhotos
            );

            setAvis(avisAvecPhotos);

        }
        catch (error) {

            console.log(
                "Erreur chargement avis",
                error.response?.data ||
                error
            );

        }
        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        chargerAvis();

    }, []);

    // ==================================
    // AJOUTER UN AVIS AVEC PHOTOS
    // ==================================

    const ajouterAvis = async () => {

        if (!utilisateur) {

            alert(
                "Connectez-vous pour laisser un avis"
            );

            return;

        }

        if (!nouveauCommentaire.trim()) {

            alert(
                "Veuillez écrire un commentaire"
            );

            return;

        }

        try {

            console.log(
                "Utilisateur connecté :",
                utilisateur
            );

            // ==================================
            // 1 - CREER L'AVIS
            // ==================================

            const res = await api.post(
                "/avis",
                {
                    id_offre: 2,

                    note: Number(noteAvis),

                    commentaire:
                        nouveauCommentaire
                }
            );

            console.log(
                "Réponse création avis :",
                res.data
            );

            const idAvis =
                res.data.id_avis;

            if (!idAvis) {

                alert(
                    "Impossible de récupérer l'identifiant de l'avis"
                );

                return;

            }

            // ==================================
            // 2 - ENVOYER LES PHOTOS
            // ==================================

            if (photosAvis.length > 0) {

                console.log(
                    "Photos sélectionnées :",
                    photosAvis
                );

                const formData =
                    new FormData();

                formData.append(
                    "id_avis",
                    idAvis
                );

                photosAvis.forEach(
                    (photo) => {

                        formData.append(
                            "photos",
                            photo
                        );

                    }
                );

                const photoResponse =
                    await api.post(
                        "/avis-photo",
                        formData,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            }
                        }
                    );

                console.log(
                    "Réponse ajout photos :",
                    photoResponse.data
                );

            }

            // ==================================
            // 3 - NETTOYAGE
            // ==================================

            setNouveauCommentaire("");

            setPhotosAvis([]);

            setNoteAvis(5);

            // ==================================
            // 4 - RECHARGER AVIS + PHOTOS
            // ==================================

            await chargerAvis();

        }
        catch (error) {

            console.log(
                "Erreur ajout avis :",
                error.response?.data ||
                error
            );

            if (
                error.response?.status === 401
            ) {

                alert(
                    "Session expirée, reconnectez-vous"
                );

            }

        }

    };

    // ==================================
    // LIKE AVIS
    // ==================================

    const likeAvis = async (id) => {

        if (!utilisateur) {

            alert(
                "Connectez-vous pour aimer"
            );

            return;

        }

        try {

            await api.post(
                "/avis/like",
                {
                    id_avis: id,

                    id_utilisateur:
                        utilisateur.id_utilisateur
                }
            );

            chargerAvis();

        }
        catch (error) {

            console.log(
                "Erreur like",
                error
            );

        }

    };

    // ==================================
    // LIKE REPONSE
    // ==================================

    const likeReponse = async (id) => {

        if (!utilisateur) {

            alert(
                "Connectez-vous"
            );

            return;

        }

        try {

            await api.post(
                "/avis/reponse/like",
                {
                    id_reponse: id,

                    id_utilisateur:
                        utilisateur.id_utilisateur
                }
            );

            chargerAvis();

        }
        catch (error) {

            console.log(
                "Erreur like réponse",
                error
            );

        }

    };

    // ==================================
    // ENVOYER UNE REPONSE
    // ==================================

    const envoyerReponse = async (id) => {

        if (!utilisateur) {

            alert(
                "Connectez-vous pour répondre"
            );

            return;

        }

        if (!texteReponse.trim()) {

            return;

        }

        try {

            await api.post(
                "/avis/reponse",
                {
                    id_avis: id,

                    id_utilisateur:
                        utilisateur.id_utilisateur,

                    reponse:
                        texteReponse
                }
            );

            setTexteReponse("");

            setReponseActive(null);

            chargerAvis();

        }
        catch (error) {

            console.log(
                "Erreur réponse",
                error
            );

        }

    };

    // ==================================
    // SUPPRIMER UN AVIS
    // ==================================

    const supprimerAvis = async (id) => {

        if (
            window.confirm(
                "Supprimer cet avis ?"
            )
        ) {

            try {

                await api.delete(
                    "/avis/" + id
                );

                chargerAvis();

            }
            catch (error) {

                console.log(error);

            }

        }

    };

    // ==================================
    // MODIFIER UN AVIS
    // ==================================

    const modifierAvis = async (id) => {

        try {

            await api.put(
                "/avis/" + id,
                {
                    note: 5,

                    commentaire:
                        texteEdition
                }
            );

            setEdition(null);

            setTexteEdition("");

            chargerAvis();

        }
        catch (error) {

            console.log(
                "Erreur modification",
                error
            );

        }

    };

    // ==================================
    // PARTAGER UN AVIS
    // ==================================

    const partager = (a) => {

        const url =
            window.location.href;

        if (
            navigator.share
        ) {

            navigator.share({

                title:
                    "Avis touristique",

                text:
                    a.commentaire,

                url: url

            });

        }
        else {

            window.open(
                "https://www.facebook.com/sharer/sharer.php?u=" +
                url,
                "_blank"
            );

        }

    };

    // ==================================
    // COPIER LE LIEN
    // ==================================

    const copier = () => {

        navigator.clipboard.writeText(
            window.location.href
        );

        alert(
            "Lien copié"
        );

    };

    // ==================================
    // FORMAT DATE
    // ==================================

    const date = (d) => {

        return new Date(d)
            .toLocaleDateString(
                "fr-FR"
            );

    };

    // ==================================
    // LOADING
    // ==================================

    if (loading) {

        return (
            <div className="avis-loading">
                Chargement...
            </div>
        );

    }

    // ==================================
    // RENDER
    // ==================================

    return (

        <div className="avis-public-page">

            <h1>
                ⭐ Avis des voyageurs
            </h1>

            <p className="avis-intro">
                Les expériences partagées par notre communauté.
            </p>

            {/* ===========================
                CREATION AVIS
            =========================== */}

            <div className="create-post">

                <div className="post-input-area">

                    <div className="mini-avatar">
                        👤
                    </div>

                    <textarea
                        placeholder="Partagez votre expérience..."
                        value={
                            nouveauCommentaire
                        }
                        onChange={(e) =>
                            setNouveauCommentaire(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="post-options">

                    <div className="rating-box">

                        <span>
                            Note :
                        </span>

                        <select
                            value={noteAvis}
                            onChange={(e) =>
                                setNoteAvis(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                        >

                            <option value="5">
                                ⭐⭐⭐⭐⭐
                            </option>

                            <option value="4">
                                ⭐⭐⭐⭐
                            </option>

                            <option value="3">
                                ⭐⭐⭐
                            </option>

                            <option value="2">
                                ⭐⭐
                            </option>

                            <option value="1">
                                ⭐
                            </option>

                        </select>

                    </div>

                    <label className="photo-button">

                        📷 Ajouter des photos

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={(e) => {

                                const nouvellesPhotos =
                                    Array.from(
                                        e.target.files
                                    );

                                setPhotosAvis(
                                    (ancienne) => [
                                        ...ancienne,
                                        ...nouvellesPhotos
                                    ]
                                );

                                e.target.value = "";

                            }}
                        />

                    </label>

                </div>

                {/* ===========================
                    APERCU PHOTOS
                =========================== */}

                {
                    photosAvis.length > 0 &&

                    <div className="preview-container">

                        {
                            photosAvis.map(
                                (photo, index) => (

                                    <div
                                        className="preview-photo"
                                        key={index}
                                    >

                                        <img
                                            src={
                                                URL.createObjectURL(
                                                    photo
                                                )
                                            }
                                            alt="aperçu"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {

                                                setPhotosAvis(
                                                    photosAvis.filter(
                                                        (_, i) =>
                                                            i !== index
                                                    )
                                                );

                                            }}
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )
                        }

                    </div>
                }

                <div className="publish-zone">

                    <span>

                        {
                            photosAvis.length
                        }

                        {" "}

                        photo(s) sélectionnée(s)

                    </span>

                    <button
                        onClick={ajouterAvis}
                    >
                        Publier
                    </button>

                </div>

            </div>

            {/* ===========================
                FEED
            =========================== */}

            <div className="facebook-feed">

                {
                    avis.map(
                        (a) => (

                            <div
                                className="facebook-card"
                                key={a.id_avis}
                            >

                                {/* ===========================
                                    HEADER
                                =========================== */}

                                <div className="post-header">

                                    {
                                        a.photo ?

                                            <img
                                                src={
                                                    import.meta.env.VITE_SERVER_URL +
                                                    "/uploads/" +
                                                    a.photo
                                                }
                                                alt="profil"
                                            />

                                            :

                                            <div className="avatar">
                                                👤
                                            </div>
                                    }

                                    <div>

                                        <h3>
                                            {a.nom}{" "}
                                            {a.prenom}
                                        </h3>

                                        {
                                            a.role ===
                                            "Administrateur"
                                            &&
                                            <span className="admin-badge">
                                                🛡 Administrateur
                                            </span>
                                        }

                                        <small>
                                            {
                                                date(
                                                    a.date_avis
                                                )
                                            }
                                        </small>

                                    </div>

                                    <div className="menu-zone">

                                        <FaEllipsisH
                                            className="menu-icon"
                                            onClick={() =>
                                                setMenu(
                                                    menu ===
                                                    a.id_avis
                                                        ?
                                                        null
                                                        :
                                                        a.id_avis
                                                )
                                            }
                                        />

                                        {
                                            menu ===
                                            a.id_avis &&

                                            <div className="menu-popup">

                                                {
                                                    utilisateur?.id_utilisateur ===
                                                    a.id_utilisateur
                                                    &&
                                                    <>

                                                        <span
                                                            onClick={() => {

                                                                setEdition(
                                                                    a.id_avis
                                                                );

                                                                setTexteEdition(
                                                                    a.commentaire
                                                                );

                                                                setMenu(
                                                                    null
                                                                );

                                                            }}
                                                        >
                                                            Modifier
                                                        </span>

                                                        <span
                                                            onClick={() =>
                                                                supprimerAvis(
                                                                    a.id_avis
                                                                )
                                                            }
                                                        >
                                                            Supprimer
                                                        </span>

                                                    </>
                                                }

                                            </div>
                                        }

                                    </div>

                                </div>

                                {/* ===========================
                                    NOTE
                                =========================== */}

                                <div className="stars">

                                    {
                                        [1, 2, 3, 4, 5]
                                            .map(
                                                (i) => (

                                                    <FaStar
                                                        key={i}
                                                        className={
                                                            i <= a.note
                                                                ?
                                                                "star-active"
                                                                :
                                                                ""
                                                        }
                                                    />

                                                )
                                            )
                                    }

                                </div>

                                {/* ===========================
                                    COMMENTAIRE
                                =========================== */}

                                {
                                    edition ===
                                    a.id_avis

                                        ?

                                        <div className="edition-zone">

                                            <textarea
                                                value={
                                                    texteEdition
                                                }
                                                onChange={
                                                    (e) =>
                                                        setTexteEdition(
                                                            e.target.value
                                                        )
                                                }
                                            />

                                            <button
                                                onClick={() =>
                                                    modifierAvis(
                                                        a.id_avis
                                                    )
                                                }
                                            >
                                                Enregistrer
                                            </button>

                                        </div>

                                        :

                                        <p className="message">
                                            {
                                                a.commentaire
                                            }
                                        </p>
                                }

                                {/* ===========================
                                    TOUTES LES PHOTOS DE L'AVIS
                                =========================== */}

                                {
                                    Array.isArray(a.photos) &&
                                    a.photos.length > 0 &&

                                    <div className="avis-photos">

                                        {
                                            a.photos.map(
                                                (photo) => (

                                                    <img
                                                        key={
                                                            photo.id_photo
                                                        }
                                                        src={
                                                            getPhotoAvisUrl(
                                                                photo.photo
                                                            )
                                                        }
                                                        alt="Photo de l'avis"
                                                        onError={(e) => {

                                                            console.log(
                                                                "Erreur chargement image :",
                                                                photo.photo
                                                            );

                                                            e.currentTarget.style.display =
                                                                "none";

                                                        }}
                                                    />

                                                )
                                            )
                                        }

                                    </div>
                                }

                                {/* ===========================
                                    ACTIONS
                                =========================== */}

                                <div className="actions">

                                    <span
                                        onClick={() =>
                                            likeAvis(
                                                a.id_avis
                                            )
                                        }
                                    >
                                        👍 J'aime
                                    </span>

                                    <span
                                        onClick={() =>
                                            setReponseActive(
                                                a.id_avis
                                            )
                                        }
                                    >
                                        💬 Répondre
                                    </span>

                                    <span
                                        onClick={() =>
                                            partager(a)
                                        }
                                    >
                                        ↗ Partager
                                    </span>

                                    <span
                                        onClick={
                                            copier
                                        }
                                    >
                                        🔗 Copier
                                    </span>

                                </div>

                                <div className="likes-count">

                                    👍{" "}
                                    {
                                        a.nombre_likes ||
                                        0
                                    }{" "}
                                    J'aime

                                </div>

                                {/* ===========================
                                    REPONSES
                                =========================== */}

                                <div className="comments">

                                    {
                                        a.reponses?.map(
                                            (r) => (

                                                <div
                                                    className="reply"
                                                    key={
                                                        r.id_reponse
                                                    }
                                                >

                                                    {
                                                        r.photo ?

                                                            <img
                                                                src={
                                                                    import.meta.env.VITE_SERVER_URL +
                                                                    "/uploads/" +
                                                                    r.photo
                                                                }
                                                                alt="profil"
                                                            />

                                                            :

                                                            <div className="avatar-small">
                                                                👤
                                                            </div>
                                                    }

                                                    <div className="reply-content">

                                                        <strong>
                                                            {
                                                                r.nom
                                                            }{" "}
                                                            {
                                                                r.prenom
                                                            }
                                                        </strong>

                                                        <p>
                                                            {
                                                                r.reponse
                                                            }
                                                        </p>

                                                        <div className="reply-actions">

                                                            <span
                                                                onClick={() =>
                                                                    likeReponse(
                                                                        r.id_reponse
                                                                    )
                                                                }
                                                            >
                                                                👍 J'aime
                                                            </span>

                                                        </div>

                                                        <small>
                                                            👍{" "}
                                                            {
                                                                r.nombre_likes ||
                                                                0
                                                            }{" "}
                                                            J'aime
                                                        </small>

                                                    </div>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                                {/* ===========================
                                    REPONSE
                                =========================== */}

                                {
                                    reponseActive ===
                                    a.id_avis &&

                                    <div className="reply-box">

                                        <input
                                            type="text"
                                            placeholder="Écrire une réponse..."
                                            value={
                                                texteReponse
                                            }
                                            onChange={
                                                (e) =>
                                                    setTexteReponse(
                                                        e.target.value
                                                    )
                                            }
                                        />

                                        <button
                                            onClick={() =>
                                                envoyerReponse(
                                                    a.id_avis
                                                )
                                            }
                                        >
                                            Publier
                                        </button>

                                    </div>
                                }

                            </div>

                        )
                    )
                }

            </div>

        </div>

    );

}

export default AvisPublic;