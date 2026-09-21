"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoBanScamHDFR = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const NeRienEcrireIciDetection_1 = require("../../../../../share/modules/AutoBanScam/NeRienEcrireIciDetection");
const RepeatedSpamDetection_1 = require("../../../../../share/modules/AutoBanScam/RepeatedSpamDetection");
const Mee6WarningCleanup_1 = require("../../../../../share/modules/AutoBanScam/Mee6WarningCleanup");
const ScamImageAnalysisDebug_1 = require("../../../../../share/modules/AutoBanScam/ScamImageAnalysisDebug");
const AutoBanScamInterfaceHDFR_1 = require("./AutoBanScamInterfaceHDFR");
const AutoBanScamConfigHDFR_1 = require("./AutoBanScamConfigHDFR");
class AutoBanScamHDFR extends discord_module_1.MultiModule {
    constructor() {
        super(...arguments);
        this.name = "AutoBanScam";
        this.description = "Anti-scam protection: warning panel and every scam detection";
        this.ui = new AutoBanScamInterfaceHDFR_1.AutoBanScamInterfaceHDFR(AutoBanScamConfigHDFR_1.autoBanScamConfigHDFR);
        this.neRienEcrireIci = new NeRienEcrireIciDetection_1.NeRienEcrireIciDetection(AutoBanScamConfigHDFR_1.autoBanScamConfigHDFR);
        // Déclaré avant repeatedSpam : les initialiseurs de propriétés s'exécutent dans l'ordre de déclaration.
        // Version prod (ScamImageAnalysis, qui court-circuite l'OCR dès que l'empreinte est connue) : non
        // branchée le temps du debug. Les deux ne doivent jamais tourner ensemble, elles partagent la banque.
        this.imageAnalysisDebug = new ScamImageAnalysisDebug_1.ScamImageAnalysisDebug();
        this.repeatedSpam = new RepeatedSpamDetection_1.RepeatedSpamDetection(AutoBanScamConfigHDFR_1.autoBanScamConfigHDFR, this.imageAnalysisDebug);
        this.mee6Cleanup = new Mee6WarningCleanup_1.Mee6WarningCleanup(AutoBanScamConfigHDFR_1.autoBanScamConfigHDFR);
        this.subModules = [
            this.ui,
            this.neRienEcrireIci,
            this.imageAnalysisDebug,
            this.repeatedSpam,
            this.mee6Cleanup,
        ];
    }
}
exports.AutoBanScamHDFR = AutoBanScamHDFR;
