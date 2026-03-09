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
const Modules_1 = require("../../../Modules");
const node_schedule_1 = require("node-schedule");
const simplediscordbot_1 = require("@spatulox/simplediscordbot");
const UserManager_1 = require("../../../../utils/Manager/UserManager");
const MemberManager_1 = require("../../../../utils/Manager/MemberManager");
const HDFR_1 = require("../../../../utils/HDFR");
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
                    const guild = yield simplediscordbot_1.Bot.client.guilds.fetch(HDFR_1.HDFRChannelID.guildID);
                    const members = yield simplediscordbot_1.GuildManager.fetchAllMembers(guild);
                    const renamedLogs = [];
                    for (const member of members.values()) {
                        try {
                            if (member.user.bot)
                                continue;
                            if (MemberManager_1.MemberManager.shouldIgnoreMember(member)) {
                                continue;
                            }
                            const currentNickname = member.nickname;
                            if (!currentNickname)
                                continue;
                            const cleanedNickname = UserManager_1.UserManager.cleanEmojisFromNickname(currentNickname);
                            if (cleanedNickname !== currentNickname &&
                                cleanedNickname.length > 0) {
                                const renamed = yield simplediscordbot_1.GuildManager.user.rename(member, cleanedNickname);
                                if (renamed) {
                                    renamedLogs.push(`**Renaming user:** @[${member.id}] ${member.user.username}\n` +
                                        `• **From :** ${currentNickname}\n` +
                                        `• **To   :** ${cleanedNickname}`);
                                }
                            }
                        }
                        catch (e) {
                            simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(`Error lors du renommage de ${member.user.username}`));
                        }
                    }
                    if (renamedLogs.length > 0) {
                        const finalMessage = renamedLogs.join("\n\n") +
                            `\n\n**Total:** ${renamedLogs.length} users renamed ✅`;
                        simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.simple(finalMessage));
                    }
                }
                catch (err) {
                    const msg = `Erreur lors du nettoyage des emotes : ${err}`;
                    simplediscordbot_1.Bot.log.info(simplediscordbot_1.EmbedManager.error(msg));
                }
            }));
        });
    }
}
exports.CleanNicknameEmoji = CleanNicknameEmoji;
CleanNicknameEmoji._instance = null;
