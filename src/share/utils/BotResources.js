"use strict";
/**
 * Bot process resources reading API.
 *
 * Pure utility : no Module, no Discord, no dependency to install (node:os + node:process only).
 * Any module of any bot can import these functions to read the state of its own process.
 *
 * Everything here is scoped to THIS process, never to the machine : the CPU comes from
 * process.cpuUsage(), the memory from process.memoryUsage() and the uptime from process.uptime().
 * node:os is only kept for the denominators the process numbers are read against — core count,
 * CPU model, total RAM, hostname.
 *
 * Two ways in :
 *  - readBotCpu() / readBotMemory() / readBotProcess() read the process right now, for a one shot
 *    need. No setup required.
 *  - startSampling() then readSampledBotResources() serve a continuously collected history, with an
 *    average, a peak and a curve over the last two minutes. See the sampler section below.
 *
 * Every size is returned in raw bytes : formatting is a separate concern, handled by the
 * formatBytes() / formatDuration() helpers at the bottom of this file, so a caller is free to
 * apply its own thresholds and comparisons on the raw numbers. Gauges and curves are drawn by
 * ChartManager of @spatulox/simplediscordbot, foldSamples() only shapes the series for it.
 *
 * What "the process" covers, which is not obvious : getrusage(RUSAGE_SELF), behind
 * process.cpuUsage(), sums EVERY thread of the process, and rss covers the whole shared address
 * space. The tesseract.js worker (worker_threads, see ImageOcr.ts) and the libuv threadpool sharp
 * runs on are therefore both counted. heapUsed / heapTotal / external are the exception : they only
 * describe the V8 isolate of the MAIN thread, so a worker allocating 200 MB leaves them flat and
 * only moves rss. Whenever both are shown, rss is the headline and the heap is labelled as such.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBotCpu = readBotCpu;
exports.readBotMemory = readBotMemory;
exports.readBotProcess = readBotProcess;
exports.startResourceWindow = startResourceWindow;
exports.startSampling = startSampling;
exports.stopSampling = stopSampling;
exports.isSampling = isSampling;
exports.readSampledBotResources = readSampledBotResources;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.foldSamples = foldSamples;
const node_os_1 = __importDefault(require("node:os"));
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
/**
 * process.cpuUsage() only exposes counters cumulated since the process start : a single call is
 * useless, the usage can only be computed from the delta between two snapshots.
 *
 * The reference snapshot is shared and refreshed at most every CPU_WINDOW_MS, so several modules
 * reading the CPU one after the other do not steal each other's measurement window (the second
 * caller would otherwise get a delta of a few milliseconds, hence a meaningless value).
 */
const CPU_WINDOW_MS = simplediscordbot_1.Time.second.SEC_05.toMilliseconds();
let cpuReference = takeCpuSnapshot();
let lastCpuPercent = 0;
let lastCpuPercentDate = 0;
function takeCpuSnapshot() {
    const usage = process.cpuUsage();
    return { user: usage.user, system: usage.system, at: Date.now() };
}
/**
 * The core count and the CPU model never change, but os.cpus() rebuilds the whole array (model
 * strings included) on every call, which is the expensive part of it : read them once.
 */
let staticCpu = null;
function readStaticCpu() {
    var _a, _b;
    if (staticCpu === null) {
        const cpus = node_os_1.default.cpus();
        staticCpu = {
            cores: cpus.length,
            model: (_b = (_a = cpus[0]) === null || _a === void 0 ? void 0 : _a.model.trim()) !== null && _b !== void 0 ? _b : "unknown"
        };
    }
    return staticCpu;
}
/**
 * Share of one core the process used between the two snapshots.
 * Never clamped to 100 : that ceiling would silently flatten every burst spread over several
 * threads, which is exactly what this file exists to show.
 */
function usageBetween(from, to) {
    const elapsedMs = to.at - from.at;
    if (elapsedMs <= 0) {
        return 0;
    }
    const usedMs = ((to.user - from.user) + (to.system - from.system)) / 1000;
    return round1(Math.max(0, (usedMs / elapsedMs) * 100));
}
function round1(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.round(value * 10) / 10;
}
/**
 * CPU usage of the process since the previous reading (at most CPU_WINDOW_MS old).
 * The very first call right after the process start returns 0 : the reference snapshot is taken
 * when this file is loaded, so there is nothing to compare it with yet.
 *
 * While the sampler runs, the last sample is returned as is : advancing the shared reference here
 * would cut the window of the next tick in two and leave a hole in the history.
 */
