/**
 * LoyerPro — Mise à jour dynamique de la navbar selon l'état d'authentification
 * À inclure après auth.js sur toutes les pages.
 * Modifie la navbar pour afficher :
 *   - Si non connecté : bouton "Connexion"
 *   - Si connecté bailleur : "Bonjour {nom}" + menu déroulant (Dashboard, Déconnexion)
 *   - Si connecté locataire : "Bonjour {nom}" + (Espace client, Déconnexion)
 */
(function (window, document) {
    'use strict';

    function updateNavbar() {
        if (!window.LoyerProAuth) return;

        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        // Supprimer un éventuel précédent widget utilisateur
        const existing = document.getElementById('nav-user-widget');
        if (existing) existing.remove();

        const session = LoyerProAuth.currentSession();
        if (!session) {
            // Non connecté : ne rien faire si un bouton "Connexion" existe déjà dans les nav-links,
            // sinon ajouter un bouton "Connexion" avant le bouton Inscription
            const existingLoginLink = document.querySelector('.nav-links a.active[href="connexion.html"]');
            const existingLoginBtn = document.getElementById('nav-login-btn');
            if (!existingLoginLink && !existingLoginBtn && !document.querySelector('a.nav-cta[href="connexion.html"]')) {
                // Vérifier qu'on n'est pas sur la page connexion elle-même
                if (!window.location.pathname.endsWith('connexion.html')) {
                    const loginLink = document.createElement('a');
                    loginLink.id = 'nav-login-btn';
                    loginLink.href = 'connexion.html';
                    loginLink.className = 'nav-cta';
                    loginLink.style.background = 'var(--surface-2, #f1f5f9)';
                    loginLink.style.color = 'var(--text-1, #0f172a)';
                    loginLink.innerHTML = '<i class="fas fa-right-to-bracket"></i> Connexion';
                    // L'insérer avant le bouton Inscription s'il existe
                    const inscriptBtn = navActions.querySelector('a.nav-cta[href="inscription.html"]');
                    if (inscriptBtn) {
                        navActions.insertBefore(loginLink, inscriptBtn);
                    } else {
                        navActions.insertBefore(loginLink, navActions.firstChild);
                    }
                }
            }
            return;
        }

        // Connecté : créer un widget utilisateur avec menu déroulant
        const widget = document.createElement('div');
        widget.id = 'nav-user-widget';
        widget.style.cssText = 'position:relative;display:flex;align-items:center;gap:.5rem';

        const initial = (session.name || session.identifier || '?').charAt(0).toUpperCase();
        const dashboardLink = session.type === 'bailleur' ? 'dashboard.html' : 'locataire.html';

        widget.innerHTML = `
            <button id="user-menu-btn" style="display:flex;align-items:center;gap:8px;background:var(--surface-2,#f1f5f9);border:1px solid var(--border,#e2e8f0);border-radius:999px;padding:6px 12px 6px 6px;cursor:pointer;font-family:inherit;transition:all .3s" aria-haspopup="true" aria-expanded="false">
                <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem">${initial}</span>
                <span style="font-size:.85rem;font-weight:600;color:var(--text-1,#0f172a);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${session.name || session.identifier}</span>
                <i class="fas fa-chevron-down" style="font-size:.7rem;color:var(--text-3,#94a3b8)"></i>
            </button>
            <div id="user-dropdown" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.12);min-width:220px;padding:8px;z-index:1000">
                <div style="padding:8px 12px;border-bottom:1px solid var(--border,#e2e8f0);margin-bottom:4px">
                    <div style="font-size:.9rem;font-weight:700;color:var(--text-1,#0f172a)">${session.name || session.identifier}</div>
                    <div style="font-size:.75rem;color:var(--text-3,#94a3b8)">${session.email || session.identifier}</div>
                    <div style="display:inline-block;margin-top:4px;padding:2px 8px;background:rgba(99,102,241,.15);color:var(--primary-600,#4f46e5);font-size:.7rem;font-weight:700;border-radius:999px;text-transform:uppercase;letter-spacing:.04em">${session.type === 'bailleur' ? 'Bailleur' : 'Locataire'}</div>
                </div>
                <a href="${dashboardLink}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:var(--text-2,#475569);font-size:.88rem;font-weight:500;transition:background .2s">
                    <i class="fas fa-gauge-high" style="width:16px;color:var(--primary-600,#4f46e5)"></i> ${session.type === 'bailleur' ? 'Dashboard' : 'Espace client'}
                </a>
                <a href="profil.html" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:var(--text-2,#475569);font-size:.88rem;font-weight:500;transition:background .2s">
                    <i class="fas fa-user-gear" style="width:16px;color:var(--primary-600,#4f46e5)"></i> Mon profil
                </a>
                <a href="parametres.html" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:var(--text-2,#475569);font-size:.88rem;font-weight:500;transition:background .2s">
                    <i class="fas fa-gear" style="width:16px;color:var(--primary-600,#4f46e5)"></i> Paramètres
                </a>
                <div style="border-top:1px solid var(--border,#e2e8f0);margin:4px 0"></div>
                <button id="logout-btn" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:none;border:none;color:var(--rose-500,#f43f5e);font-size:.88rem;font-weight:500;cursor:pointer;width:100%;text-align:left;font-family:inherit">
                    <i class="fas fa-right-from-bracket" style="width:16px"></i> Déconnexion
                </button>
            </div>
        `;

        // Insérer le widget à la place du bouton "Connexion" / "Inscription"
        // On garde le bouton Inscription pour les utilisateurs non connectés, mais on le masque si connecté
        const inscriptBtn = navActions.querySelector('a.nav-cta[href="inscription.html"]');
        if (inscriptBtn) inscriptBtn.style.display = 'none';

        // Insérer avant le nav-toggle ou en première position
        const navToggle = navActions.querySelector('.nav-toggle');
        if (navToggle) {
            navActions.insertBefore(widget, navToggle);
        } else {
            navActions.appendChild(widget);
        }

        // Gestion du menu déroulant
        const btn = document.getElementById('user-menu-btn');
        const dropdown = document.getElementById('user-dropdown');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
            btn.setAttribute('aria-expanded', !isOpen);
        });
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
            btn.setAttribute('aria-expanded', 'false');
        });

        // Déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                    LoyerProAuth.logout('index.html');
                }
            });
        }
    }

    // Exécuter au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavbar);
    } else {
        updateNavbar();
    }

})(window, document);
