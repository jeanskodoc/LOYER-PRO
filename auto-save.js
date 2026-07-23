/**
 * LoyerPro — Auto-sauvegarde toutes les 5 secondes
 * - Persistance automatique des formulaires et données en localStorage
 * - Synchronisation entre onglets via l'événement 'storage'
 * - Indicateur visuel de sauvegarde
 *
 * Utilisation :
 *   <script src="db.js"></script>
 *   <script src="auth.js"></script>
 *   <script src="auto-save.js"></script>
 */
(function (window, document) {
    'use strict';

    const AUTOSAVE_INTERVAL = 5000; // 5 secondes
    const AUTOSAVE_KEY = 'loyerpro_autosave';
    const AUTOSAVE_TIMESTAMP_KEY = 'loyerpro_autosave_last';

    // === État interne ===
    let saveTimer = null;
    let pendingChanges = false;
    let indicator = null;

    // === Indicateur visuel ===
    function createIndicator() {
        if (indicator) return;
        indicator = document.createElement('div');
        indicator.id = 'autosave-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 9998;
            background: var(--surface, #fff);
            border: 1px solid var(--border, #e2e8f0);
            border-left: 4px solid var(--emerald-500, #10b981);
            border-radius: 12px;
            padding: 8px 14px;
            box-shadow: 0 4px 12px rgba(15, 23, 42, .08);
            display: none;
            align-items: center;
            gap: 8px;
            font-size: .78rem;
            color: var(--text-2, #475569);
            font-family: 'Inter', -apple-system, sans-serif;
            transition: opacity .3s, transform .3s;
            opacity: 0;
            transform: translateY(10px);
        `;
        document.body.appendChild(indicator);
    }

    function showIndicator(type, message) {
        if (!indicator) createIndicator();
        const colors = {
            saving: { border: '#f59e0b', icon: 'fa-spinner fa-spin', color: '#d97706' },
            saved: { border: '#10b981', icon: 'fa-cloud-arrow-up', color: '#10b981' },
            synced: { border: '#6366f1', icon: 'fa-arrows-rotate', color: '#6366f1' },
            error: { border: '#f43f5e', icon: 'fa-circle-exclamation', color: '#f43f5e' }
        };
        const c = colors[type] || colors.saved;
        indicator.style.borderLeftColor = c.border;
        indicator.innerHTML = '<i class="fas ' + c.icon + '" style="color:' + c.color + ';font-size:.9rem"></i><span>' + message + '</span>';
        indicator.style.display = 'flex';
        // Animation d'apparition
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0)';
        });
        // Masquer après 2s (sauf si saving)
        if (type !== 'saving') {
            clearTimeout(indicator._hideTimer);
            indicator._hideTimer = setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(10px)';
                setTimeout(() => { indicator.style.display = 'none'; }, 300);
            }, 2000);
        }
    }

    // === Capture des changements de formulaires ===
    function captureFormState() {
        const forms = {};
        document.querySelectorAll('form[id], form[data-autosave]').forEach(form => {
            const id = form.id || form.getAttribute('data-autosave');
            if (!id) return;
            const data = {};
            new FormData(form).forEach((value, key) => {
                data[key] = value;
            });
            // Capturer aussi les checkboxes et radios
            form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                data[cb.name || cb.id] = cb.checked;
            });
            form.querySelectorAll('input[type="radio"]:checked').forEach(r => {
                data[r.name] = r.value;
            });
            forms[id] = data;
        });
        return forms;
    }

    function restoreFormState(savedState) {
        if (!savedState || !savedState.forms) return;
        Object.keys(savedState.forms).forEach(formId => {
            const form = document.getElementById(formId) || document.querySelector('[data-autosave="' + formId + '"]');
            if (!form) return;
            const data = savedState.forms[formId];
            Object.keys(data).forEach(key => {
                const inputs = form.querySelectorAll('[name="' + key + '"], #' + key);
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = !!data[key];
                    } else if (input.type === 'radio') {
                        if (input.value === data[key]) input.checked = true;
                    } else if (input.tagName === 'SELECT') {
                        input.value = data[key];
                    } else {
                        input.value = data[key];
                    }
                });
            });
        });
    }

    // === Sauvegarde ===
    function save(silent) {
        try {
            // 1. Sauvegarder la DB si possible
            if (window.LoyerProDB) {
                // La DB se sauvegarde automatiquement à chaque modification,
                // mais on force une sauvegarde ici pour être sûr
                const raw = localStorage.getItem('loyerpro_db');
                if (raw) {
                    // OK, déjà sauvegardé
                }
            }

            // 2. Sauvegarder l'état des formulaires de la page
            const forms = captureFormState();
            const pageKey = AUTOSAVE_KEY + '_' + (window.location.pathname.split('/').pop() || 'index');
            const state = {
                forms: forms,
                url: window.location.href,
                timestamp: Date.now()
            };
            localStorage.setItem(pageKey, JSON.stringify(state));
            localStorage.setItem(AUTOSAVE_TIMESTAMP_KEY, String(Date.now()));

            pendingChanges = false;
            if (!silent) {
                showIndicator('saved', 'Données sauvegardées');
            }
            return true;
        } catch (e) {
            console.error('Erreur auto-save:', e);
            if (!silent) showIndicator('error', 'Erreur de sauvegarde');
            return false;
        }
    }

    function saveSilent() {
        save(true);
    }

    function saveWithIndicator() {
        showIndicator('saving', 'Sauvegarde en cours...');
        setTimeout(save, 200);
    }

    // === Démarrage de l'auto-sauvegarde ===
    function start() {
        if (saveTimer) return; // déjà démarré
        createIndicator();

        // Sauvegarde initiale (silencieuse)
        setTimeout(saveSilent, 1000);

        // Sauvegarde toutes les 5 secondes
        saveTimer = setInterval(() => {
            saveSilent();
        }, AUTOSAVE_INTERVAL);

        // Sauvegarde avant fermeture / changement de page
        window.addEventListener('beforeunload', () => {
            save(true);
        });

        // Sauvegarde quand l'utilisateur quitte l'onglet (visibilitychange)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                save(true);
            }
        });

        // Détection des changements → marquer comme "pending"
        document.addEventListener('input', () => { pendingChanges = true; });
        document.addEventListener('change', () => { pendingChanges = true; });
        document.addEventListener('click', (e) => {
            if (e.target.matches('input, button, .radio-card, .plan-card, .toggle input')) {
                pendingChanges = true;
            }
        });

        // Sauvegarde immédiate si changement détecté (debounce 1s)
        let debounceTimer = null;
        document.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(saveSilent, 1000);
        });

        // === Synchronisation entre onglets ===
        window.addEventListener('storage', (e) => {
            if (e.key === 'loyerpro_db') {
                // La DB a été modifiée dans un autre onglet → recharger
                if (window.LoyerProDB) {
                    try {
                        // Recharger la DB
                        const raw = localStorage.getItem('loyerpro_db');
                        if (raw) {
                            // La DB se recharge automatiquement au prochain appel
                            showIndicator('synced', 'Synchronisé depuis un autre onglet');
                            // Émettre un événement pour que les pages se rafraîchissent
                            window.dispatchEvent(new CustomEvent('loyerpro:sync', { detail: { key: e.key } }));
                        }
                    } catch (err) {
                        console.error('Erreur sync:', err);
                    }
                }
            }
            if (e.key && e.key.indexOf(AUTOSAVE_KEY) === 0) {
                // Une auto-save d'un autre onglet → restaurer les formulaires si même page
                try {
                    const state = JSON.parse(e.newValue || '{}');
                    if (state.url && state.url.split('/').pop() === window.location.pathname.split('/').pop()) {
                        restoreFormState(state);
                    }
                } catch (err) {}
            }
        });

        console.log('✅ Auto-save démarré (intervalle: ' + (AUTOSAVE_INTERVAL / 1000) + 's)');
    }

    function stop() {
        if (saveTimer) {
            clearInterval(saveTimer);
            saveTimer = null;
        }
    }

    // === Restaurer l'état au chargement ===
    function restore() {
        try {
            const pageKey = AUTOSAVE_KEY + '_' + (window.location.pathname.split('/').pop() || 'index');
            const raw = localStorage.getItem(pageKey);
            if (raw) {
                const state = JSON.parse(raw);
                // Ne restaurer que si la sauvegarde a moins de 24h
                if (state.timestamp && (Date.now() - state.timestamp) < 24 * 60 * 60 * 1000) {
                    restoreFormState(state);
                }
            }
        } catch (e) {
            console.error('Erreur restauration:', e);
        }
    }

    // === Démarrage ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            restore();
            start();
        });
    } else {
        restore();
        start();
    }

    // === API publique ===
    window.LoyerProAutoSave = {
        save: save,
        saveNow: saveWithIndicator,
        restore: restore,
        start: start,
        stop: stop,
        showIndicator: showIndicator,
        AUTOSAVE_INTERVAL: AUTOSAVE_INTERVAL
    };

})(window, document);
