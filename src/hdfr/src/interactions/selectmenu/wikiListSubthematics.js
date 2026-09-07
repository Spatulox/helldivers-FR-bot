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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmojiObject = getEmojiObject;
exports.emojiTag = emojiTag;
exports.loadWikiSubthematic = loadWikiSubthematic;
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../../../../../config.json"));
const wikiListSubjects_1 = require("./wikiListSubjects");
const path_1 = __importDefault(require("path"));
const constantes_1 = require("../../constantes");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
function getEmojiObject(emojiValue, label) {
    if (!emojiValue) {
        console.warn(`WARN : Emoji manquant pour "${label}"`);
        return undefined;
    }
    if (emojiValue.startsWith('<:')) {
        const match = emojiValue.match(constantes_1.WIKI_FOLDER_REGEX);
        if (match) {
            const [, name, id] = match;
            return { id, name };
        }
        console.warn(`WARN : Format d'emoji invalide "<:" pour "${label}"`);
        return undefined;
    }
    else if (emojiValue.startsWith('(')) {
        const match = emojiValue.match(constantes_1.WIKI_FILE_REGEX);
        if (match) {
            const [, name, id] = match;
            return { id, name };
        }
        console.warn(`WARN : Format d'emoji invalide "(" pour "${label}"`);
        return undefined;
    }
    else {
        // Emoji Unicode
        return { name: emojiValue };
    }
}
/**
 * Rend un emoji sous la forme attendue par une option de select menu.
 *
 * `SelectMenuCreateOption.emoji` est une chaîne : c'est discord.js qui reconstitue `{id, name}` à
 * partir du tag `<:nom:id>` (`resolvePartialEmoji`). Sa regex exige un nom de 2 à 32 caractères et
 * un ID de 17 à 20 chiffres — ce que `validate_all.py` garantit déjà sur tous les emojis du wiki.
 *
 * Contrairement à `WikiManager.textEmoji`, l'emoji applicatif est conservé même en dev : dans un
 * champ structuré de composant il se rend toujours, l'asset étant servi par le CDN public.
 */
function emojiTag(emoji) {
    if (!emoji || !emoji.name) {
        return undefined;
    }
    return emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;
}
/**
 * Écran d'une thématique. `openApart` sert au bouton d'une fiche : le menu s'ouvre alors dans un
 * message éphémère à part, au lieu de remplacer celui d'où vient le clic.
 */
function loadWikiSubthematic(interaction_1, selectedValue_1) {
    return __awaiter(this, arguments, void 0, function* (interaction, selectedValue, openApart = false) {
        try {
            const thematicPath = `${selectedValue}`;
            const configChild = yield simplediscordbot_1.FileManager.readJsonFile(`${thematicPath}/config.json`);
            // Par défaut, on suppose qu'il y a un fichier config.json et donc que c'est une sous-thématique
            if (!WikiManager_1.WikiManager.isWikiConfigFolder(configChild)) {
                //isSubThematic = false
                yield (0, wikiListSubjects_1.loadWikiSubjects)(interaction, selectedValue, openApart);
                return;
            }
            // Le nom des dossiers et des fichiers doit correspondre aux clés du config.json associé
            const entries = [];
            const options = [];
            for (const [label, description] of Object.entries(configChild.descriptions)) {
                const emoji = configChild.emojis[label];
                let emojiObj;
                if (emoji) {
                    emojiObj = getEmojiObject(emoji, label);
                }
                else {
                    console.warn(`Emoji manquant pour "${label}"`);
                }
                options.push({
                    label: path_1.default.basename(label),
                    description: description,
                    value: thematicPath + '/' + label,
                    emoji: emojiTag(emojiObj)
                });
                entries.push(`${WikiManager_1.WikiManager.textEmoji(emojiObj)}**${label}** — ${description}`);
            }
            const selectMenu = simplediscordbot_1.SelectMenuManager.simple(configChild.customId, options, configChild.placeholder);
            const container = WikiManager_1.WikiManager.createListContainer({
                title: path_1.default.basename(selectedValue).toUpperCase(),
                description: "Quel sujet vous intéresse ?",
                thumbnailUrl: configChild.thumbnail || config_json_1.default.defaultThumbnail,
                sections: [{ entries, menu: selectMenu }],
                buttons: WikiManager_1.WikiManager.navButtons(thematicPath)
            });
            if (openApart) {
                yield interaction.reply(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteraction(container, null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] }));
            }
            else {
                yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(container, null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
            }
        }
        catch (e) {
            yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(WikiManager_1.WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e}`));
        }
    });
}
