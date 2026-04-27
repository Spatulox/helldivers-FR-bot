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
exports.getMessageSignature = getMessageSignature;
exports.deleteOccurrences = deleteOccurrences;
exports.delete_occurence_interaction = delete_occurence_interaction;
exports.formatDeleteOccurenceMessage = formatDeleteOccurenceMessage;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MessageManager_1 = require("../../utils/Manager/MessageManager");
function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}
/**
 * Check if the message have one of the thing needed to delete occurrences
 * @param msg
 */
function getMessageSignature(msg) {
    return {
        authorId: msg.author.id,
        content: msg.content || "",
        embeds: msg.embeds.length,
        attachments: msg.attachments.size,
        hasPoll: !!msg.poll,
        hasReference: !!msg.reference
    };
}
/**
 * Vérifie les conditions préalables avant la suppression
 */
function checkInteractionConditions(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const guild = interaction.guild;
        if (!guild)
            throw new Error("Cette commande ne peut pas être utilisée en DM.");
        const channel = interaction.channel;
        if (!channel)
            throw new Error("Cette commande ne peut pas être utilisée dans ce canal.");
        const me = guild.members.me;
        if (!me)
            throw new Error("Le bot n'est pas dans le serveur.");
        const signature = getMessageSignature(interaction.targetMessage);
        return {
            guild,
            me,
            signature,
        };
    });
}
/**
 * Recherche et supprime les messages correspondants
 */
function deleteOccurrences(guild, me, signature) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const debugMsg = { channelName: [], channelMessage: [] };
        for (const channel of guild.channels.cache.values()) {
            if (channel.type !== discord_js_1.ChannelType.GuildText)
                continue;
            const textChannel = channel;
            if (me != null && !((_a = textChannel.permissionsFor(me)) === null || _a === void 0 ? void 0 : _a.has([discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.ReadMessageHistory])))
                continue;
            const messages = yield textChannel.messages.fetch({ limit: 100 });
            if (messages.size === 0)
                continue;
            const matching = messages.filter(m => m.author.id === signature.authorId &&
                deepEqual(getMessageSignature(m), signature));
            for (const msg of matching.values()) {
                yield msg.delete().catch(() => null);
                debugMsg.channelName.push(textChannel.name);
                debugMsg.channelMessage.push(msg.content);
            }
        }
        return [true, debugMsg];
    });
}
/**
 * Commande principale : suppression des occurrences
 */
function delete_occurence_interaction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
            const { guild, me, signature } = yield checkInteractionConditions(interaction);
            const [_b, debugMsg] = yield deleteOccurrences(guild, me, signature);
            if (debugMsg.channelName.length > 0) {
                const embed = formatDeleteOccurenceMessage(debugMsg);
                yield MessageManager_1.MessageManager.sendToAdminChannel(embed);
                yield simplediscordbot_1.Bot.log.info(embed);
                yield simplediscordbot_1.Bot.interaction.send(interaction, embed, true);
            }
            else {
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Aucun message trouvé avec le contenu exact."), true);
            }
        }
        catch (error) {
            console.error(error);
            simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error(`${error}`), true);
            MessageManager_1.MessageManager.sendToAdminChannel(simplediscordbot_1.EmbedManager.error(`Erreur lors de la suppression des occurrences : ${error}`));
        }
    });
}
function formatDeleteOccurenceMessage(message) {
    const embed = simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error);
    embed.setTitle("Messages supprimés dans les canaux :");
    if (message.channelName.length > 0) {
        simplediscordbot_1.EmbedManager.fields(embed, message.channelName.map((name, i) => {
            var _a;
            return ({
                name: `**${name}**`,
                value: (_a = message.channelMessage[i]) !== null && _a !== void 0 ? _a : "Contenu non disponible",
                inline: false
            });
        }));
        return embed;
    }
    embed.setDescription("Pas de messages supprimés");
    return embed;
}
