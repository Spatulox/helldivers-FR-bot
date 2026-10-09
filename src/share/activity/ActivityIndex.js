"use strict";
/**
 * Indice d'activité générique : transforme des signaux bruts (événements comptés, identifiants
 * distincts, valeurs instantanées) en un score entre 0 et 1, où 1 correspond au pic observé sur
 * une période de référence glissante (7 jours par défaut).
 *
 * Ce fichier ne dépend ni de discord.js ni des bibliothèques @spatulox : il est fait pour partir
 * tel quel dans une bibliothèque. Le branchement sur Discord vit dans
 * `src/share/modules/ActivityTracker.ts`.
 *
 * FONCTIONNEMENT, à chaque tick (un par bucket, une minute par défaut) :
 * 1. chaque signal produit une valeur brute :
 *    - `rate` : nombre d'événements depuis le tick précédent, ramené à un bucket ;
 *    - `distinct` : nombre d'identifiants différents vus sur `windowMs` ;
 *    - `gauge` : dernière valeur fournie par `set()` ;
 * 2. la valeur brute est lissée par une moyenne mobile exponentielle (`smoothingMs`), pour que le
 *    score ne saute pas à chaque message ;
 * 3. la valeur lissée entre dans l'historique, limité à `referencePeriodMs` ;
 * 4. la référence (« ce qui vaut 1 ») est recalculée selon `normalization` ;
 * 5. score du signal = valeur lissée / référence, borné à [0, 1] ; score global = moyenne
 *    pondérée des scores des signaux (`weight`).
 *
 * PLANCHER : la référence n'est jamais inférieure à `nombre de membres × floorPerMember`. Sans lui,
 * un serveur calme (ou un historique encore vide au premier lancement) atteindrait 1 avec trois
 * messages. C'est aussi ce qui rend la même configuration utilisable sur des serveurs de tailles
 * différentes.
 *
 * Entre deux ticks, le score ne bouge pas : il a la granularité du bucket.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityIndex = void 0;
class ActivityIndex {
    constructor(config, now = Date.now()) {
        this.config = config;
        // État en cours de bucket
        this.counts = {};
        this.seen = {};
        this.gauges = {};
        // État lissé et historique
        this.smoothed = {};
        this.peaks = {};
        this.times = [];
        this.history = {};
        this.lastTick = null;
        this.memberCount = 0;
        // Résultat du dernier tick
        this.references = {};
        this.scores = {};
        this.names = Object.keys(config.signals);
        this.countsSince = now;
        for (const name of this.names) {
            this.counts[name] = 0;
            this.seen[name] = new Map();
            this.gauges[name] = 0;
            this.smoothed[name] = 0;
            this.peaks[name] = 0;
            this.history[name] = [];
            this.references[name] = 0;
            this.scores[name] = 0;
        }
    }
    /** Signal `rate` : compte un événement (un message, par exemple) */
    increment(signal, amount = 1) {
        this.assertKind(signal, "rate");
        this.counts[signal] += amount;
    }
    /** Signal `distinct` : note qu'un identifiant (un auteur, par exemple) a été vu */
    see(signal, id, now = Date.now()) {
        this.assertKind(signal, "distinct");
        this.seen[signal].set(id, now);
    }
    /** Signal `gauge` : fixe la valeur instantanée (personnes en vocal, par exemple) */
    set(signal, value) {
        this.assertKind(signal, "gauge");
        this.gauges[signal] = value;
    }
    /**
     * Oublie ce qui a été compté depuis le dernier tick, sans rien ajouter à l'historique. À
     * appeler à la place de tick() quand la collecte est suspendue : les zéros d'un module
     * désactivé ne doivent pas tirer la référence vers le bas.
     */
    skip(now = Date.now()) {
        for (const name of this.names) {
            this.counts[name] = 0;
        }
        this.countsSince = now;
    }
    /**
     * Clôt le bucket en cours : calcule les valeurs brutes, les lisse, les ajoute à l'historique et
     * recalcule références et scores.
     * @param memberCount nombre total de membres, pour le plancher de la référence
     */
    tick(memberCount, now = Date.now()) {
        var _a;
        const { bucketMs } = this.config;
        // Un intervalle qui dérive ou un tick tardif ne doit pas fausser un débit : on ramène le
        // compte à un bucket. Le minimum évite de multiplier un compte par un tick trop rapproché.
        const countSpan = Math.max(now - this.countsSince, bucketMs / 2);
        // Lissage : après une longue coupure, dt est grand et la valeur lissée rejoint la brute
        const dt = this.lastTick == null ? bucketMs : Math.max(now - this.lastTick, 0);
        for (const name of this.names) {
            const signal = this.config.signals[name];
            const raw = this.rawValue(name, signal, countSpan, now);
            const smoothingMs = (_a = signal.smoothingMs) !== null && _a !== void 0 ? _a : this.config.smoothingMs;
            const alpha = smoothingMs > 0 ? 1 - Math.exp(-dt / smoothingMs) : 1;
            this.smoothed[name] += alpha * (raw - this.smoothed[name]);
            if (this.config.normalization.kind == "decay") {
                const decay = Math.pow(0.5, dt / this.config.normalization.halfLifeMs);
                this.peaks[name] = Math.max(this.smoothed[name], this.peaks[name] * decay);
            }
            this.history[name].push(ActivityIndex.round(this.smoothed[name]));
            this.counts[name] = 0;
        }
        this.times.push(now);
        this.countsSince = now;
        this.lastTick = now;
        this.memberCount = memberCount;
        this.trim(now);
        this.refresh();
    }
    /** Score global entre 0 et 1, tel que calculé au dernier tick */
    score() {
        let weighted = 0;
        let totalWeight = 0;
        for (const name of this.names) {
            const weight = this.config.signals[name].weight;
            weighted += weight * this.scores[name];
            totalWeight += weight;
        }
        return totalWeight > 0 ? weighted / totalWeight : 0;
    }
    /** Score d'un seul signal, pour qu'un consommateur fasse sa propre recette */
    signalScore(signal) {
        return this.scores[signal];
    }
    snapshot() {
        const signals = {};
        for (const name of this.names) {
            signals[name] = {
                value: this.smoothed[name],
                reference: this.references[name],
                score: this.scores[name],
            };
        }
        return {
            score: this.score(),
            signals,
            memberCount: this.memberCount,
            coverage: this.coverage(),
            lastTick: this.lastTick,
        };
    }
    toState() {
        return {
            bucketMs: this.config.bucketMs,
            times: [...this.times],
            values: Object.fromEntries(this.names.map(name => [name, [...this.history[name]]])),
            smoothed: Object.assign({}, this.smoothed),
            peaks: Object.assign({}, this.peaks),
        };
    }
    /**
     * Recharge un historique persisté, devant celui déjà accumulé depuis le démarrage. Un état
     * écrit avec une autre durée de bucket est ignoré (les valeurs ne seraient pas comparables),
     * un signal absent de l'état (ajouté depuis) reçoit des null, ignorés par les statistiques.
     * @returns false si l'état a été ignoré
     */
    loadState(state) {
        var _a, _b, _c, _d, _e, _f;
        if (!state || state.bucketMs != this.config.bucketMs || !Array.isArray(state.times)) {
            return false;
        }
        const length = state.times.length;
        for (const name of this.names) {
            const stored = (_a = state.values) === null || _a === void 0 ? void 0 : _a[name];
            const restored = Array.isArray(stored) && stored.length == length
                ? stored
                : new Array(length).fill(null);
            this.history[name] = [...restored, ...this.history[name]];
            // Avant le premier tick, la valeur lissée et le pic repartent de l'état persisté
            if (this.lastTick == null) {
                this.smoothed[name] = (_c = (_b = state.smoothed) === null || _b === void 0 ? void 0 : _b[name]) !== null && _c !== void 0 ? _c : 0;
            }
            this.peaks[name] = Math.max(this.peaks[name], (_e = (_d = state.peaks) === null || _d === void 0 ? void 0 : _d[name]) !== null && _e !== void 0 ? _e : 0);
        }
        this.times = [...state.times, ...this.times];
        if (this.lastTick == null && length > 0) {
            this.lastTick = state.times[length - 1];
        }
        this.trim((_f = this.lastTick) !== null && _f !== void 0 ? _f : Date.now());
        this.refresh();
        return true;
    }
    rawValue(name, signal, countSpan, now) {
        var _a;
        switch (signal.kind) {
            case "rate":
                return this.counts[name] * this.config.bucketMs / countSpan;
            case "distinct": {
                const windowMs = (_a = signal.windowMs) !== null && _a !== void 0 ? _a : this.config.bucketMs;
                const seen = this.seen[name];
                for (const [id, at] of seen) {
                    if (now - at > windowMs) {
                        seen.delete(id);
                    }
                }
                return seen.size;
            }
            case "gauge":
                return this.gauges[name];
        }
    }
    /** Retire de l'historique ce qui sort de la période de référence */
    trim(now) {
        const limit = now - this.config.referencePeriodMs;
        let drop = 0;
        while (drop < this.times.length && this.times[drop] < limit) {
            drop++;
        }
        if (drop == 0) {
            return;
        }
        this.times.splice(0, drop);
        for (const name of this.names) {
            this.history[name].splice(0, drop);
        }
    }
    /** Recalcule références et scores depuis l'historique et les valeurs lissées */
    refresh() {
        const normalization = this.config.normalization;
        for (const name of this.names) {
            const signal = this.config.signals[name];
            const value = this.smoothed[name];
            const floor = this.memberCount * signal.floorPerMember;
            const samples = this.history[name].filter((v) => v != null);
            if (normalization.kind == "rank") {
                this.references[name] = floor;
                const rank = ActivityIndex.rank(samples, value);
                const floorRatio = floor > 0 ? Math.min(1, value / floor) : 1;
                this.scores[name] = ActivityIndex.clamp(rank * floorRatio);
                continue;
            }
            const observed = normalization.kind == "percentile" ? ActivityIndex.quantile(samples, normalization.p)
                : normalization.kind == "max" ? samples.reduce((a, b) => Math.max(a, b), 0)
                    : this.peaks[name];
            const reference = Math.max(observed, floor);
            this.references[name] = reference;
            this.scores[name] = reference > 0 ? ActivityIndex.clamp(value / reference) : 0;
        }
    }
    coverage() {
        const first = this.times[0];
        if (first == null || this.lastTick == null) {
            return 0;
        }
        return ActivityIndex.clamp((this.lastTick - first) / this.config.referencePeriodMs);
    }
    assertKind(signal, kind) {
        var _a;
        const actual = (_a = this.config.signals[signal]) === null || _a === void 0 ? void 0 : _a.kind;
        if (actual != kind) {
            throw new Error(`ActivityIndex : le signal "${signal}" est de type ${actual}, pas ${kind}`);
        }
    }
    /** Quantile par interpolation linéaire, 0 sur un historique vide */
    static quantile(samples, p) {
        if (samples.length == 0) {
            return 0;
        }
        const sorted = [...samples].sort((a, b) => a - b);
        const position = ActivityIndex.clamp(p) * (sorted.length - 1);
        const low = Math.floor(position);
        const high = Math.ceil(position);
        return sorted[low] + (sorted[high] - sorted[low]) * (position - low);
    }
    /** Rang moyen de value dans l'historique (les égalités comptent pour moitié) */
    static rank(samples, value) {
        if (samples.length == 0) {
            return 0;
        }
        let below = 0;
        let equal = 0;
        for (const sample of samples) {
            if (sample < value)
                below++;
            else if (sample == value)
                equal++;
        }
        return (below + equal / 2) / samples.length;
    }
    static clamp(value) {
        return Math.min(1, Math.max(0, value));
    }
    /** Trois décimales suffisent et allègent d'autant le JSON persisté */
    static round(value) {
        return Math.round(value * 1000) / 1000;
    }
}
exports.ActivityIndex = ActivityIndex;
