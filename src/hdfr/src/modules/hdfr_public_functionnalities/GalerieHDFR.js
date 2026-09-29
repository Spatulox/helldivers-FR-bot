"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalerieHDFR = void 0;
const HDFR_1 = require("../../utils/hdfr_list/HDFR");
const HDFREmojis_1 = require("../../utils/hdfr_list/HDFREmojis");
const Galerie_1 = require("../../../../share/modules/Galerie");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
class GalerieHDFR extends Galerie_1.Galerie {
    get reactions() {
        return [HDFREmojis_1.HDFREmoji.love, HDFREmojis_1.HDFREmoji.bonhelldivers, HDFREmojis_1.HDFREmoji.xd, HDFREmojis_1.HDFREmoji.hitass];
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
