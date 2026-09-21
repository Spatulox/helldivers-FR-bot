"use strict";
/**
 * System resources reading API.
 *
 * Pure utility : no Module, no Discord, no dependency to install (node:os + fs.statfs only).
 * Any module of any bot can import these functions to read the machine state.
 *
 * Two ways in :
 *  - readCpu() / readMemory() / readDisk() / readMachine() / readSystemResources() read the machine
 *    right now, for a one shot need. No setup required.
 *  - startSampling() then readSampledResources() serve a continuously collected history, with an
 *    average, a peak and a curve over the last two minutes. See the sampler section below.
 *
 * Every size is returned in raw bytes : formatting is a separate concern, handled by the
 * formatBytes() / formatDuration() helpers at the bottom of this file, so a caller is free to
 * apply its own thresholds and comparisons on the raw numbers. Gauges and curves are drawn by
 * ChartManager of @spatulox/simplediscordbot, foldSamples() only shapes the series for it.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCpu = readCpu;
exports.measureCpuOverInterval = measureCpuOverInterval;
exports.readMemory = readMemory;
exports.startResourceWindow = startResourceWindow;
exports.readDisk = readDisk;
exports.readMachine = readMachine;
exports.readSystemResources = readSystemResources;
exports.startSampling = startSampling;
exports.stopSampling = stopSampling;
exports.isSampling = isSampling;
exports.readSampledResources = readSampledResources;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.foldSamples = foldSamples;
const node_os_1 = __importDefault(require("node:os"));
const promises_1 = require("node:fs/promises");
const promises_2 = require("timers/promises");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
/**
 * os.cpus() only exposes counters cumulated since the boot : a single call is useless, the usage
 * can only be computed from the delta between two snapshots.
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
    let idle = 0;
    let total = 0;
    for (const cpu of node_os_1.default.cpus()) {
        idle += cpu.times.idle;
        total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    return { idle, total };
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
function usageBetween(from, to) {
    const totalDelta = to.total - from.total;
    if (totalDelta <= 0) {
        return 0;
    }
    const idleDelta = to.idle - from.idle;
    return clampPercent((1 - idleDelta / totalDelta) * 100);
}
function clampPercent(percent) {
    if (!Number.isFinite(percent)) {
        return 0;
    }
    return Math.round(Math.min(100, Math.max(0, percent)) * 10) / 10;
}
/**
 * CPU usage since the previous reading (at most CPU_WINDOW_MS old).
 * The very first call right after the process start returns 0 : the reference snapshot is taken
 * when this file is loaded, so there is nothing to compare it with yet.
 *
 * While the sampler runs, the last sample is returned as is : advancing the shared reference here
 * would cut the window of the next tick in two and leave a hole in the history.
 */
function readCpu() {
    if (isSampling()) {
        return Object.assign(Object.assign({ percent: cpuHistory.last }, readStaticCpu()), { loadAverage: node_os_1.default.loadavg() });
    }
    const now = Date.now();
    if (now - lastCpuPercentDate >= CPU_WINDOW_MS) {
        const snapshot = takeCpuSnapshot();
        lastCpuPercent = usageBetween(cpuReference, snapshot);
        cpuReference = snapshot;
        lastCpuPercentDate = now;
    }
    return Object.assign(Object.assign({ percent: lastCpuPercent }, readStaticCpu()), { loadAverage: node_os_1.default.loadavg() });
}
/**
 * One shot CPU measurement over its own window, without touching the shared reference.
 * Use it when an accurate instant value is worth waiting for (an on demand command), readCpu()
 * otherwise.
 */
function measureCpuOverInterval() {
    return __awaiter(this, arguments, void 0, function* (ms = 500) {
        const from = takeCpuSnapshot();
        yield (0, promises_2.setTimeout)(ms);
        return usageBetween(from, takeCpuSnapshot());
    });
}
/**
 * On Linux os.freemem() reports MemAvailable, so "free" here matches the "available" column of
 * `free -h` (the page cache counts as free), not its "free" column.
 */
/** The amount of physical RAM does not change while the process lives */
let staticTotalMemory = null;
function readMemory() {
    if (staticTotalMemory === null) {
        staticTotalMemory = node_os_1.default.totalmem();
    }
    const total = staticTotalMemory;
    const free = node_os_1.default.freemem();
    const used = total - free;
    return {
        total,
        free,
        used,
        percent: total > 0 ? clampPercent((used / total) * 100) : 0
    };
}
/** Short enough to collect several samples over a step of a few tens of milliseconds */
const WINDOW_SAMPLE_INTERVAL_MS = 25;
/**
 * Opens a measurement window and returns the function closing it.
 *
 * Every other reader in this file works on a window it chooses itself : readCpu() caches its value
 * for CPU_WINDOW_MS, the sampler ticks at 1 Hz, and measureCpuOverInterval() dictates how long to
 * wait. This one is instead bounded by whatever the caller is timing, from a few milliseconds up.
 *
 * Like measureCpuOverInterval(), it takes its own CPU snapshots and never advances the shared
 * reference, so the sampler and the panel keep an intact window.
 *
 * Memory is sampled on an interval, plus one reading when opening and one when closing : a window
 * shorter than the interval still averages its two bounds instead of reporting nothing. The timer
 * is unref'd, it must never keep the process alive.
 *
 * Beware of what these numbers mean : they cover the WHOLE machine, every other process included,
 * and CPU time is accounted in 10 ms jiffies, so a window of a few milliseconds gives a very noisy
 * percentage.
 */
