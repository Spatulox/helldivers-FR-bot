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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedColor = void 0;
exports.isEmbed = isEmbed;
exports.createEmbed = createEmbed;
exports.createSimpleEmbed = createSimpleEmbed;
exports.createErrorEmbed = createErrorEmbed;
exports.createSuccessEmbed = createSuccessEmbed;
exports.sendEmbed = sendEmbed;
exports.sendEmbedToInfoChannel = sendEmbedToInfoChannel;
exports.sendEmbedToAdminChannel = sendEmbedToAdminChannel;
exports.sendInteractionEmbed = sendInteractionEmbed;
exports.sendEmbedErrorMessage = sendEmbedErrorMessage;
exports.returnToSendEmbed = returnToSendEmbed;
exports.returnToSendEmbedForInteraction = returnToSendEmbedForInteraction;
exports.waitPrivateEmbedOrMessage = waitPrivateEmbedOrMessage;
exports.fillEmbed = fillEmbed;
exports.createEmbedFromFile = createEmbedFromFile;
exports.embedError = embedError;
const discord_js_1 = require("discord.js");
const log_1 = require("../log");
const builders_1 = require("@discordjs/builders");
const channels_1 = require("../guilds/channels");
const client_1 = require("../client");
const config_json_1 = __importDefault(require("../../config.json"));
// ------------------------------------------------------------- //
var EmbedColor;
(function (EmbedColor) {
    EmbedColor[EmbedColor["error"] = 8912917] = "error";
    EmbedColor[EmbedColor["success"] = 65280] = "success";
    EmbedColor[EmbedColor["black"] = 0] = "black";
    EmbedColor[EmbedColor["white"] = 16777215] = "white";
    EmbedColor[EmbedColor["red"] = 16711680] = "red";
    EmbedColor[EmbedColor["green"] = 65280] = "green";
    EmbedColor[EmbedColor["blue"] = 255] = "blue";
    EmbedColor[EmbedColor["yellow"] = 16776960] = "yellow";
    EmbedColor[EmbedColor["cyan"] = 65535] = "cyan";
    EmbedColor[EmbedColor["magenta"] = 16711935] = "magenta";
    EmbedColor[EmbedColor["gray"] = 8421504] = "gray";
    EmbedColor[EmbedColor["lightgray"] = 13882323] = "lightgray";
    EmbedColor[EmbedColor["darkgray"] = 11119017] = "darkgray";
    EmbedColor[EmbedColor["orange"] = 16753920] = "orange";
    EmbedColor[EmbedColor["purple"] = 8388736] = "purple";
    EmbedColor[EmbedColor["pink"] = 16761035] = "pink";
    EmbedColor[EmbedColor["brown"] = 10824234] = "brown";
    EmbedColor[EmbedColor["lime"] = 65280] = "lime";
    EmbedColor[EmbedColor["navy"] = 128] = "navy";
    EmbedColor[EmbedColor["teal"] = 32896] = "teal";
    EmbedColor[EmbedColor["olive"] = 8421376] = "olive";
    EmbedColor[EmbedColor["gold"] = 16766720] = "gold";
    EmbedColor[EmbedColor["silver"] = 12632256] = "silver";
    EmbedColor[EmbedColor["coral"] = 16744272] = "coral";
    EmbedColor[EmbedColor["salmon"] = 16416882] = "salmon";
    EmbedColor[EmbedColor["khaki"] = 15787660] = "khaki";
    EmbedColor[EmbedColor["plum"] = 14524637] = "plum";
    EmbedColor[EmbedColor["lavender"] = 15132410] = "lavender";
    EmbedColor[EmbedColor["beige"] = 16119260] = "beige";
    EmbedColor[EmbedColor["mint"] = 10026904] = "mint";
    EmbedColor[EmbedColor["peach"] = 16767673] = "peach";
    EmbedColor[EmbedColor["chocolate"] = 13789470] = "chocolate";
    EmbedColor[EmbedColor["crimson"] = 14423100] = "crimson";
    EmbedColor[EmbedColor["youtube"] = 16718362] = "youtube";
    EmbedColor[EmbedColor["botColor"] = 6064856] = "botColor";
    EmbedColor[EmbedColor["minecraft"] = 25600] = "minecraft"; // Vert Minecraft
})(EmbedColor || (exports.EmbedColor = EmbedColor = {}));
function isEmbed(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.title === 'string' &&
        typeof obj.color === 'number' &&
        'timestamp' in obj);
}
function createEmbed(color = null) {
    const embedColor = color ? color : EmbedColor.botColor;
    const embed = {
        title: "Titre",
        description: "",
        thumbnail: {
            url: ""
        },
        color: embedColor,
        fields: [],
        footer: {
            text: "Helldivers [FR] Bot",
            icon_url: "https://cdn.discordapp.com/app-icons/1358119106087358675/2b09d868914dc494b0ce375a9c4e184f.png"
        },
        timestamp: new Date(),
        url: ""
    };
    return embed;
}
function createSimpleEmbed(description, color) {
    const embed = createEmbed(color ? color : EmbedColor.botColor);
    embed.title = "";
    embed.description = description;
    embed.timestamp = "";
    return embed;
}
// ------------------------------------------------------------- //
function createErrorEmbed(description, title) {
    const embed = createEmbed(EmbedColor.error);
    embed.title = title || "Erreur";
    embed.description = description;
    return embed;
}
// ------------------------------------------------------------- //
function createSuccessEmbed(description) {
    const embed = createEmbed(EmbedColor.minecraft);
    embed.title = "Success";
    embed.description = description.toString();
    return embed;
}
// ------------------------------------------------------------- //
function sendEmbed(embed, targetChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!targetChannel || !embed) {
            (0, log_1.log)("WARNING : Impossible to execute the fonction, one of the two (or the two) parameter are null : (sendEmbed)");
            return false;
        }
        try {
            yield targetChannel.send(returnToSendEmbed(embed));
            (0, log_1.log)(`INFO : Embed '${(embed === null || embed === void 0 ? void 0 : embed.title) || (embed === null || embed === void 0 ? void 0 : embed.description) || 'without title :/'}' sent to '${targetChannel.id}'`);
            return true;
        }
        catch (e) {
            (0, log_1.log)(`ERROR : Impossible to send the embed '${(embed === null || embed === void 0 ? void 0 : embed.title) || (embed === null || embed === void 0 ? void 0 : embed.description) || 'without title :/'}' sent to '${targetChannel.id}' : ${e}`);
            return false;
        }
    });
}
// ------------------------------------------------------------- //
function sendEmbedToInfoChannel(embed) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
            if (channel) {
                sendEmbed(embed, channel);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
function sendEmbedToAdminChannel(embed) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.adminChannel);
            if (channel) {
                sendEmbed(embed, channel);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
// ------------------------------------------------------------- //
function sendInteractionEmbed(interaction_1, embed_1) {
    return __awaiter(this, arguments, void 0, function* (interaction, embed, privateVisibility = false) {
        if (!embed) {
            console.log("WARNING : Impossible d'exécuter la fonction, l'embed est null : (sendInteractionEmbed)");
            return false;
        }
        if (!interaction.isRepliable()) {
            console.log("WARNING : L'interaction ne peut pas recevoir de réponse : (sendInteractionEmbed)");
            return false;
        }
        try {
            const replyOptions = returnToSendEmbedForInteraction(embed, privateVisibility);
            if (interaction.deferred) {
                const replyEditOptions = returnToSendEmbedForEditInteraction(embed);
                yield interaction.editReply(replyEditOptions);
            }
            else if (interaction.replied) {
                yield interaction.followUp(replyOptions);
            }
            else if (interaction.isRepliable()) {
                yield interaction.reply(replyOptions);
            }
            else {
                (0, log_1.log)("Error when sending interaction !");
                return false;
            }
            // Interaction.update existe aussi
            console.log(`INFO : Embed '${(embed === null || embed === void 0 ? void 0 : embed.title) || 'sans titre :/'}' : '${(embed === null || embed === void 0 ? void 0 : embed.description) || 'sans description'}' envoyé à l'utilisateur via l'interaction '${interaction.id}'`);
            return true;
        }
        catch (e) {
            console.error(`ERROR : Impossible d'envoyer l'embed '${(embed === null || embed === void 0 ? void 0 : embed.title) || (embed === null || embed === void 0 ? void 0 : embed.description) || 'sans titre :/'}' via l'interaction '${interaction.id}' : ${e}`);
            return false;
        }
    });
}
//----------------------------------------------------------------------------//
function sendEmbedErrorMessage(message, targetChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!targetChannel || !message) {
            (0, log_1.log)("WARNING : Impossible to execute the fonction, one of the two (or the two) parameter are null : (sendEmbedErrorMessage)");
            return false;
        }
        const embed = createErrorEmbed(message);
        sendEmbed(embed, targetChannel);
        return true;
    });
}
// ------------------------------------------------------------- //
/**
 *
 * @param embed
 * @returns
 */
