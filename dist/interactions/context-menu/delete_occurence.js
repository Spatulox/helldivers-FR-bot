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
exports.delete_occurence = delete_occurence;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../../utils/messages/embeds");
function delete_occurence(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            const guild = interaction.guild;
            if (!guild) {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Cette commande ne peut pas être utilisée en DM."), true);
                return;
            }
            const channel = interaction.channel;
            if (!channel) {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Cette commande ne peut pas être utilisée dans ce canal."), true);
                return;
            }
            const exactContent = interaction.targetMessage.content;
            if (!exactContent) {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Le message cible n'a pas de contenu."), true);
                return;
            }
            const userID = interaction.targetMessage.author.id;
            const me = guild.members.me;
            if (!me) {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Le bot n'est pas dans le serveur."), true);
                return;
            }
            const debugMsg = { channelName: [], channelMessage: [] };
            for (const channel of guild.channels.cache.values()) {
                if (channel.type !== discord_js_1.ChannelType.GuildText)
                    continue;
                if (!((_a = channel.permissionsFor(me)) === null || _a === void 0 ? void 0 : _a.has([discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.ReadMessageHistory])))
                    continue;
                const messages = yield channel.messages.fetch({ limit: 100 });
                if (messages.size === 0)
                    continue;
                const msg = messages.find((m) => m.author.id === userID && m.content === exactContent);
                if (msg) {
                    debugMsg.channelName.push(channel.name);
                    debugMsg.channelMessage.push(msg.content);
                    yield msg.delete();
                }
            }
            if (debugMsg.channelName.length > 0 && debugMsg.channelMessage.length === debugMsg.channelName.length) {
                const embed = (0, embeds_1.createEmbed)();
                embed.title = "Messages supprimés dans les canaux : ";
                embed.fields = debugMsg.channelName.map((name, i) => {
                    var _a;
                    return ({
                        name: `**${name}**`,
                        value: (_a = debugMsg.channelMessage[i]) !== null && _a !== void 0 ? _a : "?wtf?",
                        inline: false
                    });
                });
                (0, embeds_1.sendEmbedToInfoChannel)(embed);
                (0, embeds_1.sendEmbedToAdminChannel)(embed);
                (0, embeds_1.sendInteractionEmbed)(interaction, embed, true);
            }
            else {
                (0, embeds_1.sendInteractionEmbed)(interaction, (0, embeds_1.createErrorEmbed)("Aucun message trouvé avec le contenu exact."), true);
            }
            return null;
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToAdminChannel)((0, embeds_1.createErrorEmbed)(`Une erreur est survenue lors de la suppression des occurrences du message : ${error}`));
        }
    });
}
