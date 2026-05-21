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
exports.GalerieFFW = void 0;
const Galerie_1 = require("../../../../share/modules/Galerie");
const GlobalMemberManager_1 = require("../../../../share/managers/GlobalMemberManager");
const FFW_1 = require("../../utils/ffw_list/FFW");
class GalerieFFW extends Galerie_1.Galerie {
    reactToMessage(_message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
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
