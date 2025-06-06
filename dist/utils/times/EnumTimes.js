"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
/**
 * Values are in miliseconds
 */
var Milliseconds;
(function (Milliseconds) {
    Milliseconds[Milliseconds["MS_100"] = 100] = "MS_100";
    Milliseconds[Milliseconds["MS_200"] = 200] = "MS_200";
    Milliseconds[Milliseconds["MS_500"] = 500] = "MS_500";
    Milliseconds[Milliseconds["MS_800"] = 500] = "MS_800";
    Milliseconds[Milliseconds["MS_1_SEC"] = 1000] = "MS_1_SEC";
})(Milliseconds || (Milliseconds = {}));
/**
 * Values are in seconds
 */
var Seconds;
(function (Seconds) {
    Seconds[Seconds["SEC_01"] = 1] = "SEC_01";
    Seconds[Seconds["SEC_02"] = 2] = "SEC_02";
    Seconds[Seconds["SEC_03"] = 3] = "SEC_03";
    Seconds[Seconds["SEC_04"] = 4] = "SEC_04";
    Seconds[Seconds["SEC_05"] = 5] = "SEC_05";
    Seconds[Seconds["SEC_06"] = 6] = "SEC_06";
    Seconds[Seconds["SEC_07"] = 7] = "SEC_07";
    Seconds[Seconds["SEC_08"] = 8] = "SEC_08";
    Seconds[Seconds["SEC_09"] = 9] = "SEC_09";
    Seconds[Seconds["SEC_10"] = 10] = "SEC_10";
    Seconds[Seconds["SEC_11"] = 11] = "SEC_11";
    Seconds[Seconds["SEC_12"] = 12] = "SEC_12";
    Seconds[Seconds["SEC_13"] = 13] = "SEC_13";
    Seconds[Seconds["SEC_14"] = 14] = "SEC_14";
    Seconds[Seconds["SEC_15"] = 15] = "SEC_15";
    Seconds[Seconds["SEC_16"] = 16] = "SEC_16";
    Seconds[Seconds["SEC_17"] = 17] = "SEC_17";
    Seconds[Seconds["SEC_18"] = 18] = "SEC_18";
    Seconds[Seconds["SEC_19"] = 19] = "SEC_19";
    Seconds[Seconds["SEC_20"] = 20] = "SEC_20";
    Seconds[Seconds["SEC_21"] = 21] = "SEC_21";
    Seconds[Seconds["SEC_22"] = 22] = "SEC_22";
    Seconds[Seconds["SEC_23"] = 23] = "SEC_23";
    Seconds[Seconds["SEC_24"] = 24] = "SEC_24";
    Seconds[Seconds["SEC_25"] = 25] = "SEC_25";
    Seconds[Seconds["SEC_26"] = 26] = "SEC_26";
    Seconds[Seconds["SEC_27"] = 27] = "SEC_27";
    Seconds[Seconds["SEC_28"] = 28] = "SEC_28";
    Seconds[Seconds["SEC_29"] = 29] = "SEC_29";
    Seconds[Seconds["SEC_30"] = 30] = "SEC_30";
    Seconds[Seconds["SEC_31"] = 31] = "SEC_31";
    Seconds[Seconds["SEC_32"] = 32] = "SEC_32";
    Seconds[Seconds["SEC_33"] = 33] = "SEC_33";
    Seconds[Seconds["SEC_34"] = 34] = "SEC_34";
    Seconds[Seconds["SEC_35"] = 35] = "SEC_35";
    Seconds[Seconds["SEC_36"] = 36] = "SEC_36";
    Seconds[Seconds["SEC_37"] = 37] = "SEC_37";
    Seconds[Seconds["SEC_38"] = 38] = "SEC_38";
    Seconds[Seconds["SEC_39"] = 39] = "SEC_39";
    Seconds[Seconds["SEC_40"] = 40] = "SEC_40";
    Seconds[Seconds["SEC_41"] = 41] = "SEC_41";
    Seconds[Seconds["SEC_42"] = 42] = "SEC_42";
    Seconds[Seconds["SEC_43"] = 43] = "SEC_43";
    Seconds[Seconds["SEC_44"] = 44] = "SEC_44";
    Seconds[Seconds["SEC_45"] = 45] = "SEC_45";
    Seconds[Seconds["SEC_46"] = 46] = "SEC_46";
    Seconds[Seconds["SEC_47"] = 47] = "SEC_47";
    Seconds[Seconds["SEC_48"] = 48] = "SEC_48";
    Seconds[Seconds["SEC_49"] = 49] = "SEC_49";
    Seconds[Seconds["SEC_50"] = 50] = "SEC_50";
    Seconds[Seconds["SEC_51"] = 51] = "SEC_51";
    Seconds[Seconds["SEC_52"] = 52] = "SEC_52";
    Seconds[Seconds["SEC_53"] = 53] = "SEC_53";
    Seconds[Seconds["SEC_54"] = 54] = "SEC_54";
    Seconds[Seconds["SEC_55"] = 55] = "SEC_55";
    Seconds[Seconds["SEC_56"] = 56] = "SEC_56";
    Seconds[Seconds["SEC_57"] = 57] = "SEC_57";
    Seconds[Seconds["SEC_58"] = 58] = "SEC_58";
    Seconds[Seconds["SEC_59"] = 59] = "SEC_59";
    Seconds[Seconds["SEC_60"] = 60] = "SEC_60";
})(Seconds || (Seconds = {}));
/**
 * Values are in minutes
 */
