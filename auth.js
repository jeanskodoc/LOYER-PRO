/**
 * LoyerPro — Module d'authentification partagé
 * Protection des pages par identifiant + mot de passe.
 * Sessions de 30 jours sauvegardées localement.
 *
 * Utilisation :
 *   <script src="db.js"></script>
 *   <script src="auth.js"></script>
 *   <script>
 *     // Page réservée au bailleur :
 *     LoyerProAuth.requireBailleur();
 *     // Page réservée au locataire :
 *     LoyerProAuth.requireLocataire();
 *     // Page réservée à tout utilisateur authentifié :
 *     LoyerProAuth.requireAuth();
 *   </script>
 */
(function (window, document) {
    'use strict';

    const SESSION_DURATION = 30; // jours

    /**
     * Récupère la session courante (ou null si expirée/inexistante).
     */
    function currentSession() {
        if (!window.LoyerProDB) return null;
        return LoyerProDB.getCurrentSession();
    }

    /**
     * Vérifie si l'utilisateur est authentifié.
     */
    function isAuth() {
        return currentSession() !== null;
    }

    /**
     * Vérifie si l'utilisateur est un bailleur.
     */
    function isBailleur() {
        const s = currentSession();
        return s && s.type === 'bailleur';
    }

    /**
     * Vérifie si l'utilisateur est un locataire.
     */
    function isLocataire() {
        const s = currentSession();
        return s && s.type === 'locataire';
    }

    /**
     * Déconnecte l'utilisateur courant.
     */
    function logout(redirectUrl) {
        if (window.LoyerProDB) LoyerProDB.clearSession();
        window.location.href = redirectUrl || 'connexion.html';
    }

    /**
     * Exige une authentification — redirige vers connexion.html si non authentifié.
     * @param {string} redirectTo - URL de la page à laquelle revenir après connexion (par défaut page courante)
     */
    function requireAuth(redirectTo) {
        if (!isAuth()) {
            const current = window.location.href.split('/').pop() || 'index.html';
            window.location.href = 'connexion.html?redirect=' + encodeURIComponent(redirectTo || current);
            return false;
        }
        return true;
    }

    /**
     * Exige un compte bailleur — redirige si non authentifié ou si locataire.
     */
    function requireBailleur(redirectTo) {
        if (!isAuth()) {
            const current = window.location.href.split('/').pop() || 'index.html';
            window.location.href = 'connexion.html?redirect=' + encodeURIComponent(redirectTo || current) + '&required=bailleur';
            return false;
        }
        if (!isBailleur()) {
            // Locataire tente d'accéder à une page bailleur → redirection vers son espace
            alert('⚠️ Cet onglet est réservé aux bailleurs. Vous êtes connecté en tant que locataire.');
            window.location.href = 'locataire.html';
            return false;
        }
        return true;
    }

    /**
     * Exige un compte locataire — redirige si non authentifié ou si bailleur.
     */
    function requireLocataire(redirectTo) {
        if (!isAuth()) {
            const current = window.location.href.split('/').pop() || 'locataire.html';
            window.location.href = 'connexion.html?redirect=' + encodeURIComponent(redirectTo || current) + '&required=locataire';
            return false;
        }
        if (!isLocataire()) {
            // Bailleur tente d'accéder à l'espace locataire → redirection vers dashboard
            alert('ℹ️ Cet onglet est réservé aux locataires. Vous êtes connecté en tant que bailleur.');
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }

    /**
     * Tente de connecter un utilisateur.
     * @param {string} identifier
     * @param {string} password
     * @returns {object} { success, error, account, session }
     */
    function login(identifier, password) {
        if (!window.LoyerProDB) return { success: false, error: 'Base de données non chargée.' };
        if (!identifier || !password) return { success: false, error: 'Veuillez saisir votre identifiant et mot de passe.' };

        const result = LoyerProDB.verifyCredentials(identifier.trim(), password);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        const session = LoyerProDB.startSession(result.account);
        return { success: true, account: result.account, session: session };
    }

    /**
     * Crée un compte locataire (appelé par le bailleur depuis gestion-locataires.html).
     * @param {object} tenantData - { firstName, lastName, email, phone, ownerId }
     * @returns {object} { success, account, error }
     */
    function createLocataireAccount(tenantData) {
        if (!window.LoyerProDB) return { success: false, error: 'Base de données non chargée.' };

        const identifier = LoyerProDB.generateLocataireIdentifier(tenantData.firstName, tenantData.lastName);
        const password = LoyerProDB.generatePassword(10);
        const name = (tenantData.lastName + ' ' + tenantData.firstName).trim();

        const result = LoyerProDB.createAccount({
            identifier: identifier,
            password: password,
            type: 'locataire',
            name: name,
            email: tenantData.email || '',
            phone: tenantData.phone || '',
            ownerId: tenantData.ownerId || null
        });

        if (!result.success) {
            return { success: false, error: result.error };
        }
        return { success: true, account: result.account, identifier: identifier, password: password };
    }

    /**
     * Crée un compte bailleur (appelé depuis inscription.html).
     * @param {object} bailleurData - { identifier, password, name, email, phone, country, ... }
     * @returns {object} { success, account, error }
     */
    function createBailleurAccount(bailleurData) {
        if (!window.LoyerProDB) return { success: false, error: 'Base de données non chargée.' };

        const result = LoyerProDB.createAccount({
            identifier: bailleurData.identifier,
            password: bailleurData.password,
            type: 'bailleur',
            name: bailleurData.name,
            email: bailleurData.email || '',
            phone: bailleurData.phone || '',
            country: bailleurData.country || '',
            ownerId: null
        });

        return result;
    }

    /**
     * Affiche le nom de l'utilisateur courant dans un élément HTML.
     * @param {string} elementId - ID de l'élément à remplir
     */
    function displayUserName(elementId) {
        const s = currentSession();
        const el = document.getElementById(elementId);
        if (el && s) {
            el.textContent = s.name || s.identifier;
        }
    }

    /**
     * Affiche un badge bailleur/locataire dans un élément HTML.
     */
    function displayUserType(elementId) {
        const s = currentSession();
        const el = document.getElementById(elementId);
        if (el && s) {
            el.textContent = s.type === 'bailleur' ? 'Bailleur' : 'Locataire';
            el.className = 'user-type-badge ' + s.type;
        }
    }

    /**
     * Récupère l'URL de redirection après connexion (paramètre ?redirect=).
     */
    function getRedirectUrl(defaultUrl) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        return redirect || defaultUrl || 'dashboard.html';
    }

    /**
     * Récupère le type de compte requis (paramètre ?required=).
     */
    function getRequiredType() {
        const params = new URLSearchParams(window.location.search);
        return params.get('required') || null;
    }

    // === API publique ===
    window.LoyerProAuth = {
        // Vérifications
        isAuth, isBailleur, isLocataire, currentSession,
        // Protection des pages
        requireAuth, requireBailleur, requireLocataire,
        // Actions
        login, logout,
        // Création de comptes
        createBailleurAccount, createLocataireAccount,
        // Affichage
        displayUserName, displayUserType,
        // Helpers
        getRedirectUrl, getRequiredType,
        // Constante
        SESSION_DURATION
    };

})(window, document);
