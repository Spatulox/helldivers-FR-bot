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
exports.SilentReportContextMenu = void 0;
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class SilentReportContextMenu {
    // 25 options max
    static get REPORT_MESSAGE_OPTIONS() {
        return [
            ...Object.values(this.COMMON_REPORT_BY_VALUE),
            ...Object.values(this.MESSAGE_ONLY_BY_VALUE),
            ...Object.values(this.COMMON_REPORT_END)
        ];
    }
    // 25 options max
    static get REPORT_USER_OPTIONS() {
        return [
            ...Object.values(this.COMMON_REPORT_BY_VALUE),
            ...Object.values(this.USER_ONLY_BY_VALUE),
            ...Object.values(this.COMMON_REPORT_END)
        ];
    }
    static getOptionByValue(value) {
        if (this.COMMON_REPORT_BY_VALUE[value]) {
            return this.COMMON_REPORT_BY_VALUE[value];
        }
        if (this.MESSAGE_ONLY_BY_VALUE[value]) {
            return this.MESSAGE_ONLY_BY_VALUE[value];
        }
        if (this.USER_ONLY_BY_VALUE[value]) {
            return this.USER_ONLY_BY_VALUE[value];
        }
        if (this.COMMON_REPORT_END[value]) {
            return this.COMMON_REPORT_END[value];
        }
        return undefined;
    }
    static get REPORT_BASIC_OPTIONS() {
        return Object.values(this.COMMON_REPORT_BY_VALUE);
    }
    static silent_report_message(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetMessage = interaction.targetMessage;
            const selectMenu = simplediscordbot_1.SelectMenuManager.simple(`report_message_${interaction.channelId}-${targetMessage.id}`, this.REPORT_MESSAGE_OPTIONS, "Sélectionnez le motif du report");
            const message = Object.assign({ content: `<@${interaction.user.id}>\nVous avez report ${interaction.targetMessage.url} de <@${interaction.targetMessage.author.id}>.\nVeuillez choisir une raison :` }, simplediscordbot_1.SelectMenuManager.toInteraction(selectMenu, true));
            yield interaction.reply(message);
        });
    }
    static silent_report_user(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUser = interaction.targetUser;
            const selectMenu = simplediscordbot_1.SelectMenuManager.simple(`report_user_${targetUser.id}`, this.REPORT_USER_OPTIONS, "Sélectionnez le motif du report");
            const message = Object.assign({ content: `<@${interaction.user.id}>\nVous avez report <@${interaction.targetUser.id}>.\nVeuillez choisir une raison :` }, simplediscordbot_1.SelectMenuManager.toInteraction(selectMenu, true));
            yield interaction.reply(message);
        });
    }
}
exports.SilentReportContextMenu = SilentReportContextMenu;
// 25 options max
SilentReportContextMenu.COMMON_REPORT_BY_VALUE = {
    "irrespect": { label: "Irrespect/Provocation/Troll/Diffamation", value: "irrespect", description: "Irrespect, Provocation, Troll (Compteur, Soundbard...), Diffamation", emoji: "😠" },
    "harcelement": { label: "Harcèlement", value: "harcelement", description: "Comportement toxique répété", emoji: "💢" },
    "minor": { label: "Âge non valable sur les réseaux sociaux (-15 ans)", value: "minor", description: "Suspicion de compte appartenant à une personne de moins de 15 ans", emoji: "🧒" },
    "scam": { label: "Arnaque", value: "scam", description: "Arnaque", emoji: "🪤" },
    "cheat": { label: "Cheat/Glitch", value: "cheat", description: "Cheat/Glitch/Hack", emoji: "💉" },
    "leaks": { label: "Leaks", value: "leaks", description: "Leaks & Datamining", emoji: "📂" },
};
SilentReportContextMenu.COMMON_REPORT_END = {
    "propos_deplace": { label: "Propos déplacés", value: "propos_deplace", description: "Propos religieux, politique, insultes", emoji: "🗺️" },
    "profile": { label: "Profil/Pseudo", value: "profile", description: "Profil/Pseudo non conforme : photo profile/emojis/grade/tag/décorations profile...", emoji: "👤" },
    "promo_discord": { label: "Promo Discord", value: "promo_discord", description: "Lien, images, messages", emoji: "🔗" },
    "promo_site": { label: "Site tiers", value: "promo_site", description: "Promotion site/logiciel tiers", emoji: "🌐" },
    "illegal": { label: "Illégal", value: "illegal", description: "Illégal / Non respect des TSO Discord", emoji: "🚨" },
    "autre": { label: "Autre", value: "autre", description: "Les modérateurs investigueront...", emoji: "🔗" },
};
SilentReportContextMenu.MESSAGE_ONLY_BY_VALUE = {
    "porn": { label: "Contenu pornographique/sexuel", value: "porn", description: "Image, liens, role-play...", emoji: "🔞" },
    "roleplay_force": { label: "Roleplay imposé", value: "roleplay_force", description: "Roleplay imposé", emoji: "🫡" },
    "spam": { label: "Spam", value: "spam", description: "Envoi trop rapide de messages", emoji: "💨" },
};
SilentReportContextMenu.USER_ONLY_BY_VALUE = {
    "porn_stream": { label: "Diffusion de contenu pornographique/sexuel", value: "porn_stream", description: "Partage vidéo, Message privé...", emoji: "🔞" },
    "dm": { label: "Message privé excessifs", value: "dm", description: "Message privé excessifs", emoji: "📩" },
    "gameplay_force": { label: "Gameplay imposé", value: "gameplay_force", description: "Gameplay imposé", emoji: "🎮" },
    "voice_spam": { label: "Spam vocal", value: "voice_spam", description: "Micro saturé, soundboard excessifs...", emoji: "🔊" },
};
