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
exports.GalerieHDFR = void 0;
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const HDFREmojis_1 = require("../../utils/hdfr_list/HDFREmojis");
const Galerie_1 = require("../../../../share/modules/Galerie");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
class GalerieHDFR extends Galerie_1.Galerie {
    reactToMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield message.react(HDFREmojis_1.HDFREmoji.love);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_love`));
            }
            try {
                yield message.react(HDFREmojis_1.HDFREmoji.bonhelldivers);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_bonhelldivers`));
            }
            try {
                yield message.react(HDFREmojis_1.HDFREmoji.xd);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_xd`));
            }
            try {
                yield message.react(HDFREmojis_1.HDFREmoji.hitass);
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`${e} : HD2FR_HITASS`));
            }
        });
    }
    get galerieChannel() {
        return HDFR_1.HDFR.channel.galerie;
    }
    get guildId() {
        return HDFR_1.HDFR.guildID;
    }
    isModerator(_member) {
        return GlobalMemberManager_1.GlobalMemberManager.HDFR.isModerator(_member);
    }
}
exports.GalerieHDFR = GalerieHDFR;
