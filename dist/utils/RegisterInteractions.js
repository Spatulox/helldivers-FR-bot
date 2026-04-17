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
const HandlersPath_1 = require("./HandlersPath");
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const DemocraticRouletteLogic_1 = require("../sub_games/DemocraticRoulette/DemocraticRouletteLogic");
const automaton_lang_1 = require("../interactions/commands/automaton_lang");
const liberthe_1 = require("../interactions/commands/liberthe");
const wiki_1 = require("../interactions/commands/wiki");
const sanction_1 = require("../interactions/commands/moderate_members/sanction");
const StratagemHeroLogic_1 = require("../sub_games/StratagemHero/StratagemHeroLogic");
const sendas_1 = require("../interactions/commands/sendas");
const gounie_1 = require("../interactions/commands/gounie");
const automaton_translate_1 = require("../interactions/context-menu/automaton_translate");
const delete_occurence_1 = require("../interactions/context-menu/delete_occurence");
const silent_report_1 = require("../interactions/context-menu/silent_report");
const ModerateMemberModal_1 = require("../interactions/modal/ModerateMemberModal");
const Gounie_1 = require("../interactions/modal/Gounie");
const WikiManager_1 = require("./Manager/WikiManager");
const SilentReportModal_1 = require("../interactions/modal/SilentReportModal");
const SilentReportSelectMenu_1 = require("../interactions/selectmenu/SilentReportSelectMenu");
class RegisterInteraction {
    constructor() {
        this.stratagemHeroLogic = new StratagemHeroLogic_1.StratagemHeroeLogic();
        this.democraticRoulette = new DemocraticRouletteLogic_1.DemocraticRouletteLogic();
        this.silentReportContextMenu = silent_report_1.SilentReportContextMenu;
        this.manager = discord_module_1.InteractionsManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        this.button();
        this.context_menu();
        this.modal();
        this.select_menu();
        this.slash();
    }
    slash() {
        return __awaiter(this, void 0, void 0, function* () {
            const senateurJson = yield HandlersPath_1.Handlers.load('commands', 'senateur');
            const sanctionJson = yield HandlersPath_1.Handlers.load('commands', 'sanction');
            const stratagemHeroJson = yield HandlersPath_1.Handlers.load('commands', 'stratagem_hero');
            const automatonJson = yield HandlersPath_1.Handlers.load('commands', 'automaton_lang');
            const liberteJson = yield HandlersPath_1.Handlers.load('commands', 'liberthe');
            const wikiJson = yield HandlersPath_1.Handlers.load('commands', 'wiki');
            const sendasJson = yield HandlersPath_1.Handlers.load('commands', 'sendas');
            const gounieJson = yield HandlersPath_1.Handlers.load('commands', 'gounie');
            this.manager.registerSlash(senateurJson.name, (interaction) => { return this.democraticRoulette.senateur(interaction); });
            this.manager.registerSlash(sanctionJson.name, sanction_1.sanction);
            this.manager.registerSlash(stratagemHeroJson.name, (interaction) => { return this.stratagemHeroLogic.stratagem_hero(interaction); });
            this.manager.registerSlash(automatonJson.name, automaton_lang_1.automaton_lang);
            this.manager.registerSlash(liberteJson.name, liberthe_1.liberthe);
            this.manager.registerSlash(wikiJson.name, wiki_1.wikiMenu);
            this.manager.registerSlash(sendasJson.name, sendas_1.send_as);
            this.manager.registerSlash(gounieJson.name, gounie_1.gounie);
        });
    }
    button() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.registerButton(StratagemHeroLogic_1.StratagemHeroeLogic.joinStratagemHeroButton, (interaction) => { this.stratagemHeroLogic.joinStratagem_hero(interaction); });
            this.manager.registerButton(StratagemHeroLogic_1.StratagemHeroeLogic.startGameButton, (interaction) => this.stratagemHeroLogic.startGame(interaction));
        });
    }
    context_menu() {
        return __awaiter(this, void 0, void 0, function* () {
            const automaton = yield HandlersPath_1.Handlers.load('context_menu', 'automaton_translate');
            const deleteoccurence = yield HandlersPath_1.Handlers.load('context_menu', 'delete_occurence');
            const silentreportmessage = yield HandlersPath_1.Handlers.load('context_menu', 'silent_report_message');
            const silentreportuser = yield HandlersPath_1.Handlers.load('context_menu', 'silent_report_user');
            this.manager.registerMessageContextMenus(automaton.name, automaton_translate_1.translateAutomaton);
            this.manager.registerMessageContextMenus(deleteoccurence.name, delete_occurence_1.delete_occurence_interaction);
            this.manager.registerMessageContextMenus(silentreportmessage.name, (interaction) => { this.silentReportContextMenu.silent_report_message(interaction); });
            this.manager.registerUserContextMenus(silentreportuser.name, (interaction) => { this.silentReportContextMenu.silent_report_user(interaction); });
        });
    }
    modal() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.registerModal("report_other", SilentReportModal_1.SilentReportModal.execute, discord_module_1.InteractionMatchType.START_WITH);
            this.manager.registerModal(ModerateMemberModal_1.ModerateMembersModal.TITLE, ModerateMemberModal_1.ModerateMembersModal.moderate);
            this.manager.registerModal(Gounie_1.GounieModal.TITLE, Gounie_1.GounieModal.gounie);
        });
    }
    select_menu() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.registerSelectMenu("report_", (interaction) => { SilentReportSelectMenu_1.SilentReportSelectMenu.silentReport(interaction); }, discord_module_1.InteractionMatchType.START_WITH);
            this.manager.registerSelectMenu("wikiThematic", WikiManager_1.WikiManager.dispatchWikiSelectMenu);
            this.manager.registerSelectMenu("wikiSubThematic", WikiManager_1.WikiManager.dispatchWikiSelectMenu);
            this.manager.registerSelectMenu("wikiSubject", WikiManager_1.WikiManager.dispatchWikiSelectMenu);
        });
    }
}
exports.RegisterInteraction = RegisterInteraction;
