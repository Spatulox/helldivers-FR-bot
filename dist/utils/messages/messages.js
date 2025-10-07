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
exports.crosspostMessage = crosspostMessage;
exports.sendMessage = sendMessage;
exports.sendMessageError = sendMessageError;
exports.sendMessageToInfoChannel = sendMessageToInfoChannel;
exports.sendMessageToAdminChannel = sendMessageToAdminChannel;
exports.sendMessageToOwner = sendMessageToOwner;
exports.sendMessageToPrivateUser = sendMessageToPrivateUser;
exports.replyAndDeleteReply = replyAndDeleteReply;
exports.isLastMessageInChannel = isLastMessageInChannel;
exports.containsEmoji = containsEmoji;
exports.containsOnlyEmoji = containsOnlyEmoji;
const config_json_1 = __importDefault(require("../../config.json"));
const log_1 = require("../other/log");
const channels_1 = require("../guilds/channels");
const embeds_1 = require("../messages/embeds");
const client_1 = require("../client");
const UnitTime_1 = require("../times/UnitTime");
//----------------------------------------------------------------------------//
function crosspostMessage(client, sentence, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let targetChannel = yield (0, channels_1.searchClientChannel)(client, channelId);
            if (!targetChannel) {
                return false;
            }
            try {
                const message = yield targetChannel.send(sentence);
                (0, log_1.log)(`INFO : Message posted : ${sentence.split('\n')[0]}`);
                try {
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
                catch (e) {
                    (0, log_1.log)("WARNING : Problème lors de la promise d'attente d'une secondes (postMessage)");
                }
                try {
                    yield message.crosspost();
                    (0, log_1.log)(`INFO : Crossposted message : ${sentence.split('\n')[0]}`);
                    return true;
                }
                catch (error) {
                    (0, embeds_1.sendEmbedErrorMessage)('ERROR when posting message : ' + error + `\n> - Message : ${message}\n> - TargetChannel : ${targetChannel}`, targetChannel);
                    (0, log_1.log)('ERROR : Error when posting message : ' + error);
                    return false;
                }
            }
            catch (error) {
                (0, log_1.log)('ERROR : Error when posting message : ' + error);
            }
            return true;
        }
        catch (e) {
            let msg = `ERROR : Impossible to find the channel to send the message : \n> ${sentence}\n\n> ${e}`;
            (0, log_1.log)(msg);
            try {
                const errorChannel = yield (0, channels_1.searchClientChannel)(client, config_json_1.default.errorChannel);
                if (errorChannel) {
                    (0, embeds_1.sendEmbed)((0, embeds_1.createErrorEmbed)(msg), errorChannel);
                }
                else {
                    (0, log_1.log)("ERROR : Impossible to execute the postMessage function, channel is false");
                }
            }
            catch (err) {
                (0, log_1.log)(`ERROR : [postMessage() - second try catch] : ${err}`);
            }
            return false;
        }
    });
}
//----------------------------------------------------------------------------//
function sendMessage(messageContent_1) {
    return __awaiter(this, arguments, void 0, function* (messageContent, targetChannel = "", messagetoConsole = true) {
        if (messagetoConsole)
            (0, log_1.log)("INFO : " + messageContent);
        let channelId = config_json_1.default.logChannelId;
        let channel;
        if (targetChannel) {
            if (typeof (targetChannel) === "string") {
                channel = yield (0, channels_1.searchClientChannel)(client_1.client, targetChannel);
            }
            else {
                channel = targetChannel;
            }
        }
        else {
            channel = yield (0, channels_1.searchClientChannel)(client_1.client, channelId);
        }
        try {
            if (!channel) {
                console.error(`Canal introuvable : ${targetChannel}`);
                return;
            }
            yield channel.send(messageContent);
        }
        catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        }
    });
}
//----------------------------------------------------------------------------//
function sendMessageError(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.errorChannel);
        if (channel) {
            (0, embeds_1.sendEmbedErrorMessage)(`${message}`, channel);
        }
        else {
            sendMessage(`${message}`);
        }
    });
}
//----------------------------------------------------------------------------//
function sendMessageToInfoChannel(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.helldiverLogChannel);
            if (channel) {
                sendMessage(message, channel);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
function sendMessageToAdminChannel(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = yield (0, channels_1.searchClientChannel)(client_1.client, config_json_1.default.adminChannel);
            if (channel) {
                sendMessage(message, channel);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
//----------------------------------------------------------------------------//
function sendMessageToOwner(message) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield sendMessageToPrivateUser(message, config_json_1.default.owner);
    });
}
function sendMessageToPrivateUser(message, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let messagetoSend;
        if ((0, embeds_1.isEmbed)(message)) {
            messagetoSend = (0, embeds_1.returnToSendEmbed)(message);
        }
        else {
            messagetoSend = message;
        }
        try {
            const user = yield client_1.client.users.fetch(user_id);
            yield user.send(messagetoSend);
            return true;
        }
        catch (e) {
            (0, log_1.log)("Failed to send private message, retrying");
            try {
                const user = yield client_1.client.users.fetch(config_json_1.default.owner);
                yield user.send(messagetoSend);
                (0, log_1.log)(`${message}`);
                return true;
            }
            catch (error) {
                (0, log_1.log)("Failed to send private message.");
                console.error(error);
            }
            return false;
        }
    });
}
//----------------------------------------------------------------------------//
function replyAndDeleteReply(message, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reply = yield message.reply((0, embeds_1.returnToSendEmbed)((0, embeds_1.createErrorEmbed)(msg)));
            setTimeout(() => {
                reply.delete().catch(() => { });
            }, UnitTime_1.Time.second.SEC_10.toMilliseconds());
        }
        catch (error) {
            console.error(error);
            (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`replyAndDeleteReply error ${error}`));
        }
    });
}
function isLastMessageInChannel(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const newerMessages = yield message.channel.messages.fetch({ after: message.id });
        if (newerMessages.size > 0) {
            return false;
        }
        return true;
    });
}
function containsEmoji(str) {
    const unicodeEmojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const discordEmojiRegex = /<a?:\w+:\d+>/g;
    return unicodeEmojiRegex.test(str) || discordEmojiRegex.test(str);
}
function containsOnlyEmoji(str) {
    const cleaned = str.replace(/\s/g, "");
    const unicodeEmojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const discordEmojiRegex = /<a?:\w+:\d+>/g;
    const globalRegex = new RegExp(`^(?:${discordEmojiRegex.source}|${unicodeEmojiRegex.source})+$`, "u");
    return globalRegex.test(cleaned);
}
