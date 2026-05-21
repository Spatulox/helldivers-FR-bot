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
exports.RegisterInteraction = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const HandlersPath_1 = require("../../../share/HandlersPath");
const BotType_1 = require("../../../share/BotType");
const sanction_1 = require("../../../share/interactions/commands/moderate_members/sanction");
const delete_occurence_1 = require("../../../share/interactions/context-menu/delete_occurence");
const ModerateMemberModal_1 = require("../../../share/interactions/modal/ModerateMemberModal");
class RegisterInteraction {
    constructor() {
        this.manager = discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        this.button();
        this.context_menu();
        this.modal();
        this.select_menu();
        this.slash();
    }
    slash() {
        return __awaiter(this, void 0, void 0, function* () {
            const sanctionJson = yield HandlersPath_1.Handlers.load(BotType_1.BotType.FARFAR_WEST, 'commands', 'sanction');
            this.manager.registerSlash(sanctionJson.name, sanction_1.sanction);
        });
    }
    button() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    context_menu() {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteoccurence = yield HandlersPath_1.Handlers.load(BotType_1.BotType.FARFAR_WEST, 'context_menu', 'delete_occurence');
            this.manager.registerMessageContextMenus(deleteoccurence.name, delete_occurence_1.delete_occurence_interaction);
        });
    }
    modal() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.registerModal(ModerateMemberModal_1.ModerateMembersModal.TITLE, ModerateMemberModal_1.ModerateMembersModal.moderate);
        });
    }
    select_menu() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.RegisterInteraction = RegisterInteraction;