function readBotCpu() {
    const usage = process.cpuUsage();
    const totalMs = (usage.user + usage.system) / 1000;
    if (isSampling()) {
        return Object.assign({ percent: cpuHistory.last, totalMs }, readStaticCpu());
    }
    const now = Date.now();
    if (now - lastCpuPercentDate >= CPU_WINDOW_MS) {
        const snapshot = { user: usage.user, system: usage.system, at: now };
        lastCpuPercent = usageBetween(cpuReference, snapshot);
        cpuReference = snapshot;
        lastCpuPercentDate = now;
    }
    return Object.assign({ percent: lastCpuPercent, totalMs }, readStaticCpu());
}
/** The amount of physical RAM does not change while the process lives */
let staticTotalMemory = null;
function readBotMemory() {
    if (staticTotalMemory === null) {
        staticTotalMemory = node_os_1.default.totalmem();
    }
    const machineTotal = staticTotalMemory;
    const usage = process.memoryUsage();
    return {
        rss: usage.rss,
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        machineTotal,
        share: machineTotal > 0 ? round1((usage.rss / machineTotal) * 100) : 0
    };
}
/** Everything but the uptime is fixed for the whole life of the process : read it once */
let staticProcess = null;
function readBotProcess() {
    if (staticProcess === null) {
        staticProcess = {
            pid: process.pid,
            nodeVersion: process.version,
            hostname: node_os_1.default.hostname()
        };
    }
    const uptimeSeconds = Math.floor(process.uptime());
    return Object.assign(Object.assign({}, staticProcess), { uptimeSeconds, startTime: new Date(Date.now() - process.uptime() * 1000) });
}
/** Short enough to collect several samples over a step of a few tens of milliseconds */
const WINDOW_SAMPLE_INTERVAL_MS = 25;
/**
 * Opens a measurement window and returns the function closing it.
 *
 * Every other reader in this file works on a window it chooses itself : readBotCpu() caches its
 * value for CPU_WINDOW_MS and the sampler ticks at 1 Hz. This one is instead bounded by whatever
 * the caller is timing, from a few milliseconds up.
 *
 * Like the sampler, it takes its own CPU snapshots and never advances the shared reference, so the
 * sampler and the panel keep an intact window.
 *
 * Memory is sampled on an interval, plus one reading when opening and one when closing, and the
 * interval is what makes rssPeak trustworthy : a worker thread gives its memory back when it ends,
 * so the closing reading alone sees almost nothing of what the step really cost. The timer is
 * unref'd, it must never keep the process alive.
 *
 * Beware of what these numbers mean : the noise of the other processes of the machine is gone, but
 * the resolution is still the one of the kernel CPU accounting, so a window of a few milliseconds
 * gives a coarse percentage.
 */
function startResourceWindow(sampleIntervalMs = WINDOW_SAMPLE_INTERVAL_MS) {
    const cpuFrom = takeCpuSnapshot();
    const rssStart = process.memoryUsage().rss;
    let rssPeak = rssStart;
    let heapPeak = 0;
    const collect = () => {
        const memory = process.memoryUsage();
        if (memory.rss > rssPeak) {
            rssPeak = memory.rss;
        }
        if (memory.heapUsed > heapPeak) {
            heapPeak = memory.heapUsed;
        }
        return memory.rss;
    };
    collect();
    const timer = setInterval(collect, Math.max(1, sampleIntervalMs));
    timer.unref();
    return () => {
        clearInterval(timer);
        const rssEnd = collect();
        const cpuTo = takeCpuSnapshot();
        const durationMs = cpuTo.at - cpuFrom.at;
        return {
            durationMs,
            cpuMs: round1(((cpuTo.user - cpuFrom.user) + (cpuTo.system - cpuFrom.system)) / 1000),
            cpuPercent: usageBetween(cpuFrom, cpuTo),
            rssStart,
            rssEnd,
            rssPeak,
            heapPeak
        };
    };
}
/**
 * Continuous sampler.
 *
 * Reading the process only when the panel renders would show a single one second slice picked at
 * random inside the refresh window : unrepresentative, and blind to every spike in between. The
 * sampler instead collects at a fixed rate and keeps a short history, so a caller can render an
 * average, a peak and a curve.
 *
 * 1 Hz is the sweet spot, and the kernel is what sets it, not the cost : CPU time is accounted in
 * jiffies (CLK_TCK is 100, so 10 ms) and a tick charges its whole 10 ms to whatever was running at
 * that instant. A one second window cumulates ~100 jiffies per core, which is accurate ; shorter
 * windows are not just coarser, they are genuinely noisy.
 *
 * Two tiers, because not everything is worth the same rate :
 *  - CPU and memory, every SAMPLE_INTERVAL_MS : two cheap syscalls, no blocking I/O
 *  - CPU model, core count, total RAM, pid, hostname : read once (see readStaticCpu/readBotProcess)
 */
