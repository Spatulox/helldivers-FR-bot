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
const MessageManager_1 = require("../../managers/MessageManager");
const BotType_1 = require("../../BotType");
// Longueur max d'un nom de fil Discord : un titre de post est le début du message tronqué
const THREAD_NAME_MAX_LENGTH = 100;
// Limites Discord d'un embed. Les dépasser fait rejeter l'embed entier — et Bot.log / sendToAdminChannel
// avalent l'erreur : le rapport disparaît sans bruit. Depuis que les fils sont parcourus (après les
// salons), le nombre d'occurrences dépasse facilement ces limites.
const EMBED_MAX_FIELDS = 25;
const EMBED_MAX_CHARS = 5500; // 6000 en réalité, marge pour le titre et le pied de page
const FIELD_NAME_MAX_LENGTH = 256;
const FIELD_VALUE_MAX_LENGTH = 1024;
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
        var _a, _c;
        const debugMsg = { channelName: [], channelMessage: [] };
        // Salons textuels (texte, annonces, chat des vocaux…) + fils actifs (fils de salon et posts de forum).
        // Les fils archivés sont ignorés : un message récent désarchive son fil.
        const channels = guild.channels.cache
            .filter((c) => c.isTextBased() && !c.isThread())
            .map(c => c);
        try {
            const activeThreads = yield guild.channels.fetchActiveThreads();
            channels.push(...activeThreads.threads.values());
        }
        catch (error) {
            reportDeleteOccurrenceError(`Impossible de récupérer les fils actifs : ${error}`);
        }
        const forumTitle = signature.content.trim().slice(0, THREAD_NAME_MAX_LENGTH);
        for (const channel of channels) {
            if (me != null && !((_a = channel.permissionsFor(me)) === null || _a === void 0 ? void 0 : _a.has([discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.ReadMessageHistory])))
                continue;
            try {
                // Post de forum créé par l'auteur avec le contenu du message comme titre : on supprime tout le post
                if (channel.isThread() && ((_c = channel.parent) === null || _c === void 0 ? void 0 : _c.type) === discord_js_1.ChannelType.GuildForum
                    && forumTitle !== "" && channel.ownerId === signature.authorId && channel.name.trim() === forumTitle) {
                    yield channel.delete("Suppression des occurrences d'un message");
                    debugMsg.channelName.push(`${channel.parent.name} › ${channel.name}`);
                    debugMsg.channelMessage.push("Post de forum supprimé (titre identique au message)");
                    continue;
                }
                const messages = yield channel.messages.fetch({ limit: 100 });
                const matching = messages.filter(m => m.author.id === signature.authorId &&
                    deepEqual(getMessageSignature(m), signature));
                for (const msg of matching.values()) {
                    let alreadyDeleted = false;
                    try {
                        yield msg.delete();
                    }
                    catch (error) {
                        // Un autre passage (anti-scam déclenché par un autre exemplaire du message, ou commande
                        // lancée en parallèle) l'a déjà supprimé : il doit quand même figurer au rapport.
                        alreadyDeleted = error instanceof discord_js_1.DiscordAPIError && error.code === discord_js_1.RESTJSONErrorCodes.UnknownMessage;
                        if (!alreadyDeleted) {
                            reportDeleteOccurrenceError(`Impossible de supprimer le message ${msg.url} : ${error}`);
                            continue;
                        }
                    }
                    debugMsg.channelName.push(channel.isThread() && channel.parent ? `${channel.parent.name} › ${channel.name}` : channel.name);
                    debugMsg.channelMessage.push(alreadyDeleted ? `*(déjà supprimé)* ${msg.content}` : msg.content);
                }
            }
            catch (error) {
                // Un salon inaccessible ne doit pas interrompre le nettoyage des autres
                reportDeleteOccurrenceError(`Erreur dans ${channel.url} : ${error}`);
            }
        }
        return [true, debugMsg];
    });
}
/**
 * Remonte une erreur de suppression d'occurrences dans #retour_bot (canal de Bot.log.info)
 * et dans le canal de Bot.log.error — les deux loggent aussi en console
 */
function reportDeleteOccurrenceError(description) {
    const embed = simplediscordbot_1.EmbedManager.error(`Suppression des occurrences : ${description}`);
    simplediscordbot_1.Bot.log.info(embed);
    simplediscordbot_1.Bot.log.error(embed);
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
                const embeds = formatDeleteOccurenceMessage(debugMsg);
                for (const embed of embeds) {
                    yield MessageManager_1.MessageManager.sendToAdminChannel(embed, BotType_1.BotType.HDFR);
                    yield simplediscordbot_1.Bot.log.info(embed);
                }
                // Un embed par message : la limite de 6000 caractères vaut pour tous les embeds d'un message.
                const [first, ...rest] = embeds;
                yield interaction.editReply({ embeds: first ? [first] : [] });
                for (const embed of rest) {
                    yield interaction.followUp({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
                }
            }
            else {
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Aucun message trouvé avec le contenu exact."), true);
            }
        }
        catch (error) {
            console.error(error);
            simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error(`${error}`), true);
            MessageManager_1.MessageManager.sendToAdminChannel(simplediscordbot_1.EmbedManager.error(`Erreur lors de la suppression des occurrences : ${error}`), BotType_1.BotType.HDFR);
        }
    });
}
/**
 * Construit le rapport, découpé en autant d'embeds que nécessaire pour tenir dans les limites Discord.
 */
function formatDeleteOccurenceMessage(message) {
    const createEmbed = (part) => simplediscordbot_1.EmbedManager.create(simplediscordbot_1.SimpleColor.error)
        .setTitle(part === 1 ? "Messages supprimés dans les canaux :" : `Messages supprimés dans les canaux (suite ${part}) :`);
    if (message.channelName.length === 0) {
        return [createEmbed(1).setDescription("Pas de messages supprimés")];
    }
    const embeds = [];
    let current = createEmbed(1);
    let fieldCount = 0;
    let charCount = 0;
    message.channelName.forEach((channelName, i) => {
        const name = truncate(`**${channelName}**`, FIELD_NAME_MAX_LENGTH);
        // Un message sans texte (pièce jointe, embed seul) donnerait une valeur vide, refusée par Discord.
        const value = truncate(message.channelMessage[i] || "*(message sans texte)*", FIELD_VALUE_MAX_LENGTH);
        if (fieldCount >= EMBED_MAX_FIELDS || charCount + name.length + value.length > EMBED_MAX_CHARS) {
            embeds.push(current);
            current = createEmbed(embeds.length + 1);
            fieldCount = 0;
            charCount = 0;
        }
        simplediscordbot_1.EmbedManager.field(current, { name, value, inline: false });
        fieldCount++;
        charCount += name.length + value.length;
    });
    embeds.push(current);
    return embeds;
}
function truncate(text, max) {
    return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
