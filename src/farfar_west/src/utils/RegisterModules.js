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
const FFWPublicFunctionnalities_1 = require("../modules/ffw_public_functionnalities/FFWPublicFunctionnalities");
const FFWPrivateFunctionnalities_1 = require("../modules/ffw_private_functionnalities/FFWPrivateFunctionnalities");
const ScheduleJobs_1 = require("../modules/schedule_jobs/ScheduleJobs");
const TmpVoiceChannel_1 = require("../modules/ffw_private_functionnalities/VoiceChannel/TmpVoiceChannel");
class RegisterModules {
    constructor() {
        this.manager = discord_module_1.ModuleManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.manager.register(new FFWPrivateFunctionnalities_1.FFWPrivateFunctionnalities());
            this.manager.register(new FFWPublicFunctionnalities_1.FFWPublicFunctionnalities());
            this.manager.register(new ScheduleJobs_1.ScheduleJobs());
            if (simplediscordbot_1.Bot.client && simplediscordbot_1.Bot.client.user) {
                this.manager.enableAll();
                if (!simplediscordbot_1.BotEnv.dev) {
                    (_a = this.manager.getModule(new TmpVoiceChannel_1.FFWTmpVoiceChannel().name)) === null || _a === void 0 ? void 0 : _a.disable();
                }
            }
        });
    }
}
exports.RegisterModules = RegisterModules;
