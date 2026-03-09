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
exports.VoiceChannelDescription = void 0;
const Modules_1 = require("../../Modules");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFR_1 = require("../../../utils/HDFR");
class VoiceChannelDescription extends Modules_1.Module {
    get voiceChannels() {
        return {
            [HDFR_1.HDFRChannelID.detente]: this.string,
        };
    }
    constructor() {
        if (VoiceChannelDescription._instance) {
            return VoiceChannelDescription._instance;
        }
        super("Voice Channel Description", "Set the voice channel status when someone is joining certain voice channel");
        //        prod                    dev
        //private readonly voiceChannelId: string[] = ["1155492225774534696", "1215343151741403147"];
        this.string = "🚫 PAS DE HD2 ICI 🚫";
        VoiceChannelDescription._instance = this;
    }
    static get instance() {
        return VoiceChannelDescription._instance;
    }
    handleVoiceState(oldState, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.enabled) {
                return;
            }
            if (((_a = newState.channel) === null || _a === void 0 ? void 0 : _a.guildId) != HDFR_1.HDFRChannelID.guildID) {
                return;
            }
            // join Vocal
            if (!oldState.channelId && newState.channelId && this.voiceChannels[newState.channelId]) {
                yield this.updateStatus(newState.channelId);
            }
            /*
            // Leave Vocal
            if (oldState.channelId && !newState.channelId) {
                console.log(`${oldState.member?.user.username} a quitté le vocal`);
            }
            */
            // Change Vocal
            if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                this.updateStatus(newState.channelId);
            }
        });
    }
    updateStatus(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chanString = this.voiceChannels[channelID];
                if (chanString) {
                    const channel = yield simplediscordbot_1.Bot.client.channels.cache.get(channelID);
                    if (channel && channel.type == 2 && channel.members.size > 1) {
                        return;
                    }
                    yield simplediscordbot_1.Bot.client.rest.put(`/channels/${channelID}/voice-status`, { body: { status: chanString } });
                }
            }
            catch (error) {
                console.error(error);
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error("Impossible to set the status of a channel"));
            }
        });
    }
}
exports.VoiceChannelDescription = VoiceChannelDescription;
VoiceChannelDescription._instance = null;
