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
exports.ReusableButtonsActions = void 0;
const discord_js_1 = require("discord.js");
const MessageManager_1 = require("../../managers/MessageManager");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
class ReusableButtonsActions {
    static validateMessage(dmContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dmContent) {
                return false;
            }
            return true;
        });
    }
    static tweakMessage(_dmContent) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static sendMessage(interaction, dmContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Envoyer en DM
                yield interaction.user.send(dmContent);
                yield interaction.reply({
                    content: "✅ Message dupliqué en DM !",
                    flags: discord_js_1.MessageFlags.Ephemeral
                });
            }
            catch (e) {
                try {
                    yield interaction.reply({
                        content: `❌ Impossible d'envoyer en DM (${e})`,
                        flags: discord_js_1.MessageFlags.Ephemeral
                    });
                }
                catch (e) {
                }
                console.error("Erreur DM:", e);
            }
        });
    }
    static duplicateMessageToDM(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dmContent = yield MessageManager_1.MessageManager.getMessageCreateOptionFromDiscordMessage(interaction.message);
                if (!(yield this.validateMessage(dmContent))) {
                    throw new Error("Message is not valid when duplicating it to DM");
                }
                yield this.tweakMessage(dmContent);
                yield this.sendMessage(interaction, dmContent);
            }
            catch (error) {
                yield simplediscordbot_1.Bot.log.error(`${error}`);
            }
        });
    }
}
exports.ReusableButtonsActions = ReusableButtonsActions;
ReusableButtonsActions.DUPLICATE_MSG_TO_DM = "duplicate_msg_to_dm";
