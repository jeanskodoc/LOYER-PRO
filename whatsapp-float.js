/**
 * LoyerPro — Bouton WhatsApp flottant
 * S'injecte automatiquement sur toutes les pages où le script est chargé.
 * Numéro : +228 92 87 16 05 (22892871605 au format international)
 */
(function (window, document) {
    'use strict';

    const WHATSAPP_NUMBER = '22892871605';
    const WHATSAPP_MESSAGE = "Bonjour LoyerPro, je souhaite avoir des informations sur vos services de gestion locative.";

    // Attendre le chargement du DOM
    function init() {
        // Éviter double injection
        if (document.getElementById('loyerpro-wa-float')) return;

        // Conteneur principal
        const wrap = document.createElement('div');
        wrap.id = 'loyerpro-wa-float';
        wrap.innerHTML = `
            <style>
                #loyerpro-wa-float {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                #loyerpro-wa-float .wa-button {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #25D366;
                    color: #fff;
                    padding: 14px 20px;
                    border-radius: 999px;
                    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                #loyerpro-wa-float .wa-button:hover {
                    background: #1da851;
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 12px 32px rgba(37, 211, 102, 0.55);
                }
                #loyerpro-wa-float .wa-icon {
                    font-size: 1.6rem;
                    line-height: 1;
                    flex-shrink: 0;
                }
                #loyerpro-wa-float .wa-label {
                    white-space: nowrap;
                }
                #loyerpro-wa-float .wa-pulse {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 999px;
                    background: #25D366;
                    z-index: -1;
                    animation: loyerproWaPulse 2.5s ease-out infinite;
                }
                @keyframes loyerproWaPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                #loyerpro-wa-float .wa-tooltip {
                    position: absolute;
                    right: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    margin-right: 12px;
                    background: #0f172a;
                    color: #fff;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                #loyerpro-wa-float .wa-tooltip::after {
                    content: '';
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 6px solid transparent;
                    border-left-color: #0f172a;
                }
                #loyerpro-wa-float .wa-button:hover .wa-tooltip {
                    opacity: 1;
                }
                /* Version mobile : icône seule */
                @media (max-width: 640px) {
                    #loyerpro-wa-float {
                        bottom: 16px;
                        right: 16px;
                    }
                    #loyerpro-wa-float .wa-button {
                        padding: 14px;
                        width: 56px;
                        height: 56px;
                        justify-content: center;
                    }
                    #loyerpro-wa-float .wa-label,
                    #loyerpro-wa-float .wa-tooltip {
                        display: none;
                    }
                    #loyerpro-wa-float .wa-icon {
                        font-size: 1.8rem;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    #loyerpro-wa-float .wa-pulse { animation: none; }
                    #loyerpro-wa-float .wa-button { transition: none; }
                }
            </style>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}"
               target="_blank"
               rel="noopener"
               class="wa-button"
               aria-label="Contacter LoyerPro sur WhatsApp">
                <span class="wa-pulse"></span>
                <i class="fab fa-whatsapp wa-icon" aria-hidden="true"></i>
                <span class="wa-label">Discuter sur WhatsApp</span>
                <span class="wa-tooltip">Une question ? Écrivez-nous !</span>
            </a>
        `;
        document.body.appendChild(wrap);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