var Minutes;
(function (Minutes) {
    Minutes[Minutes["MIN_01"] = 1] = "MIN_01";
    Minutes[Minutes["MIN_02"] = 2] = "MIN_02";
    Minutes[Minutes["MIN_03"] = 3] = "MIN_03";
    Minutes[Minutes["MIN_04"] = 4] = "MIN_04";
    Minutes[Minutes["MIN_05"] = 5] = "MIN_05";
    Minutes[Minutes["MIN_10"] = 10] = "MIN_10";
    Minutes[Minutes["MIN_15"] = 15] = "MIN_15";
    Minutes[Minutes["MIN_20"] = 20] = "MIN_20";
    Minutes[Minutes["MIN_25"] = 25] = "MIN_25";
    Minutes[Minutes["MIN_30"] = 30] = "MIN_30";
    Minutes[Minutes["MIN_35"] = 35] = "MIN_35";
    Minutes[Minutes["MIN_40"] = 40] = "MIN_40";
    Minutes[Minutes["MIN_45"] = 45] = "MIN_45";
    Minutes[Minutes["MIN_50"] = 50] = "MIN_50";
    Minutes[Minutes["MIN_55"] = 55] = "MIN_55";
    Minutes[Minutes["MIN_60"] = 60] = "MIN_60";
})(Minutes || (Minutes = {}));
/**
 * Values are in minutes
 */
var Hours;
(function (Hours) {
    Hours[Hours["HOUR_01"] = 60] = "HOUR_01";
    Hours[Hours["HOUR_02"] = 120] = "HOUR_02";
    Hours[Hours["HOUR_03"] = 180] = "HOUR_03";
    Hours[Hours["HOUR_04"] = 240] = "HOUR_04";
    Hours[Hours["HOUR_05"] = 300] = "HOUR_05";
    Hours[Hours["HOUR_06"] = 360] = "HOUR_06";
    Hours[Hours["HOUR_07"] = 420] = "HOUR_07";
    Hours[Hours["HOUR_08"] = 480] = "HOUR_08";
    Hours[Hours["HOUR_09"] = 540] = "HOUR_09";
    Hours[Hours["HOUR_10"] = 600] = "HOUR_10";
    Hours[Hours["HOUR_11"] = 660] = "HOUR_11";
    Hours[Hours["HOUR_12"] = 720] = "HOUR_12";
    Hours[Hours["HOUR_13"] = 780] = "HOUR_13";
    Hours[Hours["HOUR_14"] = 840] = "HOUR_14";
    Hours[Hours["HOUR_15"] = 900] = "HOUR_15";
    Hours[Hours["HOUR_16"] = 960] = "HOUR_16";
    Hours[Hours["HOUR_17"] = 1020] = "HOUR_17";
    Hours[Hours["HOUR_18"] = 1080] = "HOUR_18";
    Hours[Hours["HOUR_19"] = 1140] = "HOUR_19";
    Hours[Hours["HOUR_20"] = 1200] = "HOUR_20";
    Hours[Hours["HOUR_21"] = 1260] = "HOUR_21";
    Hours[Hours["HOUR_22"] = 1320] = "HOUR_22";
    Hours[Hours["HOUR_23"] = 1380] = "HOUR_23";
    Hours[Hours["HOUR_24"] = 1440] = "HOUR_24";
})(Hours || (Hours = {}));
/**
 * Values are in minutes
 */
var Days;
(function (Days) {
    Days[Days["DAY_01"] = 1440] = "DAY_01";
    Days[Days["DAY_02"] = 2880] = "DAY_02";
    Days[Days["DAY_03"] = 4320] = "DAY_03";
    Days[Days["DAY_04"] = 5760] = "DAY_04";
    Days[Days["DAY_05"] = 7200] = "DAY_05";
    Days[Days["DAY_06"] = 8640] = "DAY_06";
    Days[Days["DAY_07"] = 10080] = "DAY_07";
    Days[Days["DAY_08"] = 11520] = "DAY_08";
    Days[Days["DAY_09"] = 12960] = "DAY_09";
    Days[Days["DAY_10"] = 14400] = "DAY_10";
})(Days || (Days = {}));
exports.Time = {
    miliseconds: Milliseconds,
    secondes: Seconds,
    minutes: Minutes,
    hours: Hours,
    days: Days
};
