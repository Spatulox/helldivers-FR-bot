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
exports.CleanNicknameEmoji = void 0;
const Modules_1 = require("../../../../utils/other/Modules");
const node_schedule_1 = require("node-schedule");
const client_1 = require("../../../../utils/client");
const constantes_1 = require("../../../../utils/constantes");
const members_1 = require("../../../../utils/guilds/members");
const nicknames_1 = require("../../../../utils/guilds/nicknames");
const messages_1 = require("../../../../utils/messages/messages");
class CleanNicknameEmoji extends Modules_1.Module {
    constructor() {
        if (CleanNicknameEmoji._instance) {
            return CleanNicknameEmoji._instance;
        }
        super("Clean Emoji", "Clean emoji in nickname");
        CleanNicknameEmoji._instance = this;
    }
    static get instance() { return CleanNicknameEmoji._instance; }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, node_schedule_1.scheduleJob)("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
                if (!this.enabled) {
                    return;
                }
                try {
                    const guild = yield client_1.client.guilds.fetch(constantes_1.TARGET_GUILD_ID);
                    const members = yield (0, members_1.fetchMembers)(guild);
                    const renamedLogs = [];
                    for (const member of members.values()) {
                        try {
                            if (member.user.bot)
                                continue;
                            if ((0, members_1.shouldIgnoreMember)(member)) {
                                continue;
                            }
                            const currentNickname = member.nickname;
                            if (!currentNickname)
                                continue;
                            const cleanedNickname = (0, nicknames_1.cleanEmojisFromNickname)(currentNickname);
                            if (cleanedNickname !== currentNickname &&
                                cleanedNickname.length > 0) {
                                const renamed = yield (0, nicknames_1.renameUser)(member, cleanedNickname);
                                if (renamed) {
                                    renamedLogs.push(`**Renaming user:** @[${member.id}] ${member.user.username}\n` +
                                        `• **From :** ${currentNickname}\n` +
                                        `• **To   :** ${cleanedNickname}`);
                                }
                            }
                        }
                        catch (e) {
                            (0, messages_1.sendMessageToInfoChannel)(`Error lors du renommage de ${member.user.username}`);
                        }
                    }
                    if (renamedLogs.length > 0) {
                        const finalMessage = renamedLogs.join("\n\n") +
                            `\n\n**Total:** ${renamedLogs.length} users renamed ✅`;
                        (0, messages_1.sendMessageToInfoChannel)(finalMessage);
                    }
                }
                catch (err) {
                    const msg = `Erreur lors du nettoyage des emotes : ${err}`;
                    (0, messages_1.sendMessageToInfoChannel)(msg);
                }
            }));
        });
    }
}
exports.CleanNicknameEmoji = CleanNicknameEmoji;
CleanNicknameEmoji._instance = null;
