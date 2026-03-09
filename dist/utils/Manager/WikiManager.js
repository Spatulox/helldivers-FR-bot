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
exports.WikiManager = void 0;
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
class WikiManager {
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
            && typeof obj.footerUser === "string";
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
    static createEmbedFromFile(file) {
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
            embed.setThumbnail(file.thumbnail ? file.thumbnail : null);
        }
        return embed;
    }
    static embedError() {
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
}
exports.WikiManager = WikiManager;