function returnToSendEmbed(embed) {
    var _a, _b;
    const embedBuilder = new discord_js_1.EmbedBuilder();
    // Vérification et ajout du titre
    if (embed.title) {
        embedBuilder.setTitle(embed.title);
    }
    // Vérification et ajout de la couleur
    if (typeof embed.color === 'number') {
        embedBuilder.setColor(embed.color);
    }
    // Vérification et ajout de la description
    if (embed.description) {
        embedBuilder.setDescription(embed.description);
    }
    // Vérification et ajout du timestamp
    if (embed.timestamp) {
        const timestamp = typeof embed.timestamp === 'string'
            ? new Date(embed.timestamp)
            : embed.timestamp;
        if (!isNaN(timestamp.getTime())) {
            embedBuilder.setTimestamp(timestamp);
        }
    }
    // Vérification et ajout de l'URL
    if (embed.url && isValidUrl(embed.url)) {
        embedBuilder.setURL(embed.url);
    }
    // Vérification et ajout de l'image
    if (((_a = embed.image) === null || _a === void 0 ? void 0 : _a.url) && isValidUrl(embed.image.url)) {
        embedBuilder.setImage(embed.image.url);
    }
    // Vérification et ajout de la miniature (thumbnail)
    if (((_b = embed.thumbnail) === null || _b === void 0 ? void 0 : _b.url) && isValidUrl(embed.thumbnail.url)) {
        embedBuilder.setThumbnail(embed.thumbnail.url);
    }
    // Vérification et ajout de l'auteur
    if (embed.author) {
        const authorData = {
            name: embed.author.name || '',
            iconURL: embed.author.icon_url && isValidUrl(embed.author.icon_url)
                ? embed.author.icon_url
                : undefined,
            url: embed.author.url && isValidUrl(embed.author.url)
                ? embed.author.url
                : undefined,
        };
        // Ajout uniquement si un nom est défini ou si une URL est valide
        if (authorData.name || authorData.iconURL || authorData.url) {
            embedBuilder.setAuthor(authorData);
        }
    }
    // Vérification et ajout du footer
    if (embed.footer) {
        const footerData = {
            text: embed.footer.text || '',
            iconURL: embed.footer.icon_url && isValidUrl(embed.footer.icon_url)
                ? embed.footer.icon_url
                : undefined,
        };
        // Ajout uniquement si le texte du footer est défini
        if (footerData.text) {
            embedBuilder.setFooter(footerData);
        }
    }
    // Vérification et ajout des champs (fields)
    if (Array.isArray(embed.fields) && embed.fields.length > 0) {
        const validFields = embed.fields.map((field) => {
            var _a;
            return ({
                name: field.name || 'Sans titre',
                value: field.value || 'Aucune valeur',
                inline: (_a = field.inline) !== null && _a !== void 0 ? _a : false,
            });
        });
        embedBuilder.addFields(...validFields);
    }
    return { embeds: [embedBuilder.toJSON()] };
}
// Fonction utilitaire pour vérifier la validité d'une URL
function isValidUrl(url) {
    try {
        new URL(url); // Essaie de créer un objet URL
        return true;
    }
    catch (_) {
        return false; // Retourne false si une exception est levée
    }
}
/**
 *
 * @param embed
 * @param privateVisibility
 * @returns
 */
