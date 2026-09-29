import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OffresPrestataire.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8081/api";

const OFFRES_PAR_PAGE = 6;

const initialForm = {
    id_destination: "",
    id_categorie: "",
    titre: "",
    description: "",
    prix: "",
    capacite: "",
    disponibilite: "",
    date_debut: "",
    date_fin: "",
    image: null,
    photos: []
};

function OffresPrestataire() {

    // =====================================================
    // ETATS
    // =====================================================

    const [offres, setOffres] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);

    const [prestataire, setPrestataire] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [mode, setMode] = useState("ajout");

    const [selectedOffre, setSelectedOffre] =
        useState(null);

    const [form, setForm] =
        useState(initialForm);

    const [search, setSearch] =
        useState("");

    const [page, setPage] =
        useState(1);


    // =====================================================
    // RECUPERER UTILISATEUR CONNECTE
    // =====================================================

    const getUtilisateurConnecte = () => {

        try {

            const utilisateur =
                localStorage.getItem("utilisateur");

            if (!utilisateur) {
                return null;
            }

            return JSON.parse(utilisateur);

        } catch (error) {

            console.error(
                "Erreur lecture utilisateur :",
                error
            );

            return null;
        }
    };


    // =====================================================
    // CHARGER LE PRESTATAIRE
    // =====================================================

    const chargerPrestataire = async () => {

        try {

            const utilisateur =
                getUtilisateurConnecte();

            if (!utilisateur?.id) {

                setError(
                    "Utilisateur connecté introuvable."
                );

                setLoading(false);

                return;
            }


            console.log(
                "Utilisateur connecté :",
                utilisateur
            );


            const response = await fetch(
                `${API_URL}/prestataires/utilisateur/${utilisateur.id}`
            );


            if (!response.ok) {

                throw new Error(
                    "Impossible de récupérer le prestataire."
                );
            }


            const data =
                await response.json();


            console.log(
                "PRESTATAIRE CONNECTÉ :",
                data
            );


            setPrestataire(data);

            return data;

        } catch (error) {

            console.error(
                "Erreur chargement prestataire :",
                error
            );

            setError(
                error.message ||
                "Erreur lors du chargement du prestataire."
            );

            return null;
        }
    };


    // =====================================================
    // CHARGER LES OFFRES DU PRESTATAIRE
    // =====================================================

    const chargerOffres = async (
        idPrestataire
    ) => {

        try {

            const response = await fetch(
                `${API_URL}/offres/prestataire/${idPrestataire}`
            );


            if (!response.ok) {

                throw new Error(
                    "Impossible de récupérer les offres."
                );
            }


            const data =
                await response.json();


            console.log(
                "OFFRES DU PRESTATAIRE :",
                data
            );


            setOffres(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Erreur chargement offres :",
                error
            );

            setError(
                error.message ||
                "Erreur lors du chargement des offres."
            );
        }
    };


    // =====================================================
    // CHARGER DESTINATIONS
    // =====================================================

    const chargerDestinations = async () => {

        try {

            const response = await fetch(
                `${API_URL}/destinations`
            );


            if (!response.ok) {

                throw new Error(
                    "Impossible de récupérer les destinations."
                );
            }


            const data =
                await response.json();


            setDestinations(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Erreur destinations :",
                error
            );
        }
    };


    // =====================================================
    // CHARGER CATEGORIES
    // =====================================================

    const chargerCategories = async () => {

        try {

            const response = await fetch(
                `${API_URL}/categories`
            );


            if (!response.ok) {

                throw new Error(
                    "Impossible de récupérer les catégories."
                );
            }


            const data =
                await response.json();


            setCategories(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Erreur catégories :",
                error
            );
        }
    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        const chargerDonnees = async () => {

            setLoading(true);
            setError("");

            const prestataireData =
                await chargerPrestataire();

            await Promise.all([
                chargerDestinations(),
                chargerCategories()
            ]);


            if (
                prestataireData?.id_prestataire
            ) {

                await chargerOffres(
                    prestataireData.id_prestataire
                );
            }


            setLoading(false);
        };


        chargerDonnees();

    }, []);


    // =====================================================
    // CHANGEMENT DES CHAMPS
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =====================================================
    // IMAGE PRINCIPALE
    // =====================================================

    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0] || null;


        setForm((previous) => ({
            ...previous,
            image: file
        }));
    };


    // =====================================================
    // PHOTOS DETAILLEES
    // =====================================================

    const handlePhotosChange = (e) => {

        const files =
            Array.from(
                e.target.files || []
            );


        setForm((previous) => ({
            ...previous,
            photos: files
        }));
    };


    // =====================================================
    // OUVRIR AJOUT
    // =====================================================

    const ouvrirAjout = () => {

        setMode("ajout");

        setSelectedOffre(null);

        setForm({
            ...initialForm
        });

        setError("");
        setMessage("");

        setShowModal(true);
    };


    // =====================================================
    // OUVRIR MODIFICATION
    // =====================================================

    const ouvrirModification = (offre) => {

        setMode("modification");

        setSelectedOffre(offre);


        setForm({
            id_destination:
                offre.id_destination || "",

            id_categorie:
                offre.id_categorie || "",

            titre:
                offre.titre || "",

            description:
                offre.description || "",

            prix:
                offre.prix || "",

            capacite:
                offre.capacite || "",

            disponibilite:
                offre.disponibilite || "",

            date_debut:
                offre.date_debut
                    ? String(offre.date_debut).substring(0, 10)
                    : "",

            date_fin:
                offre.date_fin
                    ? String(offre.date_fin).substring(0, 10)
                    : "",

            image: null,

            photos: []
        });


        setError("");
        setMessage("");

        setShowModal(true);
    };


    // =====================================================
    // FERMER MODAL
    // =====================================================

    const fermerModal = () => {

        if (loadingForm) {
            return;
        }

        setShowModal(false);

        setSelectedOffre(null);

        setForm({
            ...initialForm
        });

        setError("");
        setMessage("");
    };


    // =====================================================
    // ENREGISTRER OFFRE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!prestataire?.id_prestataire) {

            setError(
                "Prestataire introuvable."
            );

            return;
        }


        setLoadingForm(true);
        setError("");
        setMessage("");


        try {

            // =================================================
            // 1. FORM DATA DE L'OFFRE
            // =================================================

            const formData =
                new FormData();


            formData.append(
                "id_prestataire",
                prestataire.id_prestataire
            );

            formData.append(
                "id_destination",
                form.id_destination
            );

            formData.append(
                "id_categorie",
                form.id_categorie
            );

            formData.append(
                "titre",
                form.titre.trim()
            );

            formData.append(
                "description",
                form.description.trim()
            );

            formData.append(
                "prix",
                form.prix
            );

            formData.append(
                "capacite",
                form.capacite
            );

            formData.append(
                "disponibilite",
                form.disponibilite
            );

            formData.append(
                "date_debut",
                form.date_debut
            );

            formData.append(
                "date_fin",
                form.date_fin
            );


            // =================================================
            // IMAGE PRINCIPALE
            // =================================================

            if (form.image) {

                formData.append(
                    "image",
                    form.image
                );
            }


            // =================================================
            // URL ET METHODE
            // =================================================

            let url =
                `${API_URL}/offres`;

            let method = "POST";


            if (
                mode === "modification" &&
                selectedOffre
            ) {

                url =
                    `${API_URL}/offres/${selectedOffre.id_offre}`;

                method = "PUT";
            }


            console.log(
                "Enregistrement offre :",
                method,
                url
            );


            // =================================================
            // 2. ENREGISTRER L'OFFRE
            // =================================================

            const response =
                await fetch(
                    url,
                    {
                        method,
                        body: formData
                    }
                );


            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};
            }


            console.log(
                "Réponse offre :",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Impossible d'enregistrer l'offre."
                );
            }


            // =================================================
            // 3. RECUPERER ID OFFRE
            // =================================================

            let idOffre =
                null;


            if (
                mode === "modification" &&
                selectedOffre
            ) {

                idOffre =
                    selectedOffre.id_offre;

            } else {

                idOffre =
                    data.id_offre ||
                    data.id ||
                    data.offre?.id_offre ||
                    data.data?.id_offre;
            }


            console.log(
                "ID OFFRE :",
                idOffre
            );


            // =================================================
            // 4. PHOTOS DETAILLEES
            // =================================================

            if (
                form.photos &&
                form.photos.length > 0 &&
                idOffre
            ) {

                const photosFormData =
                    new FormData();


                form.photos.forEach(
                    (photo) => {

                        photosFormData.append(
                            "photos",
                            photo
                        );

                    }
                );


                console.log(
                    "Envoi des photos détaillées :",
                    form.photos.length
                );


                const photosResponse =
                    await fetch(
                        `${API_URL}/offres/${idOffre}/photos`,
                        {
                            method: "POST",
                            body: photosFormData
                        }
                    );


                let photosData = {};


                try {

                    photosData =
                        await photosResponse.json();

                } catch {

                    photosData = {};
                }


                console.log(
                    "Réponse photos :",
                    photosData
                );


                if (!photosResponse.ok) {

                    throw new Error(
                        photosData.message ||
                        photosData.error ||
                        "L'offre a été enregistrée, mais les photos détaillées n'ont pas pu être enregistrées."
                    );
                }
            }


            // =================================================
            // 5. MESSAGE DE SUCCES
            // =================================================

            setMessage(
                mode === "ajout"
                    ? "Offre et photos ajoutées avec succès."
                    : "Offre et photos enregistrées avec succès."
            );


            // =================================================
            // 6. ACTUALISER LA LISTE
            // =================================================

            await chargerOffres(
                prestataire.id_prestataire
            );


            setPage(1);


            // =================================================
            // 7. FERMER MODAL
            // =================================================

            setTimeout(() => {

                setShowModal(false);

                setSelectedOffre(null);

                setForm({
                    ...initialForm
                });

                setMessage("");

            }, 1000);


        } catch (error) {

            console.error(
                "Erreur enregistrement offre :",
                error
            );


            setError(
                error.message ||
                "Une erreur est survenue lors de l'enregistrement."
            );

        } finally {

            setLoadingForm(false);
        }
    };


    // =====================================================
    // SUPPRIMER OFFRE
    // =====================================================

    const supprimerOffre = async (
        idOffre
    ) => {

        const confirmation =
            window.confirm(
                "Voulez-vous vraiment supprimer cette offre ?"
            );


        if (!confirmation) {
            return;
        }


        try {

            setError("");
            setMessage("");


            const response =
                await fetch(
                    `${API_URL}/offres/${idOffre}`,
                    {
                        method: "DELETE"
                    }
                );


            let data = {};


            try {

                data =
                    await response.json();

            } catch {

                data = {};
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Impossible de supprimer l'offre."
                );
            }


            setMessage(
                "Offre supprimée avec succès."
            );


            await chargerOffres(
                prestataire.id_prestataire
            );


        } catch (error) {

            console.error(
                "Erreur suppression offre :",
                error
            );


            setError(
                error.message ||
                "Erreur lors de la suppression."
            );
        }
    };


    // =====================================================
    // RECHERCHE
    // =====================================================

    const offresFiltrees =
        offres.filter((offre) => {

            const texte =
                `${offre.titre || ""}
                ${offre.description || ""}
                ${offre.destination || ""}
                ${offre.categorie || ""}
                ${offre.ville || ""}`
                    .toLowerCase();


            return texte.includes(
                search.toLowerCase()
            );
        });


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                offresFiltrees.length /
                OFFRES_PAR_PAGE
            )
        );


    const indexDebut =
        (page - 1) *
        OFFRES_PAR_PAGE;


    const offresPage =
        offresFiltrees.slice(
            indexDebut,
            indexDebut +
                OFFRES_PAR_PAGE
        );


    useEffect(() => {

        if (page > totalPages) {
            setPage(totalPages);
        }

    }, [
        page,
        totalPages
    ]);


    // =====================================================
    // IMAGE
    // =====================================================

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }


        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;
        }


        return `${API_URL.replace(
            "/api",
            ""
        )}${image}`;
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }


        try {

            return new Date(date)
                .toLocaleDateString(
                    "fr-FR"
                );

        } catch {

            return date;
        }
    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (loading) {

        return (
            <div className="offres-loading">
                <div className="loading-spinner"></div>
                <p>
                    Chargement de vos offres...
                </p>
            </div>
        );
    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="offres-prestataire">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="offres-header">

                <div>

                    <h1>
                        Mes offres
                    </h1>

                    <p>
                        Gérez vos offres touristiques
                    </p>

                </div>


                <button
                    className="btn-ajouter"
                    onClick={ouvrirAjout}
                >
                    + Ajouter une offre
                </button>

            </div>


            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (

                <div className="message erreur">
                    {error}
                </div>

            )}


            {message && (

                <div className="message succes">
                    {message}
                </div>

            )}


            {/* =================================================
                RECHERCHE
            ================================================= */}

            <div className="offres-toolbar">

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Rechercher une offre..."
                        value={search}
                        onChange={(e) => {
                            setSearch(
                                e.target.value
                            );
                            setPage(1);
                        }}
                    />

                </div>


                <div className="nombre-offres">

                    {offresFiltrees.length} offre
                    {offresFiltrees.length > 1
                        ? "s"
                        : ""}

                </div>

            </div>


            {/* =================================================
                LISTE DES OFFRES
            ================================================= */}

            {offresPage.length === 0 ? (

                <div className="aucune-offre">

                    <div className="aucune-offre-icon">
                        🏝️
                    </div>

                    <h2>
                        Aucune offre trouvée
                    </h2>

                    <p>
                        {search
                            ? "Aucune offre ne correspond à votre recherche."
                            : "Vous n'avez pas encore créé d'offre."}
                    </p>


                    {!search && (

                        <button
                            className="btn-ajouter"
                            onClick={ouvrirAjout}
                        >
                            + Créer ma première offre
                        </button>

                    )}

                </div>

            ) : (

                <>

                    <div className="offres-grid">

                        {offresPage.map(
                            (offre) => (

                                <div
                                    className="offre-card"
                                    key={offre.id_offre}
                                >

                                    {/* IMAGE */}

                                    <div className="offre-image">

                                        {offre.image ? (

                                            <img
                                                src={getImageUrl(
                                                    offre.image
                                                )}
                                                alt={
                                                    offre.titre
                                                }
                                            />

                                        ) : (

                                            <div className="image-placeholder">
                                                🏝️
                                            </div>

                                        )}

                                    </div>


                                    {/* CONTENU */}

                                    <div className="offre-content">

                                        <div className="offre-categorie">

                                            {offre.categorie ||
                                                "Tourisme"}

                                        </div>


                                        <h2>
                                            {offre.titre}
                                        </h2>


                                        <p className="offre-destination">

                                            📍{" "}

                                            {offre.destination ||
                                                "Destination non renseignée"}

                                        </p>


                                        <p className="offre-description">

                                            {offre.description ||
                                                "Aucune description disponible."}

                                        </p>


                                        <div className="offre-infos">

                                            <span>
                                                👥{" "}
                                                {offre.capacite ||
                                                    0}{" "}
                                                personnes
                                            </span>

                                            <span>
                                                📅{" "}
                                                {formatDate(
                                                    offre.date_debut
                                                )}
                                            </span>

                                        </div>


                                        <div className="offre-prix">

                                            {Number(
                                                offre.prix || 0
                                            ).toLocaleString(
                                                "fr-FR"
                                            )}{" "}
                                            €

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="offre-actions">

                                            <Link
                                                to={`/detail-offre/${offre.id_offre}`}
                                                className="btn-details"
                                            >
                                                👁 Voir les détails
                                            </Link>


                                            <button
                                                className="btn-modifier"
                                                onClick={() =>
                                                    ouvrirModification(
                                                        offre
                                                    )
                                                }
                                            >
                                                ✏️ Modifier
                                            </button>


                                            <button
                                                className="btn-supprimer"
                                                onClick={() =>
                                                    supprimerOffre(
                                                        offre.id_offre
                                                    )
                                                }
                                            >
                                                🗑️ Supprimer
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {totalPages > 1 && (

                        <div className="pagination">

                            <button
                                disabled={
                                    page === 1
                                }
                                onClick={() =>
                                    setPage(
                                        page - 1
                                    )
                                }
                            >
                                ← Précédent
                            </button>


                            {Array.from(
                                {
                                    length:
                                        totalPages
                                },
                                (_, index) => {

                                    const numero =
                                        index + 1;


                                    return (

                                        <button
                                            key={numero}
                                            className={
                                                page === numero
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setPage(
                                                    numero
                                                )
                                            }
                                        >
                                            {numero}
                                        </button>

                                    );

                                }
                            )}


                            <button
                                disabled={
                                    page ===
                                    totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        page + 1
                                    )
                                }
                            >
                                Suivant →
                            </button>

                        </div>

                    )}

                </>

            )}


            {/* =====================================================
                MODAL AJOUT / MODIFICATION
            ===================================================== */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onClick={fermerModal}
                >

                    <div
                        className="modal-content"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* HEADER MODAL */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {mode === "ajout"
                                        ? "Ajouter une offre"
                                        : "Modifier l'offre"}

                                </h2>

                                <p>
                                    Informations de votre offre touristique
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={fermerModal}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORMULAIRE */}

                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="form-grid">

                                {/* DESTINATION */}

                                <div className="form-group">

                                    <label>
                                        Destination *
                                    </label>

                                    <select
                                        name="id_destination"
                                        value={
                                            form.id_destination
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Sélectionner une destination
                                        </option>

                                        {destinations.map(
                                            (destination) => (

                                                <option
                                                    key={
                                                        destination.id_destination
                                                    }
                                                    value={
                                                        destination.id_destination
                                                    }
                                                >
                                                    {
                                                        destination.nom
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* CATEGORIE */}

                                <div className="form-group">

                                    <label>
                                        Catégorie *
                                    </label>

                                    <select
                                        name="id_categorie"
                                        value={
                                            form.id_categorie
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Sélectionner une catégorie
                                        </option>

                                        {categories.map(
                                            (categorie) => (

                                                <option
                                                    key={
                                                        categorie.id_categorie
                                                    }
                                                    value={
                                                        categorie.id_categorie
                                                    }
                                                >
                                                    {
                                                        categorie.nom
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* TITRE */}

                                <div className="form-group full-width">

                                    <label>
                                        Titre de l'offre *
                                    </label>

                                    <input
                                        type="text"
                                        name="titre"
                                        value={
                                            form.titre
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ex : Séjour découverte de Nosy Be"
                                        required
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="form-group full-width">

                                    <label>
                                        Description *
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="4"
                                        placeholder="Décrivez votre offre touristique..."
                                        required
                                    />

                                </div>


                                {/* PRIX */}

                                <div className="form-group">

                                    <label>
                                        Prix (€) *
                                    </label>

                                    <input
                                        type="number"
                                        name="prix"
                                        value={
                                            form.prix
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="Ex : 490"
                                        required
                                    />

                                </div>


                                {/* CAPACITE */}

                                <div className="form-group">

                                    <label>
                                        Capacité *
                                    </label>

                                    <input
                                        type="number"
                                        name="capacite"
                                        value={
                                            form.capacite
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="1"
                                        placeholder="Ex : 10"
                                        required
                                    />

                                </div>


                                {/* DISPONIBILITE */}

                                <div className="form-group">

                                    <label>
                                        Disponibilité *
                                    </label>

                                    <input
                                        type="number"
                                        name="disponibilite"
                                        value={
                                            form.disponibilite
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        placeholder="Ex : 10"
                                        required
                                    />

                                </div>


                                {/* DATE DEBUT */}

                                <div className="form-group">

                                    <label>
                                        Date de début *
                                    </label>

                                    <input
                                        type="date"
                                        name="date_debut"
                                        value={
                                            form.date_debut
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* DATE FIN */}

                                <div className="form-group">

                                    <label>
                                        Date de fin *
                                    </label>

                                    <input
                                        type="date"
                                        name="date_fin"
                                        value={
                                            form.date_fin
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* =================================================
                                    IMAGE PRINCIPALE
                                ================================================= */}

                                <div className="form-group full-width">

                                    <label>
                                        Image principale
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        required={
                                            mode === "ajout"
                                        }
                                    />


                                    {form.image && (

                                        <div className="image-preview">

                                            <img
                                                src={
                                                    URL.createObjectURL(
                                                        form.image
                                                    )
                                                }
                                                alt="Aperçu"
                                            />

                                        </div>

                                    )}


                                    {mode === "modification" &&
                                        !form.image &&
                                        selectedOffre?.image && (

                                            <div className="image-preview">

                                                <img
                                                    src={getImageUrl(
                                                        selectedOffre.image
                                                    )}
                                                    alt={
                                                        selectedOffre.titre
                                                    }
                                                />

                                            </div>

                                        )}

                                </div>


                                {/* =================================================
                                    PHOTOS DETAILLEES
                                ================================================= */}

                                <div className="form-group full-width">

                                    <label>
                                        Photos détaillées
                                    </label>

                                    <p className="form-help">

                                        Ajoutez plusieurs photos pour présenter
                                        les différents aspects de votre offre.

                                    </p>


                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        multiple
                                        onChange={
                                            handlePhotosChange
                                        }
                                    />


                                    {form.photos &&
                                        form.photos.length > 0 && (

                                            <div className="photos-selection">

                                                <strong>

                                                    {
                                                        form.photos.length
                                                    }{" "}
                                                    photo
                                                    {form.photos.length > 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    sélectionnée
                                                    {form.photos.length > 1
                                                        ? "s"
                                                        : ""}

                                                </strong>


                                                <div className="photos-preview-grid">

                                                    {form.photos.map(
                                                        (
                                                            photo,
                                                            index
                                                        ) => (

                                                            <div
                                                                className="photo-preview-item"
                                                                key={
                                                                    index
                                                                }
                                                            >

                                                                <img
                                                                    src={
                                                                        URL.createObjectURL(
                                                                            photo
                                                                        )
                                                                    }
                                                                    alt={`Photo ${index + 1}`}
                                                                />

                                                                <span>
                                                                    Photo{" "}
                                                                    {index + 1}
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                </div>

                            </div>


                            {/* =================================================
                                ERREUR DANS LE MODAL
                            ================================================= */}

                            {error && (

                                <div className="message erreur">

                                    {error}

                                </div>

                            )}


                            {/* =================================================
                                ACTIONS MODAL
                            ================================================= */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-annuler"
                                    onClick={
                                        fermerModal
                                    }
                                    disabled={
                                        loadingForm
                                    }
                                >
                                    Annuler
                                </button>


                                <button
                                    type="submit"
                                    className="btn-enregistrer"
                                    disabled={
                                        loadingForm
                                    }
                                >

                                    {loadingForm
                                        ? "Enregistrement..."
                                        : mode === "ajout"
                                            ? "Créer l'offre"
                                            : "Enregistrer les modifications"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default OffresPrestataire;