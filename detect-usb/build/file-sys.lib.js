"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSys = void 0;
var fs = __importStar(require("fs"));
/**
 * 除了openFolder的路徑須以\連接以外，其他一律規定用/。
 *
 * node fs模組的特性（稍微測試過）：
 *
 * 1.root dir下的資料夾加不加./都可，例如./logs只要用logs即可。
 * 2.正反dash都抓得到檔案
 */
exports.fileSys = {
    checkExistence: function (path) {
        return fs.existsSync(path);
    },
    makeIfNoDir: function (dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    },
    appendFile: function (pathToFileWithExt, content, isWithLineBreak) {
        if (isWithLineBreak === void 0) { isWithLineBreak = true; }
        fs.appendFileSync(pathToFileWithExt, (content + (isWithLineBreak ? '\r\n' : '')));
    },
    /**
     * ex: fruit/apple/red.json => fruit/apple
     */
    getDirFromFilePath: function (pathToFileWithExt) {
        var i1 = pathToFileWithExt.lastIndexOf('/');
        var i2 = pathToFileWithExt.lastIndexOf('\\');
        var i = i1 > i2 ? i1 : i2; //取較後面的
        return pathToFileWithExt.slice(0, i); // 
    },
    readFileSync: function (pathToFileWithExt, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    },
    readFileSyncWithDefaultStr: function (pathToFileWithExt, defaultStr, encoding) {
        if (defaultStr === void 0) { defaultStr = ''; }
        if (encoding === void 0) { encoding = 'utf8'; }
        if (!fs.existsSync(pathToFileWithExt))
            exports.fileSys.saveFileSync(pathToFileWithExt, defaultStr, encoding);
        var data = fs.readFileSync(pathToFileWithExt, encoding);
        return data;
    },
    saveFileSync: function (pathToFileWithExt, strToSave, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        var desitinationPath = getUniqueName(pathToFileWithExt);
        fs.writeFileSync(desitinationPath, strToSave, encoding);
        return desitinationPath;
    },
    saveExcelFile: function (pathToFileWithExt, strToSave) {
        return exports.fileSys.saveFileSync(pathToFileWithExt, strToSave, 'binary');
    },
    /**
     * 有則如實讀入，無則幫創，可以json作為創建內容。
     * @param pathToFileWithExt
     * @param defaultJson 當無該檔案時以此作為新創檔案之內容
     */
    readAsJson: function (pathToFileWithExt, defaultJson) {
        if (defaultJson === void 0) { defaultJson = {}; }
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        // 無則幫創
        if (!fs.existsSync(pathToFileWithExt))
            exports.fileSys.writeAsJson(pathToFileWithExt, defaultJson);
        var data = fs.readFileSync(pathToFileWithExt, 'utf8');
        return JSON.parse(data);
    },
    simpleWrite: function (pathToFileWithExt, content) {
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        fs.writeFileSync(pathToFileWithExt, content, 'utf8');
    },
    writeAsJson: function (pathToFileWithExt, obj) {
        var dir = exports.fileSys.getDirFromFilePath(pathToFileWithExt);
        exports.fileSys.makeIfNoDir(dir);
        fs.writeFileSync(pathToFileWithExt, JSON.stringify(obj), 'utf8');
    },
    getDirNames: function (path, isFullPath) {
        if (isFullPath === void 0) { isFullPath = true; }
        var arr = [];
        if (fs.existsSync(path))
            arr = fs.readdirSync(path, { withFileTypes: true }).filter(function (dirent) { return dirent.isDirectory(); }).map(function (dirent) { return path + '\\' + dirent.name; });
        // console.log(arr);
        return arr;
    },
    copyFile: function (sourcePath, desitinationPath) {
        desitinationPath = getUniqueName(desitinationPath);
        this.makeIfNoDir(this.getDirFromFilePath(desitinationPath));
        fs.copyFileSync(sourcePath, desitinationPath);
        console.log("".concat(sourcePath, " \u5DF2\u8907\u88FD\u5230 ").concat(desitinationPath));
        return desitinationPath;
    },
    /** 為了相容node 4.9.1 */
    copyFileP: function (sourcePath, desitinationPath) {
        desitinationPath = getUniqueName(desitinationPath);
        this.makeIfNoDir(this.getDirFromFilePath(desitinationPath));
        return new Promise(function (res, rej) {
            copyFile(sourcePath, desitinationPath, function (err) {
                if (err)
                    rej(err);
                else
                    res();
            });
        });
        function copyFile(sourcePath, desitinationPath, cb) {
            if (cb === void 0) { cb = function (err) { }; }
            var cbCalled = false;
            var rd = fs.createReadStream(sourcePath);
            rd.on("error", function (err) {
                done(err);
            });
            var wr = fs.createWriteStream(desitinationPath);
            wr.on("error", function (err) {
                done(err);
            });
            wr.on("close", function () {
                done();
            });
            rd.pipe(wr);
            function done(err) {
                if (!cbCalled) {
                    cb(err);
                    cbCalled = true;
                }
            }
        }
    },
    renameExcelFile: function (pathWithExt, nameToReplaceWithoutExt) {
        var folder = pathWithExt.slice(0, pathWithExt.lastIndexOf('\\') + 1);
        var dotExt = pathWithExt.slice(pathWithExt.lastIndexOf('.'));
        var newPath = folder + nameToReplaceWithoutExt + dotExt;
        var dest = getUniqueName(newPath);
        fs.renameSync(pathWithExt, dest);
        console.log("\u6A94\u6848\u5F9E".concat(pathWithExt, "\u66F4\u540D\u70BA").concat(dest));
        return dest;
    },
    readDir: function (path, filter) {
        if (filter === void 0) { filter = '.txt'; }
        //路徑如果是檔案會壞掉，目前沒擋
        if (exports.fileSys.checkExistence(path))
            return fs.readdirSync(path).filter(function (path) { return path.includes(filter); });
        else {
            var errMsg = '無此資料夾:' + path;
            return errMsg;
        }
    },
    removeFile: function (path) {
        try {
            fs.unlinkSync(path);
        }
        catch (error) {
            console.log(error);
        }
    },
    saveIntoLog: function (msg, dir, logFileName, logFileExt) {
        if (dir === void 0) { dir = 'logs'; }
        if (logFileName === void 0) { logFileName = 'log'; }
        if (logFileExt === void 0) { logFileExt = 'txt'; }
        exports.fileSys.makeIfNoDir(dir);
        var path = dir + "/".concat(logFileName, ".").concat(logFileExt);
        exports.fileSys.appendFile(path, msg);
    }
};
function getUniqueName(pathToSave) {
    if (fs.existsSync(pathToSave)) {
        var extPointIndex = pathToSave.lastIndexOf('.');
        var nameWithoutExt = pathToSave.slice(0, extPointIndex);
        var extWithPoint = pathToSave.slice(extPointIndex);
        // extension以前的部分
        var lastUnderLineIndex = nameWithoutExt.lastIndexOf('_');
        var firstPartInName = nameWithoutExt.slice(0, lastUnderLineIndex); //不含_
        var lastPartInName = nameWithoutExt.slice(lastUnderLineIndex); // _XXXX
        // console.log(extPointIndex, nameWithoutExt, extWithPoint, lastPartInName)
        // 找到_X*n n>=1的情況
        if (lastPartInName.length > 1) {
            var charsAfter_ = lastPartInName.slice(1);
            var numerizedLastChar = Number(charsAfter_);
            if (!isNaN(numerizedLastChar))
                return getUniqueName(firstPartInName + '_' + (numerizedLastChar + 1) + extWithPoint);
            else
                return getUniqueName(nameWithoutExt + '_1' + extWithPoint); //無法辨識索引 創新索引
        }
        // 找不到_所以取到第一個字母  以及  _在最後的情況
        else
            return getUniqueName(nameWithoutExt + '_1' + extWithPoint); //無法辨識索引 創新索引
    }
    else
        return pathToSave;
}
