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
const DetectHDFRCrash_1 = require("../modules/DetectHDFRCrash");
// FFW désactivé : le bot Shériff n'est plus lancé, le surveiller ne ferait que remonter des alertes « hors ligne »
//import {DetectFFWCrash} from "../modules/DetectFFWCrash";
class RegisterModules {
    constructor() {
        this.manager = discord_module_1.ModuleManager.createOrGetInstance(simplediscordbot_1.Bot.client);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.manager.register(new DetectHDFRCrash_1.DetectHDFRCrash());
            //this.manager.register(new DetectFFWCrash())
        });
    }
}
exports.RegisterModules = RegisterModules;
