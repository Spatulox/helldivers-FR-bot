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
exports.WikiManager = void 0;
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const wiki_1 = require("../../interactions/commands/wiki");
const wikiListSubthematics_1 = require("../../interactions/selectmenu/wikiListSubthematics");
const wikiListSubjects_1 = require("../../interactions/selectmenu/wikiListSubjects");
const wikiSubject_1 = require("../../interactions/selectmenu/wikiSubject");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class WikiManager {
    static dispatchWikiSelectMenu(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedValue = interaction.values[0];
            if (selectedValue === undefined) {
                interaction.reply("You need to select a value");
                return;
            }
            switch (interaction.customId) {
                case "wikiThematic": // go to wikiSubthematic
                    (0, wikiListSubthematics_1.loadWikiSubthematic)(interaction, selectedValue);
                    break;
                case "wikiSubThematic": // go to wikiSuject
                    (0, wikiListSubjects_1.loadWikiSubjects)(interaction, selectedValue);
                    break;
                case "wikiSubject": // show the subject
                    (0, wikiSubject_1.loadWikiSubject)(interaction, selectedValue);
                    return;
                default:
                    yield interaction.reply(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteraction(WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] }));
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Wrong thematic ID`));
                    break;
            }
        });
    }
    static dispatchWikiButton(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = interaction.customId;
            if (id === WikiManager.HOME_ID) {
                yield (0, wiki_1.loadWikiRoot)(interaction);
                return;
            }
            // `wikiNav:` remplace l'écran courant, `wikiOpen:` ouvre le menu à part : c'est le
            // préfixe qui porte l'intention, pas le contexte du clic.
            if (id.startsWith(WikiManager.NAV_PREFIX)) {
                yield (0, wikiListSubthematics_1.loadWikiSubthematic)(interaction, id.slice(WikiManager.NAV_PREFIX.length));
                return;
            }
            if (id.startsWith(WikiManager.OPEN_PREFIX)) {
                yield (0, wikiListSubthematics_1.loadWikiSubthematic)(interaction, id.slice(WikiManager.OPEN_PREFIX.length), true);
                return;
            }
            yield interaction.reply(Object.assign(Object.assign({}, simplediscordbot_1.ComponentManager.toInteraction(WikiManager.containerError(), null, false)), { flags: [discord_js_1.MessageFlags.IsComponentsV2, discord_js_1.MessageFlags.Ephemeral] }));
            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`WIKI : bouton inconnu ${id}`));
        });
    }
    static isWikiFile(obj) {
        return typeof obj === "object" && obj !== null
            && typeof obj.color === "number"
            && typeof obj.title === "string"
            && Array.isArray(obj.field)
            && obj.field.every((f) => typeof f === "object" &&
                f !== null &&
                typeof f.name === "string" &&
                typeof f.value === "string")
            && (typeof obj.image === "string" || obj.image === false)
            && (typeof obj.thumbnail === "string" || obj.thumbnail === false)
            && typeof obj.footerDate === "string"
            && typeof obj.footerUser === "string"
            && (obj.source === undefined || typeof obj.source === "string");
    }
    static isWikiConfigFile(obj) {
        return typeof obj === "object" && obj !== null
            && typeof obj.thumbnail === "string";
    }
    static isWikiConfigFolder(obj) {
        return typeof obj === "object" && obj !== null
            && typeof obj.thumbnail === "string" // hérité de WikiConfigFile
            && typeof obj.customId === "string"
            && typeof obj.placeholder === "string"
            && typeof obj.descriptions === "object" && obj.descriptions !== null
            && Object.values(obj.descriptions).every((v) => typeof v === "string")
            && typeof obj.emojis === "object" && obj.emojis !== null
            && Object.values(obj.emojis).every((v) => typeof v === "string");
    }
    /**
     * Préfixe emoji à insérer dans du texte.
     *
     * Un emoji d'application ne se résout dans du texte que si le message est envoyé par
     * l'application qui le possède : le client compare le tag `<:nom:id>` au jeu d'emojis de
     * l'expéditeur. Dans un champ structuré de composant (`setEmoji({id, name})`) il se rend en
     * revanche toujours, l'asset étant servi publiquement par le CDN — d'où l'asymétrie visible
     * en dev, où le menu déroulant affiche l'emoji mais pas le texte.
     *
     * Les 232 emojis du wiki appartiennent à l'application de prod. En dev, le bot est une autre
     * application : le tag afficherait `:nom:`, on l'omet donc plutôt que de polluer la liste.
     * Les emojis Unicode, eux, se rendent partout.
     */
    static textEmoji(emoji) {
        if (!emoji || !emoji.name) {
            return "";
        }
        if (!emoji.id) {
            return emoji.name + " ";
        }
        return simplediscordbot_1.BotEnv.dev ? "" : `<:${emoji.name}:${emoji.id}> `;
    }
    static separator(spacing = discord_js_1.SeparatorSpacingSize.Small) {
        return new discord_js_1.SeparatorBuilder().setDivider(true).setSpacing(spacing);
    }
    /**
     * Un TextDisplay accepte le markdown, contrairement au footer d'un embed :
     * le lien vers la source est donc enfin cliquable.
     */
    static footerText(file) {
        let text = `-# GWW Wiki · Mis à jour le ${file.footerDate} par ${file.footerUser}`;
        if (file.source) {
            text += ` · [Source](${file.source})`;
        }
        return text;
    }
    /**
     * Boutons de navigation d'un écran de menu.
     *
     * Le bouton « Retour » est omis quand le parent est la racine : « Menu principal » y mène
     * déjà, deux boutons vers la même destination n'apportent rien.
     */
    static navButtons(currentPath) {
        const buttons = [];
        const parent = path_1.default.dirname(currentPath);
        if (parent !== WikiManager.WIKI_ROOT && parent !== path_1.default.dirname(WikiManager.WIKI_ROOT)) {
            buttons.push(simplediscordbot_1.ButtonManager.secondary({
                label: path_1.default.basename(parent),
                emoji: "◀",
                customId: WikiManager.NAV_PREFIX + parent
            }));
        }
        buttons.push(simplediscordbot_1.ButtonManager.secondary({
            label: "Menu principal",
            emoji: "🏠",
            customId: WikiManager.HOME_ID
        }));
        return buttons;
    }
    /** Bouton d'une fiche : rouvre le dossier qui la contient, dans un message à part. */
    static parentButton(parentPath) {
        return simplediscordbot_1.ButtonManager.secondary({
            label: path_1.default.basename(parentPath),
            emoji: "◀",
            customId: WikiManager.OPEN_PREFIX + parentPath
        });
    }
    static addButtons(container, buttons) {
        if (buttons.length > 0) {
            container.addActionRowComponents(new discord_js_1.ActionRowBuilder().addComponents(buttons));
        }
        return container;
    }
    /**
     * Fiche d'un sujet, en Components V2.
     * `thumbnail` devient l'accessoire du titre (en haut à droite), `image` une galerie
     * pleine largeur : la distinction que portait déjà le JSON garde exactement son sens.
     */
    static createContainerFromFile(file, parentPath) {
        const container = simplediscordbot_1.ComponentManager.create(Object.assign(Object.assign({ title: `## ${file.title}`, color: file.color }, (file.thumbnail ? { thumbnailUrl: file.thumbnail } : {})), { separator: false }));
        // Le premier champ porte un nom vide (" ") : c'est le texte d'introduction, un héritage
        // du format embed, où le nom d'un champ ne pouvait pas être vide.
        const fields = [...file.field];
        const lead = fields[0] && !fields[0].name.trim() ? fields.shift() : undefined;
        if (lead) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(lead.value));
        }
        if (fields.length > 0) {
            container.addSeparatorComponents(WikiManager.separator());
            for (const field of fields) {
                container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(`**${field.name}**\n${field.value}`));
            }
        }
        if (file.image) {
            container.addMediaGalleryComponents(new discord_js_1.MediaGalleryBuilder().addItems(new discord_js_1.MediaGalleryItemBuilder().setURL(file.image)));
        }
        container.addSeparatorComponents(WikiManager.separator());
        container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(WikiManager.footerText(file)));
        if (parentPath) {
            WikiManager.addButtons(container, [WikiManager.parentButton(parentPath)]);
        }
        return container;
    }
    /**
     * Écran de navigation : titre, liste des entrées disponibles, puis le menu déroulant
     * à l'intérieur du conteneur au lieu de flotter sous l'embed.
     */
    static createListContainer(options) {
        var _a;
        const container = simplediscordbot_1.ComponentManager.create(Object.assign(Object.assign({ title: `## ${options.title}`, color: WikiManager.LIST_COLOR }, (options.thumbnailUrl ? { thumbnailUrl: options.thumbnailUrl } : {})), { separator: false }));
        if (options.description) {
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(options.description));
        }
        if (options.entries.length > 0) {
            container.addSeparatorComponents(WikiManager.separator());
            container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(options.entries.map(e => `- ${e}`).join("\n")));
        }
        container.addSeparatorComponents(WikiManager.separator());
        simplediscordbot_1.ComponentManager.selectMenu(container, options.menu);
        return WikiManager.addButtons(container, (_a = options.buttons) !== null && _a !== void 0 ? _a : []);
    }
    static containerError() {
        const container = simplediscordbot_1.ComponentManager.create({
            title: "## ERREUR",
            color: WikiManager.ERROR_COLOR,
            separator: false
        });
        container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent("```OUPS ! LA DEMOCRATIE REVIENT VITE !!```"));
        container.addSeparatorComponents(WikiManager.separator());
        container.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent("-# GWW Wiki · Rapport d'Erreurs Automatic"));
        return container;
    }
}
exports.WikiManager = WikiManager;
WikiManager.WIKI_ROOT = "./src/hdfr/wikiContents";
WikiManager.LIST_COLOR = 16771082;
WikiManager.ERROR_COLOR = 0xff1a1a;
/** Remplace l'écran courant */
WikiManager.NAV_PREFIX = "wikiNav:";
/** Ouvre le menu à côté, dans un message éphémère */
WikiManager.OPEN_PREFIX = "wikiOpen:";
WikiManager.HOME_ID = "wikiHome";
