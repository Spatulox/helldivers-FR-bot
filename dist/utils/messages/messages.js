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
exports.sendMessageToInfoChannel = sendMessageToInfoChannel;
exports.sendMessageToOwner = sendMessageToOwner;
const config_json_1 = __importDefault(require("../../config.json"));
const log_1 = require("../log");
const channels_1 = require("../guilds/channels");
const embeds_1 = require("../messages/embeds");
const client_1 = require("../client");
//----------------------------------------------------------------------------//
function crosspostMessage(client_2, sentence_1, channelId_1) {
    return __awaiter(this, arguments, void 0, function* (client, sentence, channelId, reactions = "default") {
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
    return __awaiter(this, arguments, void 0, function* (messageContent, targetChannel = "") {
        (0, log_1.log)("INFO : " + messageContent);
        let channelId = config_json_1.default.logChannelId;
        let channel;
        if (targetChannel) {
            if (typeof (targetChannel) === "string") {
                channel = yield (0, channels_1.searchClientChannel)(client_1.client, channelId);
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
function sendMessageToInfoChannel(message) {
    return __awaiter(this, void 0, void 0, function* () {
        sendMessage(message, config_json_1.default.logChannelId);
    });
}
//----------------------------------------------------------------------------//
function sendMessageToOwner(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield client_1.client.users.fetch(config_json_1.default.owner);
            yield user.send(`${message}`);
            (0, log_1.log)(`${message}`);
            return;
        }
        catch (error) {
            const user = yield client_1.client.users.fetch(config_json_1.default.owner);
            yield user.send(`${message}`);
            (0, log_1.log)(`${message}`);
        }
    });
}
//----------------------------------------------------------------------------//
