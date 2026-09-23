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
// Distances de Hamming maximales pour considérer deux images comme identiques (sur 64 bits)
const PHASH_THRESHOLD = 10;
const DHASH_THRESHOLD = 12;
// Sous ces distances, la correspondance est nette ; entre elles et les seuils, l'OCR est relancé
const PHASH_SURE = 6;
const DHASH_SURE = 8;
// Plafond des sources gardées par entrée : la traçabilité n'a pas besoin de mille copies d'un spam
const MAX_SOURCES = 25;
// Banque globale : versionnée, hors CACHE_FOLDER, chemin relatif au cwd comme le wiki et les handlers
const GLOBAL_BANK_FOLDER = "./src/share/scamRules";
const GLOBAL_BANK_FILE = "global_hashes";
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
     * part en quarantaine, comme toute empreinte que personne n'a validée.
     * @returns true si au moins une entrée a été complétée, donc si la banque est à réécrire
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
            if (!Array.isArray(entry.sources)) {
                entry.sources = [];
                changed = true;
            }
            if (entry.reviewedBy === undefined) {
                entry.reviewedBy = null;
                changed = true;
            }
            if (entry.historyMessageId === undefined) {
                entry.historyMessageId = null;
                changed = true;
            }
        }
        return changed;
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
            this.globalBank = stored && Array.isArray(stored.hashes) ? { hashes: stored.hashes } : { hashes: [] };
            if (ImageHashDetection.migrate(this.globalBank.hashes)) {
                yield this.writeGlobalBank();
            }
            this.globalIndex = ImageHashDetection.buildIndex(this.globalBank.hashes);
        });
    }
    writeGlobalBank() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield ImageHashDetection.lock.lock();
                yield simplediscordbot_1.FileManager.writeJsonFile(GLOBAL_BANK_FOLDER, GLOBAL_BANK_FILE, this.globalBank);
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
    /** Nombre d'auteurs distincts parmi les sources d'une entrée : c'est ce qui la confirme */
    static distinctAuthors(entry) {
        return new Set(entry.sources.map(source => source.authorId)).size;
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
     */
    findSimilar(hash) {
        var _a;
        const numeric = (0, ImageHash_1.toNumericHash)(hash);
        if (numeric == null) {
            return null;
        }
        return (_a = this.findIn(numeric, this.globalIndex, "global")) !== null && _a !== void 0 ? _a : this.findIn(numeric, this.serverIndex, "server");
    }
    /** Candidats du BK-tree (pHash), filtrés sur le dHash, puis le plus proche des deux distances cumulées */
    findIn(hash, index, scope) {
        let best = null;
        for (const candidate of index.tree.search(hash.phash, this.phashThreshold)) {
            const dhashDistance = (0, ImageHash_1.hammingDistance)(hash.dhash, candidate.value.hash.dhash);
            if (dhashDistance > this.dhashThreshold) {
                continue;
            }
            if (best == null || candidate.distance + dhashDistance < best.phashDistance + best.dhashDistance) {
                best = {
                    entry: candidate.value.entry,
                    scope,
                    phashDistance: candidate.distance,
                    dhashDistance,
                    near: candidate.distance > PHASH_SURE || dhashDistance > DHASH_SURE
                };
            }
        }
        return best;
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
     * enregistrée lui ressemble (l'appelant enregistre alors une détection avec recordHit).
     * @param source message d'origine, null quand l'appelant ne le connaît pas
     * @returns l'entrée créée, ou null si une entrée ressemblante existait déjà
     */
    add(hash, reason, scope, source) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.findSimilar(hash) != null) {
                return null;
            }
            const entry = {
                id: (0, crypto_1.randomUUID)(),
                phash: hash.phash,
                dhash: hash.dhash,
                reason,
                added_at: Date.now(),
                status: "quarantine",
                sources: source != null ? [source] : [],
                reviewedBy: null,
                historyMessageId: null
            };
            const numeric = (0, ImageHash_1.toNumericHash)(entry);
            const bank = scope == "global" ? this.globalBank : this.serverBank;
            const index = scope == "global" ? this.globalIndex : this.serverIndex;
            bank.hashes.push(entry);
            if (numeric != null) {
                index.tree.insert(numeric.phash, { entry, hash: numeric });
            }
            yield this.writeBank(scope);
            return entry;
        });
    }
    /**
     * PROMOTION d'une entrée serveur vers la banque globale, quand une règle globale reconnaît une
     * image que le bot avait apprise avec ses propres mots-clés. L'entrée est déplacée telle quelle
     * (sources, message d'historique), sauf une confirmation AUTOMATIQUE, qui ne vaut qu'en banque
     * serveur : l'entrée repasse en quarantaine en attendant un technicien.
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
     * Nouvelle détection OCR d'une image déjà en banque. La source est gardée si son message est
     * nouveau ; en banque serveur, l'entrée en quarantaine passe confirmée dès CONFIRMATION_AUTHORS
     * auteurs distincts. En banque globale, le compteur monte mais seul un technicien confirme.
     * Une entrée rejetée ne bouge pas : elle sert de liste blanche.
     */
    recordHit(entry, scope, source) {
        return __awaiter(this, void 0, void 0, function* () {
            if (entry.status == "rejected" || source == null) {
                return "unchanged";
            }
            if (entry.sources.some(known => known.messageUrl == source.messageUrl)) {
                return "unchanged";
            }
            const newAuthor = !entry.sources.some(known => known.authorId == source.authorId);
            if (entry.sources.length >= MAX_SOURCES) {
                if (!newAuthor) {
                    return "unchanged";
                }
                // Plafond atteint : un nouvel auteur prend la place de la plus ancienne source d'un
                // auteur présent plusieurs fois, pour que le décompte des auteurs puisse encore monter
                const duplicate = entry.sources.findIndex(known => entry.sources.filter(other => other.authorId == known.authorId).length > 1);
                if (duplicate < 0) {
                    return "unchanged";
                }
                entry.sources.splice(duplicate, 1);
            }
            entry.sources.push(source);
            const confirmedNow = scope == "server" && entry.status == "quarantine"
                && ImageHashDetection.distinctAuthors(entry) >= ImageHashDetection.CONFIRMATION_AUTHORS;
            if (confirmedNow) {
                entry.status = "confirmed";
            }
            yield this.writeBank(scope);
            return confirmedNow ? "confirmed" : "recorded";
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
    /** Mémorise le message d'historique qui présente l'entrée, pour le réécrire ensuite */
    setHistoryMessage(entry, scope, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            entry.historyMessageId = messageId;
            yield this.writeBank(scope);
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
