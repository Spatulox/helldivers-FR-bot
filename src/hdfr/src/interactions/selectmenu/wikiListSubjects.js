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
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const config_json_1 = __importDefault(require("../../../../../config.json"));
const path_1 = __importDefault(require("path"));
const wikiListSubthematics_1 = require("./wikiListSubthematics");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
function loadWikiSubjects(interaction_1, selectedValue_1) {
    return __awaiter(this, arguments, void 0, function* (interaction, selectedValue, openApart = false) {
        try {
            const subThematicPath = `${selectedValue}`;
            const configChild = yield simplediscordbot_1.FileManager.readJsonFile(`${subThematicPath}/config.json`);
            const thumbnail = WikiManager_1.WikiManager.isWikiConfigFile(configChild) ? configChild.thumbnail : config_json_1.default.defaultThumbnail;
            const listFile = yield simplediscordbot_1.FileManager.listJsonFiles(subThematicPath + "/");
            if (!listFile || listFile.length < 1) {
                simplediscordbot_1.Log.error(`Récupération des données de '${selectedValue}'`);
                yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(WikiManager_1.WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`ERROR : Récupération des données de '${selectedValue}'`));
                return;
            }
            const selectMenu = new builders_1.StringSelectMenuBuilder()
                .setCustomId('wikiSubject')
                .setPlaceholder(`Sélectionnez un sujet`);
            const entries = [];
            for (const file of listFile) {
                if (file === "config.json")
                    continue;
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
                    entries.push(`${WikiManager_1.WikiManager.textEmoji(res)}${label}`);
                }
                else {
                    selectMenu.addOptions(new builders_1.StringSelectMenuOptionBuilder()
                        .setLabel(file)
                        .setDescription(' ')
                        .setValue(`${subThematicPath}/${label}.json`));
                    entries.push(file);
                }
            }
            const container = WikiManager_1.WikiManager.createListContainer({
                title: path_1.default.basename(selectedValue).toUpperCase(),
                description: "Quel sujet vous intéresse ?",
                thumbnailUrl: thumbnail,
                entries,
                menu: selectMenu,
                buttons: WikiManager_1.WikiManager.navButtons(subThematicPath)
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
