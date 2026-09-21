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
const SEUIL_PHASH = 10;
const SEUIL_DHASH = 12;
// Banque commune aux trois bots : chemin relatif au cwd, comme le wiki et les handlers
const BANQUE_DOSSIER = "./src/share/.utilscache";
const BANQUE_FICHIER = "scam_image_hashes";
class ImageHashDetection extends discord_module_1.ModuleWithCache {
    get events() {
        return {};
    }
    initData() {
        return { empreintes: [] };
    }
    constructor() {
        super();
        this.name = ImageHashDetection.NAME;
        this.description = "Perceptual hash (pHash + dHash) of images, compared against the scam hash bank shared by every bot";
        this.cacheKey = BANQUE_FICHIER;
        void this.loadCache();
    }
    get seuilPhash() {
        return SEUIL_PHASH;
    }
    get seuilDhash() {
        return SEUIL_DHASH;
    }
    /**
     * Le cache de base passe par CacheManager, donc par CACHE_FOLDER, donc par une banque et un
     * fichier PAR BOT. On vise ici un fichier unique dans src/share/ pour ne pas dupliquer les
     * empreintes : une image vue sur un serveur est connue sur l'autre.
     */
    loadCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const parDefaut = this.initData();
            const stocke = yield simplediscordbot_1.FileManager.readJsonFile(`${BANQUE_DOSSIER}/${BANQUE_FICHIER}.json`);
            this.cacheData = stocke ? Object.assign(Object.assign({}, parDefaut), stocke) : parDefaut;
        });
    }
    writeCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield ImageHashDetection.verrou.lock();
                yield simplediscordbot_1.FileManager.writeJsonFile(BANQUE_DOSSIER, BANQUE_FICHIER, this.cacheData);
            }
            catch (error) {
                console.log(error);
            }
            finally {
                ImageHashDetection.verrou.unlock();
            }
        });
    }
    /**
     * Calcule les empreintes de l'image et les compare à la banque.
     * @returns null si l'image est illisible ; sinon l'empreinte, et la correspondance si l'image est connue
     */
    analyser(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const empreinte = yield (0, ImageHash_1.calculerEmpreinte)(buffer);
            if (empreinte == null) {
                return null;
            }
            const correspondance = this.chercherSimilaire(empreinte);
            if (correspondance != null) {
                yield this.incrementerVues(correspondance.entree);
            }
            return { empreinte, correspondance };
        });
    }
    /** Première entrée de la banque dont les DEUX distances restent sous leur seuil */
    chercherSimilaire(empreinte) {
        for (const entree of this.cache.empreintes) {
            if (!(0, ImageHash_1.sontSimilaires)(empreinte, entree, this.seuilPhash, this.seuilDhash)) {
                continue;
            }
            return {
                entree,
                distancePhash: (0, ImageHash_1.distanceHamming)(empreinte.phash, entree.phash),
                distanceDhash: (0, ImageHash_1.distanceHamming)(empreinte.dhash, entree.dhash)
            };
        }
        return null;
    }
    /** Ajoute une image à la banque, sauf si une image déjà enregistrée lui ressemble */
    ajouter(empreinte, raison) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chercherSimilaire(empreinte) != null) {
                return false;
            }
            this.cache.empreintes.push({
                phash: empreinte.phash,
                dhash: empreinte.dhash,
                raison,
                ajoutee_le: Date.now(),
                vues: 0
            });
            yield this.writeCache();
            return true;
        });
    }
    /** Public : le module de debug compare sans passer par analyser(), il compte les vues lui-même */
    incrementerVues(entree) {
        return __awaiter(this, void 0, void 0, function* () {
            entree.vues++;
            yield this.writeCache();
        });
    }
}
exports.ImageHashDetection = ImageHashDetection;
ImageHashDetection.NAME = "AutoBanScam ImageHash";
// Le mutex d'écriture de ModuleWithCache est privé : on en tient un pour nos propres écritures
ImageHashDetection.verrou = new simplediscordbot_1.SimpleMutex();
