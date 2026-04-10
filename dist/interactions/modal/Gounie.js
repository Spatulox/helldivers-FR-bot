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
const HDFR_1 = require("../../utils/HDFR");
const HDFRUserList_1 = require("../../utils/HDFRUserList");
class GounieModal {
    static gounie(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield simplediscordbot_1.Bot.interaction.defer(interaction);
                const title = interaction.fields.getTextInputValue(`${GounieModal.TITLE}_title`);
                const description = interaction.fields.getTextInputValue(`${GounieModal.TITLE}_desc`);
                const embed = simplediscordbot_1.EmbedManager.simple(description);
                embed.setTitle(title);
                const gounie = yield simplediscordbot_1.GuildManager.user.findInGuild(HDFR_1.HDFRChannelID.guildID, simplediscordbot_1.BotEnv.dev ? HDFRUserList_1.HDFRUserList.SPATULOX : HDFRUserList_1.HDFRUserList.GOUNIE);
                if (!gounie) {
                    simplediscordbot_1.Bot.log.info("Impossible to select Gounie :/");
                    return;
                }
                gounie.send(simplediscordbot_1.EmbedManager.toMessage(embed));
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.success("Merci :D"), true);
            }
            catch (error) {
                simplediscordbot_1.Bot.log.error(`${error}`);
            }
        });
    }
}
exports.GounieModal = GounieModal;
GounieModal.TITLE = "gounie";
