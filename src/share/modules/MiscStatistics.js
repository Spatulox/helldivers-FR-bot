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
exports.MiscStatistics = void 0;
const discord_module_1 = require("@spatulox/discord-module");
/**
 * Compteurs divers du bot, persistés dans <CACHE_FOLDER>/.utilscache/<cacheKey>.json.
 *
 * Chaque serveur en dérive une sous-classe qui fournit son propre cache statique : les compteurs
 * d'un serveur ne doivent jamais être lus ni incrémentés depuis l'autre. Les méthodes statiques
 * passent donc toutes par `this` (la sous-classe sur laquelle on appelle) et jamais par le nom de
 * cette classe de base, sinon les deux serveurs écriraient dans le même cacheData.
 */
class MiscStatistics extends discord_module_1.ModuleWithStaticCache {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Misc Statistics";
        this.description = "Miscellaneous stats for the bot/discord";
        void this.constructor.ensureLoaded();
    }
    static ensureLoaded() {
        if (!this.loading) {
            this.loading = this.loadCache();
        }
        return this.loading;
    }
    static get cache() {
        return this.cacheData;
    }
    static incrementAutoBanScam() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureLoaded();
                this.cache.auto_kill_count = this.cache.auto_kill_count + 1;
                yield this.writeCache();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.MiscStatistics = MiscStatistics;
/**
 * Chargement du cache, lancé par le constructeur et mémorisé : tant qu'il n'est pas résolu,
 * cacheData vaut encore les valeurs par défaut (auto_kill_count: 0). Tout ce qui lit ou écrit
 * le compteur au démarrage doit attendre cette promesse, sinon un affichage montre 0 et, pire,
 * un incrément écraserait le compteur du fichier par 1.
 *
 * L'affectation se fait sur `this`, donc chaque sous-classe a sa propre promesse.
 */
MiscStatistics.loading = null;
