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
            // `listJsonFiles` est un readdir brut : sans ordre imposé ici, l'affichage dépend du
            // système de fichiers. `buildSubjectGroups` ordonne, et découpe en blocs si le config.json
            // le demande — un seul bloc sans titre partout ailleurs.
            const groups = yield WikiManager_1.WikiManager.buildSubjectGroups(subThematicPath, listFile.filter(file => file !== "config.json"), configChild);
            const sections = groups.map((group, index) => {
                var _a;
                const entries = [];
                const options = [];
                for (const file of group.files) {
                    const fileNameParts = file.split('.json')[0].split("_");
                    const emojiValue = fileNameParts[0]; // Nouvelle écriture des emojis au format <:name:id>
                    const label = fileNameParts[1]; // Nom du fichier
                    if (label && emojiValue) {
                        const res = (0, wikiListSubthematics_1.getEmojiObject)(emojiValue, label);
                        options.push({
                            label: path_1.default.basename(label),
                            description: ' ',
                            value: `${subThematicPath}/${label}.json`,
                            emoji: (0, wikiListSubthematics_1.emojiTag)(res)
                        });
                        entries.push(`${WikiManager_1.WikiManager.textEmoji(res)}${label}`);
                    }
                    else {
                        options.push({
                            label: file,
                            description: ' ',
                            value: `${subThematicPath}/${label}.json`
                        });
                        entries.push(file);
                    }
                }
                // Un custom_id par bloc : Discord les refuse en double dans un même message.
                const selectMenu = simplediscordbot_1.SelectMenuManager.simple(`wikiSubject:${index}`, options, (_a = group.placeholder) !== null && _a !== void 0 ? _a : `Sélectionnez un sujet`);
                return { title: group.title, entries, menu: selectMenu };
            });
            const container = WikiManager_1.WikiManager.createListContainer({
                title: path_1.default.basename(selectedValue).toUpperCase(),
                description: "Quel sujet vous intéresse ?",
                thumbnailUrl: thumbnail,
                sections,
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
