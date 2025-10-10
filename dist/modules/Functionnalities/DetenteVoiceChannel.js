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
exports.DetenteVoiceChannel = void 0;
const client_1 = require("../../utils/client");
const Modules_1 = require("../../utils/other/Modules");
const embeds_1 = require("../../utils/messages/embeds");
class DetenteVoiceChannel extends Modules_1.Module {
    constructor() {
        super("Detente Voice Channel", "Set the voice channel status when someone is joining the <#1155492225774534696> voice channel");
        //        prod                    dev
        this.voiceChannelId = ["1155492225774534696", "1215343151741403147"];
        this.string = "🚫 PAS DE HD2 ICI 🚫";
    }
    handleVoiceState(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            // join Vocal
            if (!oldState.channelId && newState.channelId && this.voiceChannelId.includes(newState.channelId)) {
                try {
                    const channel = yield client_1.client.channels.cache.get(newState.channelId);
                    if (channel && channel.type == 2 && channel.members.size > 1) {
                        return;
                    }
                    //console.log(`${newState.member?.user.username} a rejoint le vocal ${newState.channel?.name}`);
                    yield client_1.client.rest.put(`/channels/${this.voiceChannelId[0]}/voice-status`, { body: { status: this.string } });
                }
                catch (error) {
                    console.error(error);
                    (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)(`${error}`));
                    try {
                        yield client_1.client.rest.put(`/channels/${this.voiceChannelId[1]}/voice-status`, { body: { status: this.string } });
                    }
                    catch (error) {
                        console.error(error);
                        (0, embeds_1.sendEmbedToInfoChannel)((0, embeds_1.createErrorEmbed)("Impossible to set the status of a channel"));
                    }
                }
            }
            /*
            // Leave Vocal
            if (oldState.channelId && !newState.channelId) {
                console.log(`${oldState.member?.user.username} a quitté le vocal`);
            }
            
            // Change Vocal
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                console.log(`${newState.member?.user.username} a changé de vocal : ${oldState.channelId} → ${newState.channelId}`);
            }
            */
        });
    }
}
exports.DetenteVoiceChannel = DetenteVoiceChannel;
