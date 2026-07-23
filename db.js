/**
 * LoyerPro — Base de données locale (localStorage)
 * Couche d'abstraction pour persister les données côté navigateur.
 * Toutes les opérations CRUD synchrones, simples et fiables.
 */
(function (window) {
    'use strict';

    const DB_NAME = 'loyerpro_db';
    const DB_VERSION = 1;

    // Schéma par défaut
    // bailleurId = identifiant du compte bailleur propriétaire des données
    const DEFAULT_SCHEMA = {
        version: 2,
        properties: [
            { id: 'p1', bailleurId: 'LP-2025-DEMO01', name: 'Appartement T3 — Lomé', type: 'Appartement', address: '45 Avenue des Lilas, App 12, Lomé', surface: 65, rooms: 3, rent: 350000, charges: 25000, deposit: 375000, status: 'occupied', createdAt: '2024-01-15' },
            { id: 'p2', bailleurId: 'LP-2025-DEMO01', name: 'Studio — Lomé', type: 'Studio', address: '12 Rue du Commerce, Lomé', surface: 28, rooms: 1, rent: 100000, charges: 20000, deposit: 120000, status: 'occupied', createdAt: '2024-03-01' },
            { id: 'p3', bailleurId: 'LP-2025-DEMO01', name: 'Maison — Kpalimé', type: 'Maison', address: 'Route de Kpimé, Kpalimé', surface: 120, rooms: 5, rent: 600000, charges: 50000, deposit: 650000, status: 'occupied', createdAt: '2023-09-10' },
            { id: 'p4', bailleurId: 'LP-2025-DEMO01', name: 'Local commercial — Lomé', type: 'Commerce', address: 'Boulevard du Mono, Lomé', surface: 50, rooms: 1, rent: 250000, charges: 15000, deposit: 275000, status: 'vacant', createdAt: '2024-06-20' }
        ],
        tenants: [
            { id: 't1', bailleurId: 'LP-2025-DEMO01', firstName: 'Marie', lastName: 'ANOUKOUM', email: 'marie.anoukom@example.fr', phone: '+228 92 87 16 05', propertyId: 'p1', leaseStart: '2024-01-15', leaseEnd: '2026-01-14', deposit: 375000, status: 'active', createdAt: '2024-01-10' },
            { id: 't2', bailleurId: 'LP-2025-DEMO01', firstName: 'Pierre', lastName: 'DOUKOUWA', email: 'pierre.doukouwa@example.fr', phone: '+228 90 11 22 33', propertyId: 'p2', leaseStart: '2024-03-01', leaseEnd: '2025-02-28', deposit: 120000, status: 'active', createdAt: '2024-02-25' },
            { id: 't3', bailleurId: 'LP-2025-DEMO01', firstName: 'Sophie', lastName: 'LAMBERT', email: 'sophie.lambert@example.fr', phone: '+228 99 88 77 66', propertyId: 'p3', leaseStart: '2023-09-15', leaseEnd: '2026-09-14', deposit: 650000, status: 'active', createdAt: '2023-09-05' }
        ],
        payments: [
            { id: 'pay1', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2025-07', amount: 375000, date: '2025-07-05', method: 'Virement', status: 'paid', createdAt: '2025-07-05' },
            { id: 'pay2', bailleurId: 'LP-2025-DEMO01', tenantId: 't2', propertyId: 'p2', period: '2025-07', amount: 120000, date: '2025-07-08', method: 'Espèces', status: 'paid', createdAt: '2025-07-08' },
            { id: 'pay3', bailleurId: 'LP-2025-DEMO01', tenantId: 't3', propertyId: 'p3', period: '2025-07', amount: 650000, date: '2025-07-03', method: 'Virement', status: 'paid', createdAt: '2025-07-03' },
            { id: 'pay4', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2025-06', amount: 375000, date: '2025-06-05', method: 'Virement', status: 'paid', createdAt: '2025-06-05' },
            { id: 'pay5', bailleurId: 'LP-2025-DEMO01', tenantId: 't2', propertyId: 'p2', period: '2025-06', amount: 120000, date: '2025-06-10', method: 'Espèces', status: 'paid', createdAt: '2025-06-10' },
            { id: 'pay6', bailleurId: 'LP-2025-DEMO01', tenantId: 't3', propertyId: 'p3', period: '2025-06', amount: 650000, date: '2025-06-04', method: 'Virement', status: 'paid', createdAt: '2025-06-04' },
            { id: 'pay7', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2025-05', amount: 375000, date: '2025-05-06', method: 'Virement', status: 'paid', createdAt: '2025-05-06' },
            { id: 'pay8', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2025-08', amount: 375000, date: null, method: 'Virement', status: 'pending', createdAt: '2025-07-22' },
            { id: 'pay9', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2026-07', amount: 375000, date: '2026-07-05', method: 'Virement', status: 'paid', createdAt: '2026-07-05' },
            { id: 'pay10', bailleurId: 'LP-2025-DEMO01', tenantId: 't2', propertyId: 'p2', period: '2026-07', amount: 120000, date: '2026-07-08', method: 'Espèces', status: 'paid', createdAt: '2026-07-08' },
            { id: 'pay11', bailleurId: 'LP-2025-DEMO01', tenantId: 't3', propertyId: 'p3', period: '2026-07', amount: 650000, date: '2026-07-03', method: 'Virement', status: 'paid', createdAt: '2026-07-03' },
            { id: 'pay12', bailleurId: 'LP-2025-DEMO01', tenantId: 't1', propertyId: 'p1', period: '2026-06', amount: 375000, date: '2026-06-05', method: 'Virement', status: 'paid', createdAt: '2026-06-05' },
            { id: 'pay13', bailleurId: 'LP-2025-DEMO01', tenantId: 't2', propertyId: 'p2', period: '2026-06', amount: 120000, date: '2026-06-10', method: 'Espèces', status: 'paid', createdAt: '2026-06-10' },
            { id: 'pay14', bailleurId: 'LP-2025-DEMO01', tenantId: 't3', propertyId: 'p3', period: '2026-06', amount: 650000, date: '2026-06-04', method: 'Virement', status: 'paid', createdAt: '2026-06-04' },
            { id: 'pay15', bailleurId: 'LP-2025-DEMO01', tenantId: 't2', propertyId: 'p2', period: '2026-08', amount: 120000, date: null, method: 'Virement', status: 'pending', createdAt: '2026-07-22' }
        ],
        receipts: [
            { id: 'rec1', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0001', tenantId: 't1', propertyId: 'p1', owner: 'Jean Dupont', tenant: 'Marie ANOUKOUM', property: 'Appart. T3 Lomé', period: '2026-07', rent: 350000, charges: 25000, total: 375000, date: '2026-07-05', method: 'Virement', createdAt: '2026-07-05' },
            { id: 'rec2', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0002', tenantId: 't2', propertyId: 'p2', owner: 'Jean Dupont', tenant: 'Pierre DOUKOUWA', property: 'Studio Lomé', period: '2026-07', rent: 100000, charges: 20000, total: 120000, date: '2026-07-08', method: 'Espèces', createdAt: '2026-07-08' },
            { id: 'rec3', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0003', tenantId: 't3', propertyId: 'p3', owner: 'Jean Dupont', tenant: 'Sophie LAMBERT', property: 'Maison Kpalimé', period: '2026-07', rent: 600000, charges: 50000, total: 650000, date: '2026-07-03', method: 'Virement', createdAt: '2026-07-03' },
            { id: 'rec4', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0004', tenantId: 't1', propertyId: 'p1', owner: 'Jean Dupont', tenant: 'Marie ANOUKOUM', property: 'Appart. T3 Lomé', period: '2026-06', rent: 350000, charges: 25000, total: 375000, date: '2026-06-05', method: 'Virement', createdAt: '2026-06-05' },
            { id: 'rec5', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0005', tenantId: 't2', propertyId: 'p2', owner: 'Jean Dupont', tenant: 'Pierre DOUKOUWA', property: 'Studio Lomé', period: '2026-06', rent: 100000, charges: 20000, total: 120000, date: '2026-06-10', method: 'Espèces', createdAt: '2026-06-10' },
            { id: 'rec6', bailleurId: 'LP-2025-DEMO01', number: 'QP-2026-0006', tenantId: 't3', propertyId: 'p3', owner: 'Jean Dupont', tenant: 'Sophie LAMBERT', property: 'Maison Kpalimé', period: '2026-06', rent: 600000, charges: 50000, total: 650000, date: '2026-06-04', method: 'Virement', createdAt: '2026-06-04' }
        ],
        accounts: [
            // Comptes d'authentification (bailleur & locataire)
            // Format : { id, identifier, password, type: 'bailleur'|'locataire', name, email, phone, ownerId (pour locataire), createdAt, expiresAt }
            { id: 'acc_demo_bailleur', identifier: 'LP-2025-DEMO01', password: 'Demo!2025', type: 'bailleur', name: 'Jean Dupont', email: 'jeanskodoc22@gmail.com', phone: '+228 92 87 16 05', ownerId: null, createdAt: '2025-01-01', expiresAt: null },
            { id: 'acc_demo_loc1', identifier: 'LOC-2025-MA0001', password: 'Loc!2025A', type: 'locataire', name: 'Marie ANOUKOUM', email: 'marie.anoukom@example.fr', phone: '+228 92 87 16 05', ownerId: 't1', createdAt: '2025-01-01', expiresAt: null }
        ],
        sessions: [
            // Sessions actives (30 jours)
            // Format : { identifier, type, name, loginAt, expiresAt }
        ],
        settings: {
            ownerName: 'Jean Dupont',
            ownerEmail: 'jeanskodoc22@gmail.com',
            ownerPhone: '+228 92 87 16 05',
            ownerAddress: '123 Rue du Commerce, DIGITALE EXPERT',
            currency: 'FCFA'
        }
    };

    // === Lecture / écriture du stockage ===
    function load() {
        try {
            const raw = localStorage.getItem(DB_NAME);
            if (!raw) {
                save(DEFAULT_SCHEMA);
                return JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
            }
            const parsed = JSON.parse(raw);
            // === Migration automatique : ajouter les tables manquantes ===
            let needsSave = false;
            const defaults = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
            Object.keys(defaults).forEach(key => {
                if (parsed[key] === undefined) {
                    parsed[key] = defaults[key];
                    needsSave = true;
                    console.log('LoyerPro DB: table "' + key + '" ajoutée par migration');
                }
            });
            // Vérifier que les comptes de démonstration existent
            if (!parsed.accounts || parsed.accounts.length === 0) {
                parsed.accounts = defaults.accounts;
                needsSave = true;
                console.log('LoyerPro DB: comptes de démonstration ajoutés');
            } else {
                const hasBailleurDemo = parsed.accounts.some(a => a.identifier === 'LP-2025-DEMO01');
                const hasLocataireDemo = parsed.accounts.some(a => a.identifier === 'LOC-2025-MA0001');
                if (!hasBailleurDemo) {
                    parsed.accounts.push(defaults.accounts.find(a => a.identifier === 'LP-2025-DEMO01'));
                    needsSave = true;
                    console.log('LoyerPro DB: compte démo bailleur ajouté');
                }
                if (!hasLocataireDemo) {
                    parsed.accounts.push(defaults.accounts.find(a => a.identifier === 'LOC-2025-MA0001'));
                    needsSave = true;
                    console.log('LoyerPro DB: compte démo locataire ajouté');
                }
            }
            // === Migration v2 : ajouter bailleurId aux anciens enregistrements ===
            ['properties', 'tenants', 'payments', 'receipts'].forEach(table => {
                if (parsed[table] && Array.isArray(parsed[table])) {
                    parsed[table].forEach(record => {
                        if (!record.bailleurId) {
                            record.bailleurId = 'LP-2025-DEMO01';
                            needsSave = true;
                        }
                    });
                }
            });
            if (needsSave) {
                save(parsed);
            }
            return parsed;
        } catch (e) {
            console.error('LoyerPro DB: erreur de lecture', e);
            save(DEFAULT_SCHEMA);
            return JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
        }
    }

    function save(data) {
        try {
            localStorage.setItem(DB_NAME, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('LoyerPro DB: erreur d\'écriture', e);
            return false;
        }
    }

    let db = load();

    // === Utilitaires ===
    function uid(prefix) {
        return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    function formatFCFA(n) {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n || 0) + ' FCFA';
    }

    function formatShort(n) {
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' Mds';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + ' M';
        if (n >= 1000) return (n / 1000).toFixed(0) + ' K';
        return String(n);
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('fr-FR');
    }

    function formatMonth(yyyymm) {
        if (!yyyymm) return '—';
        const [y, m] = yyyymm.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    function monthLabel(yyyymm) {
        if (!yyyymm) return '';
        const [y, m] = yyyymm.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        return d.toLocaleDateString('fr-FR', { month: 'short' });
    }

    function currentMonth() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    // === CRUD générique ===
    function getAll(table) {
        return db[table] || [];
    }

    function getById(table, id) {
        return (db[table] || []).find(r => r.id === id);
    }

    function create(table, record) {
        if (!db[table]) db[table] = [];
        const newRecord = Object.assign({ id: uid(table[0]), createdAt: new Date().toISOString().slice(0, 10) }, record);
        db[table].push(newRecord);
        save(db);
        return newRecord;
    }

    function update(table, id, updates) {
        const idx = (db[table] || []).findIndex(r => r.id === id);
        if (idx === -1) return null;
        db[table][idx] = Object.assign({}, db[table][idx], updates, { updatedAt: new Date().toISOString().slice(0, 10) });
        save(db);
        return db[table][idx];
    }

    function remove(table, id) {
        if (!db[table]) return false;
        const before = db[table].length;
        db[table] = db[table].filter(r => r.id !== id);
        save(db);
        return db[table].length < before;
    }

    // === Méthodes spécifiques ===
    // === Récupérer l'ID du bailleur connecté ===
    function getCurrentBailleurId() {
        try {
            const raw = localStorage.getItem('loyerpro_session');
            if (raw) {
                const session = JSON.parse(raw);
                if (session && session.type === 'bailleur') return session.identifier;
            }
        } catch (e) {}
        // Pour les comptes locataires, on récupère le bailleurId via le locataire
        return null;
    }

    // === Récupérer l'ID du bailleur pour un locataire connecté ===
    function getBailleurIdForLocataire() {
        try {
            const raw = localStorage.getItem('loyerpro_session');
            if (raw) {
                const session = JSON.parse(raw);
                if (session && session.type === 'locataire' && session.ownerId) {
                    const tenant = getTenant(session.ownerId);
                    if (tenant && tenant.bailleurId) return tenant.bailleurId;
                }
            }
        } catch (e) {}
        return null;
    }

    // === Récupérer l'ID du bailleur courant (bailleur connecté OU bailleur du locataire connecté) ===
    function getCurrentBailleurIdAny() {
        return getCurrentBailleurId() || getBailleurIdForLocataire() || 'acc_demo_bailleur';
    }

    function getProperties() {
        const bid = getCurrentBailleurId();
        if (!bid) return getAll('properties');
        return getAll('properties').filter(p => !p.bailleurId || p.bailleurId === bid);
    }
    function getTenants() {
        const bid = getCurrentBailleurId();
        if (!bid) return getAll('tenants');
        return getAll('tenants').filter(t => !t.bailleurId || t.bailleurId === bid);
    }
    function getPayments() {
        const bid = getCurrentBailleurId();
        if (!bid) return getAll('payments');
        return getAll('payments').filter(p => !p.bailleurId || p.bailleurId === bid);
    }
    function getProperty(id) { return getById('properties', id); }
    function getTenant(id) { return getById('tenants', id); }
    function getTenantByProperty(propertyId) {
        return getAll('tenants').find(t => t.propertyId === propertyId && t.status === 'active');
    }

    function getStats() {
        const props = getAll('properties');
        const tenants = getAll('tenants');
        const payments = getAll('payments');
        const month = currentMonth();

        const totalProperties = props.length;
        const occupied = props.filter(p => p.status === 'occupied').length;
        const vacant = props.filter(p => p.status === 'vacant').length;
        const occupancyRate = totalProperties > 0 ? Math.round((occupied / totalProperties) * 100) : 0;

        const expectedMonthly = props
            .filter(p => p.status === 'occupied')
            .reduce((sum, p) => sum + (p.rent || 0) + (p.charges || 0), 0);

        const collectedThisMonth = payments
            .filter(p => p.period === month && p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const pendingThisMonth = payments
            .filter(p => p.period === month && p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalCollected = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const pendingCount = payments.filter(p => p.status === 'pending').length;

        return {
            totalProperties, occupied, vacant, occupancyRate,
            expectedMonthly, collectedThisMonth, pendingThisMonth,
            totalCollected, pendingCount, activeTenants: tenants.filter(t => t.status === 'active').length,
            collectionRate: expectedMonthly > 0 ? Math.round((collectedThisMonth / expectedMonthly) * 100) : 0
        };
    }

    function getMonthlySeries(months) {
        const series = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            const total = getAll('payments')
                .filter(p => p.period === key && p.status === 'paid')
                .reduce((s, p) => s + (p.amount || 0), 0);
            series.push({ month: key, label: monthLabel(key), total });
        }
        return series;
    }

    function getRecentPayments(limit) {
        return getAll('payments')
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .slice(0, limit || 5);
    }

    function resetDatabase() {
        db = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
        save(db);
        return db;
    }

    function exportData() {
        return JSON.stringify(db, null, 2);
    }

    function importData(json) {
        try {
            db = JSON.parse(json);
            save(db);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ============================================================
    // === AUTHENTIFICATION & COMPTES ===
    // ============================================================

    function getAccounts() { return getAll('accounts'); }
    function getAccountByIdentifier(identifier) {
        return (db.accounts || []).find(a => a.identifier === identifier);
    }
    function getAccountByOwnerId(ownerId, type) {
        return (db.accounts || []).find(a => a.ownerId === ownerId && (!type || a.type === type));
    }
    function getLocataireAccounts(bailleurIdentifier) {
        // Récupère tous les comptes locataires (lié ou non à un bailleur spécifique)
        return (db.accounts || []).filter(a => a.type === 'locataire');
    }

    function createAccount(accountData) {
        // Vérifier que l'identifier n'existe pas déjà
        const existing = getAccountByIdentifier(accountData.identifier);
        if (existing) {
            return { success: false, error: 'Cet identifiant existe déjà.' };
        }
        const newAccount = create('accounts', Object.assign({
            type: 'bailleur',
            expiresAt: null,
            ownerId: null
        }, accountData));
        return { success: true, account: newAccount };
    }

    function updateAccount(id, updates) {
        return update('accounts', id, updates);
    }

    function deleteAccount(id) {
        return remove('accounts', id);
    }

    function verifyCredentials(identifier, password) {
        const account = getAccountByIdentifier(identifier);
        if (!account) return { success: false, error: 'Identifiant introuvable.' };
        if (account.password !== password) return { success: false, error: 'Mot de passe incorrect.' };
        return { success: true, account: account };
    }

    // === Sessions (30 jours) ===
    const SESSION_DURATION_DAYS = 30;

    function startSession(account) {
        if (!account) return null;
        const now = new Date();
        const expires = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
        const session = {
            identifier: account.identifier,
            type: account.type,
            name: account.name,
            email: account.email,
            phone: account.phone,
            ownerId: account.ownerId,
            loginAt: now.toISOString(),
            expiresAt: expires.toISOString()
        };
        // Remplacer une éventuelle session existante pour ce compte
        db.sessions = (db.sessions || []).filter(s => s.identifier !== account.identifier);
        db.sessions.push(session);
        // Sauvegarder aussi dans localStorage 'loyerpro_session' pour accès rapide
        try { localStorage.setItem('loyerpro_session', JSON.stringify(session)); } catch (e) {}
        save(db);
        return session;
    }

    function getCurrentSession() {
        // D'abord tenter localStorage (plus rapide)
        try {
            const raw = localStorage.getItem('loyerpro_session');
            if (raw) {
                const session = JSON.parse(raw);
                if (session && new Date(session.expiresAt) > new Date()) {
                    return session;
                } else if (session) {
                    // Session expirée, on nettoie
                    localStorage.removeItem('loyerpro_session');
                }
            }
        } catch (e) {}
        // Fallback : DB
        if (!db.sessions) return null;
        const session = db.sessions.find(s => new Date(s.expiresAt) > new Date());
        return session || null;
    }

    function clearSession() {
        try { localStorage.removeItem('loyerpro_session'); } catch (e) {}
        db.sessions = [];
        save(db);
    }

    function isAuth() {
        return getCurrentSession() !== null;
    }

    function isBailleur() {
        const s = getCurrentSession();
        return s && s.type === 'bailleur';
    }

    function isLocataire() {
        const s = getCurrentSession();
        return s && s.type === 'locataire';
    }

    function extendSession() {
        // Prolonge la session courante de 30 jours
        const session = getCurrentSession();
        if (!session) return null;
        const expires = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
        session.expiresAt = expires.toISOString();
        try { localStorage.setItem('loyerpro_session', JSON.stringify(session)); } catch (e) {}
        // Mettre à jour dans db.sessions
        if (db.sessions) {
            const idx = db.sessions.findIndex(s => s.identifier === session.identifier);
            if (idx >= 0) db.sessions[idx] = session;
        }
        save(db);
        return session;
    }

    // === Génération d'identifiants pour locataires ===
    function generateLocataireIdentifier(firstName, lastName) {
        // Format : LOC-YYYY-XXXXX
        const year = new Date().getFullYear();
        const cleanFirst = (firstName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        const cleanLast = (lastName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        const random = Math.random().toString(36).slice(2, 6).toUpperCase();
        const base = (cleanFirst + cleanLast).padEnd(4, '0').slice(0, 4);
        return 'LOC-' + year + '-' + base + random;
    }

    function generatePassword(length) {
        length = length || 10;
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower = 'abcdefghijkmnpqrstuvwxyz';
        const digits = '23456789';
        const symbols = '!@#$%&*?';
        const all = upper + lower + digits + symbols;
        let pwd = [
            upper[Math.floor(Math.random() * upper.length)],
            lower[Math.floor(Math.random() * lower.length)],
            digits[Math.floor(Math.random() * digits.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        for (let i = pwd.length; i < length; i++) {
            pwd.push(all[Math.floor(Math.random() * all.length)]);
        }
        for (let i = pwd.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
        }
        return pwd.join('');
    }

    // ============================================================
    // === CHIFFRE D'AFFAIRES & TAXE DÉVELOPPEUR (10 %) ===
    // ============================================================

    const TAXE_DEVELOPPEUR_RATE = 0.10; // 10 % de taxe développeur
    const CYCLE_30_JOURS = 30; // cycle de facturation en jours

    /**
     * Récupère toutes les quittances générées.
     */
    function getReceipts() {
        const bid = getCurrentBailleurId();
        if (!bid) return getAll('receipts');
        return getAll('receipts').filter(r => !r.bailleurId || r.bailleurId === bid);
    }

    /**
     * Crée une nouvelle quittance (appelée depuis facture-loyer.html).
     */
    function createReceipt(receiptData) {
        // Générer un numéro de quittance si non fourni
        if (!receiptData.number) {
            const year = new Date().getFullYear();
            const count = (getReceipts()).filter(r => (r.number || '').startsWith('QP-' + year)).length + 1;
            receiptData.number = 'QP-' + year + '-' + String(count).padStart(4, '0');
        }
        // Calculer le total si non fourni
        if (receiptData.total == null) {
            receiptData.total = (receiptData.rent || 0) + (receiptData.charges || 0);
        }
        return create('receipts', receiptData);
    }

    /**
     * Calcule le chiffre d'affaires total du bailleur à partir des quittances sauvegardées.
     * @param {string} periodStart - YYYY-MM optionnel, si fourni ne compte que depuis ce mois
     * @returns {number} CA total en FCFA
     */
    function getChiffreAffaires(periodStart) {
        const receipts = getReceipts();
        const filtered = periodStart ? receipts.filter(r => (r.period || '') >= periodStart) : receipts;
        return filtered.reduce((sum, r) => sum + (r.total || 0), 0);
    }

    /**
     * Calcule le CA du bailleur pour un mois donné.
     * @param {string} period - YYYY-MM (ex: '2026-07')
     * @returns {number} CA du mois en FCFA
     */
    function getCAParMois(period) {
        const receipts = getReceipts();
        return receipts
            .filter(r => r.period === period)
            .reduce((sum, r) => sum + (r.total || 0), 0);
    }

    /**
     * Récupère la série du CA mensuel sur N mois.
     * @param {number} months - nombre de mois (défaut 12)
     * @returns {Array} [{month, label, total}]
     */
    function getCAMonthlySeries(months) {
        months = months || 12;
        const series = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            const total = getCAParMois(key);
            series.push({ month: key, label: monthLabel(key), total });
        }
        return series;
    }

    /**
     * Calcule la taxe développeur (10 %) pour une période donnée.
     * @param {string} periodStart - YYYY-MM début (optionnel)
     * @param {string} periodEnd - YYYY-MM fin (optionnel)
     * @returns {object} { ca, taxe, total }
     */
    function calculerTaxeDeveloppeur(periodStart, periodEnd) {
        let receipts = getReceipts();
        if (periodStart) receipts = receipts.filter(r => (r.period || '') >= periodStart);
        if (periodEnd) receipts = receipts.filter(r => (r.period || '') <= periodEnd);
        const ca = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
        const taxe = Math.round(ca * TAXE_DEVELOPPEUR_RATE);
        return { ca: ca, taxe: taxe, total: ca + taxe, rate: TAXE_DEVELOPPEUR_RATE };
    }

    /**
     * Calcule la taxe développeur pour un cycle de 30 jours.
     * @param {Date} dateInscription - date d'inscription du bailleur
     * @returns {object} { cycleNumber, cycleStart, cycleEnd, ca, taxe }
     */
    function calculerTaxeCycle30Jours(dateInscription) {
        if (!dateInscription) {
            // Si pas de date d'inscription, on prend la date de la première quittance
            const receipts = getReceipts();
            if (receipts.length === 0) {
                return { cycleNumber: 1, cycleStart: null, cycleEnd: null, ca: 0, taxe: 0 };
            }
            dateInscription = receipts.reduce((min, r) => {
                const d = new Date(r.createdAt || r.date);
                return d < min ? d : min;
            }, new Date());
        }

        const now = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.floor((now - dateInscription) / msPerDay);
        const cycleNumber = Math.floor(diffDays / CYCLE_30_JOURS) + 1;
        const cycleStart = new Date(dateInscription.getTime() + (cycleNumber - 1) * CYCLE_30_JOURS * msPerDay);
        const cycleEnd = new Date(cycleStart.getTime() + CYCLE_30_JOURS * msPerDay);

        // CA des quittances du cycle courant
        const cycleStartStr = cycleStart.toISOString().slice(0, 10);
        const cycleEndStr = cycleEnd.toISOString().slice(0, 10);
        const receipts = (getReceipts()).filter(r => {
            const d = r.date || r.createdAt;
            return d && d >= cycleStartStr && d < cycleEndStr;
        });
        const ca = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
        const taxe = Math.round(ca * TAXE_DEVELOPPEUR_RATE);

        return {
            cycleNumber: cycleNumber,
            cycleStart: cycleStart.toISOString().slice(0, 10),
            cycleEnd: cycleEnd.toISOString().slice(0, 10),
            daysRemaining: Math.max(0, Math.ceil((cycleEnd - now) / msPerDay)),
            ca: ca,
            taxe: taxe,
            rate: TAXE_DEVELOPPEUR_RATE,
            receiptsCount: receipts.length
        };
    }

    /**
     * Récupère l'historique des cycles de 30 jours (pour facturation récurrente).
     * @param {Date} dateInscription
     * @returns {Array} [{cycleNumber, cycleStart, cycleEnd, ca, taxe, status}]
     */
    function getHistoriqueCycles(dateInscription, maxCycles) {
        maxCycles = maxCycles || 12;
        if (!dateInscription) {
            const receipts = getReceipts();
            if (receipts.length === 0) return [];
            dateInscription = receipts.reduce((min, r) => {
                const d = new Date(r.createdAt || r.date);
                return d < min ? d : min;
            }, new Date());
        }

        const now = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.floor((now - dateInscription) / msPerDay);
        const totalCycles = Math.floor(diffDays / CYCLE_30_JOURS) + 1;
        const cycles = [];

        for (let i = 1; i <= Math.min(totalCycles, maxCycles); i++) {
            const cycleStart = new Date(dateInscription.getTime() + (i - 1) * CYCLE_30_JOURS * msPerDay);
            const cycleEnd = new Date(cycleStart.getTime() + CYCLE_30_JOURS * msPerDay);
            const cycleStartStr = cycleStart.toISOString().slice(0, 10);
            const cycleEndStr = cycleEnd.toISOString().slice(0, 10);

            const receipts = (getReceipts()).filter(r => {
                const d = r.date || r.createdAt;
                return d && d >= cycleStartStr && d < cycleEndStr;
            });
            const ca = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
            const taxe = Math.round(ca * TAXE_DEVELOPPEUR_RATE);

            cycles.push({
                cycleNumber: i,
                cycleStart: cycleStartStr,
                cycleEnd: cycleEndStr,
                ca: ca,
                taxe: taxe,
                receiptsCount: receipts.length,
                status: cycleEnd < now ? 'closed' : 'current'
            });
        }
        return cycles.reverse(); // du plus récent au plus ancien
    }

    // === API publique ===
    window.LoyerProDB = {
        // CRUD générique
        getAll, getById, create, update, remove,
        // Spécifique
        getProperties, getTenants, getPayments,
        getProperty, getTenant, getTenantByProperty,
        getStats, getMonthlySeries, getRecentPayments,
        // Filtrage par bailleur
        getCurrentBailleurId, getBailleurIdForLocataire, getCurrentBailleurIdAny,
        // Quittances & CA
        getReceipts, createReceipt,
        getChiffreAffaires, getCAParMois, getCAMonthlySeries,
        // Taxe développeur
        calculerTaxeDeveloppeur, calculerTaxeCycle30Jours, getHistoriqueCycles,
        TAXE_DEVELOPPEUR_RATE: TAXE_DEVELOPPEUR_RATE,
        CYCLE_30_JOURS: CYCLE_30_JOURS,
        getSettings: () => db.settings,
        updateSettings: (s) => { db.settings = Object.assign({}, db.settings, s); save(db); return db.settings; },
        // Authentification & comptes
        getAccounts, getAccountByIdentifier, getAccountByOwnerId, getLocataireAccounts,
        createAccount, updateAccount, deleteAccount, verifyCredentials,
        startSession, getCurrentSession, clearSession, extendSession,
        isAuth, isBailleur, isLocataire,
        generateLocataireIdentifier, generatePassword,
        SESSION_DURATION_DAYS: SESSION_DURATION_DAYS,
        // Utilitaires
        formatFCFA, formatShort, formatDate, formatMonth, currentMonth,
        // Maintenance
        resetDatabase, exportData, importData,
        // Constantes
        DB_NAME, DB_VERSION
    };

})(window);