function startResourceWindow(sampleIntervalMs = WINDOW_SAMPLE_INTERVAL_MS) {
    const startedAt = Date.now();
    const cpuFrom = takeCpuSnapshot();
    let sum = 0;
    let count = 0;
    let peakPercent = 0;
    let peakUsed = 0;
    const collect = () => {
        const memory = readMemory();
        sum += memory.percent;
        count++;
        if (memory.percent > peakPercent) {
            peakPercent = memory.percent;
        }
        if (memory.used > peakUsed) {
            peakUsed = memory.used;
        }
    };
    collect();
    const timer = setInterval(collect, Math.max(1, sampleIntervalMs));
    timer.unref();
    return () => {
        clearInterval(timer);
        collect();
        return {
            durationMs: Date.now() - startedAt,
            cpuPercent: usageBetween(cpuFrom, takeCpuSnapshot()),
            memoryPercent: clampPercent(sum / count),
            memoryPeakPercent: peakPercent,
            memoryPeakUsed: peakUsed
        };
    };
}
/**
 * Disk usage of the filesystem holding the given path, the bot working directory by default.
 * Returns null instead of throwing when the filesystem cannot be read.
 */
function readDisk() {
    return __awaiter(this, arguments, void 0, function* (path = process.cwd()) {
        try {
            const stats = yield (0, promises_1.statfs)(path);
            const total = stats.blocks * stats.bsize;
            if (total <= 0) {
                return null;
            }
            const free = stats.bavail * stats.bsize;
            const used = total - stats.bfree * stats.bsize;
            return {
                path,
                total,
                free,
                used,
                // used / (used + free) and not used / total, to report the same ratio as `df` : the
                // blocks reserved for root belong to neither side of that ratio.
                percent: used + free > 0 ? clampPercent((used / (used + free)) * 100) : 0
            };
        }
        catch (error) {
            simplediscordbot_1.Log.info(`SystemResources : unable to read the disk usage of ${path} : ${error}`);
            return null;
        }
    });
}
/** Everything but the uptime is fixed for the whole life of the process : read it once */
let staticMachine = null;
function readMachine() {
    if (staticMachine === null) {
        staticMachine = {
            platform: node_os_1.default.platform(),
            release: node_os_1.default.release(),
            arch: node_os_1.default.arch(),
            hostname: node_os_1.default.hostname()
        };
    }
    const uptimeSeconds = Math.floor(node_os_1.default.uptime());
    return Object.assign(Object.assign({}, staticMachine), { uptimeSeconds, bootTime: new Date(Date.now() - uptimeSeconds * 1000) });
}
/**
 * Every reading at once : the entry point most callers want.
 */
function readSystemResources(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            cpu: readCpu(),
            memory: readMemory(),
            disk: yield readDisk(path),
            machine: readMachine(),
            date: new Date()
        };
    });
}
/**
 * Continuous sampler.
 *
 * Reading the machine only when the panel renders would show a single one second slice picked at
 * random inside the refresh window : unrepresentative, and blind to every spike in between. The
 * sampler instead collects at a fixed rate and keeps a short history, so a caller can render an
 * average, a peak and a curve.
 *
 * 1 Hz is the sweet spot, and the kernel is what sets it, not the cost : CPU time is accounted in
 * jiffies (CLK_TCK is 100, so 10 ms) and a tick charges its whole 10 ms to whatever was running at
 * that instant. A one second window cumulates ~100 jiffies per core, which is accurate ; shorter
 * windows are not just coarser, they are genuinely noisy. Measured cost at 1 Hz : 0.04 % of a core.
 *
 * Three tiers, because not everything is worth the same rate :
 *  - CPU and memory, every SAMPLE_INTERVAL_MS : /proc reads, no blocking I/O
 *  - disk, every DISK_INTERVAL_MS : statfs is a real filesystem syscall, it can block on a network
 *    mount, and disk usage moves slowly anyway
 *  - CPU model, core count, hostname, platform, arch : read once (see readStaticCpu/readMachine)
 */
const SAMPLE_INTERVAL_MS = simplediscordbot_1.Time.second.SEC_01.toMilliseconds();
const DISK_INTERVAL_MS = simplediscordbot_1.Time.minute.MIN_01.toMilliseconds();
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
            average: Math.round((sum / samples.length) * 10) / 10,
            min: Math.round(min * 10) / 10,
            max: Math.round(max * 10) / 10,
            samples
        };
    }
}
const cpuHistory = new MetricHistory(HISTORY_SIZE);
const memoryHistory = new MetricHistory(HISTORY_SIZE);
let samplerTimer = null;
let samplerReference = null;
let sampledDisk = null;
let sampledDiskDate = 0;
function sample() {
    const snapshot = takeCpuSnapshot();
    if (samplerReference !== null) {
        cpuHistory.push(usageBetween(samplerReference, snapshot));
        memoryHistory.push(readMemory().percent);
    }
    samplerReference = snapshot;
    if (Date.now() - sampledDiskDate >= DISK_INTERVAL_MS) {
        // The date is set before awaiting : a slow statfs would otherwise be fired again on every
        // tick until it finally answers.
        sampledDiskDate = Date.now();
        void readDisk().then(disk => { sampledDisk = disk; });
    }
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
 * Everything the sampler knows, synchronously : no syscall on the disk path, so a renderer can call
 * it from a non async function. Returns ready === false until the first sample landed.
 */
function readSampledResources() {
    const cpuStats = cpuHistory.stats();
    const memory = readMemory();
    return {
        cpu: Object.assign(Object.assign({ percent: cpuStats.current }, readStaticCpu()), { loadAverage: node_os_1.default.loadavg(), stats: cpuStats }),
        memory: Object.assign(Object.assign({}, memory), { stats: memoryHistory.stats() }),
        disk: sampledDisk,
        machine: readMachine(),
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
        out[i] = clampPercent(sum / (to - from));
    }
    return out;
}
