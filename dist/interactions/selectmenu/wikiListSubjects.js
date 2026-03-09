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
exports.loadWikiSubjects = loadWikiSubjects;
const builders_1 = require("@discordjs/builders");
const config_json_1 = __importDefault(require("../../config.json"));
const path_1 = __importDefault(require("path"));
const wikiListSubthematics_1 = require("./wikiListSubthematics");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
function loadWikiSubjects(interaction, selectedValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const subThematicPath = `${selectedValue}`;
            const configChild = yield simplediscordbot_1.FileManager.readJsonFile(`${subThematicPath}/config.json`);
            const choice = new builders_1.ActionRowBuilder();
            const embed = new builders_1.EmbedBuilder()
                .setColor(16771082)
                .setTitle(path_1.default.basename(selectedValue).toUpperCase());
            if (WikiManager_1.WikiManager.isWikiConfigFile(configChild)) {
                embed.setThumbnail(configChild.thumbnail);
            }
            else {
                embed.setThumbnail(config_json_1.default.defaultThumbnail);
            }
            // Récupération de la valeur choisie
            let subThematicChoiceValue = interaction.values[0];
            const listFile = yield simplediscordbot_1.FileManager.listJsonFiles(subThematicPath + "/");
            if (!listFile || listFile.length < 1) {
                simplediscordbot_1.Log.error(`Récupération des données de '${subThematicChoiceValue}'`);
                const { choice, embed } = yield WikiManager_1.WikiManager.embedError();
                yield interaction.update({
                    content: ``,
                    embeds: [embed],
                    components: choice ? [choice] : []
                });
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`ERROR : Récupération des données de '${subThematicChoiceValue}'`));
                return;
            }
            const selectMenu = new builders_1.StringSelectMenuBuilder()
                .setCustomId('wikiSubject')
                .setPlaceholder(`Sélectionnez un sujet`);
            for (const file of listFile) {
                if (file !== "config.json") {
                    const fileNameParts = file.split('.json')[0].split("_");
                    const emojiValue = fileNameParts[0]; // Nouvelle écriture des emojis au format <:name:id>
                    const label = fileNameParts[1]; // Nom du fichier
                    if (label && emojiValue) {
                        const res = (0, wikiListSubthematics_1.getEmojiObject)(emojiValue, label);
                        const optionBuilder = new builders_1.StringSelectMenuOptionBuilder()
                            .setLabel(path_1.default.basename(label))
                            .setDescription(' ')
                            .setValue(`${subThematicPath}/${label}.json`);
                        if (res) {
                            optionBuilder.setEmoji(res);
                        }
                        selectMenu.addOptions(optionBuilder);
                    }
                    else {
                        selectMenu.addOptions(new builders_1.StringSelectMenuOptionBuilder()
                            .setLabel(file)
                            .setDescription(' ')
                            .setValue(`${subThematicPath}/${label}.json`));
                    }
                }
            }
            // Ajout des composants au menu déroulant
            choice.addComponents(selectMenu);
            // Ajout des champs à l'embed
            for (const file of listFile) {
                if (file !== "config.json") {
                    const fileNameParts = file.split('.json')[0].split("_");
                    const label = fileNameParts[1]; // Nom du fichier
                    embed.addFields({
                        name: ' ',
                        value: `\`\`\`${label}\`\`\``,
                        inline: false,
                    });
                }
            }
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
