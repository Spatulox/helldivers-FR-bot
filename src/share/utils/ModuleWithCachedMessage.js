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
exports.ModuleWithCachedMessage = void 0;
const discord_module_1 = require("@spatulox/discord-module");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
/**
 * You need to call initCache in the constructor in order to init the cache and load it
 */
class ModuleWithCachedMessage extends discord_module_1.ModuleWithCache {
    constructor() {
        super(...arguments);
        this._message = null;
        this.cacheData = { channel_id: "", message_id: "" };
    }
    initCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCache();
            yield this.ensureMessageExist(true);
            yield this.updateOrSendMessage();
        });
    }
    get message() {
        return this._message;
    }
    updateOrSendMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._message !== null) {
                    yield this.updateMessage();
                }
                else {
                    yield this.sendMessage();
                }
            }
            catch (e) {
                simplediscordbot_1.Bot.log.info(`${e}`);
            }
        });
    }
    updateMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this._message)
                    return;
                yield this._message.edit(this.editMessage());
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`${err}`);
            }
        });
    }
    sendMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield simplediscordbot_1.GuildManager.channel.any.find(this.getChannelId());
                if (!channel || !(channel === null || channel === void 0 ? void 0 : channel.isSendable()))
                    return;
                const msg = yield channel.send(this.buildMessage());
                this.cacheData.channel_id = channel.id;
                this.cacheData.message_id = msg.id;
                this._message = msg;
                yield this.syncCache(this.cacheData);
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`${err}`);
            }
        });
    }
    ensureMessageExist() {
        return __awaiter(this, arguments, void 0, function* (initMsg = false) {
            try {
                if (this.cacheData.message_id == null || this.cacheData.message_id == "") {
                    return false;
                }
                const msg = yield simplediscordbot_1.GuildManager.channel.any.message.fetchOne(this.getChannelId(), this.cacheData.message_id);
                if (initMsg) {
                    this._message = msg;
                }
                return msg !== null;
            }
            catch (err) {
                simplediscordbot_1.Bot.log.info(`${err}`);
                return false;
            }
        });
    }
}
exports.ModuleWithCachedMessage = ModuleWithCachedMessage;
