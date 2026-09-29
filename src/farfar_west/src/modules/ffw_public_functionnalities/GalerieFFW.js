"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalerieFFW = void 0;
const Galerie_1 = require("../../../../share/modules/Galerie");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const FFW_1 = require("../../utils/ffw_list/FFW");
class GalerieFFW extends Galerie_1.Galerie {
    get galerieChannel() {
        return FFW_1.FFW.channel.galerie;
    }
    get guildId() {
        return FFW_1.FFW.guildID;
    }
    isModerator(_member) {
        return GlobalMemberManager_1.GlobalMemberManager.FFW.isModerator(_member);
    }
}
exports.GalerieFFW = GalerieFFW;
