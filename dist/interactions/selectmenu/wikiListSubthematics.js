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
exports.loadWikiSubthematic = loadWikiSubthematic;
const builders_1 = require("@discordjs/builders");
const config_json_1 = __importDefault(require("../../config.json"));
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
function loadWikiSubthematic(interaction, selectedValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const thematicPath = `${selectedValue}`;
            const configChild = yield simplediscordbot_1.FileManager.readJsonFile(`${thematicPath}/config.json`);
            // Par défaut, on suppose qu'il y a un fichier config.json et donc que c'est une sous-thématique
            if (!WikiManager_1.WikiManager.isWikiConfigFolder(configChild)) {
                //isSubThematic = false
                yield (0, wikiListSubjects_1.loadWikiSubjects)(interaction, selectedValue);
                return;
            }
            const choice = new builders_1.ActionRowBuilder();
            const embed = new builders_1.EmbedBuilder()
                .setColor(16771082)
                .setTitle(path_1.default.basename(selectedValue).toUpperCase());
            if (configChild.hasOwnProperty("thumbnail")) {
                embed.setThumbnail(configChild.thumbnail);
            }
            else {
                embed.setThumbnail(config_json_1.default.defaultThumbnail);
            }
            // Lire le fichier de configuration
            const selectMenu = new builders_1.StringSelectMenuBuilder()
                .setCustomId(configChild.customId)
                .setPlaceholder(configChild.placeholder);
            // Pour chaque entrée dans l'objet 'descriptions' du fichier config.json associé, ajoutez une option au menu déroulant avec sa description
            // Donc le nom des dossiers et des fichiers sont importants pour que cela fonctionne
            for (const [label, description] of Object.entries(configChild.descriptions)) {
                let emoji = configChild.emojis[label];
                const select = new builders_1.StringSelectMenuOptionBuilder()
                    .setLabel(path_1.default.basename(label))
                    .setDescription(description)
                    .setValue(thematicPath + '/' + label);
                if (emoji) {
                    const emojiObj = getEmojiObject(emoji, label);
                    select.setEmoji(emojiObj);
                }
                else {
                    console.warn(`Emoji manquant pour "${label}"`);
                }
                selectMenu.addOptions(select);
                embed.addFields({ name: ' ', value: `\`\`\`${label}\`\`\``, inline: true });
            }
            choice.addComponents(selectMenu);
            yield interaction.update({
                content: `Quel sujet vous intéresse ?`,
                embeds: [embed],
                components: [choice]
            });
        }
        catch (e) {
            const { choice, embed } = yield WikiManager_1.WikiManager.embedError();
            yield interaction.update({
                content: `Quel sujet vous intéresse ?`,
                embeds: [embed],
                components: choice ? [choice] : []
            });
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e}`));
        }
    });
}
