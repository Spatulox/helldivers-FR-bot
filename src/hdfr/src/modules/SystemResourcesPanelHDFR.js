"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemResourcesPanelHDFR = void 0;
const SystemResourcesPanel_1 = require("../../../share/modules/SystemResourcesPanel");
const HDFR_1 = require("../utils/hdfr_list/HDFR");
class SystemResourcesPanelHDFR extends SystemResourcesPanel_1.SystemResourcesPanel {
    get channelId() {
        return HDFR_1.HDFR.channel.module_et_auto;
    }
}
exports.SystemResourcesPanelHDFR = SystemResourcesPanelHDFR;