function returnToSendEmbedForInteraction(embed, privateVisibility = false) {
    const messageOptions = returnToSendEmbed(embed);
    if (messageOptions.embeds && messageOptions.embeds[0]) {
        return {
            embeds: [messageOptions.embeds[0]],
            flags: privateVisibility ? discord_js_1.MessageFlags.Ephemeral : undefined
        };
    }
    return {
        content: "Une erreur est survenue :(",
        flags: privateVisibility ? discord_js_1.MessageFlags.Ephemeral : undefined
    };
}
function returnToSendEmbedForEditInteraction(embed) {
    const replyOptions = returnToSendEmbedForInteraction(embed);
    const editReplyOptions = __rest(replyOptions, []);
    return editReplyOptions;
}
// ------------------------------------------------------------- //
/**
 * Only used like that: interaction.deferReply(waitPrivateEmbedOrMessage())
 * @returns {InteractionDeferReplyOptions}
 */
function waitPrivateEmbedOrMessage() {
    return {
        flags: discord_js_1.MessageFlags.Ephemeral
    };
}
// ------------------------------------------------------------- //
function fillEmbed(embed) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!embed.color) {
            embed.color = 0xfcfcf9;
        }
        if (!embed.footer) {
            embed.footer = {
                text: "",
                icon_url: "https://cdn.discordapp.com/app-icons/1358119106087358675/2b09d868914dc494b0ce375a9c4e184f.png"
            };
        }
        else if (!embed.footer.icon_url) {
            embed.footer.icon_url = "https://cdn.discordapp.com/app-icons/1358119106087358675/2b09d868914dc494b0ce375a9c4e184f.png";
        }
        if (!(embed === null || embed === void 0 ? void 0 : embed.timestamp)) {
            embed.timestamp = new Date();
        }
    });
}
//----------------------------------------------------------------------------//
function createEmbedFromFile(file) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(file.color)
        .setTitle(file.title)
        .setFooter({
        text: "GWW Wiki - Mis à jour le " + file.footerDate + " par " + file.footerUser,
        iconURL: "https://cdn.discordapp.com/attachments/1219746976325701652/1219749512504016996/Logo_bot_wiki_3.png?ex=660c6f41&is=65f9fa41&hm=e476d7b2a1ff75cad995c0057ed3bb26f171d3acb2af621f15ae5660f6a115cc&"
    });
    for (const field of file.field) {
        embed.addFields({
            name: field.name,
            value: field.value
        });
    }
    if (file.image) {
        embed.setImage(file.image);
    }
    else {
        embed.setThumbnail(file.thumbnail);
    }
    return embed;
}
//----------------------------------------------------------------------------//
function embedError() {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        // Création de l'embed
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xff1a1a)
            .setTitle('ERREUR')
            .addFields({
            name: ' ',
            value: '```OUPS ! LA DEMOCRATIE REVIENT VITE !!```',
            inline: true,
        })
            .setFooter({
            text: `Amiral Super Terre - Mis à jour le ${today.toLocaleDateString()} par Rapport d'Erreurs Automatic`,
            iconURL: "https://cdn.discordapp.com/attachments/1219746976325701652/1219749512504016996/Logo_bot_wiki_3.png",
        });
        // Création du menu déroulant désactivé
        const selectMenu = new builders_1.StringSelectMenuBuilder()
            .setCustomId('wikiSubject')
            .setPlaceholder('Rien à voir ici')
            .setDisabled(true)
            .addOptions(new builders_1.StringSelectMenuOptionBuilder()
            .setLabel('Erreur')
            .setValue('Error')
            .setDescription('Error'));
        // Ajout du menu déroulant dans une ActionRow
        const choice = new builders_1.ActionRowBuilder().addComponents(selectMenu);
        // Retourne l'embed et le menu désactivé
        return { choice, embed };
    });
}
