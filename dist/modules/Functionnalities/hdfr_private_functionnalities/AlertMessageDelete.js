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
exports.AlertMessageDelete = void 0;
const Modules_1 = require("../../Modules");
const discord_js_1 = require("discord.js");
const HDFR_1 = require("../../../utils/HDFR");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MessageManager_1 = require("../../../utils/Manager/MessageManager");
const MemberManager_1 = require("../../../utils/Manager/MemberManager");
class AlertMessageDelete extends Modules_1.Module {
    /*private channelChecker: string[] = [
        HDFRChannelID.blabla_jeu,
        HDFRChannelID.blabla_hors_sujet,
        HDFRChannelID.galerie,
        HDFRChannelID.besoin_daide,
        HDFRChannelID.chill_tryhard,
        HDFRChannelID.farm_debutant,
    ]*/
    constructor() {
        if (AlertMessageDelete._instance) {
            return AlertMessageDelete._instance;
        }
        super("Alert Message Delete", "Module which send the deleted message to a modo channel, in order to check if there is any weird images/content")
        AlertMessageDelete._instance = this;
    }
    static get instance() {
        return AlertMessageDelete._instance;
    }
    /*private ensureFullMessage(message: Message | PartialMessage): Message {
        if (message.partial) {
            throw new Error("Message is partial");
        }
        if (!message.author) {
            throw new Error("Message has no author");
        }
        return message; // <- ici TS sait que c'est un Message
    }*/
    handleMessageDelete(message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.enabled)
                return;
            if (message.guildId != HDFR_1.HDFRChannelID.guildID)
                return;
            try {
                const container = simplediscordbot_1.ComponentManager.create({
                    title: "## Message Supprimé",
                    description: "Détection automatique de message supprimé",
                    color: simplediscordbot_1.SimpleColor.error
                });
                const modoChannel = yield simplediscordbot_1.GuildManager.channel.text.find(HDFR_1.HDFRChannelID.message_admin);
                if (!modoChannel)
                    return;
                if (message.partial) {
                    const fields = [
                        { value: `ERROR : Le message ayant été envoyé avant que le bot démarre, il est impossible de récupérer les informations de ce message` },
                    ];
                    simplediscordbot_1.ComponentManager.fields(container, fields);
                    yield simplediscordbot_1.Bot.message.send(modoChannel, simplediscordbot_1.ComponentManager.toMessage(container));
                    return;
                }
                if (!message.author)
                    return;
                if (!message.member || MemberManager_1.MemberManager.isStaff(message.member)) {
                    return;
                }
                if (message.attachments.size > 0) {
                    const fields = [
                        { value: `Auteur : <@${message.author.id}> (${message.author.displayName} : ${message.author.id})`, separator: false },
                        { value: `Environ du message : ${message.url}`, separator: false },
                        { value: `Attachements : ${message.attachments.size}`, separator: false },
                        { value: `Contenu : "${(_a = message.content) === null || _a === void 0 ? void 0 : _a.slice(0, 60)}"`, separator: discord_js_1.SeparatorSpacingSize.Large }
                    ];
                    simplediscordbot_1.ComponentManager.fields(container, fields);
                    const msg = yield simplediscordbot_1.Bot.message.send(modoChannel, simplediscordbot_1.ComponentManager.toMessage(container));
                    const option = {
                        name: message.author.displayName,
                        reason: "Automatique thread"
                    };
                    const thread = yield (msg === null || msg === void 0 ? void 0 : msg.startThread(option));
                    if (!thread)
                        return;
                    const buffer = yield MessageManager_1.MessageManager.getAttachementBuffer(message);
                    yield simplediscordbot_1.Bot.message.send(thread, simplediscordbot_1.EmbedManager.simple(message.content));
                    yield MessageManager_1.MessageManager.sendAttachement(buffer, thread);
                }
            }
            catch (e) {
            }
        });
    }
}
exports.AlertMessageDelete = AlertMessageDelete;
AlertMessageDelete._instance = null;
