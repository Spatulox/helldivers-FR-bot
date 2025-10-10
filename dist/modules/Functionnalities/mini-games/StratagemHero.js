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
exports.StratagemHero = void 0;
const Modules_1 = require("../../../utils/other/Modules");
const StratagemHeroLogic_1 = require("../../../sub_games/StratagemHero/StratagemHeroLogic");
const messages_1 = require("../../../utils/messages/messages");
//import config from "../../../config.json"
/**
 * This class only manager the StratagemHero module, not how the mini-games works
 */
class StratagemHero extends Modules_1.Module {
    constructor() {
        if (StratagemHero._instance) {
            return StratagemHero._instance;
        }
        super("Stratagem Code", "Module for the Stratagem Code mini-game");
        StratagemHero._instance = this;
    }
    static get instance() {
        return StratagemHero._instance;
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled)
                return;
            if (message.author.bot)
                return;
            const channel = message.channel;
            if (!channel || !channel.isThread()) {
                return;
            }
            /*if(channel.parentId == config.counterChannel){// || channel.parentId != "1227056196297560105"){
                return
            }*/
            const thread = channel;
            const parentMessageId = thread.id;
            if (!StratagemHeroLogic_1.StratagemHeroeLogic.games[parentMessageId]) {
                return;
            }
            if (StratagemHeroLogic_1.StratagemHeroeLogic.games[parentMessageId] &&
                StratagemHeroLogic_1.StratagemHeroeLogic.games[parentMessageId].thread_id == channel.id &&
                StratagemHeroLogic_1.StratagemHeroeLogic.games[parentMessageId].players.includes(message.author.id) &&
                (0, messages_1.containsOnlyEmoji)(message.content)) {
                new StratagemHeroLogic_1.StratagemHeroeLogic().resolveStratagem(message);
            }
            else {
                message.deletable && message.delete();
            }
        });
    }
}
exports.StratagemHero = StratagemHero;
StratagemHero._instance = null;
StratagemHero.lastStrataCode = null;
