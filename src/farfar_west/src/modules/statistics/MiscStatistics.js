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
exports.MiscStatistics = void 0;
const discord_module_1 = require("@spatulox/discord-module");
class MiscStatistics extends discord_module_1.ModuleWithStaticCache {
    get events() {
        return {};
    }
    constructor() {
        super();
        this.name = "Misc Statistics";
        this.description = "Miscellaneous stats for the bot/discord";
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield MiscStatistics.loadCache();
        });
    }
    static get cache() {
        return MiscStatistics.cacheData;
    }
    static incrementAutoBanScam() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.cacheData.auto_kill_count = this.cacheData.auto_kill_count + 1;
                yield this.writeCache();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.MiscStatistics = MiscStatistics;
MiscStatistics.cacheKey = "misc_stats";
MiscStatistics.cacheData = { auto_kill_count: 0 };