const SAMPLE_INTERVAL_MS = simplediscordbot_1.Time.second.SEC_01.toMilliseconds();
const HISTORY_SIZE = 120;
class MetricHistory {
    constructor(size) {
        this.size = size;
        this.written = 0;
        this.values = new Float64Array(size);
    }
    push(value) {
        this.values[this.written % this.size] = value;
        this.written++;
    }
    get length() {
        return Math.min(this.written, this.size);
    }
    get last() {
        var _a;
        return this.written === 0 ? 0 : ((_a = this.values[(this.written - 1) % this.size]) !== null && _a !== void 0 ? _a : 0);
    }
    /** Oldest to newest */
    toArray() {
        var _a;
        const length = this.length;
        const start = this.written > this.size ? this.written % this.size : 0;
        const out = new Array(length);
        for (let i = 0; i < length; i++) {
            out[i] = (_a = this.values[(start + i) % this.size]) !== null && _a !== void 0 ? _a : 0;
        }
        return out;
    }
    stats() {
        const samples = this.toArray();
        if (samples.length === 0) {
            return { current: 0, average: 0, min: 0, max: 0, samples };
        }
        let sum = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const value of samples) {
            sum += value;
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        }
        return {
            current: this.last,
            average: round1(sum / samples.length),
            min: round1(min),
            max: round1(max),
            samples
        };
    }
}
const cpuHistory = new MetricHistory(HISTORY_SIZE);
const memoryHistory = new MetricHistory(HISTORY_SIZE);
let samplerTimer = null;
let samplerReference = null;
function sample() {
    const snapshot = takeCpuSnapshot();
    if (samplerReference !== null) {
        cpuHistory.push(usageBetween(samplerReference, snapshot));
        memoryHistory.push(process.memoryUsage().rss);
    }
    samplerReference = snapshot;
}
/**
 * Starts the sampler. Idempotent, so any number of modules may call it.
 * The timer is unref'd : the sampler alone must never keep the process alive.
 */
function startSampling() {
    if (samplerTimer !== null) {
        return;
    }
    samplerReference = takeCpuSnapshot();
    samplerTimer = setInterval(sample, SAMPLE_INTERVAL_MS);
    samplerTimer.unref();
}
function stopSampling() {
    if (samplerTimer === null) {
        return;
    }
    clearInterval(samplerTimer);
    samplerTimer = null;
    samplerReference = null;
}
function isSampling() {
    return samplerTimer !== null;
}
/**
 * Everything the sampler knows, synchronously, so a renderer can call it from a non async function.
 * Returns ready === false until the first sample landed.
 */
function readSampledBotResources() {
    return {
        cpu: Object.assign(Object.assign({}, readBotCpu()), { stats: cpuHistory.stats() }),
        memory: Object.assign(Object.assign({}, readBotMemory()), { stats: memoryHistory.stats() }),
        process: readBotProcess(),
        date: new Date(),
        ready: cpuHistory.length > 0
    };
}
const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];
/**
 * Human readable size, base 1024 : formatBytes(6657199308) === "6.2 GB"
 */
function formatBytes(bytes, decimals = 1) {
    var _a;
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : decimals)} ${(_a = BYTE_UNITS[index]) !== null && _a !== void 0 ? _a : "B"}`;
}
/**
 * Human readable duration : formatDuration(1045800) === "12d 02h 30m"
 */
function formatDuration(seconds) {
    const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const parts = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (days > 0 || hours > 0) {
        parts.push(`${hours.toString().padStart(2, "0")}h`);
    }
    parts.push(`${minutes.toString().padStart(2, "0")}m`);
    return parts.join(" ");
}
/**
 * Folds a series into `buckets` points by averaging consecutive samples.
 *
 * Drawing is ChartManager's job, but its maxPoints only keeps the N most recent points : handing
 * it 120 raw samples with maxPoints 24 would draw the last 24 seconds instead of the whole window.
 * Folding first keeps the curve covering its entire window whatever its width.
 *
 * Unit agnostic on purpose : it is handed a percentage of a core, which goes past 100, as well as
 * raw byte counts, so it must never clamp what it averages.
 */
function foldSamples(samples, buckets = 24) {
    var _a;
    if (samples.length === 0) {
        return [];
    }
    const count = Math.min(Math.max(1, Math.floor(buckets)), samples.length);
    const perBucket = samples.length / count;
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
        const from = Math.floor(i * perBucket);
        const to = Math.max(from + 1, Math.floor((i + 1) * perBucket));
        let sum = 0;
        for (let j = from; j < to; j++) {
            sum += (_a = samples[j]) !== null && _a !== void 0 ? _a : 0;
        }
        out[i] = round1(sum / (to - from));
    }
    return out;
}
