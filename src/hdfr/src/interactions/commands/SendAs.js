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
exports.HDFRSendAs = void 0;
const sendas_1 = require("../../../../share/interactions/commands/sendas");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HDFRIntegrationList_1 = require("../../utils/hdfr_list/HDFRIntegrationList");
const automaton_lang_1 = require("./automaton_lang");
class HDFRSendAs extends sendas_1.SendAs {
    action(integrationName, message) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (integrationName) {
                case HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.name:
                    message = yield (0, automaton_lang_1.textIntoAutomaton)(message);
                    return new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.M4R4UD3R.avatarUrl);
                case HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.name:
                    return new simplediscordbot_1.WebhookManager(simplediscordbot_1.Bot.client, integrationName, HDFRIntegrationList_1.HDFRIntegrationList.AMIRAL_SUPER_TERRE.avatarUrl);
                default:
                    return;
            }
        });
    }
}
exports.HDFRSendAs = HDFRSendAs;
