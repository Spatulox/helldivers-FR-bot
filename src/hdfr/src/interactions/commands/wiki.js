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
exports.buildRootContainer = buildRootContainer;
exports.wikiMenu = wikiMenu;
exports.loadWikiRoot = loadWikiRoot;
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const wikiListSubthematics_1 = require("../selectmenu/wikiListSubthematics");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const WikiManager_1 = require("../../utils/Manager/WikiManager");
/**
 * Menu racine du wiki. Partagé entre la commande /wiki et le bouton « Menu principal ».
 * C'est le seul écran sans bouton de navigation : il est déjà la destination des autres.
 */
function buildRootContainer() {
    return __awaiter(this, void 0, void 0, function* () {
        const file = yield simplediscordbot_1.FileManager.readJsonFile(`${WikiManager_1.WikiManager.WIKI_ROOT}/thematics.json`);
        const direct = yield simplediscordbot_1.FileManager.listDirectories(`${WikiManager_1.WikiManager.WIKI_ROOT}/`);
        if (!Array.isArray(direct)) {
            return null;
        }
        const desc = file.descriptions;
        const emoji = file.emojis;
        const wikiThematic = new builders_1.StringSelectMenuBuilder()
            .setCustomId('wikiThematic')
            .setPlaceholder('Sélectionnez une thématique');
        const entries = [];
        for (const label of direct) {
            const description = desc[label];
            const emojiValue = emoji[label];
            if (!description || !emojiValue) {
                console.warn(`WARN : Clé manquante dans thematics.json pour "${label}"`);
                continue;
            }
            const optionBuilder = new builders_1.StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setDescription(description)
                .setValue(`${WikiManager_1.WikiManager.WIKI_ROOT}/${label}`);
            const res = (0, wikiListSubthematics_1.getEmojiObject)(emojiValue, label);
            if (res && "id" in res && "name" in res) {
                optionBuilder.setEmoji({ id: res.id, name: res.name });
            }
            else if (res && "name" in res) {
                optionBuilder.setEmoji({ name: emojiValue });
            }
            else {
                continue;
            }
            wikiThematic.addOptions(optionBuilder);
            entries.push(`${WikiManager_1.WikiManager.textEmoji(res)}**${label}** — ${description}`);
        }
        return WikiManager_1.WikiManager.createListContainer({
            title: "WIKI",
            description: "Quel sujet voulez-vous approfondir aujourd'hui, Helldiver ?",
            thumbnailUrl: file.thumbnail,
            entries,
            menu: wikiThematic
        });
    });
}
function wikiMenu(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const container = yield buildRootContainer();
            if (!container) {
                simplediscordbot_1.Bot.interaction.send(interaction, simplediscordbot_1.EmbedManager.error("Une erreur est survenue"), true);
                return;
            }
            yield interaction.reply(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteraction(container, null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] }));
        }
        catch (error) {
            console.error('ERROR : Éxécution de la commande /wiki' + error);
            yield interaction.reply('Erreur lors de l\'exécution de cette commande. Veuillez réessayer ou contacter un développeur');
        }
    });
}
/** Retour au menu racine depuis un bouton : remplace l'écran courant. */
function loadWikiRoot(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const container = yield buildRootContainer();
            yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(container !== null && container !== void 0 ? container : WikiManager_1.WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
        }
        catch (error) {
            yield interaction.update(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteractionEdit(WikiManager_1.WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2] }));
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${error}`));
        }
    });
}
