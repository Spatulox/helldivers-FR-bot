"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageHashDetection = void 0;
const crypto_1 = require("crypto");
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageHash_1 = require("../../utils/ImageHash");
const BKTree_1 = require("../../utils/BKTree");
const Distance_1 = require("../../utils/Distance");
// Distances de Hamming maximales pour considérer deux images comme identiques (sur 64 bits)
const PHASH_THRESHOLD = 10;
const DHASH_THRESHOLD = 12;
// Sous ces distances, la correspondance est nette ; entre elles et les seuils, l'OCR est relancé
const PHASH_SURE = 6;
const DHASH_SURE = 8;
// Banque globale : versionnée, hors CACHE_FOLDER, chemin relatif au cwd comme le wiki et les handlers
const GLOBAL_BANK_FOLDER = "./src/share/scamRules";
const GLOBAL_BANK_FILE = "global_hashes";
// Copie de secours de la banque globale, dans le cache du bot (voir l'en-tête du module)
const GLOBAL_BANK_BACKUP = "global_hashes_backup";
class ImageHashDetection extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        return { hashes: [] };
    }
    constructor() {
        super();
        this.name = ImageHashDetection.NAME;
        this.description = "Perceptual hash (pHash + dHash) of images, compared against the global and server scam hash banks";
        // Banque serveur : cache standard du module, donc un fichier par bot
        this.cacheKey = "local_hashes";
        this.globalBank = { hashes: [] };
        this.globalIndex = ImageHashDetection.buildIndex([]);
        this.serverIndex = ImageHashDetection.buildIndex([]);
        void this.loadServerBank();
        void this.loadGlobalBank();
    }
    /**
     * Index d'une liste d'entrées. Une entrée aux empreintes invalides (JSON édité à la main) est
     * ignorée : elle ne pouvait déjà correspondre à rien.
     */
    static buildIndex(entries) {
        const tree = new BKTree_1.BKTree();
        for (const entry of entries) {
            const hash = (0, ImageHash_1.toNumericHash)(entry);
            if (hash != null) {
                tree.insert(hash.phash, { entry, hash });
            }
        }
        return { tree };
    }
    /**
     * Complète les entrées d'un format antérieur (ou ajoutées à la main) : sans statut, une entrée
     * part en quarantaine, comme toute empreinte que personne n'a validée. Les détections d'un
     * format antérieur (`sources`, `authors`) et le message d'historique (`historyMessageId`, que
     * ScamHashHistory retrouve seul) sont retirés.
     * @returns true si au moins une entrée a été modifiée, donc si la banque est à réécrire
     */
    static migrate(entries) {
        let changed = false;
        for (const entry of entries) {
            if (typeof entry.id != "string") {
                entry.id = (0, crypto_1.randomUUID)();
                changed = true;
            }
            if (entry.status == null) {
                entry.status = "quarantine";
                changed = true;
            }
            if (entry.reviewedBy === undefined) {
                entry.reviewedBy = null;
                changed = true;
            }
            if (entry.sources !== undefined) {
                delete entry.sources;
                changed = true;
            }
            if (entry.authors !== undefined) {
                delete entry.authors;
                changed = true;
            }
            if (entry.historyMessageId !== undefined) {
                delete entry.historyMessageId;
                changed = true;
            }
        }
        return changed;
    }
    /** Retient le message et son auteur pour l'entrée. @returns false si le message était déjà compté */
    static countDetection(entry, context) {
        var _a;
        const counted = (_a = ImageHashDetection.detections.get(entry.id)) !== null && _a !== void 0 ? _a : { messages: new Set(), authors: new Set() };
        ImageHashDetection.detections.set(entry.id, counted);
        if (counted.messages.has(context.messageUrl)) {
            return false;
        }
        counted.messages.add(context.messageUrl);
        counted.authors.add(context.authorId);
        return true;
    }
    loadServerBank() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCache();
            if (ImageHashDetection.migrate(this.serverBank.hashes)) {
                yield this.writeCache();
            }
            this.serverIndex = ImageHashDetection.buildIndex(this.serverBank.hashes);
        });
    }
    get phashThreshold() {
        return PHASH_THRESHOLD;
    }
    get dhashThreshold() {
        return DHASH_THRESHOLD;
    }
    /** Banque serveur (cache du module) */
    get serverBank() {
        return this.cache;
    }
    loadGlobalBank() {
        return __awaiter(this, void 0, void 0, function* () {
            const stored = yield simplediscordbot_1.FileManager.readJsonFile(`${GLOBAL_BANK_FOLDER}/${GLOBAL_BANK_FILE}.json`);
            const backup = yield simplediscordbot_1.CacheManager.readCache(GLOBAL_BANK_BACKUP);
            const versioned = stored && Array.isArray(stored.hashes) ? stored.hashes : [];
            const saved = backup && Array.isArray(backup.hashes) ? backup.hashes : [];
            const migrated = ImageHashDetection.migrate(versioned);
            const savedMigrated = ImageHashDetection.migrate(saved);
            const merged = ImageHashDetection.mergeBanks(versioned, saved);
            this.globalBank = { hashes: merged.hashes };
            // Réécrit les deux fichiers dès que l'un ne reflète pas la fusion (migration, entrées
            // retrouvées dans la copie de secours, ou première copie de secours)
            if (migrated || savedMigrated || merged.changed || saved.length != merged.hashes.length || backup === false) {
                yield this.writeGlobalBank();
            }
            this.globalIndex = ImageHashDetection.buildIndex(this.globalBank.hashes);
        });
    }
    /**
     * Fusion de la banque versionnée et de sa copie de secours, par identifiant. La banque globale
     * ne perd jamais d'entrée (elle n'en gagne que par ajout ou promotion) : l'union suffit. Une
     * entrée est reconnue par son identifiant, ou à défaut par ses empreintes : une entrée ajoutée
     * à la main sans identifiant en reçoit un nouveau à chaque chargement du fichier versionné, et
     * serait sinon dupliquée à chaque déploiement.
     * Pour une entrée présente des deux côtés, la copie de secours l'emporte (c'est le dernier état
     * écrit par le bot), sauf si seul le fichier versionné porte une décision de technicien : elle
     * a alors été prise à la main dans le dépôt et doit être gardée.
     * @returns la banque fusionnée, et changed = true si le fichier versionné ne la reflétait pas
     */
    static mergeBanks(versioned, saved) {
        const hashes = [...versioned];
        let changed = false;
        for (const entry of saved) {
            const index = hashes.findIndex(known => known.id == entry.id
                || (known.phash == entry.phash && known.dhash == entry.dhash));
            const known = index >= 0 ? hashes[index] : undefined;
            if (known == null) {
                hashes.push(entry);
                changed = true;
                continue;
            }
            if (known.reviewedBy != null && entry.reviewedBy == null) {
                continue;
            }
            if (JSON.stringify(known) != JSON.stringify(entry)) {
                hashes[index] = entry;
                changed = true;
            }
        }
        return { hashes, changed };
    }
    writeGlobalBank() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield ImageHashDetection.lock.lock();
                yield simplediscordbot_1.FileManager.writeJsonFile(GLOBAL_BANK_FOLDER, GLOBAL_BANK_FILE, this.globalBank);
                yield simplediscordbot_1.CacheManager.writeCache(GLOBAL_BANK_BACKUP, this.globalBank);
            }
            catch (error) {
                console.log(error);
            }
            finally {
                ImageHashDetection.lock.unlock();
            }
        });
    }
    writeBank(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope == "global") {
                yield this.writeGlobalBank();
            }
            else {
                yield this.writeCache();
            }
        });
    }
    /** Nombre d'empreintes de chaque banque, pour les rapports */
    bankSizes() {
        return { global: this.globalBank.hashes.length, server: this.serverBank.hashes.length };
    }
    /**
     * Nombre d'auteurs distincts dont l'image a déclenché l'OCR depuis le démarrage : c'est ce qui
     * confirme une entrée serveur.
     */
    static distinctAuthors(entry) {
        var _a, _b;
        return (_b = (_a = ImageHashDetection.detections.get(entry.id)) === null || _a === void 0 ? void 0 : _a.authors.size) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Calcule les empreintes de l'image et les compare aux banques.
     * @returns null si le calcul échoue ; sinon l'empreinte, et la correspondance si l'image est connue
     */
    analyze(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield (0, ImageHash_1.computeHash)(image);
            if (hash == null) {
                return null;
            }
            return { hash, match: this.findSimilar(hash) };
        });
    }
    /**
     * Entrée la plus proche dont les DEUX distances restent sous leur seuil. La banque globale passe
     * d'abord : une image connue de tous n'a pas à être redécouverte localement.
     * @param includeRejected false pour ignorer les entrées rejetées (liste blanche)
     */
    findSimilar(hash, includeRejected = true) {
        var _a;
        const numeric = (0, ImageHash_1.toNumericHash)(hash);
        if (numeric == null) {
            return null;
        }
        const keep = (match) => includeRejected || match.entry.status != "rejected";
        return (_a = ImageHashDetection.closest(this.candidatesIn(numeric, this.globalIndex, "global").filter(keep))) !== null && _a !== void 0 ? _a : ImageHashDetection.closest(this.candidatesIn(numeric, this.serverIndex, "server").filter(keep));
    }
    /** Le plus proche des candidats, sur les deux distances cumulées */
    static closest(candidates) {
        let best = null;
        for (const candidate of candidates) {
            if (best == null || candidate.phashDistance + candidate.dhashDistance < best.phashDistance + best.dhashDistance) {
                best = candidate;
            }
        }
        return best;
    }
    /** Tous les candidats d'une banque : BK-tree sur le pHash, puis filtre sur le dHash */
    candidatesIn(hash, index, scope) {
        const matches = [];
        for (const candidate of index.tree.search(hash.phash, this.phashThreshold)) {
            const dhashDistance = (0, Distance_1.hammingDistance)(hash.dhash, candidate.value.hash.dhash);
            if (dhashDistance > this.dhashThreshold) {
                continue;
            }
            matches.push({
                entry: candidate.value.entry,
                scope,
                phashDistance: candidate.distance,
                dhashDistance,
                near: candidate.distance > PHASH_SURE || dhashDistance > DHASH_SURE
            });
        }
        return matches;
    }
    /** Retrouve une entrée par son identifiant, dans l'une ou l'autre banque */
    findById(id) {
        const global = this.globalBank.hashes.find(entry => entry.id == id);
        if (global != null) {
            return { entry: global, scope: "global" };
        }
        const server = this.serverBank.hashes.find(entry => entry.id == id);
        return server != null ? { entry: server, scope: "server" } : null;
    }
    /**
     * Ajoute une image à la banque de la portée demandée, EN QUARANTAINE, sauf si une image déjà
     * enregistrée lui ressemble (l'appelant enregistre alors une détection avec recordHit). Une
     * entrée rejetée ne bloque l'ajout que si elle ressemble NETTEMENT à l'image : une variante
     * seulement proche d'une image légitime doit pouvoir être apprise.
     * @param context message d'origine, null quand l'appelant ne le connaît pas
     * @returns l'entrée créée, ou null si une entrée ressemblante existait déjà
     */
    add(hash, reason, scope, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const numeric = (0, ImageHash_1.toNumericHash)(hash);
            const candidates = numeric == null ? [] : [
                ...this.candidatesIn(numeric, this.globalIndex, "global"),
                ...this.candidatesIn(numeric, this.serverIndex, "server")
            ];
            if (candidates.some(candidate => candidate.entry.status != "rejected" || !candidate.near)) {
                return null;
            }
            const entry = {
                id: (0, crypto_1.randomUUID)(),
                phash: hash.phash,
                dhash: hash.dhash,
                reason,
                added_at: Date.now(),
                status: "quarantine",
                reviewedBy: null
            };
            const bank = scope == "global" ? this.globalBank : this.serverBank;
            const index = scope == "global" ? this.globalIndex : this.serverIndex;
            bank.hashes.push(entry);
            if (numeric != null) {
                index.tree.insert(numeric.phash, { entry, hash: numeric });
            }
            if (context != null) {
                ImageHashDetection.countDetection(entry, context);
            }
            yield this.writeBank(scope);
            return entry;
        });
    }
    /**
     * Ajout décidé par un technicien (proposition d'image voisine de ScamHashHistory) : l'entrée
     * entre directement CONFIRMÉE, sans passer par la quarantaine.
     * @returns l'entrée créée, ou null si une entrée ressemblante existait déjà
     */
    addReviewed(hash, reason, scope, reviewer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const entry = yield this.add(hash, reason, scope, null);
            if (entry == null) {
                return null;
            }
            return (_b = (_a = (yield this.setStatus(entry.id, "confirmed", reviewer))) === null || _a === void 0 ? void 0 : _a.entry) !== null && _b !== void 0 ? _b : entry;
        });
    }
    /**
     * PROMOTION d'une entrée serveur vers la banque globale, quand une règle globale reconnaît une
     * image que le bot avait apprise avec ses propres mots-clés. L'entrée est déplacée telle quelle,
     * sauf une confirmation AUTOMATIQUE, qui n'existe qu'en banque serveur : l'entrée repasse en
     * quarantaine en attendant un technicien.
     */
    promote(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.serverBank.hashes.includes(entry)) {
                return;
            }
            if (entry.status == "confirmed" && entry.reviewedBy == null) {
                entry.status = "quarantine";
            }
            this.serverBank.hashes = this.serverBank.hashes.filter(other => other !== entry);
            // Le BK-tree ne sait pas retirer une clé : on reconstruit l'index de la banque serveur
            this.serverIndex = ImageHashDetection.buildIndex(this.serverBank.hashes);
            yield this.writeCache();
            this.globalBank.hashes.push(entry);
            const numeric = (0, ImageHash_1.toNumericHash)(entry);
            if (numeric != null) {
                this.globalIndex.tree.insert(numeric.phash, { entry, hash: numeric });
            }
            yield this.writeGlobalBank();
        });
    }
    /**
     * Nouvelle détection OCR d'une image déjà en banque, comptée si son message ne l'a pas encore
     * été. En banque serveur, l'entrée en quarantaine passe confirmée dès CONFIRMATION_AUTHORS
     * auteurs distincts (comptés en mémoire). En banque globale, seul un technicien confirme : la
     * détection ne sert qu'à l'historique. Une entrée rejetée ne bouge pas : elle sert de liste
     * blanche. Rien n'est écrit dans la banque, sauf une confirmation.
     */
    recordHit(entry, scope, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (entry.status == "rejected" || context == null || !ImageHashDetection.countDetection(entry, context)) {
                return "unchanged";
            }
            const confirmedNow = scope == "server" && entry.status == "quarantine"
                && ImageHashDetection.distinctAuthors(entry) >= ImageHashDetection.CONFIRMATION_AUTHORS;
            if (!confirmedNow) {
                return "recorded";
            }
            entry.status = "confirmed";
            yield this.writeBank(scope);
            return "confirmed";
        });
    }
    /**
     * Décision d'un technicien (boutons de ScamHashHistory) : « confirmed » valide l'entrée,
     * « rejected » la passe en liste blanche.
     * @returns l'entrée modifiée et sa banque, null si l'identifiant est inconnu
     */
    setStatus(id, status, reviewer) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = this.findById(id);
            if (found == null) {
                return null;
            }
            found.entry.status = status;
            found.entry.reviewedBy = reviewer;
            yield this.writeBank(found.scope);
            return found;
        });
    }
}
exports.ImageHashDetection = ImageHashDetection;
ImageHashDetection.NAME = "AutoBanScam ImageHash";
/**
 * Auteurs distincts dont l'image doit avoir déclenché l'OCR pour confirmer une entrée de la
 * banque SERVEUR. En banque globale, seul un technicien confirme.
 */
ImageHashDetection.CONFIRMATION_AUTHORS = 3;
// Le mutex d'écriture de ModuleWithCache est privé : on en tient un pour la banque globale
ImageHashDetection.lock = new simplediscordbot_1.SimpleMutex();
/**
 * Détections de chaque entrée (par identifiant), en mémoire seulement : les messages déjà
 * comptés, pour qu'un même message (plusieurs copies de l'image, message réanalysé) ne compte
 * qu'une fois, et les auteurs distincts, qui confirment une entrée serveur. Statique pour que
 * les rapports (distinctAuthors) y accèdent sans instance.
 */
ImageHashDetection.detections = new Map();
