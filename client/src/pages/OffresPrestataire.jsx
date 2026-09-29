import React, { useEffect, useState } from "react";
import "./OffresPrestataire.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8081/api";

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
};

function OffresPrestataire() {
    const [utilisateur, setUtilisateur] = useState(null);
    const [prestataire, setPrestataire] = useState(null);

    const [offres, setOffres] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("ajout");

    const [selectedOffre, setSelectedOffre] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ============================================================
    // RECUPERATION DE L'UTILISATEUR CONNECTE
    // ============================================================

    useEffect(() => {
        const utilisateurStocke =
            localStorage.getItem("utilisateur");

        if (!utilisateurStocke) {
            setError("Utilisateur non connecté.");
            setLoading(false);
            return;
        }

        try {
            const data = JSON.parse(utilisateurStocke);
            setUtilisateur(data);
        } catch (err) {
            console.error(err);
            setError("Impossible de récupérer les informations du compte.");
            setLoading(false);
        }
    }, []);

    // ============================================================
    // CHARGEMENT DU PRESTATAIRE
    // ============================================================

    useEffect(() => {
        if (!utilisateur) return;

        const idUtilisateur =
            utilisateur.id || utilisateur.id_utilisateur;

        if (!idUtilisateur) {
            setError("ID utilisateur introuvable.");
            setLoading(false);
            return;
        }

        chargerPrestataire(idUtilisateur);
    }, [utilisateur]);

    // ============================================================
    // CHARGEMENT DES DESTINATIONS ET CATEGORIES
    // ============================================================

    useEffect(() => {
        chargerDestinations();
        chargerCategories();
    }, []);

    // ============================================================
    // RECUPERER LE PRESTATAIRE
    // ============================================================

    const chargerPrestataire = async (idUtilisateur) => {
        try {
            const response = await fetch(
                `${API_URL}/prestataires/utilisateur/${idUtilisateur}`
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de récupérer le prestataire."
                );
            }

            const data = await response.json();

            setPrestataire(data);

            if (data?.id_prestataire) {
                await chargerOffres(data.id_prestataire);
            } else {
                setError("Aucun prestataire associé à ce compte.");
                setLoading(false);
            }
        } catch (err) {
            console.error(
                "Erreur récupération prestataire :",
                err
            );

            setError(
                "Impossible de récupérer les informations du prestataire."
            );

            setLoading(false);
        }
    };

    // ============================================================
    // CHARGER LES OFFRES DU PRESTATAIRE
    // ============================================================

    const chargerOffres = async (idPrestataire) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/offres/prestataire/${idPrestataire}`
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de récupérer les offres."
                );
            }

            const data = await response.json();

            setOffres(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Erreur chargement offres :",
                err
            );

            setError(
                "Impossible de récupérer les offres publiées."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // DESTINATIONS
    // ============================================================

    const chargerDestinations = async () => {
        try {
            const response = await fetch(
                `${API_URL}/destinations`
            );

            if (!response.ok) {
                throw new Error(
                    "Erreur chargement destinations."
                );
            }

            const data = await response.json();

            setDestinations(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Erreur destinations :",
                err
            );
        }
    };

    // ============================================================
    // CATEGORIES
    // ============================================================

    const chargerCategories = async () => {
        try {
            const response = await fetch(
                `${API_URL}/categories`
            );

            if (!response.ok) {
                throw new Error(
                    "Erreur chargement catégories."
                );
            }

            const data = await response.json();

            setCategories(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Erreur catégories :",
                err
            );
        }
    };

    // ============================================================
    // CHANGEMENT DU FORMULAIRE
    // ============================================================

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setForm((prev) => ({
                ...prev,
                image: files?.[0] || null,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ============================================================
    // OUVRIR MODALE AJOUT
    // ============================================================

    const ouvrirAjout = () => {
        setMode("ajout");
        setSelectedOffre(null);

        setForm({
            ...initialForm,
        });

        setMessage("");
        setError("");
        setShowModal(true);
    };

    // ============================================================
    // OUVRIR MODALE MODIFICATION
    // ============================================================

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
        });

        setMessage("");
        setError("");
        setShowModal(true);
    };

    // ============================================================
    // FERMER MODALE
    // ============================================================

    const fermerModal = () => {
        if (loadingForm) return;

        setShowModal(false);
        setSelectedOffre(null);
        setForm(initialForm);
        setMessage("");
        setError("");
    };

    // ============================================================
    // AJOUT / MODIFICATION
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!prestataire?.id_prestataire) {
            setError("Prestataire introuvable.");
            return;
        }

        setLoadingForm(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();

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

            if (form.image) {
                formData.append(
                    "image",
                    form.image
                );
            }

            let url = `${API_URL}/offres`;
            let method = "POST";

            if (
                mode === "modification" &&
                selectedOffre
            ) {
                url = `${API_URL}/offres/${selectedOffre.id_offre}`;
                method = "PUT";
            }

            const response = await fetch(
                url,
                {
                    method,
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Une erreur est survenue."
                );
            }

            setMessage(
                mode === "ajout"
                    ? "Offre ajoutée avec succès."
                    : "Offre modifiée avec succès."
            );

            await chargerOffres(
                prestataire.id_prestataire
            );

            setTimeout(() => {
                fermerModal();
            }, 700);
        } catch (err) {
            console.error(
                "Erreur enregistrement offre :",
                err
            );

            setError(
                err.message ||
                "Impossible d'enregistrer l'offre."
            );
        } finally {
            setLoadingForm(false);
        }
    };

    // ============================================================
    // SUPPRIMER UNE OFFRE
    // ============================================================

    const supprimerOffre = async (offre) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer l'offre "${offre.titre}" ?`
        );

        if (!confirmation) return;

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/offres/${offre.id_offre}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible de supprimer l'offre."
                );
            }

            setMessage(
                "Offre supprimée avec succès."
            );

            await chargerOffres(
                prestataire.id_prestataire
            );
        } catch (err) {
            console.error(
                "Erreur suppression offre :",
                err
            );

            setError(
                err.message ||
                "Impossible de supprimer l'offre."
            );
        }
    };

    // ============================================================
    // FILTRAGE RECHERCHE
    // ============================================================

    const offresFiltrees = offres.filter((offre) => {
        const recherche =
            search.toLowerCase().trim();

        if (!recherche) return true;

        return (
            String(offre.titre || "")
                .toLowerCase()
                .includes(recherche) ||

            String(offre.destination || "")
                .toLowerCase()
                .includes(recherche) ||

            String(offre.categorie || "")
                .toLowerCase()
                .includes(recherche)
        );
    });

    // ============================================================
    // FORMAT PRIX
    // ============================================================

    const formatPrix = (prix) => {
        return Number(prix || 0).toLocaleString(
            "fr-FR"
        );
    };

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {
        if (!date) return "Non définie";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
            return date;
        }

        return d.toLocaleDateString(
            "fr-FR"
        );
    };

    // ============================================================
    // AFFICHAGE
    // ============================================================

    if (loading) {
        return (
            <div className="offres-page">
                <div className="offres-loading">
                    <div className="loading-spinner"></div>
                    <p>
                        Chargement de vos offres...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="offres-page">

            {/* ==================================================
                EN-TETE
            ================================================== */}

            <div className="offres-header">

                <div>
                    <div className="page-breadcrumb">
                        Espace prestataire
                        <span>/</span>
                        Mes offres
                    </div>

                    <h1>
                        Mes offres
                    </h1>

                    <p>
                        Gérez les offres touristiques
                        publiées par votre établissement.
                    </p>
                </div>

                <button
                    className="btn-add-offre"
                    onClick={ouvrirAjout}
                >
                    <span className="btn-icon">
                        +
                    </span>

                    Ajouter une offre
                </button>

            </div>

            {/* ==================================================
                MESSAGES
            ================================================== */}

            {message && (
                <div className="alert alert-success">
                    <span>✓</span>
                    {message}
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* ==================================================
                INFORMATIONS
            ================================================== */}

            <div className="prestataire-summary">

                <div className="summary-company">
                    <div className="company-icon">
                        🏨
                    </div>

                    <div>
                        <span>
                            Établissement
                        </span>

                        <strong>
                            {prestataire?.nom_entreprise ||
                                "Mon établissement"}
                        </strong>
                    </div>
                </div>

                <div className="summary-stat">
                    <strong>
                        {offres.length}
                    </strong>

                    <span>
                        Offre{offres.length > 1 ? "s" : ""} publiée
                        {offres.length > 1 ? "s" : ""}
                    </span>
                </div>

            </div>

            {/* ==================================================
                BARRE DE RECHERCHE
            ================================================== */}

            <div className="offres-toolbar">

                <div className="search-box">

                    <span className="search-icon">
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Rechercher une offre, une destination..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            className="clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>
                    )}

                </div>

                <div className="result-count">
                    {offresFiltrees.length} résultat
                    {offresFiltrees.length > 1
                        ? "s"
                        : ""}
                </div>

            </div>

            {/* ==================================================
                AUCUNE OFFRE
            ================================================== */}

            {offres.length === 0 ? (
                <div className="empty-state">

                    <div className="empty-icon">
                        🏝️
                    </div>

                    <h2>
                        Aucune offre publiée
                    </h2>

                    <p>
                        Vous n'avez pas encore publié
                        d'offre touristique.
                    </p>

                    <button
                        className="btn-add-offre"
                        onClick={ouvrirAjout}
                    >
                        <span className="btn-icon">
                            +
                        </span>

                        Créer ma première offre
                    </button>

                </div>
            ) : offresFiltrees.length === 0 ? (
                <div className="empty-search">

                    <div>
                        🔎
                    </div>

                    <h3>
                        Aucune offre trouvée
                    </h3>

                    <p>
                        Essayez avec un autre terme
                        de recherche.
                    </p>

                </div>
            ) : (

                /* ==================================================
                   LISTE DES OFFRES
                ================================================== */

                <div className="offres-grid">

                    {offresFiltrees.map((offre) => (

                        <article
                            className="offre-card"
                            key={offre.id_offre}
                        >

                            {/* IMAGE */}

                            <div className="offre-image-container">

                                {offre.image ? (
                                    <img
                                        src={offre.image}
                                        alt={offre.titre}
                                        className="offre-image"
                                    />
                                ) : (
                                    <div className="offre-no-image">
                                        <span>
                                            🏝️
                                        </span>

                                        <small>
                                            Aucune image
                                        </small>
                                    </div>
                                )}

                                <div className="offre-status">
                                    Publiée
                                </div>

                                <div className="offre-price">

                                    <strong>
                                        {formatPrix(
                                            offre.prix
                                        )}
                                    </strong>

                                    <span>
                                        Ar
                                    </span>

                                </div>

                            </div>

                            {/* CONTENU */}

                            <div className="offre-content">

                                <div className="offre-category">
                                    {offre.categorie ||
                                        "Offre touristique"}
                                </div>

                                <h2>
                                    {offre.titre}
                                </h2>

                                <div className="offre-destination">
                                    <span>
                                        📍
                                    </span>

                                    {offre.destination ||
                                        "Destination non définie"}
                                </div>

                                <p className="offre-description">
                                    {offre.description
                                        ? offre.description.length >
                                          110
                                            ? `${offre.description.substring(
                                                  0,
                                                  110
                                              )}...`
                                            : offre.description
                                        : "Aucune description disponible."}
                                </p>

                                {/* DETAILS */}

                                <div className="offre-details">

                                    <div>
                                        <span>
                                            👥
                                        </span>

                                        <div>
                                            <small>
                                                Capacité
                                            </small>

                                            <strong>
                                                {offre.capacite ||
                                                    0}{" "}
                                                personnes
                                            </strong>
                                        </div>
                                    </div>

                                    <div>
                                        <span>
                                            🎟️
                                        </span>

                                        <div>
                                            <small>
                                                Disponibilité
                                            </small>

                                            <strong>
                                                {offre.disponibilite ||
                                                    0}{" "}
                                                place
                                                {Number(
                                                    offre.disponibilite
                                                ) > 1
                                                    ? "s"
                                                    : ""}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                {/* DATES */}

                                <div className="offre-dates">

                                    <div>
                                        <small>
                                            Début
                                        </small>

                                        <span>
                                            {formatDate(
                                                offre.date_debut
                                            )}
                                        </span>
                                    </div>

                                    <div>
                                        <small>
                                            Fin
                                        </small>

                                        <span>
                                            {formatDate(
                                                offre.date_fin
                                            )}
                                        </span>
                                    </div>

                                </div>

                                {/* ACTIONS */}

                                <div className="offre-actions">

                                    <button
                                        className="btn-edit"
                                        onClick={() =>
                                            ouvrirModification(
                                                offre
                                            )
                                        }
                                    >
                                        ✎ Modifier
                                    </button>

                                    <button
                                        className="btn-delete"
                                        onClick={() =>
                                            supprimerOffre(
                                                offre
                                            )
                                        }
                                    >
                                        🗑 Supprimer
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))}

                </div>
            )}

            {/* ==================================================
                MODALE AJOUT / MODIFICATION
            ================================================== */}

            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            fermerModal();
                        }
                    }}
                >

                    <div className="offre-modal">

                        {/* MODALE HEADER */}

                        <div className="modal-header">

                            <div>
                                <span>
                                    {mode === "ajout"
                                        ? "Nouvelle publication"
                                        : "Modification"}
                                </span>

                                <h2>
                                    {mode === "ajout"
                                        ? "Ajouter une offre"
                                        : "Modifier l'offre"}
                                </h2>
                            </div>

                            <button
                                className="modal-close"
                                onClick={fermerModal}
                            >
                                ×
                            </button>

                        </div>

                        {/* MESSAGE MODALE */}

                        {message && (
                            <div className="modal-success">
                                ✓ {message}
                            </div>
                        )}

                        {error && (
                            <div className="modal-error">
                                ! {error}
                            </div>
                        )}

                        {/* FORMULAIRE */}

                        <form
                            className="offre-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-section">

                                <h3>
                                    Informations générales
                                </h3>

                                <div className="form-grid">

                                    <div className="form-group full-width">

                                        <label>
                                            Titre de l'offre *
                                        </label>

                                        <input
                                            type="text"
                                            name="titre"
                                            value={form.titre}
                                            onChange={handleChange}
                                            placeholder="Ex : Séjour découverte de Nosy Be"
                                            required
                                        />

                                    </div>

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
                                            placeholder="Décrivez votre offre touristique..."
                                            rows="4"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Tarification et capacité
                                </h3>

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Prix *
                                        </label>

                                        <div className="input-unit">

                                            <input
                                                type="number"
                                                name="prix"
                                                value={
                                                    form.prix
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min="1"
                                                step="0.01"
                                                placeholder="0"
                                                required
                                            />

                                            <span>
                                                Ar
                                            </span>

                                        </div>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Capacité *
                                        </label>

                                        <div className="input-unit">

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
                                                step="1"
                                                placeholder="Ex : 20"
                                                required
                                            />

                                            <span>
                                                pers.
                                            </span>

                                        </div>

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Disponibilité *
                                        </label>

                                        <div className="input-unit">

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
                                                step="1"
                                                placeholder="Ex : 10"
                                                required
                                            />

                                            <span>
                                                places
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Période de l'offre
                                </h3>

                                <div className="form-grid">

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

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Image de l'offre
                                </h3>

                                <div className="image-upload">

                                    <label
                                        htmlFor="offre-image"
                                        className="image-upload-label"
                                    >

                                        <span>
                                            📷
                                        </span>

                                        <strong>
                                            {form.image
                                                ? form.image.name
                                                : mode ===
                                                  "modification"
                                                ? "Choisir une nouvelle image"
                                                : "Ajouter une image"}
                                        </strong>

                                        <small>
                                            JPG, JPEG, PNG ou WEBP
                                        </small>

                                    </label>

                                    <input
                                        id="offre-image"
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>

                            {/* BOUTONS */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={fermerModal}
                                    disabled={
                                        loadingForm
                                    }
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={
                                        loadingForm
                                    }
                                >
                                    {loadingForm ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Enregistrement...
                                        </>
                                    ) : mode ===
                                      "ajout" ? (
                                        <>
                                            ✓ Publier l'offre
                                        </>
                                    ) : (
                                        <>
                                            ✓ Enregistrer les modifications
                                        </>
                                    )}
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