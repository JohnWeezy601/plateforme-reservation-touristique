import { useEffect, useState } from "react";
import api from "../api/api";
import "./Offres.css";

function Offres() {

    // =========================================================
    // DONNÉES
    // =========================================================

    const [offres, setOffres] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [prestataires, setPrestataires] = useState([]);

    // =========================================================
    // MODALE
    // =========================================================

    const [modal, setModal] = useState(false);
    const [menuOuvert, setMenuOuvert] = useState(null);

    const [modeModification, setModeModification] = useState(false);
    const [idModification, setIdModification] = useState(null);

    // =========================================================
    // IMAGES
    // =========================================================

    const [image, setImage] = useState(null);
    const [photosDetails, setPhotosDetails] = useState([]);
    const [photosExistantes, setPhotosExistantes] = useState([]);

    // =========================================================
    // RECHERCHE
    // =========================================================

    const [recherche, setRecherche] = useState("");

    // =========================================================
    // PAGINATION
    // =========================================================

    const [pageActuelle, setPageActuelle] = useState(1);

    const offresParPage = 6;

    // =========================================================
    // CHARGEMENT
    // =========================================================

    const [chargement, setChargement] = useState(false);

    // =========================================================
    // FORMULAIRE
    // =========================================================

    const [offre, setOffre] = useState({

        id_prestataire: "",
        id_destination: "",
        id_categorie: "",

        titre: "",
        description: "",

        prix: "",
        capacite: "",
        disponibilite: "",

        date_debut: "",
        date_fin: ""

    });

    // =========================================================
    // ERREURS
    // =========================================================

    const [erreurs, setErreurs] = useState({});

    // =========================================================
    // URL SERVEUR
    // =========================================================

    const SERVER_URL =
        import.meta.env.VITE_SERVER_URL;

    // =========================================================
    // CHARGER LES DONNÉES
    // =========================================================

    const chargerDonnees = async () => {

        try {

            console.log("🔄 Chargement des données...");

            const [
                offresRes,
                destinationsRes,
                categoriesRes,
                prestatairesRes
            ] = await Promise.all([

                api.get("/offres"),

                api.get("/destinations"),

                api.get("/categories"),

                api.get("/prestataires")

            ]);

            setOffres(
                Array.isArray(offresRes.data)
                    ? offresRes.data
                    : []
            );

            setDestinations(
                Array.isArray(destinationsRes.data)
                    ? destinationsRes.data
                    : []
            );

            setCategories(
                Array.isArray(categoriesRes.data)
                    ? categoriesRes.data
                    : []
            );

            setPrestataires(
                Array.isArray(prestatairesRes.data)
                    ? prestatairesRes.data
                    : []
            );

            console.log("✅ Données chargées");

        }

        catch (error) {

            console.error(
                "❌ Erreur chargement données :",
                error
            );

        }

    };

    // =========================================================
    // CHARGEMENT INITIAL
    // =========================================================

    useEffect(() => {

        chargerDonnees();

    }, []);

    // =========================================================
    // CHANGEMENT INPUT
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setOffre((ancienne) => ({

            ...ancienne,

            [name]: value

        }));

        if (erreurs[name]) {

            setErreurs((ancienne) => ({

                ...ancienne,

                [name]: ""

            }));

        }

    };

    // =========================================================
    // IMAGE PRINCIPALE
    // =========================================================

    const handleImage = (e) => {

        const fichier =
            e.target.files?.[0];

        if (!fichier) {

            setImage(null);

            return;

        }

        const formatsAutorises = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"

        ];

        if (
            !formatsAutorises.includes(
                fichier.type
            )
        ) {

            alert(
                "Format d'image non autorisé. Utilisez JPG, JPEG, PNG ou WEBP."
            );

            e.target.value = "";

            setImage(null);

            return;

        }

        if (
            fichier.size >
            5 * 1024 * 1024
        ) {

            alert(
                "L'image ne doit pas dépasser 5 Mo."
            );

            e.target.value = "";

            setImage(null);

            return;

        }

        setImage(fichier);

    };

    // =========================================================
    // PHOTOS DÉTAILLÉES
    // =========================================================

    const handlePhotosDetails = (e) => {

        const fichiers = Array.from(
            e.target.files || []
        );

        if (
            fichiers.length === 0
        ) {

            return;

        }

        const formatsAutorises = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"

        ];

        const fichiersValides = [];

        for (
            const fichier
            of fichiers
        ) {

            if (
                !formatsAutorises.includes(
                    fichier.type
                )
            ) {

                alert(
                    `Le fichier "${fichier.name}" n'est pas une image autorisée.`
                );

                continue;

            }

            if (
                fichier.size >
                5 * 1024 * 1024
            ) {

                alert(
                    `Le fichier "${fichier.name}" dépasse 5 Mo.`
                );

                continue;

            }

            fichiersValides.push(
                fichier
            );

        }

        // =====================================================
        // NOMBRE DE PHOTOS DÉJÀ ENREGISTRÉES
        // =====================================================

        const nombreExistantes =
            photosExistantes.length;

        const nombreNouvelles =
            photosDetails.length;

        const nombreTotal =
            nombreExistantes +
            nombreNouvelles;

        const nombreDisponible =
            10 - nombreTotal;

        if (
            nombreDisponible <= 0
        ) {

            alert(
                "Maximum 10 photos détaillées par offre."
            );

            e.target.value = "";

            return;

        }

        const photosAAjouter =
            fichiersValides.slice(
                0,
                nombreDisponible
            );

        setPhotosDetails(
            (anciennes) => [

                ...anciennes,

                ...photosAAjouter

            ]
        );

        if (
            fichiersValides.length >
            nombreDisponible
        ) {

            alert(
                `Vous pouvez encore ajouter seulement ${nombreDisponible} photo(s). Maximum 10 photos au total.`
            );

        }

        e.target.value = "";

    };

    // =========================================================
    // SUPPRIMER PHOTO SÉLECTIONNÉE
    // =========================================================

    const supprimerPhotoSelectionnee = (
        index
    ) => {

        setPhotosDetails(
            (anciennes) =>
                anciennes.filter(
                    (_, i) =>
                        i !== index
                )
        );

    };

    // =========================================================
    // SUPPRIMER PHOTO EXISTANTE
    // =========================================================

    const supprimerPhotoExistante = async (
        idPhoto
    ) => {

        if (
            !window.confirm(
                "Voulez-vous vraiment supprimer cette photo ?"
            )
        ) {

            return;

        }

        try {

            await api.delete(
                `/offres/photos/${idPhoto}`
            );

            setPhotosExistantes(
                (anciennes) =>
                    anciennes.filter(
                        (photo) =>
                            photo.id_photo !==
                            idPhoto
                    )
            );

            alert(
                "Photo supprimée avec succès."
            );

        }

        catch (error) {

            console.error(
                "❌ Erreur suppression photo :",
                error
            );

            alert(

                error.response?.data?.message ||

                "Erreur lors de la suppression de la photo."

            );

        }

    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validerFormulaire = () => {

        const nouvellesErreurs = {};

        // =====================================================
        // TITRE
        // =====================================================

        if (
            !offre.titre.trim()
        ) {

            nouvellesErreurs.titre =
                "Le titre est obligatoire.";

        }

        else if (
            offre.titre.trim().length <
            3
        ) {

            nouvellesErreurs.titre =
                "Le titre doit contenir au moins 3 caractères.";

        }

        // =====================================================
        // PRESTATAIRE
        // =====================================================

        if (
            !offre.id_prestataire
        ) {

            nouvellesErreurs.id_prestataire =
                "Veuillez choisir un prestataire.";

        }

        // =====================================================
        // DESTINATION
        // =====================================================

        if (
            !offre.id_destination
        ) {

            nouvellesErreurs.id_destination =
                "Veuillez choisir une destination.";

        }

        // =====================================================
        // CATÉGORIE
        // =====================================================

        if (
            !offre.id_categorie
        ) {

            nouvellesErreurs.id_categorie =
                "Veuillez choisir une catégorie.";

        }

        // =====================================================
        // DESCRIPTION
        // =====================================================

        if (
            !offre.description.trim()
        ) {

            nouvellesErreurs.description =
                "La description est obligatoire.";

        }

        else if (
            offre.description.trim().length <
            10
        ) {

            nouvellesErreurs.description =
                "La description doit contenir au moins 10 caractères.";

        }

        // =====================================================
        // PRIX
        // =====================================================

        const prix =
            Number(offre.prix);

        if (
            offre.prix === ""
        ) {

            nouvellesErreurs.prix =
                "Le prix est obligatoire.";

        }

        else if (
            isNaN(prix) ||
            prix <= 0
        ) {

            nouvellesErreurs.prix =
                "Le prix doit être supérieur à 0.";

        }

        // =====================================================
        // CAPACITÉ
        // =====================================================

        const capacite =
            Number(offre.capacite);

        if (
            offre.capacite === ""
        ) {

            nouvellesErreurs.capacite =
                "La capacité est obligatoire.";

        }

        else if (
            isNaN(capacite) ||
            capacite <= 0 ||
            !Number.isInteger(capacite)
        ) {

            nouvellesErreurs.capacite =
                "La capacité doit être un entier supérieur à 0.";

        }

        // =====================================================
        // DISPONIBILITÉ
        // =====================================================

        const disponibilite =
            Number(
                offre.disponibilite
            );

        if (
            offre.disponibilite === ""
        ) {

            nouvellesErreurs.disponibilite =
                "La disponibilité est obligatoire.";

        }

        else if (
            isNaN(disponibilite) ||
            disponibilite < 0 ||
            !Number.isInteger(
                disponibilite
            )
        ) {

            nouvellesErreurs.disponibilite =
                "La disponibilité doit être un entier positif ou égal à 0.";

        }

        else if (
            capacite > 0 &&
            disponibilite > capacite
        ) {

            nouvellesErreurs.disponibilite =
                "La disponibilité ne peut pas dépasser la capacité.";

        }

        // =====================================================
        // DATE DÉBUT
        // =====================================================

        if (
            !offre.date_debut
        ) {

            nouvellesErreurs.date_debut =
                "La date de début est obligatoire.";

        }

        // =====================================================
        // DATE FIN
        // =====================================================

        if (
            !offre.date_fin
        ) {

            nouvellesErreurs.date_fin =
                "La date de fin est obligatoire.";

        }

        // =====================================================
        // COMPARAISON DATES
        // =====================================================

        if (
            offre.date_debut &&
            offre.date_fin &&
            offre.date_fin <
            offre.date_debut
        ) {

            nouvellesErreurs.date_fin =
                "La date de fin doit être après ou égale à la date de début.";

        }

        setErreurs(
            nouvellesErreurs
        );

        return (
            Object.keys(
                nouvellesErreurs
            ).length === 0
        );

    };

    // =========================================================
    // RESET
    // =========================================================

    const resetForm = () => {

        setOffre({

            id_prestataire: "",
            id_destination: "",
            id_categorie: "",

            titre: "",
            description: "",

            prix: "",
            capacite: "",
            disponibilite: "",

            date_debut: "",
            date_fin: ""

        });

        setImage(null);

        setPhotosDetails([]);

        setPhotosExistantes([]);

        setModeModification(false);

        setIdModification(null);

        setErreurs({});

    };

    // =========================================================
    // OUVRIR AJOUT
    // =========================================================

    const ouvrirAjout = () => {

        resetForm();

        setModal(true);

    };

    // =========================================================
    // ENVOYER PHOTOS DÉTAILLÉES
    // =========================================================

    const envoyerPhotosDetails = async (
        idOffre
    ) => {

        if (
            !photosDetails ||
            photosDetails.length === 0
        ) {

            return;

        }

        const formDataPhotos =
            new FormData();

        photosDetails.forEach(
            (photo) => {

                formDataPhotos.append(
                    "photos",
                    photo
                );

            }
        );

        const response =
            await api.post(

                `/offres/${idOffre}/photos`,

                formDataPhotos,

                {
                    headers: {

                        "Content-Type":
                            "multipart/form-data"

                    }

                }

            );

        console.log(
            "✅ Photos ajoutées :",
            response.data
        );

    };

    // =========================================================
    // ENREGISTRER OFFRE
    // =========================================================

    const enregistrerOffre = async (
        e
    ) => {

        if (e) {

            e.preventDefault();

        }

        if (
            !validerFormulaire()
        ) {

            return;

        }

        try {

            setChargement(true);

            // =================================================
            // FORM DATA
            // =================================================

            const formData =
                new FormData();

            Object.keys(offre).forEach(
                (key) => {

                    formData.append(
                        key,
                        offre[key]
                    );

                }
            );

            // =================================================
            // IMAGE PRINCIPALE
            // =================================================

            if (image) {

                formData.append(
                    "image",
                    image
                );

            }

            // =================================================
            // MODIFICATION
            // =================================================

            if (
                modeModification
            ) {

                const response =
                    await api.put(

                        `/offres/${idModification}`,

                        formData,

                        {

                            headers: {

                                "Content-Type":
                                    "multipart/form-data"

                            }

                        }

                    );

                console.log(
                    "✅ Offre modifiée :",
                    response.data
                );

                // =============================================
                // AJOUTER NOUVELLES PHOTOS DÉTAILLÉES
                // =============================================

                if (
                    photosDetails.length >
                    0
                ) {

                    await envoyerPhotosDetails(
                        idModification
                    );

                }

                alert(
                    "Offre modifiée avec succès."
                );

            }

            // =================================================
            // AJOUT
            // =================================================

            else {

                const response =
                    await api.post(

                        "/offres",

                        formData,

                        {

                            headers: {

                                "Content-Type":
                                    "multipart/form-data"

                            }

                        }

                    );

                console.log(
                    "✅ Offre ajoutée :",
                    response.data
                );

                const nouvelId =
                    response.data.id_offre;

                // =============================================
                // AJOUT PHOTOS DÉTAILLÉES
                // =============================================

                if (
                    nouvelId &&
                    photosDetails.length >
                    0
                ) {

                    await envoyerPhotosDetails(
                        nouvelId
                    );

                }

                alert(
                    "Offre ajoutée avec succès."
                );

            }

            // =================================================
            // RECHARGER
            // =================================================

            await chargerDonnees();

            resetForm();

            setModal(false);

            setPageActuelle(1);

        }

        catch (error) {

            console.error(
                "❌ ERREUR ENREGISTREMENT OFFRE :",
                error
            );

            console.error(
                "Réponse serveur :",
                error.response?.data
            );

            alert(

                error.response?.data?.message ||

                "Erreur lors de l'enregistrement de l'offre."

            );

        }

        finally {

            setChargement(false);

        }

    };

    // =========================================================
    // MODIFIER OFFRE
    // =========================================================

    const modifierOffre = async (
        item
    ) => {

        try {

            setChargement(true);

            const response =
                await api.get(

                    `/offres/${item.id_offre}`

                );

            const offreComplete =
                response.data;

            // =================================================
            // REMPLIR FORMULAIRE
            // =================================================

            setOffre({

                id_prestataire:
                    offreComplete.id_prestataire ||
                    "",

                id_destination:
                    offreComplete.id_destination ||
                    "",

                id_categorie:
                    offreComplete.id_categorie ||
                    "",

                titre:
                    offreComplete.titre ||
                    "",

                description:
                    offreComplete.description ||
                    "",

                prix:
                    offreComplete.prix ??
                    "",

                capacite:
                    offreComplete.capacite ??
                    "",

                disponibilite:
                    offreComplete.disponibilite ??
                    "",

                date_debut:
                    offreComplete.date_debut
                        ? String(
                            offreComplete.date_debut
                        ).substring(
                            0,
                            10
                        )
                        : "",

                date_fin:
                    offreComplete.date_fin
                        ? String(
                            offreComplete.date_fin
                        ).substring(
                            0,
                            10
                        )
                        : ""

            });

            // =================================================
            // PHOTOS EXISTANTES
            // =================================================

            setPhotosExistantes(

                Array.isArray(
                    offreComplete.photos
                )
                    ? offreComplete.photos
                    : []

            );

            // =================================================
            // NOUVELLES PHOTOS
            // =================================================

            setPhotosDetails([]);

            // =================================================
            // IMAGE PRINCIPALE
            // =================================================

            setImage(null);

            setErreurs({});

            setIdModification(
                item.id_offre
            );

            setModeModification(
                true
            );

            setMenuOuvert(null);

            setModal(true);

        }

        catch (error) {

            console.error(
                "❌ Erreur récupération offre :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Impossible de récupérer les détails de cette offre."
            );

        }

        finally {

            setChargement(false);

        }

    };

    // =========================================================
    // SUPPRIMER OFFRE
    // =========================================================

    const supprimerOffre = async (
        id
    ) => {

        if (
            !window.confirm(
                "Voulez-vous vraiment supprimer cette offre ?\n\nLes photos détaillées associées seront également supprimées de la base de données."
            )
        ) {

            return;

        }

        try {

            await api.delete(
                `/offres/${id}`
            );

            alert(
                "Offre supprimée avec succès."
            );

            await chargerDonnees();

            setMenuOuvert(null);

        }

        catch (error) {

            console.error(
                "❌ Erreur suppression offre :",
                error
            );

            alert(

                error.response?.data?.message ||

                "Erreur lors de la suppression."

            );

        }

    };

    // =========================================================
    // RECHERCHE
    // =========================================================

    const offresFiltrees =
        offres.filter(
            (item) => {

                const texte =
                    recherche
                        .toLowerCase()
                        .trim();

                if (!texte) {

                    return true;

                }

                return (

                    String(
                        item.titre || ""
                    )
                        .toLowerCase()
                        .includes(texte)

                    ||

                    String(
                        item.destination || ""
                    )
                        .toLowerCase()
                        .includes(texte)

                    ||

                    String(
                        item.categorie || ""
                    )
                        .toLowerCase()
                        .includes(texte)

                    ||

                    String(
                        item.prestataire || ""
                    )
                        .toLowerCase()
                        .includes(texte)

                );

            }
        );

    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages =
        Math.ceil(

            offresFiltrees.length /
            offresParPage

        );

    const pageSure =
        totalPages > 0

            ? Math.min(
                pageActuelle,
                totalPages
            )

            : 1;

    const indexPremiereOffre =
        (
            pageSure - 1
        ) *
        offresParPage;

    const offresPage =
        offresFiltrees.slice(

            indexPremiereOffre,

            indexPremiereOffre +
            offresParPage

        );

    const changerPage = (
        page
    ) => {

        if (
            page >= 1 &&
            page <= totalPages
        ) {

            setPageActuelle(
                page
            );

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    };

    // =========================================================
    // FORMAT PRIX
    // =========================================================

    const formatPrix = (
        prix
    ) => {

        return Number(
            prix || 0
        ).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };

    // =========================================================
    // DISPONIBILITÉ
    // =========================================================

    const afficherDisponibilite = (
        nombre
    ) => {

        const valeur =
            Number(
                nombre || 0
            );

        if (
            valeur <= 0
        ) {

            return (

                <span className="disponibilite complet">

                    🔴 Complet

                </span>

            );

        }

        if (
            valeur === 1
        ) {

            return (

                <span className="disponibilite faible">

                    🟠 1 place disponible

                </span>

            );

        }

        return (

            <span className="disponibilite disponible">

                🟢 {valeur} places disponibles

            </span>

        );

    };

    // =========================================================
    // URL IMAGE
    // =========================================================

    const getImageUrl = (
        filename
    ) => {

        if (!filename) {

            return "/image-default.jpg";

        }

        return `${SERVER_URL}/uploads/${filename}`;

    };

    // =========================================================
    // RENDU
    // =========================================================

    return (

        <div className="offres-admin">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="offres-header">

                <div>

                    <h1>
                        🎒 Gestion des offres
                    </h1>

                    <p>
                        Gérez vos séjours touristiques
                    </p>

                </div>

                <button
                    type="button"
                    className="btn-add-offre"
                    onClick={ouvrirAjout}
                >
                    + Nouvelle offre
                </button>

            </div>

            {/* =================================================
                LISTE
            ================================================= */}

            <div className="offres-list-card">

                <div className="liste-header">

                    <div>

                        <h2>
                            Liste des offres
                        </h2>

                        <span className="nombre-resultats">

                            {offresFiltrees.length}{" "}

                            {offresFiltrees.length > 1
                                ? "offres"
                                : "offre"}

                        </span>

                    </div>

                    {/* RECHERCHE */}

                    <div className="recherche-offres">

                        <span>
                            🔎
                        </span>

                        <input
                            type="text"
                            placeholder="Rechercher une offre..."
                            value={recherche}
                            onChange={(e) => {

                                setRecherche(
                                    e.target.value
                                );

                                setPageActuelle(
                                    1
                                );

                            }}
                        />

                        {recherche && (

                            <button
                                type="button"
                                className="btn-clear-search"
                                onClick={() => {

                                    setRecherche("");

                                    setPageActuelle(
                                        1
                                    );

                                }}
                            >
                                ✕
                            </button>

                        )}

                    </div>

                </div>

                {/* =================================================
                    AUCUNE OFFRE
                ================================================= */}

                {offresPage.length === 0 ? (

                    <div className="aucune-offre">

                        <div className="aucune-offre-icon">
                            🔎
                        </div>

                        <h3>
                            Aucune offre trouvée
                        </h3>

                        <p>

                            {recherche

                                ? "Aucune offre ne correspond à votre recherche."

                                : "Aucune offre n'est disponible pour le moment."

                            }

                        </p>

                    </div>

                ) : (

                    /* =================================================
                       CARTES OFFRES
                    ================================================= */

                    <div className="offres-admin-list">

                        {offresPage.map(
                            (item) => (

                                <div
                                    className="offre-admin-card"
                                    key={
                                        item.id_offre
                                    }
                                >

                                    {/* IMAGE */}

                                    <div className="offre-image-container">

                                        <img
                                            src={getImageUrl(
                                                item.image
                                            )}
                                            alt={
                                                item.titre ||
                                                "Offre touristique"
                                            }
                                        />

                                        {/* MENU */}

                                        <div className="menu-offre">

                                            <button
                                                type="button"
                                                className="btn-menu-offre"
                                                onClick={() =>
                                                    setMenuOuvert(

                                                        menuOuvert ===
                                                        item.id_offre

                                                            ? null

                                                            : item.id_offre

                                                    )
                                                }
                                            >
                                                ⋮
                                            </button>

                                            {menuOuvert ===
                                                item.id_offre && (

                                                <div className="menu-actions">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            modifierOffre(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        ✏️ Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-action"
                                                        onClick={() =>
                                                            supprimerOffre(
                                                                item.id_offre
                                                            )
                                                        }
                                                    >
                                                        🗑️ Supprimer
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                    {/* INFORMATIONS */}

                                    <div className="info-offre">

                                        <h3>
                                            {item.titre}
                                        </h3>

                                        <p>
                                            📍{" "}

                                            {item.destination ||
                                                "Destination inconnue"}

                                        </p>

                                        <p>
                                            🏷️{" "}

                                            {item.categorie ||
                                                "Catégorie non précisée"}

                                        </p>

                                        <p>
                                            🏢{" "}

                                            {item.prestataire ||
                                                "Prestataire non précisé"}

                                        </p>

                                        <p className="prix-offre">

                                            💰{" "}

                                            {formatPrix(
                                                item.prix
                                            )} €

                                        </p>

                                        <div className="card-disponibilite">

                                            {afficherDisponibilite(
                                                item.disponibilite
                                            )}

                                        </div>

                                        <div className="card-dates">

                                            <span>

                                                📅 Début :{" "}

                                                {item.date_debut

                                                    ? new Date(
                                                        item.date_debut
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )

                                                    : "-"

                                                }

                                            </span>

                                            <span>

                                                📅 Fin :{" "}

                                                {item.date_fin

                                                    ? new Date(
                                                        item.date_fin
                                                    ).toLocaleDateString(
                                                        "fr-FR"
                                                    )

                                                    : "-"

                                                }

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (

                    <div className="pagination-offres">

                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={
                                pageSure === 1
                            }
                            onClick={() =>
                                changerPage(
                                    pageSure - 1
                                )
                            }
                        >
                            ← Précédent
                        </button>

                        <div className="pagination-numeros">

                            {Array.from(

                                {
                                    length:
                                        totalPages
                                },

                                (_, index) =>
                                    index + 1

                            ).map(
                                (page) => (

                                    <button
                                        type="button"
                                        key={page}
                                        className={

                                            pageSure ===
                                            page

                                                ? "page-number active"

                                                : "page-number"

                                        }
                                        onClick={() =>
                                            changerPage(
                                                page
                                            )
                                        }
                                    >
                                        {page}
                                    </button>

                                )
                            )}

                        </div>

                        <button
                            type="button"
                            className="pagination-btn"
                            disabled={
                                pageSure ===
                                totalPages
                            }
                            onClick={() =>
                                changerPage(
                                    pageSure + 1
                                )
                            }
                        >
                            Suivant →
                        </button>

                    </div>

                )}

            </div>

            {/* =================================================
                MODALE
            ================================================= */}

            {modal && (

                <div className="modal-overlay">

                    <div className="modal-offre">

                        {/* =================================================
                            HEADER MODALE
                        ================================================= */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {modeModification

                                        ? "✏️ Modifier l'offre"

                                        : "➕ Nouvelle offre"

                                    }

                                </h2>

                                <p>
                                    Remplissez les informations de l'offre
                                </p>

                            </div>

                            <button
                                type="button"
                                className="close-modal"
                                onClick={() => {

                                    if (!chargement) {

                                        setModal(
                                            false
                                        );

                                        resetForm();

                                    }

                                }}
                            >
                                ✕
                            </button>

                        </div>

                        {/* =================================================
                            FORMULAIRE
                        ================================================= */}

                        <div className="form-grid">

                            {/* TITRE */}

                            <div className="form-group">

                                <label>
                                    Titre de l'offre *
                                </label>

                                <input
                                    type="text"
                                    name="titre"
                                    placeholder="Ex : Séjour à Nosy Be"
                                    value={
                                        offre.titre
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.titre
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {erreurs.titre && (

                                    <small className="error-message">
                                        {erreurs.titre}
                                    </small>

                                )}

                            </div>

                            {/* PRESTATAIRE */}

                            <div className="form-group">

                                <label>
                                    Prestataire *
                                </label>

                                <select
                                    name="id_prestataire"
                                    value={
                                        offre.id_prestataire
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.id_prestataire
                                            ? "input-error"
                                            : ""
                                    }
                                >

                                    <option value="">
                                        Choisir un prestataire
                                    </option>

                                    {prestataires.map(
                                        (p) => (

                                            <option
                                                key={
                                                    p.id_prestataire
                                                }
                                                value={
                                                    p.id_prestataire
                                                }
                                            >
                                                {
                                                    p.nom_entreprise
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                                {erreurs.id_prestataire && (

                                    <small className="error-message">
                                        {
                                            erreurs.id_prestataire
                                        }
                                    </small>

                                )}

                            </div>

                            {/* DESTINATION */}

                            <div className="form-group">

                                <label>
                                    Destination *
                                </label>

                                <select
                                    name="id_destination"
                                    value={
                                        offre.id_destination
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.id_destination
                                            ? "input-error"
                                            : ""
                                    }
                                >

                                    <option value="">
                                        Choisir une destination
                                    </option>

                                    {destinations.map(
                                        (d) => (

                                            <option
                                                key={
                                                    d.id_destination
                                                }
                                                value={
                                                    d.id_destination
                                                }
                                            >
                                                {d.nom}
                                            </option>

                                        )
                                    )}

                                </select>

                                {erreurs.id_destination && (

                                    <small className="error-message">
                                        {
                                            erreurs.id_destination
                                        }
                                    </small>

                                )}

                            </div>

                            {/* CATÉGORIE */}

                            <div className="form-group">

                                <label>
                                    Catégorie *
                                </label>

                                <select
                                    name="id_categorie"
                                    value={
                                        offre.id_categorie
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.id_categorie
                                            ? "input-error"
                                            : ""
                                    }
                                >

                                    <option value="">
                                        Choisir une catégorie
                                    </option>

                                    {categories.map(
                                        (c) => (

                                            <option
                                                key={
                                                    c.id_categorie
                                                }
                                                value={
                                                    c.id_categorie
                                                }
                                            >
                                                {c.nom}
                                            </option>

                                        )
                                    )}

                                </select>

                                {erreurs.id_categorie && (

                                    <small className="error-message">
                                        {
                                            erreurs.id_categorie
                                        }
                                    </small>

                                )}

                            </div>

                            {/* PRIX */}

                            <div className="form-group">

                                <label>
                                    Prix *
                                </label>

                                <div className="input-suffix">

                                    <input
                                        type="number"
                                        name="prix"
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Ex : 250.00"
                                        value={
                                            offre.prix
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            erreurs.prix
                                                ? "input-error"
                                                : ""
                                        }
                                    />

                                    <span>
                                        €
                                    </span>

                                </div>

                                {erreurs.prix && (

                                    <small className="error-message">
                                        {erreurs.prix}
                                    </small>

                                )}

                            </div>

                            {/* CAPACITÉ */}

                            <div className="form-group">

                                <label>
                                    Capacité *
                                </label>

                                <div className="input-suffix">

                                    <input
                                        type="number"
                                        name="capacite"
                                        min="1"
                                        step="1"
                                        placeholder="Ex : 20"
                                        value={
                                            offre.capacite
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            erreurs.capacite
                                                ? "input-error"
                                                : ""
                                        }
                                    />

                                    <span>
                                        personnes
                                    </span>

                                </div>

                                {erreurs.capacite && (

                                    <small className="error-message">
                                        {
                                            erreurs.capacite
                                        }
                                    </small>

                                )}

                            </div>

                            {/* DISPONIBILITÉ */}

                            <div className="form-group">

                                <label>
                                    Disponibilité *
                                </label>

                                <div className="input-suffix">

                                    <input
                                        type="number"
                                        name="disponibilite"
                                        min="0"
                                        step="1"
                                        max={
                                            offre.capacite ||
                                            undefined
                                        }
                                        placeholder="Ex : 15"
                                        value={
                                            offre.disponibilite
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className={
                                            erreurs.disponibilite
                                                ? "input-error"
                                                : ""
                                        }
                                    />

                                    <span>
                                        places
                                    </span>

                                </div>

                                <small className="field-help">
                                    Nombre de places encore disponibles.
                                </small>

                                {erreurs.disponibilite && (

                                    <small className="error-message">
                                        {
                                            erreurs.disponibilite
                                        }
                                    </small>

                                )}

                            </div>

                            {/* DATE DÉBUT */}

                            <div className="form-group">

                                <label>
                                    📅 Date de début *
                                </label>

                                <input
                                    type="date"
                                    name="date_debut"
                                    value={
                                        offre.date_debut
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.date_debut
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {erreurs.date_debut && (

                                    <small className="error-message">
                                        {
                                            erreurs.date_debut
                                        }
                                    </small>

                                )}

                            </div>

                            {/* DATE FIN */}

                            <div className="form-group">

                                <label>
                                    📅 Date de fin *
                                </label>

                                <input
                                    type="date"
                                    name="date_fin"
                                    min={
                                        offre.date_debut ||
                                        undefined
                                    }
                                    value={
                                        offre.date_fin
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        erreurs.date_fin
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {erreurs.date_fin && (

                                    <small className="error-message">
                                        {
                                            erreurs.date_fin
                                        }
                                    </small>

                                )}

                            </div>

                        </div>

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div className="form-group description-group">

                            <label>
                                Description *
                            </label>

                            <textarea
                                name="description"
                                rows="5"
                                placeholder="Décrivez cette offre touristique..."
                                value={
                                    offre.description
                                }
                                onChange={
                                    handleChange
                                }
                                className={
                                    erreurs.description
                                        ? "input-error"
                                        : ""
                                }
                            />

                            {erreurs.description && (

                                <small className="error-message">
                                    {
                                        erreurs.description
                                    }
                                </small>

                            )}

                        </div>

                        {/* =================================================
                            IMAGE PRINCIPALE
                        ================================================= */}

                        <div className="upload-zone">

                            <div className="upload-title">

                                <span className="upload-icon">
                                    📷
                                </span>

                                <div>

                                    <strong>
                                        Image principale
                                    </strong>

                                    <small>
                                        JPG, JPEG, PNG ou WEBP — 5 Mo maximum
                                    </small>

                                </div>

                            </div>

                            {/* IMAGE ACTUELLE EN MODIFICATION */}

                            {modeModification &&
                                !image &&
                                photosExistantes !== null && (

                                    <div className="image-actuelle">

                                        <small>
                                            Image principale actuelle :
                                        </small>

                                        {offres
                                            .find(
                                                (o) =>
                                                    o.id_offre ===
                                                    idModification
                                            )
                                            ?.image && (

                                            <img
                                                src={getImageUrl(
                                                    offres.find(
                                                        (o) =>
                                                            o.id_offre ===
                                                            idModification
                                                    )?.image
                                                )}
                                                alt="Image actuelle"
                                            />

                                        )}

                                    </div>

                                )}

                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={
                                    handleImage
                                }
                            />

                            {image && (

                                <div className="selected-image">

                                    <span>
                                        🖼️{" "}
                                        {image.name}
                                    </span>

                                    <span>

                                        {(
                                            image.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        Mo

                                    </span>

                                </div>

                            )}

                            {modeModification &&
                                !image && (

                                    <small className="field-help">

                                        Laissez vide pour conserver
                                        l'image principale actuelle.

                                    </small>

                                )}

                        </div>

                        {/* =================================================
                            PHOTOS DÉTAILLÉES
                        ================================================= */}

                        <div className="upload-zone">

                            <div className="upload-title">

                                <span className="upload-icon">
                                    🖼️
                                </span>

                                <div>

                                    <strong>
                                        Photos détaillées
                                    </strong>

                                    <small>
                                        Maximum 10 photos — 5 Mo maximum par photo
                                    </small>

                                </div>

                            </div>

                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={
                                    handlePhotosDetails
                                }
                            />

                            {/* =================================================
                                PHOTOS EXISTANTES
                            ================================================= */}

                            {modeModification &&
                                photosExistantes.length >
                                0 && (

                                    <div className="photos-existantes">

                                        <strong>
                                            Photos déjà enregistrées
                                        </strong>

                                        <div className="photos-details-grid">

                                            {photosExistantes.map(
                                                (photo) => (

                                                    <div
                                                        className="photo-detail-item"
                                                        key={
                                                            photo.id_photo
                                                        }
                                                    >

                                                        <img
                                                            src={getImageUrl(
                                                                photo.chemin_photo
                                                            )}
                                                            alt="Photo détaillée"
                                                        />

                                                        <button
                                                            type="button"
                                                            className="delete-photo-detail"
                                                            disabled={
                                                                chargement
                                                            }
                                                            onClick={() =>
                                                                supprimerPhotoExistante(
                                                                    photo.id_photo
                                                                )
                                                            }
                                                        >
                                                            ✕
                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            {/* =================================================
                                NOUVELLES PHOTOS
                            ================================================= */}

                            {photosDetails.length >
                                0 && (

                                    <div className="photos-selectionnees">

                                        <strong>
                                            Nouvelles photos
                                        </strong>

                                        <div className="photos-details-grid">

                                            {photosDetails.map(
                                                (
                                                    photo,
                                                    index
                                                ) => (

                                                    <div
                                                        className="photo-detail-item"
                                                        key={`${photo.name}-${index}`}
                                                    >

                                                        <img
                                                            src={URL.createObjectURL(
                                                                photo
                                                            )}
                                                            alt={
                                                                photo.name
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            className="delete-photo-detail"
                                                            disabled={
                                                                chargement
                                                            }
                                                            onClick={() =>
                                                                supprimerPhotoSelectionnee(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            ✕
                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            {/* COMPTEUR */}

                            <small className="field-help">

                                {photosExistantes.length +
                                    photosDetails.length}{" "}

                                / 10 photo(s) détaillée(s).

                            </small>

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="btn-cancel"
                                disabled={
                                    chargement
                                }
                                onClick={() => {

                                    setModal(
                                        false
                                    );

                                    resetForm();

                                }}
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                className="btn-save"
                                disabled={
                                    chargement
                                }
                                onClick={
                                    enregistrerOffre
                                }
                            >

                                {chargement

                                    ? "⏳ Enregistrement..."

                                    : modeModification

                                        ? "💾 Enregistrer les modifications"

                                        : "🚀 Publier l'offre"

                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Offres;