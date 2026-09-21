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
exports.SystemResourcesPanel = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const SystemResources_1 = require("../utils/SystemResources");
/**
 * Persistent panel showing the machine resources (CPU, memory, disk, uptime), refreshed in place.
 *
 * Each server subclasses it and only provides its target channel. The readings themselves come
 * from share/utils/SystemResources.ts, which any other module can import directly : this module is
 * only the display side.
 */
class SystemResourcesPanel extends discord_module_1.ModuleWithCachedMessage {
    get events() {
        return {};
    }
    /** Override it in a subclass to use another refresh rate */
    get refreshInterval() {
        return simplediscordbot_1.Time.minute.MIN_02.toMilliseconds();
    }
    initData() {
        return {
            channel_id: this.channelId,
            message_id: ""
        };
    }
    constructor() {
        super();
        this.name = "System Resources";
        this.description = "Machine resources panel (CPU, memory, disk), refreshed every 2 minutes";
        this.cacheKey = "system_resources";
        this.ready = this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Started first so the history begins filling while the cache loads.
            (0, SystemResources_1.startSampling)();
            yield this.loadCache();
            this.cacheData.channel_id = this.channelId;
            yield this.writeCache();
            this.scheduleFirstRender();
            this.startRefreshing();
        });
    }
    /**
     * The sampler starts empty, so the render loadCache() does on its own can only show the
     * placeholder. Waiting for the regular cycle would leave the panel on it for a full
     * refreshInterval after every restart : this one shot render fills it as soon as the history
     * holds a few points.
     */
    scheduleFirstRender() {
        setTimeout(() => {
            if (!this.enabled) {
                return;
            }
            void this.refresh();
        }, SystemResourcesPanel.FIRST_RENDER_DELAY_MS);
    }
    /**
     * The timer is armed once and each tick checks this.enabled, instead of being cleared on
     * disable : the ModuleUI toggles a module through toggle(), which flips the enabled flag
     * without going through enable()/disable(), so a timer disarmed in disable() would survive a
     * toggle coming from the panel.
     */
    startRefreshing() {
        setInterval(() => {
            if (!this.enabled) {
                return;
            }
            void this.refresh();
        }, this.refreshInterval);
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            yield this.triggerUpdateMessage();
        });
    }
    enable() {
        super.enable();
        void this.refresh();
    }
    toggle() {
        super.toggle();
        if (this.enabled) {
            void this.refresh();
        }
    }
    getChannel() {
        return simplediscordbot_1.GuildManager.channel.any.find(this.channelId);
    }
    buildMessage() {
        return {
            components: this.createComponents(),
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        };
    }
    editMessage() {
        return {
            components: this.createComponents(),
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        };
    }
    createComponents() {
        const container = simplediscordbot_1.ComponentManager.create({
            title: `# ${this.name}`,
            description: `Machine resources, updated every ${this.refreshInterval / simplediscordbot_1.Time.minute.MIN_01.toMilliseconds()} minutes`,
            color: simplediscordbot_1.SimpleColor.transparent,
            separator: discord_js_1.SeparatorSpacingSize.Large
        });
        const reading = (0, SystemResources_1.readSampledResources)();
        if (!reading.ready) {
            simplediscordbot_1.ComponentManager.field(container, { value: "Measuring...", separator: false });
            return [container];
        }
        const cpu = reading.cpu.stats;
        const memory = reading.memory.stats;
        // Both curves in a single TextDisplay : ChartManager pads the labels so they start at the
        // same column, which a separate call per curve would not do.
        container.addTextDisplayComponents(simplediscordbot_1.ChartManager.sparklines([
            { label: "CPU", values: this.curve(cpu) },
            { label: "Memory", values: this.curve(memory) }
        ], SystemResourcesPanel.CURVE_OPTIONS));
        simplediscordbot_1.ComponentManager.fields(container, [
            { value: `**CPU :** avg ${cpu.average} % · peak ${cpu.max} %`, separator: false },
            { value: `> - ${reading.cpu.model}\n` +
                    `> - ${reading.cpu.cores} core${reading.cpu.cores > 1 ? "s" : ""} · load average ${reading.cpu.loadAverage.map(load => load.toFixed(2)).join(" / ")}`, separator: false },
            { value: `**Memory :** ${(0, SystemResources_1.formatBytes)(reading.memory.used)} used out of ${(0, SystemResources_1.formatBytes)(reading.memory.total)} · peak ${memory.max} %`, separator: false },
        ]);
        if (reading.disk) {
            // A gauge and not a curve : one disk reading per minute does not make a series.
            container.addTextDisplayComponents(simplediscordbot_1.ChartManager.progressBar("Disk", reading.disk.percent, 100, SystemResourcesPanel.GAUGE_OPTIONS));
            simplediscordbot_1.ComponentManager.field(container, { value: `> - ${(0, SystemResources_1.formatBytes)(reading.disk.used)} used out of ${(0, SystemResources_1.formatBytes)(reading.disk.total)}\n` +
                    `> - ${(0, SystemResources_1.formatBytes)(reading.disk.free)} available on \`${reading.disk.path}\``, separator: false });
        }
        simplediscordbot_1.ComponentManager.fields(container, [
            { value: `**Uptime :** ${(0, SystemResources_1.formatDuration)(reading.machine.uptimeSeconds)} (${this.discordTimestamp(reading.machine.bootTime, "R")})`, separator: discord_js_1.SeparatorSpacingSize.Large },
            { value: `> - ${reading.machine.hostname} · ${reading.machine.platform} ${reading.machine.release} · ${reading.machine.arch}`, separator: false },
            { value: `**Last update :** ${this.discordTimestamp(reading.date, "F")}`, separator: false },
        ]);
        return [container];
    }
    /**
     * Points of one curve, over the whole window.
     *
     * The last point is forced to the current sample instead of keeping its bucket average :
     * ChartManager prints the end of the series next to the curve, and that number has to be the
     * current value. A five second average could differ wildly from it — a spike in the last
     * second would print 44.5 % next to a machine actually running at 80 %.
     */
    curve(stats) {
        const points = (0, SystemResources_1.foldSamples)(stats.samples, SystemResourcesPanel.CURVE_POINTS);
        if (points.length > 0) {
            points[points.length - 1] = stats.current;
        }
        return points;
    }
    discordTimestamp(date, style) {
        return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
    }
}
exports.SystemResourcesPanel = SystemResourcesPanel;
/** Delay of the catch up render posted after a start, see scheduleFirstRender() */
SystemResourcesPanel.FIRST_RENDER_DELAY_MS = simplediscordbot_1.Time.second.SEC_10.toMilliseconds();
/** Points of a curve : the history is folded into that many buckets before being drawn */
SystemResourcesPanel.CURVE_POINTS = 24;
/**
 * Fixed 0-100 scale, never fitted on the min and max of the series : an idle machine must draw
 * a flat line at the bottom, not a lively curve made of noise, and two successive renders must
 * stay comparable.
 */
SystemResourcesPanel.CURVE_OPTIONS = {
    min: 0,
    max: 100,
    maxPoints: SystemResourcesPanel.CURVE_POINTS,
    showValue: true,
    unit: "%",
    decimals: 1,
    codeBlock: true
};
SystemResourcesPanel.GAUGE_OPTIONS = {
    width: 24,
    codeBlock: true
};
