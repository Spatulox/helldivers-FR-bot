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
exports.AutoBanScamInterface = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
/**
 * Panneau d'avertissement « PROTECTION ANTI-SCAM » posté dans le premier salon « ne rien écrire ici ».
 * Le message est retrouvé (ou recréé) au démarrage et rafraîchi après chaque sanction pour mettre à jour
 * le compteur « Rongeurs attrapés ». Le contenu du message (images) est fourni par la sous-classe du serveur.
 */
class AutoBanScamInterface extends discord_module_1.ModuleWithCachedMessage {
    get events() {
        return {};
    }
    constructor(config) {
        super();
        this.config = config;
        this.name = AutoBanScamInterface.NAME;
        this.description = "Anti-scam warning panel in #ne_rien_ecrire_ici, with the caught scammers counter";
    }
    /** Rafraîchit le panneau du serveur courant (appelé par AutoBanScamBase après chaque sanction) */
    static refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const module = discord_module_1.ModuleRegistry.getModule(AutoBanScamInterface.NAME);
            if (!(module instanceof AutoBanScamInterface)) {
                simplediscordbot_1.Bot.log.info("Impossible to find the AutoBanScam Interface module to refresh the panel");
                return;
            }
            yield module.triggerUpdateMessage();
        });
    }
    get mainNeRienEcrireIciChannel() {
        var _a, _b;
        // initData() est aussi appelé par le constructeur de ModuleWithCache, avant l'affectation de `config`
        return (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.neRienEcrireIciChannels[0]) !== null && _b !== void 0 ? _b : "";
    }
    getChannel() {
        return simplediscordbot_1.GuildManager.channel.text.find(this.mainNeRienEcrireIciChannel);
    }
    initData() {
        return {
            channel_id: this.mainNeRienEcrireIciChannel,
            message_id: ""
        };
    }
    initMessageSendEachXTime(time) {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield this.getChannel();
                if (!channel)
                    return;
                const msg = yield simplediscordbot_1.Bot.message.send(channel, "Test anti-scam");
                if (msg) {
                    msg.deletable && (yield msg.delete());
                }
            }
            catch (e) {
                console.log(e);
            }
        }), time);
    }
}
exports.AutoBanScamInterface = AutoBanScamInterface;
AutoBanScamInterface.NAME = "AutoBanScam Interface";
