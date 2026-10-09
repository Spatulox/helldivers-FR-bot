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
exports.GounieModal = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const UserList_1 = require("../../../../share/utils/UserList");
const rateLimiter_1 = require("../../utils/rateLimiter");
class GounieModal {
    static isExempt(interaction) {
        return interaction.inCachedGuild() && (0, rateLimiter_1.isQuotaExempt)(interaction.member);
    }
    /** Message d'un membre qui a déjà envoyé son avis de l'heure */
    static limitedEmbed(userId) {
        const until = this.limiter.blockedUntil(userId);
        return simplediscordbot_1.EmbedManager.error("Vous avez déjà envoyé un avis récemment." +
            (until !== null ? ` Vous pourrez en envoyer un nouveau <t:${Math.ceil(until / 1000)}:R>.` : ""));
    }
    static gounie(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Formulaire resté ouvert pendant qu'un autre avis partait
                if (!GounieModal.isExempt(interaction) && !GounieModal.limiter.consume(interaction.user.id)) {
                    yield simplediscordbot_1.Bot.interaction.reply(interaction, GounieModal.limitedEmbed(interaction.user.id), true);
                    return;
                }
                yield simplediscordbot_1.Bot.interaction.defer(interaction);
                const title = interaction.fields.getTextInputValue(`${GounieModal.TITLE}_title`);
                const description = interaction.fields.getTextInputValue(`${GounieModal.TITLE}_desc`);
                const embed = simplediscordbot_1.EmbedManager.simple(description);
                // Le champ accepte 4000 caractères, un titre d'embed 256
                embed.setTitle(title.length > 256 ? `${title.slice(0, 255)}…` : title);
                const gounie = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFR.guildID, simplediscordbot_1.BotEnv.dev ? UserList_1.UserList.shared.SPATULOX : UserList_1.UserList.shared.GOUNIE);
                if (!gounie) {
                    simplediscordbot_1.Bot.log.info("Impossible to select Gounie :/");
                    // La réponse est différée : sans ce message, l'utilisateur resterait sur « réfléchit… »
                    yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Impossible de transmettre votre avis pour le moment"), true);
                    return;
                }
                yield gounie.send(simplediscordbot_1.EmbedManager.toMessage(embed));
                yield simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.success("Merci :D"), true);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`${error}`);
                yield ((_a = simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Impossible de transmettre votre avis pour le moment"), true)) === null || _a === void 0 ? void 0 : _a.catch(() => { }));
            }
        });
    }
}
exports.GounieModal = GounieModal;
GounieModal.TITLE = "gounie";
/** Chaque avis part en MP à Gounie : un par heure et par membre au plus, décompté à l'envoi */
GounieModal.limiter = new rateLimiter_1.SlidingWindowLimiter(1, simplediscordbot_1.Time.hour.HOUR_01.toMilliseconds());
