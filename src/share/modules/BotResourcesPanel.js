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
exports.BotResourcesPanel = void 0;
const discord_js_1 = require("discord.js");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const discord_module_1 = require("@spatulox/discord-module");
const BotResources_1 = require("../utils/BotResources");
/**
 * Persistent panel showing the resources of THIS bot process (CPU, memory, uptime), refreshed in
 * place. Nothing here describes the machine : it only provides the denominators the process numbers
 * are read against (core count, total RAM).
 *
 * Each server subclasses it and only provides its target channel. The readings themselves come
 * from share/utils/BotResources.ts, which any other module can import directly : this module is
 * only the display side.
 */
class BotResourcesPanel extends discord_module_1.ModuleWithCachedMessage {
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
        this.name = "Bot Resources";
        this.description = "Resources of this bot process (CPU, memory, uptime), refreshed every 2 minutes";
        /**
         * Kept as is although the module was renamed : this key holds the id of the panel message
         * already posted. Changing it would post a second panel and leave the first one orphaned.
         */
        this.cacheKey = "system_resources";
        /** Date of the next tick of the refresh timer, null until the timer is armed */
        this.nextRefreshAt = null;
        this.ready = this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Started first so the history begins filling while the cache loads.
            (0, BotResources_1.startSampling)();
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
        }, BotResourcesPanel.FIRST_RENDER_DELAY_MS);
    }
    /**
     * The timer is armed once and each tick checks this.enabled, instead of being cleared on
     * disable : the ModuleUI toggles a module through toggle(), which flips the enabled flag
     * without going through enable()/disable(), so a timer disarmed in disable() would survive a
     * toggle coming from the panel.
     */
    startRefreshing() {
        this.nextRefreshAt = new Date(Date.now() + this.refreshInterval);
        setInterval(() => {
            // Updated before the enabled check : the timer keeps ticking while the module is off.
            this.nextRefreshAt = new Date(Date.now() + this.refreshInterval);
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
            description: `Resources of this bot process, updated every ${this.refreshInterval / simplediscordbot_1.Time.minute.MIN_01.toMilliseconds()} minutes`,
            color: simplediscordbot_1.SimpleColor.transparent,
            separator: discord_js_1.SeparatorSpacingSize.Large
        });
        const reading = (0, BotResources_1.readSampledBotResources)();
        if (!reading.ready) {
            simplediscordbot_1.ComponentManager.field(container, { value: "Measuring...", separator: false });
            return [container];
        }
        const cpu = reading.cpu.stats;
        const memory = reading.memory.stats;
        // Both curves in a single TextDisplay : ChartManager pads the labels so they start at the
        // same column, which a separate call per curve would not do. The scales differ, hence the
        // per row options, which override the shared ones.
        container.addTextDisplayComponents(simplediscordbot_1.ChartManager.sparklines([
            {
                label: "CPU",
                values: this.curve(cpu),
                options: { min: 0, max: this.cpuScale(cpu.max, reading.cpu.cores), unit: "%", decimals: 1 }
            },
            {
                label: "Memory",
                values: this.curve(memory, bytes => Math.round(bytes / BotResourcesPanel.MEGABYTE)),
                options: { min: 0, max: this.memoryScale(memory.max), unit: "MB", decimals: 0 }
            }
        ], BotResourcesPanel.CURVE_OPTIONS));
        simplediscordbot_1.ComponentManager.fields(container, [
            { value: `**CPU :** avg ${cpu.average} % · peak ${cpu.max} % · 100 % = 1 core out of ${reading.cpu.cores}`, separator: false },
            { value: `> - ${this.cpuTime(reading.cpu.totalMs)} of CPU time since the start\n` +
                    `> - ${reading.cpu.model}`, separator: false },
            // rss and not the heap : the tesseract worker and the sharp threadpool only show there.
            { value: `**Memory :** RSS ${(0, BotResources_1.formatBytes)(reading.memory.rss)} (${reading.memory.share} % of ${(0, BotResources_1.formatBytes)(reading.memory.machineTotal)}) · peak ${(0, BotResources_1.formatBytes)(memory.max)}`, separator: false },
            { value: `> - main thread heap ${(0, BotResources_1.formatBytes)(reading.memory.heapUsed)} used out of ${(0, BotResources_1.formatBytes)(reading.memory.heapTotal)} · external ${(0, BotResources_1.formatBytes)(reading.memory.external)}`, separator: false },
        ]);
        simplediscordbot_1.ComponentManager.fields(container, [
            { value: `**Uptime :** ${(0, BotResources_1.formatDuration)(reading.process.uptimeSeconds)} (${this.discordTimestamp(reading.process.startTime, "R")})`, separator: discord_js_1.SeparatorSpacingSize.Large },
            { value: `> - PID ${reading.process.pid} · node ${reading.process.nodeVersion} · ${reading.process.hostname}`, separator: false },
            { value: `**Last update :** ${this.discordTimestamp(reading.date, "F")}`, separator: false },
        ]);
        // Relative timestamp : Discord renders "in 2 minutes" and counts it down on its own.
        if (this.nextRefreshAt) {
            simplediscordbot_1.ComponentManager.field(container, { value: `**Next refresh :** ${this.discordTimestamp(this.nextRefreshAt, "R")}`, separator: false });
        }
        return [container];
    }
    /**
     * High bound of the CPU curve, in percent of one core.
     *
     * A fixed 0-cores*100 scale was tempting but unreadable : on 12 cores an idle bot at 4 % would
     * always draw a flat line at the very bottom, and even a saturated core would only reach 8 % of
     * the height. Starting at one core and growing by whole cores keeps a quiet bot legible while
     * still showing an OCR burst — which does go past 100 %, tesseract runs on a worker thread.
     */
    cpuScale(peak, cores) {
        return Math.min(cores * 100, Math.max(100, Math.ceil(peak / 100) * 100));
    }
    /**
     * High bound of the memory curve, in megabytes. Same reasoning : a share of the machine RAM
     * would read 1.3 % on a 32 GB host and flatten the curve, so the scale follows the process.
     */
    memoryScale(peakBytes) {
        const peak = peakBytes / BotResourcesPanel.MEGABYTE;
        return Math.max(256, Math.ceil(peak / 128) * 128);
    }
    /** formatDuration() stops at the minute, which would print "00m" for a freshly started bot */
    cpuTime(totalMs) {
        const seconds = totalMs / 1000;
        return seconds < 60 ? `${seconds.toFixed(1)} s` : (0, BotResources_1.formatDuration)(seconds);
    }
    /**
     * Points of one curve, over the whole window.
     *
     * The last point is forced to the current sample instead of keeping its bucket average :
     * ChartManager prints the end of the series next to the curve, and that number has to be the
     * current value. A five second average could differ wildly from it — a spike in the last
     * second would print 44.5 % next to a bot actually running at 80 %.
     */
    curve(stats, transform = value => value) {
        const points = (0, BotResources_1.foldSamples)(stats.samples, BotResourcesPanel.CURVE_POINTS).map(transform);
        if (points.length > 0) {
            points[points.length - 1] = transform(stats.current);
        }
        return points;
    }
    discordTimestamp(date, style) {
        return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
    }
}
exports.BotResourcesPanel = BotResourcesPanel;
/** Delay of the catch up render posted after a start, see scheduleFirstRender() */
BotResourcesPanel.FIRST_RENDER_DELAY_MS = simplediscordbot_1.Time.second.SEC_10.toMilliseconds();
/** Points of a curve : the history is folded into that many buckets before being drawn */
BotResourcesPanel.CURVE_POINTS = 24;
BotResourcesPanel.MEGABYTE = 1024 * 1024;
/**
 * Scales are computed per curve (see cpuScale/memoryScale) : the two series no longer share a
 * unit, so only what is common to both lives here.
 */
BotResourcesPanel.CURVE_OPTIONS = {
    maxPoints: BotResourcesPanel.CURVE_POINTS,
    showValue: true,
    codeBlock: true
};
