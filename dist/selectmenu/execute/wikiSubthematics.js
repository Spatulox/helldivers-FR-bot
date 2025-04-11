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
const files_1 = require("../../utils/server/files");
const builders_1 = require("@discordjs/builders");
const config_json_1 = __importDefault(require("../../config.json"));
function getEmojiObject(emojiValue, label) {
    if (!emojiValue) {
        console.warn(`WARN : Emoji manquant pour "${label}"`);
        return undefined;
    }
    if (emojiValue.startsWith('<:')) {
        // Emoji personnalisé : extraire le nom et l'ID
        const match = emojiValue.match(/<:([a-zA-Z0-9_]+):(\d+)>/);
        if (match) {
            const [, name, id] = match;
            return { id, name };
        }
        else {
            console.warn(`WARN : Format d'emoji invalide pour "${label}"`);
            return undefined;
        }
    }
    else {
        // Emoji Unicode
        return { name: emojiValue };
    }
}
function loadWikiSubthematic(interaction, selectedValue) {
    return __awaiter(this, void 0, void 0, function* () {
        //try{
        const thematicPath = `./src/wikiContents/${selectedValue}`;
        const configChild = yield (0, files_1.readJsonFile)(`${thematicPath}/config.json`);
        // Par défaut, on suppose qu'il y a un fichier config.json et donc que c'est une sous-thématique
        let isSubThematic = true;
        // S'il n'y a pas de fichier config.json, alors c'est un sujet direct
        // configChild est nul ou qu'il contient une discription, c'est que ce n'est pas un config.json de dossier.
        if (configChild === null || !configChild.hasOwnProperty("descriptions")) {
            isSubThematic = false;
            //loadWikiSubjects(interaction, selectedValue)
            // Loading All the Wiki subejcts
            //return await generateDynamicSubThematic(thematicPath, interaction, isSubThematic);
            console.log("SUBJECTS !! NOT FOLDERS");
            return;
        }
        const choice = new builders_1.ActionRowBuilder();
        const embed = new builders_1.EmbedBuilder()
            .setColor(16771082)
            .setTitle(selectedValue.toUpperCase());
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
            selectMenu.addOptions(new builders_1.StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setDescription(description)
                .setEmoji(getEmojiObject(emoji, label))
                .setValue(thematicPath + '/' + label));
            embed.addFields({ name: ' ', value: `\`\`\`${label}\`\`\``, inline: true });
        }
        choice.addComponents(selectMenu);
        // On retourne également la valeur de "isSubThematic" pour savoir quoi traîter (sous-thématique ou sujet direct)
        //return { choice, embed, isSubThematic };
        yield interaction.update({
            content: `Quel sujet vous intéresse ?`,
            embeds: [embed],
            components: [choice]
        });
        /*} catch(e){
            sendInteractionEmbed(interaction, createErrorEmbed(`Nothing here : ${selectedValue}`), true)
        }*/
    });
}
