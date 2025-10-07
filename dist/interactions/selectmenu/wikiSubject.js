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
exports.findMatchingFile = findMatchingFile;
exports.loadWikiSubject = loadWikiSubject;
const embeds_1 = require("../../utils/messages/embeds");
const files_1 = require("../../utils/server/files");
const path_1 = __importDefault(require("path"));
const constantes_1 = require("../../utils/constantes");
const messages_1 = require("../../utils/messages/messages");
function findMatchingFile(targetPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = path_1.default.dirname(targetPath);
        const targetFileName = path_1.default.basename(targetPath);
        const files = yield (0, files_1.listJsonFile)(folderPath);
        if (!files) {
            return null;
        }
        for (const file of files) {
            if (!file.endsWith(".json"))
                continue;
            //replace '(emoji_name-emoji_id)_' (emoji dans un nom de fichier) ou '🎉_' (un emoji, pas forcément celui là)
            //const fileWithoutEmoji = file.replace(new RegExp(`${WIKI_FILE_REGEX.source}_|^[^\\w]+`, "g"), "");
            const fileWithoutEmoji = file.replace(constantes_1.WIKI_FILE_REGEX, "");
            if (fileWithoutEmoji === targetFileName) {
                return path_1.default.join(folderPath, file);
            }
        }
        return null;
    });
}
function loadWikiSubject(interaction, selectedValue) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!interaction.isStringSelectMenu())
                return;
            const matchingFile = yield findMatchingFile(selectedValue);
            if (matchingFile == null) {
                const { embed } = yield (0, embeds_1.embedError)();
                interaction.update({
                    content: '',
                    embeds: [embed],
                    components: [],
                });
                (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`WIKI : No matching file for ${selectedValue}`));
                return;
            }
            const file = (0, files_1.readJsonFile)(`${matchingFile}`);
            if (file) {
                let response = (0, embeds_1.createEmbedFromFile)(file);
                yield interaction.reply({ content: '', embeds: [response], components: [] });
                (0, messages_1.sendMessageToOwner)("Quelqu'un a utilié le Wiki !!");
            }
            else {
                let response = 'Sélection non reconnue.';
                yield interaction.update({ content: response, components: [] });
            }
        }
        catch (error) {
            console.error(`ERROR : Traitement de la sélection du sujet : ${error}`);
            yield interaction.update({
                content: 'Erreur lors du traitement de votre sélection. Veuillez réessayer ou contacter un développeur.',
                components: []
            });
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
        }
    });
}
