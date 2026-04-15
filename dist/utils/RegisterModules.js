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
exports.RegisterModules = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const MiniGames_1 = require("../modules/mini-games/MiniGames");
const Statistics_1 = require("../modules/statistiques/Statistics");
const Status_1 = require("../modules/Status");
const HDFRPublicFunctionnalitites_1 = require("../modules/hdfr_public_functionnalities/HDFRPublicFunctionnalitites");
const HDFRPrivateFunctionnalitites_1 = require("../modules/hdfr_private_functionnalities/HDFRPrivateFunctionnalitites");
const ScheduleJobs_1 = require("../modules/hdfr_private_functionnalities/ScheduleJobs/ScheduleJobs");
class RegisterModules {
    constructor() {
        this.manager = discord_module_1.ModuleManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.register(new HDFRPrivateFunctionnalitites_1.HDFRPrivateFunctionnalitites());
            this.manager.register(new HDFRPublicFunctionnalitites_1.HDFRPublicFunctionnalitites());
            this.manager.register(new MiniGames_1.MiniGames());
            this.manager.register(new Statistics_1.Statistics());
            this.manager.register(new Status_1.Status());
            this.manager.register(new ScheduleJobs_1.ScheduleJobs());
            if (simplediscordbot_1.Bot.client && simplediscordbot_1.Bot.client.user) {
                this.manager.enableAll();
                //this.manager.sendUIToChannel(HDFRChannelID.module_et_auto)
            }
        });
    }
}
exports.RegisterModules = RegisterModules;
