"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BKTree = void 0;
const ImageHash_1 = require("./ImageHash");
class BKTree {
    constructor(distance = ImageHash_1.hammingDistance) {
        this.distance = distance;
        this.root = null;
        this.count = 0;
    }
    /** Nombre de valeurs indexées */
    get size() {
        return this.count;
    }
    insert(key, value) {
        this.count++;
        if (this.root == null) {
            this.root = { key, values: [value], children: new Map() };
            return;
        }
        let node = this.root;
        while (true) {
            const distance = this.distance(node.key, key);
            if (distance == 0) {
                node.values.push(value);
                return;
            }
            const child = node.children.get(distance);
            if (child == null) {
                node.children.set(distance, { key, values: [value], children: new Map() });
                return;
            }
            node = child;
        }
    }
    /** Toutes les valeurs dont la clé est à distance ≤ radius, sans ordre particulier */
    search(key, radius) {
        const matches = [];
        const pending = this.root != null ? [this.root] : [];
        while (pending.length > 0) {
            const node = pending.pop();
            if (node == null) {
                break;
            }
            const distance = this.distance(node.key, key);
            if (distance <= radius) {
                for (const value of node.values) {
                    matches.push({ value, distance });
                }
            }
            for (const [childDistance, child] of node.children) {
                if (childDistance >= distance - radius && childDistance <= distance + radius) {
                    pending.push(child);
                }
            }
        }
        return matches;
    }
}
exports.BKTree = BKTree;
