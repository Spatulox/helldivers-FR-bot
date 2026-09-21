"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoExtension = exports.ImageExtension = void 0;
exports.getFileExtension = getFileExtension;
exports.isImageFile = isImageFile;
exports.isVideoFile = isVideoFile;
exports.countImageUrls = countImageUrls;
var ImageExtension;
(function (ImageExtension) {
    ImageExtension["png"] = ".png";
    ImageExtension["jpg"] = ".jpg";
    ImageExtension["jpeg"] = ".jpeg";
    ImageExtension["gif"] = ".gif";
    ImageExtension["webp"] = ".webp";
    ImageExtension["bmp"] = ".bmp";
    ImageExtension["tiff"] = ".tiff";
    ImageExtension["tif"] = ".tif";
    ImageExtension["svg"] = ".svg";
    ImageExtension["ico"] = ".ico";
    ImageExtension["heic"] = ".heic";
    ImageExtension["heif"] = ".heif";
    ImageExtension["avif"] = ".avif";
    ImageExtension["jfif"] = ".jfif";
    ImageExtension["pjpeg"] = ".pjpeg";
    ImageExtension["pjp"] = ".pjp";
    ImageExtension["apng"] = ".apng";
    ImageExtension["raw"] = ".raw";
})(ImageExtension || (exports.ImageExtension = ImageExtension = {}));
var VideoExtension;
(function (VideoExtension) {
    VideoExtension["mp4"] = ".mp4";
    VideoExtension["mov"] = ".mov";
    VideoExtension["webm"] = ".webm";
    VideoExtension["avi"] = ".avi";
    VideoExtension["mkv"] = ".mkv";
    VideoExtension["flv"] = ".flv";
    VideoExtension["wmv"] = ".wmv";
    VideoExtension["m4v"] = ".m4v";
    VideoExtension["mpg"] = ".mpg";
    VideoExtension["mpeg"] = ".mpeg";
    VideoExtension["ogv"] = ".ogv";
    VideoExtension["ts"] = ".ts";
    VideoExtension["mts"] = ".mts";
    VideoExtension["m2ts"] = ".m2ts";
})(VideoExtension || (exports.VideoExtension = VideoExtension = {}));
const IMAGE_EXTENSIONS = Object.values(ImageExtension);
const VIDEO_EXTENSIONS = Object.values(VideoExtension);
// Liens http(s) terminés par une extension d'image (paramètres d'URL tolérés), construit depuis ImageExtension
const IMAGE_URL_REGEX = new RegExp(`https?:\\/\\/\\S+?(?:${IMAGE_EXTENSIONS.map(ext => ext.replace(".", "\\.")).join("|")})(?:[?#]\\S*)?(?=\\s|$)`, "gi");
/** Extension en minuscules avec le point (`.png`), ou `""` ; accepte un nom de fichier ou une URL avec paramètres */
function getFileExtension(nameOrUrl) {
    const match = nameOrUrl.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/i);
    if (match && match[1]) {
        return '.' + match[1].toLowerCase();
    }
    return '';
}
function isImageFile(nameOrUrl) {
    return IMAGE_EXTENSIONS.includes(getFileExtension(nameOrUrl));
}
function isVideoFile(nameOrUrl) {
    return VIDEO_EXTENSIONS.includes(getFileExtension(nameOrUrl));
}
/** Nombre de liens d'images dans un texte */
function countImageUrls(text) {
    var _a, _b;
    return (_b = (_a = text.match(IMAGE_URL_REGEX)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
}
