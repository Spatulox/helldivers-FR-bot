"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBanScamFFW = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const NeRienEcrireIciDetection_1 = require("../../../../../share/modules/AutoBanScam/NeRienEcrireIciDetection");
const Mee6WarningCleanup_1 = require("../../../../../share/modules/AutoBanScam/Mee6WarningCleanup");
const MultipleImagesDetection_1 = require("../../../../../share/modules/AutoBanScam/MultipleImagesDetection");
const AutoBanScamInterfaceFFW_1 = require("./AutoBanScamInterfaceFFW");
const AutoBanScamConfigFFW_1 = require("./AutoBanScamConfigFFW");
// Pas de RepeatedSpamDetection sur FFW (non demandé)
class AutoBanScamFFW extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam";
        this.description = "Anti-scam protection: warning panel and every scam detection";
        this.ui = new AutoBanScamInterfaceFFW_1.AutoBanScamInterfaceFFW(AutoBanScamConfigFFW_1.autoBanScamConfigFFW);
        this.neRienEcrireIci = new NeRienEcrireIciDetection_1.NeRienEcrireIciDetection(AutoBanScamConfigFFW_1.autoBanScamConfigFFW);
        this.multipleImages = new MultipleImagesDetection_1.MultipleImagesDetection(AutoBanScamConfigFFW_1.autoBanScamConfigFFW);
        this.mee6Cleanup = new Mee6WarningCleanup_1.Mee6WarningCleanup(AutoBanScamConfigFFW_1.autoBanScamConfigFFW);
        this.subModules = [
            this.ui,
            this.neRienEcrireIci,
            this.multipleImages,
            this.mee6Cleanup,
        ];
    }
}
exports.AutoBanScamFFW = AutoBanScamFFW;
