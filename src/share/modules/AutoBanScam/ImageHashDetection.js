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
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const ImageHash_1 = require("../../utils/ImageHash");
// Distances de Hamming maximales pour considérer deux images comme identiques (sur 64 bits)
const PHASH_THRESHOLD = 10;
const DHASH_THRESHOLD = 12;
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
        void this.loadCache();
        void this.loadGlobalBank();
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
    /** Nombre d'empreintes de chaque banque, pour les rapports */
    bankSizes() {
        return { global: this.globalBank.hashes.length, server: this.serverBank.hashes.length };
    }
    /**
     * Calcule les empreintes de l'image et les compare aux banques.
     * @returns null si l'image est illisible ; sinon l'empreinte, et la correspondance si l'image est connue
     */
    analyze(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield (0, ImageHash_1.computeHash)(buffer);
            if (hash == null) {
                return null;
            }
            return { hash, match: this.findSimilar(hash) };
        });
    }
    /**
     * Première entrée dont les DEUX distances restent sous leur seuil. La banque globale passe
     * d'abord : une image connue de tous n'a pas à être redécouverte localement.
     */
    findSimilar(hash) {
        var _a;
        return (_a = this.findIn(hash, this.globalBank, "global")) !== null && _a !== void 0 ? _a : this.findIn(hash, this.serverBank, "server");
    }
    findIn(hash, bank, scope) {
        for (const entry of bank.hashes) {
            if (!(0, ImageHash_1.areSimilar)(hash, entry, this.phashThreshold, this.dhashThreshold)) {
                continue;
            }
            return {
                entry,
                scope,
                phashDistance: (0, ImageHash_1.hammingDistance)(hash.phash, entry.phash),
                dhashDistance: (0, ImageHash_1.hammingDistance)(hash.dhash, entry.dhash)
            };
        }
        return null;
    }
    /**
     * Ajoute une image à la banque de la portée demandée, sauf si une image déjà enregistrée lui
     * ressemble. Seul cas qui écrit malgré une correspondance : la PROMOTION d'une entrée serveur
     * vers la banque globale, quand une règle globale reconnaît une image que le bot avait apprise
     * avec ses propres mots-clés. L'entrée serveur est alors retirée.
     */
    add(hash, reason, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = this.findSimilar(hash);
            const promotion = existing != null && scope == "global" && existing.scope == "server";
            if (existing != null && !promotion) {
                return false;
            }
            if (promotion && existing != null) {
                this.serverBank.hashes = this.serverBank.hashes.filter(entry => entry !== existing.entry);
                yield this.writeCache();
            }
            const entry = {
                phash: hash.phash,
                dhash: hash.dhash,
                reason,
                added_at: Date.now()
            };
            if (scope == "global") {
                this.globalBank.hashes.push(entry);
                yield this.writeGlobalBank();
            }
            else {
                this.serverBank.hashes.push(entry);
                yield this.writeCache();
            }
            return true;
        });
    }
}
exports.ImageHashDetection = ImageHashDetection;
ImageHashDetection.NAME = "AutoBanScam ImageHash";
// Le mutex d'écriture de ModuleWithCache est privé : on en tient un pour la banque globale
ImageHashDetection.lock = new simplediscordbot_1.SimpleMutex();
