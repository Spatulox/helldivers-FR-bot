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
exports.searchClientChannel = searchClientChannel;
exports.searchMessageChannel = searchMessageChannel;
//----------------------------------------------------------------------------//
function searchClientChannel(client, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const channel = client.channels.cache.get(channelId) || (yield client.channels.fetch(channelId));
            if ((channel === null || channel === void 0 ? void 0 : channel.isTextBased()) && 'send' in channel) {
                return channel;
            }
            return null;
        }
        catch (e) {
            (`ERROR : Impossible to fetch the channel : ${channelId}\n> ${e}`);
            return null;
        }
    });
}
function searchMessageChannel(message, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!message.guild) {
                console.log("ERROR : Message n'est pas dans un serveur ????? WTH");
                return null;
            }
            if (channelId && typeof channelId !== 'string') {
                console.log(`ERROR : channelId invalide : ${channelId}`);
                return null;
            }
            return message.guild.channels.cache.get(channelId) || (yield message.guild.channels.fetch(channelId)); // || message.channel
        }
        catch (e) {
            console.log(`ERROR : Impossible to fetch the channel : ${channelId}\n> ${e}`);
            return null;
        }
    });
}
