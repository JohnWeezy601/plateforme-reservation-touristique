import { useEffect, useState } from "react";
import api from "../api/api";
import "./Contacts.css";

import {
    FaEnvelope,
    FaPaperPlane,
    FaTrash,
    FaCheck,
    FaTimes
} from "react-icons/fa";

function Contacts() {

    const [contacts, setContacts] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedContact, setSelectedContact] = useState(null);

    const [reply, setReply] = useState({
        sujet: "",
        message: ""
    });

    // =====================================================
    // CHARGER CONTACTS + UTILISATEURS
    // =====================================================

    const getContacts = async () => {

        try {

            const [contactsRes, utilisateursRes] =
                await Promise.all([
                    api.get("/contacts"),
                    api.get("/utilisateurs")
                ]);

            const contactsData =
                Array.isArray(contactsRes.data)
                    ? contactsRes.data
                    : [];

            const utilisateursData =
                Array.isArray(utilisateursRes.data)
                    ? utilisateursRes.data
                    : [];

            setUtilisateurs(utilisateursData);

            // =================================================
            // ASSOCIER LE PROFIL AU CONTACT PAR EMAIL
            // =================================================

            const contactsAvecProfil =
                contactsData.map((contact) => {

                    const utilisateur =
                        utilisateursData.find(
                            (user) =>
                                user.email?.trim().toLowerCase() ===
                                contact.email?.trim().toLowerCase()
                        );

                    return {
                        ...contact,

                        id_utilisateur:
                            utilisateur?.id_utilisateur ||
                            contact.id_utilisateur ||
                            null,

                        prenom:
                            utilisateur?.prenom ||
                            contact.prenom ||
                            "",

                        nom:
                            utilisateur?.nom ||
                            contact.nom ||
                            "",

                        photo:
                            utilisateur?.photo ||
                            contact.photo ||
                            null,

                        role:
                            utilisateur?.role ||
                            contact.role ||
                            null
                    };
                });

            setContacts(contactsAvecProfil);

            // =================================================
            // ACTUALISER LE CONTACT SELECTIONNE
            // =================================================

            if (selectedContact) {

                const contactActualise =
                    contactsAvecProfil.find(
                        (item) =>
                            item.id_contact ===
                            selectedContact.id_contact
                    );

                if (contactActualise) {

                    setSelectedContact(
                        contactActualise
                    );
                }
            }

        } catch (error) {

            console.error(
                "Erreur chargement contacts/profils :",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        getContacts();

    }, []);

    // =====================================================
    // TROUVER UTILISATEUR
    // =====================================================

    const trouverUtilisateur = (contact) => {

        if (!contact) {
            return null;
        }

        return utilisateurs.find(
            (user) =>
                user.email?.trim().toLowerCase() ===
                contact.email?.trim().toLowerCase()
        ) || null;
    };

    // =====================================================
    // NOM COMPLET
    // =====================================================

    const getNomComplet = (contact) => {

        if (!contact) {
            return "Client";
        }

        const utilisateur =
            trouverUtilisateur(contact);

        const prenom =
            utilisateur?.prenom?.trim() ||
            contact.prenom?.trim() ||
            "";

        const nom =
            utilisateur?.nom?.trim() ||
            contact.nom?.trim() ||
            "";

        const nomComplet =
            `${prenom} ${nom}`.trim();

        return nomComplet || "Client";
    };

    // =====================================================
    // PRENOM
    // =====================================================

    const getPrenom = (contact) => {

        if (!contact) {
            return "";
        }

        const utilisateur =
            trouverUtilisateur(contact);

        return (
            utilisateur?.prenom?.trim() ||
            contact.prenom?.trim() ||
            ""
        );
    };

    // =====================================================
    // INITIALE
    // PRIORITE AU PRENOM
    // =====================================================

    const getInitiale = (contact) => {

        if (!contact) {
            return "?";
        }

        const utilisateur =
            trouverUtilisateur(contact);

        const prenom =
            utilisateur?.prenom?.trim() ||
            contact.prenom?.trim() ||
            "";

        const nom =
            utilisateur?.nom?.trim() ||
            contact.nom?.trim() ||
            "";

        if (prenom) {

            return prenom
                .charAt(0)
                .toUpperCase();
        }

        if (nom) {

            return nom
                .charAt(0)
                .toUpperCase();
        }

        return "?";
    };

    // =====================================================
    // PHOTO PROFIL
    // =====================================================

    const getPhotoProfil = (contact) => {

        if (!contact) {
            return null;
        }

        const utilisateur =
            trouverUtilisateur(contact);

        const photo =
            utilisateur?.photo ||
            contact.photo ||
            null;

        if (
            !photo ||
            typeof photo !== "string" ||
            photo.trim() === ""
        ) {
            return null;
        }

        const photoNettoyee =
            photo.trim();

        // ---------------------------------------------
        // URL complète
        // ---------------------------------------------

        if (
            photoNettoyee.startsWith("http://") ||
            photoNettoyee.startsWith("https://")
        ) {
            return photoNettoyee;
        }

        // ---------------------------------------------
        // Si le backend renvoie déjà /uploads/...
        // ---------------------------------------------

        if (
            photoNettoyee.startsWith("/uploads/")
        ) {
            return `http://localhost:8081${photoNettoyee}`;
        }

        // ---------------------------------------------
        // Si le backend renvoie uploads/...
        // ---------------------------------------------

        if (
            photoNettoyee.startsWith("uploads/")
        ) {
            return `http://localhost:8081/${photoNettoyee}`;
        }

        // ---------------------------------------------
        // Nom simple du fichier
        // ---------------------------------------------

        return `http://localhost:8081/uploads/${photoNettoyee}`;
    };

    // =====================================================
    // SELECTIONNER MESSAGE
    // =====================================================

    const voirContact = async (contact) => {

        const utilisateur =
            trouverUtilisateur(contact);

        const contactComplet = {

            ...contact,

            id_utilisateur:
                utilisateur?.id_utilisateur ||
                contact.id_utilisateur ||
                null,

            prenom:
                utilisateur?.prenom ||
                contact.prenom ||
                "",

            nom:
                utilisateur?.nom ||
                contact.nom ||
                "",

            photo:
                utilisateur?.photo ||
                contact.photo ||
                null,

            role:
                utilisateur?.role ||
                contact.role ||
                null
        };

        // Afficher immédiatement
        setSelectedContact(contactComplet);

        // Réinitialiser la réponse
        setReply({
            sujet: "",
            message: ""
        });

        // =================================================
        // NOUVEAU -> LU
        // =================================================

        if (contact.statut === "Nouveau") {

            try {

                await api.put(
                    `/contacts/${contact.id_contact}`,
                    {
                        statut: "Lu"
                    }
                );

                const contactLu = {
                    ...contactComplet,
                    statut: "Lu"
                };

                setSelectedContact(contactLu);

                setContacts(
                    (ancienneListe) =>
                        ancienneListe.map(
                            (item) =>
                                item.id_contact ===
                                contact.id_contact
                                    ? contactLu
                                    : item
                        )
                );

            } catch (error) {

                console.error(
                    "Erreur changement statut :",
                    error
                );
            }
        }
    };

    // =====================================================
    // FERMER MESSAGE
    // =====================================================

    const fermerMessage = () => {

        setSelectedContact(null);

        setReply({
            sujet: "",
            message: ""
        });
    };

    // =====================================================
    // CHANGEMENT REPONSE
    // =====================================================

    const handleReplyChange = (e) => {

        setReply({
            ...reply,
            [e.target.name]: e.target.value
        });
    };

    // =====================================================
    // ENVOYER REPONSE
    // =====================================================

    const envoyerReponse = async () => {

        if (!selectedContact) {

            alert(
                "Aucun message sélectionné"
            );

            return;
        }

        if (!reply.message.trim()) {

            alert(
                "Veuillez écrire une réponse"
            );

            return;
        }

        try {

            await api.post(
                "/reponses",
                {
                    id_contact:
                        selectedContact.id_contact,

                    message:
                        reply.message
                }
            );

            const contactTraite = {
                ...selectedContact,
                statut: "Traité"
            };

            setSelectedContact(
                contactTraite
            );

            setContacts(
                (ancienneListe) =>
                    ancienneListe.map(
                        (item) =>
                            item.id_contact ===
                            contactTraite.id_contact
                                ? contactTraite
                                : item
                    )
            );

            setReply({
                sujet: "",
                message: ""
            });

            alert(
                "Réponse envoyée avec succès."
            );

        } catch (error) {

            console.error(
                "Erreur envoi réponse :",
                error
            );

            if (
                error.response?.data?.message
            ) {

                alert(
                    "Erreur : " +
                    error.response.data.message
                );

            } else {

                alert(
                    "Erreur lors de l'envoi de la réponse."
                );
            }
        }
    };

    // =====================================================
    // SUPPRIMER CONTACT
    // =====================================================

    const supprimerContact = async () => {

        if (!selectedContact) {
            return;
        }

        const confirmation =
            window.confirm(
                "Voulez-vous vraiment supprimer ce message ?"
            );

        if (!confirmation) {
            return;
        }

        try {

            await api.delete(
                `/contacts/${selectedContact.id_contact}`
            );

            setContacts(
                (ancienneListe) =>
                    ancienneListe.filter(
                        (item) =>
                            item.id_contact !==
                            selectedContact.id_contact
                    )
            );

            fermerMessage();

        } catch (error) {

            console.error(
                "Erreur suppression :",
                error
            );

            alert(
                "Impossible de supprimer ce message."
            );
        }
    };

    // =====================================================
    // CHANGER STATUT
    // =====================================================

    const changerStatut = async () => {

        if (!selectedContact) {
            return;
        }

        let nouveauStatut;

        if (
            selectedContact.statut ===
            "Nouveau"
        ) {

            nouveauStatut = "Lu";

        } else if (
            selectedContact.statut ===
            "Lu"
        ) {

            nouveauStatut = "Traité";

        } else {

            return;
        }

        try {

            await api.put(
                `/contacts/${selectedContact.id_contact}`,
                {
                    statut: nouveauStatut
                }
            );

            const contactModifie = {
                ...selectedContact,
                statut: nouveauStatut
            };

            setSelectedContact(
                contactModifie
            );

            setContacts(
                (ancienneListe) =>
                    ancienneListe.map(
                        (item) =>
                            item.id_contact ===
                            contactModifie.id_contact
                                ? contactModifie
                                : item
                    )
            );

        } catch (error) {

            console.error(
                "Erreur changement statut :",
                error
            );
        }
    };

    // =====================================================
    // AVATAR REUTILISABLE
    // =====================================================

    const Avatar = ({
        contact,
        large = false,
        message = false
    }) => {

        const [imageError, setImageError] =
            useState(false);

        const photo =
            getPhotoProfil(contact);

        const initiale =
            getInitiale(contact);

        const className = message
            ? "message-avatar"
            : large
                ? "avatar large"
                : "avatar";

        // ---------------------------------------------
        // PHOTO EXISTANTE ET VALIDE
        // ---------------------------------------------

        if (photo && !imageError) {

            return (
                <img
                    src={photo}
                    alt={getNomComplet(contact)}
                    className={`${className} avatar-photo`}
                    onError={() =>
                        setImageError(true)
                    }
                />
            );
        }

        // ---------------------------------------------
        // PAS DE PHOTO -> INITIALE
        // ---------------------------------------------

        return (
            <div className={className}>
                {initiale}
            </div>
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="contacts-loading">

                <div className="loading-spinner"></div>

                <p>
                    Chargement des messages...
                </p>

            </div>
        );
    }

    // =====================================================
    // INTERFACE
    // =====================================================

    return (

        <div className="messenger-container">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="chat-sidebar">

                <div className="sidebar-header">

                    <div className="sidebar-title">

                        <div className="title-icon">
                            <FaEnvelope />
                        </div>

                        <div>

                            <h2>
                                Messages
                            </h2>

                            <span>
                                {contacts.length} conversation
                                {contacts.length > 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>

                    </div>

                </div>

                <div className="chat-list">

                    {contacts.length === 0 ? (

                        <div className="no-messages">

                            <FaEnvelope />

                            <p>
                                Aucun message
                            </p>

                        </div>

                    ) : (

                        contacts.map(
                            (contact) => (

                                <div
                                    key={
                                        contact.id_contact
                                    }
                                    className={
                                        `chat-item ${
                                            selectedContact?.id_contact ===
                                            contact.id_contact
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        voirContact(
                                            contact
                                        )
                                    }
                                >

                                    {/* ======================
                                        UN SEUL AVATAR
                                    ====================== */}

                                    <Avatar
                                        contact={
                                            contact
                                        }
                                    />

                                    <div className="chat-info">

                                        <div className="chat-top">

                                            <h4>
                                                {
                                                    getNomComplet(
                                                        contact
                                                    )
                                                }
                                            </h4>

                                            <small>
                                                {new Date(
                                                    contact.date_envoi
                                                ).toLocaleDateString()}
                                            </small>

                                        </div>

                                        <p>
                                            {
                                                contact.email
                                            }
                                        </p>

                                        <div className="chat-bottom">

                                            <span
                                                className={
                                                    `status ${contact.statut}`
                                                }
                                            >
                                                {
                                                    contact.statut
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>

            </aside>

            {/* =================================================
                ZONE CHAT
            ================================================= */}

            <main className="chat-content">

                {!selectedContact ? (

                    <div className="empty-chat">

                        <div className="empty-icon">
                            <FaEnvelope />
                        </div>

                        <h2>
                            Sélectionnez un message
                        </h2>

                        <p>
                            Choisissez un message à gauche
                            pour afficher son contenu.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* =====================================
                            HEADER
                        ===================================== */}

                        <div className="chat-header">

                            <div className="header-user">

                                {/* UN SEUL AVATAR */}

                                <Avatar
                                    contact={
                                        selectedContact
                                    }
                                    large
                                />

                                <div className="header-user-info">

                                    <h2>
                                        {
                                            getNomComplet(
                                                selectedContact
                                            )
                                        }
                                    </h2>

                                    <p>
                                        {
                                            selectedContact.email
                                        }
                                    </p>

                                    {selectedContact.role && (

                                        <span className="profile-role">

                                            {
                                                selectedContact.role
                                            }

                                        </span>

                                    )}

                                </div>

                            </div>

                            <button
                                className="btn-close-chat"
                                onClick={
                                    fermerMessage
                                }
                                title="Fermer"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {/* =====================================
                            CONVERSATION
                        ===================================== */}

                        <div className="conversation">

                            <div className="message-row client-row">

                                {/* UN SEUL AVATAR */}

                                <Avatar
                                    contact={
                                        selectedContact
                                    }
                                    message
                                />

                                <div className="message-bubble client">

                                    <div className="message-label">

                                        <strong>
                                            {
                                                getNomComplet(
                                                    selectedContact
                                                )
                                            }
                                        </strong>

                                        <span>
                                            {new Date(
                                                selectedContact.date_envoi
                                            ).toLocaleString()}
                                        </span>

                                    </div>

                                    <div className="message-subject">

                                        {
                                            selectedContact.sujet
                                        }

                                    </div>

                                    <p>
                                        {
                                            selectedContact.message
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* =====================================
                            REPONSE
                        ===================================== */}

                        <div className="reply-box">

                            <h3>
                                Répondre au client
                            </h3>

                            <textarea
                                name="message"
                                rows="4"
                                placeholder="Écrivez votre réponse..."
                                value={
                                    reply.message
                                }
                                onChange={
                                    handleReplyChange
                                }
                            />

                            <div className="reply-footer">

                                <span>
                                    La réponse sera envoyée
                                    par email au client.
                                </span>

                                <button
                                    className="btn-send-reply"
                                    onClick={
                                        envoyerReponse
                                    }
                                    disabled={
                                        !reply.message.trim()
                                    }
                                >
                                    <FaPaperPlane />

                                    Envoyer

                                </button>

                            </div>

                        </div>

                        {/* =====================================
                            ACTIONS
                        ===================================== */}

                        <div className="chat-actions">

                            <button
                                className="btn-check"
                                onClick={
                                    changerStatut
                                }
                            >
                                <FaCheck />

                                Changer statut

                            </button>

                            <button
                                className="btn-delete"
                                onClick={
                                    supprimerContact
                                }
                            >
                                <FaTrash />

                                Supprimer

                            </button>

                        </div>

                    </>
                )}

            </main>

        </div>
    );
}

export default Contacts;