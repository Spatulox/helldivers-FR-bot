"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotResourcesPanelHDFR = void 0;
const BotResourcesPanel_1 = require("../../../share/modules/BotResourcesPanel");
const HDFR_1 = require("../utils/hdfr_list/HDFR");
class BotResourcesPanelHDFR extends BotResourcesPanel_1.BotResourcesPanel {
    get channelId() {
        return HDFR_1.HDFR.channel.module_et_auto;
    }
}
exports.BotResourcesPanelHDFR = BotResourcesPanelHDFR;
