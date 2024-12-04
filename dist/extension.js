/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
const vscode = __importStar(__webpack_require__(1));
const simple_git_1 = __webpack_require__(2);
const gitAnalyzer_1 = __webpack_require__(3);
const visualization_1 = __webpack_require__(7);
function activate(context) {
    // Create status bar button
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000 // Higher priority to ensure better visibility
    );
    // Configure status bar item
    statusBarItem.text = "$(graph-line) Git Stats"; // Using git-commit icon
    statusBarItem.tooltip = "Click to view your Git contribution statistics";
    statusBarItem.command = 'code-activity-tracker.showStats';
    // Only show the button when in a workspace with a Git repository
    const updateStatusBarVisibility = () => {
        if (vscode.workspace.workspaceFolders) {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    };
    // Update visibility initially and when workspace folders change
    updateStatusBarVisibility();
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => updateStatusBarVisibility()));
    // Add status bar item to subscriptions for cleanup
    context.subscriptions.push(statusBarItem);
    let disposable = vscode.commands.registerCommand('code-activity-tracker.showStats', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace with a Git repository');
            return;
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        // console.log(`Analyzing repository at: ${rootPath}`);
        const git = (0, simple_git_1.simpleGit)(rootPath);
        try {
            // 检查是否是Git仓库
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                vscode.window.showErrorMessage('This workspace is not a Git repository');
                return;
            }
            // console.log('Valid Git repository confirmed');
            // 创建分析器实例
            const gitAnalyzer = new gitAnalyzer_1.GitContributionAnalyzer(git);
            // 创建可视化实例
            const visualization = new visualization_1.ContributionVisualization(context);
            // 显示加载消息
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing Git history...",
                cancellable: false
            }, async () => {
                const stats = await gitAnalyzer.getContributionStats();
                await visualization.show(stats);
            });
            // 监听时间范围变化
            visualization.onTimeRangeChange(async (days, startDate, endDate) => {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Updating statistics...",
                    cancellable: false
                }, async () => {
                    const stats = await gitAnalyzer.getContributionStats(days, startDate, endDate);
                    await visualization.callData(stats);
                });
            });
        }
        catch (error) {
            vscode.window.showErrorMessage('Error analyzing Git history: ' + error);
            // console.error('Error:', error);
        }
    });
    context.subscriptions.push(disposable);
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("simple-git");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitContributionAnalyzer = void 0;
const simple_git_1 = __importDefault(__webpack_require__(2));
const moment_1 = __importDefault(__webpack_require__(4));
const fs = __importStar(__webpack_require__(5));
const path = __importStar(__webpack_require__(6));
class GitContributionAnalyzer {
    constructor(git, config = {}) {
        this.repoPath = '';
        this.git = git;
        this.config = {
            excludePatterns: [
                '**/*.pb.go', // Go protobuf
                '**/*.pb.js', // JavaScript protobuf
                '**/*.pb.ts', // TypeScript protobuf
                '**/*_pb2.py', // Python protobuf v2
                '**/*_pb3.py', // Python protobuf v3
                '**/generated/**', // 通用生成目录
                '**/*.pb.cs', // C# protobuf
                ...(config.excludePatterns || [])
            ]
        };
    }
    isProtobufGeneratedFile(filePath) {
        console.log(`\nChecking file: ${filePath}`);
        // 检查文件路径是否包含protobuf目录
        if (filePath.includes('Protos/') || filePath.includes('Protos\\')) {
            console.log(`File is in Protos directory: ${filePath}`);
            // 对于C#文件，仍然检查内容以确认
            if (filePath.toLowerCase().endsWith('.cs')) {
                try {
                    console.log(`Reading C# file content: ${filePath}`);
                    const content = fs.readFileSync(filePath, 'utf8');
                    // 只读取前几行来判断
                    const firstFewLines = content.split('\n').slice(0, 5).join('\n');
                    console.log('First few lines:', firstFewLines);
                    // 如果文件不存在，这里会抛出错误
                    return true;
                }
                catch (error) {
                    console.error(`Error reading C# file ${filePath}:`, error);
                    // 如果文件不存在，仍然基于路径判断
                    return true;
                }
            }
            return true;
        }
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.log(`File does not exist: ${filePath}`);
            return false;
        }
        // 对于C#文件，检查文件内容
        if (filePath.toLowerCase().endsWith('.cs')) {
            try {
                console.log(`Reading C# file content: ${filePath}`);
                const content = fs.readFileSync(filePath, 'utf8');
                const firstFewLines = content.split('\n').slice(0, 20).join('\n');
                // 检查是否包含protobuf生成文件的特征
                const markers = [
                    'Generated by the protocol buffer compiler',
                    '<auto-generated>',
                    'DO NOT EDIT',
                    'using pb = global::Google.Protobuf',
                    'using pbc = global::Google.Protobuf.Collections',
                    'namespace Google.Protobuf',
                    '#pragma warning disable'
                ];
                const isGenerated = markers.some(marker => firstFewLines.includes(marker));
                if (isGenerated) {
                    console.log(`Found protobuf generated C# file: ${filePath}`);
                    console.log('First few lines:', firstFewLines);
                }
                return isGenerated;
            }
            catch (error) {
                console.error(`Error reading C# file ${filePath}:`, error);
                return false;
            }
        }
        // 对于其他文件，使用文件名模式匹配
        const isExcluded = this.config.excludePatterns.some(pattern => {
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
            const regex = new RegExp(regexPattern);
            const matches = regex.test(filePath);
            if (matches) {
                console.log(`File matches exclude pattern ${pattern}: ${filePath}`);
            }
            return matches;
        });
        return isExcluded;
    }
    shouldIncludeFile(file) {
        // 首先检查文件路径中是否包含Protos目录
        if (file.includes('Protos/') || file.includes('Protos\\')) {
            console.log(`Excluding file from Protos directory: ${file}`);
            return false;
        }
        const fullPath = path.join(this.repoPath, file);
        const shouldExclude = this.isProtobufGeneratedFile(fullPath);
        if (shouldExclude) {
            console.log(`Excluding generated file: ${file}`);
        }
        return !shouldExclude;
    }
    async getLastCommitTime() {
        console.log('Getting last commit time...');
        try {
            // 使用 --pretty=format 来确保我们得到正确的日期格式
            const log = await this.git.log([
                '-1', // 只获取最后一条提交
                '--pretty=format:%aI' // ISO 8601 格式的作者日期
            ]);
            console.log('Last commit log:', log);
            // 由于我们使用了自定义格式，日期会直接在 log.latest.hash 中
            if (log && log.latest && log.latest.hash) {
                const dateStr = log.latest.hash.trim();
                const lastCommitTime = (0, moment_1.default)(dateStr);
                if (lastCommitTime.isValid()) {
                    console.log('Last commit time:', lastCommitTime.format('YYYY-MM-DD HH:mm:ss'));
                    return lastCommitTime;
                }
                else {
                    console.log('Invalid date format:', dateStr);
                }
            }
            else {
                console.log('No commit found or invalid log format:', log);
            }
        }
        catch (error) {
            console.error('Error getting last commit time:', error);
        }
        // 如果获取失败，返回当前时间
        const currentTime = (0, moment_1.default)();
        console.log('Using current time as fallback:', currentTime.format('YYYY-MM-DD HH:mm:ss'));
        return currentTime;
    }
    async getContributionStats(days = 7, startDateStr, endDateStr) {
        console.log(`Starting contribution analysis for the last ${days} days`);
        console.log(`Repository path: ${this.repoPath}`);
        console.log('Custom date range:', startDateStr, 'to', endDateStr);
        // 计算时间范围
        let endDate;
        let startDate;
        if (startDateStr && endDateStr) {
            // 使用自定义日期范围
            startDate = (0, moment_1.default)(startDateStr).startOf('day');
            endDate = (0, moment_1.default)(endDateStr).endOf('day');
            console.log('Using custom date range');
        }
        else {
            // 使用预设时间范围，从最后一次提交时间开始计算
            console.log('Using preset time range');
            endDate = await this.getLastCommitTime();
            if (!endDate.isValid()) {
                console.log('Invalid end date, using current time');
                endDate = (0, moment_1.default)();
            }
            console.log('End date (last commit):', endDate.format('YYYY-MM-DD HH:mm:ss'));
            // 从最后提交时间开始往前推
            startDate = endDate.clone().subtract(days - 1, 'days').startOf('day');
            console.log('Start date:', startDate.format('YYYY-MM-DD HH:mm:ss'));
            // 确保包含最后一天的所有提交
            endDate = endDate.clone().endOf('day');
            console.log('Adjusted end date:', endDate.format('YYYY-MM-DD HH:mm:ss'));
        }
        console.log(`Analyzing commits from ${startDate.format('YYYY-MM-DD HH:mm:ss')} to ${endDate.format('YYYY-MM-DD HH:mm:ss')}`);
        try {
            const logs = await this.git.log([
                '--all', // 获取所有分支
                '--no-merges', // 不包括合并提交
                '--numstat', // 获取更改统计
                '--date=iso-strict', // ISO格式的日期
                '--pretty=format:commit %H%n%an%n%aI%n%s%n', // 自定义输出格式
                '--since', startDate.format('YYYY-MM-DD HH:mm:ss'), // 使用精确时间
                '--until', endDate.format('YYYY-MM-DD HH:mm:ss'), // 使用精确时间
                '--invert-grep', // 反向匹配，排除匹配的提交
                '--grep=^WIP', // 排除 WIP 提交
                '--grep=^stash', // 排除 stash 提交
                '--grep=^\\[STASH\\]', // 排除 [STASH] 提交
                '--grep=^\\[stash\\]' // 排除 [stash] 提交
            ]);
            if (!logs || !logs.all || logs.all.length === 0) {
                console.log('No commits found in the specified date range');
                return {};
            }
            console.log(`Found ${logs.all.length} commits in the date range`);
            const stats = {};
            // 解析提交日志
            const content = logs.all[0].hash;
            const commits = content.split('\ncommit ');
            for (const commitBlock of commits) {
                if (!commitBlock.trim())
                    continue;
                const lines = commitBlock.split('\n');
                if (lines.length < 4)
                    continue; // 至少需要4行：hash, author, date, subject
                // 解析提交信息
                const hash = lines[0].trim();
                const author = lines[1].trim();
                const dateStr = lines[2].trim();
                const subject = lines[3].trim();
                // 跳过 stash 相关的提交
                if (author.toLowerCase().includes('stash') ||
                    subject.toLowerCase().includes('stash') ||
                    subject.startsWith('WIP') ||
                    subject.startsWith('[STASH]') ||
                    subject.startsWith('[stash]')) {
                    continue;
                }
                // Git ISO date format: YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss+HH:MM
                const date = (0, moment_1.default)(dateStr);
                if (!date.isValid()) {
                    continue;
                }
                // 初始化作者统计
                if (!stats[author]) {
                    stats[author] = {
                        author,
                        email: '', // simple-git的log命令没有返回email
                        startDate,
                        endDate,
                        totalCommits: 0,
                        totalInsertions: 0,
                        totalDeletions: 0,
                        totalFiles: 0,
                        dailyStats: {}
                    };
                }
                // 初始化日期统计
                const dateKey = date.format('YYYY-MM-DD');
                if (!stats[author].dailyStats[dateKey]) {
                    stats[author].dailyStats[dateKey] = {
                        commits: 0,
                        insertions: 0,
                        deletions: 0,
                        files: 0
                    };
                }
                // 更新提交计数
                stats[author].totalCommits++;
                stats[author].dailyStats[dateKey].commits++;
                // 解析文件变更统计
                // 跳过提交信息的4行，后面都是文件统计
                for (let i = 4; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line)
                        continue;
                    const [ins, del, file] = line.split('\t');
                    if (!file)
                        continue;
                    // 检查是否应该包含此文件
                    if (!this.shouldIncludeFile(file)) {
                        console.log(`Skipping generated file in commit ${hash}: ${file}`);
                        continue;
                    }
                    // 解析插入和删除的行数
                    const insertions = ins === '-' ? 0 : parseInt(ins) || 0;
                    const deletions = del === '-' ? 0 : parseInt(del) || 0;
                    // 更新统计
                    stats[author].totalInsertions += insertions;
                    stats[author].totalDeletions += deletions;
                    stats[author].totalFiles++;
                    stats[author].dailyStats[dateKey].insertions += insertions;
                    stats[author].dailyStats[dateKey].deletions += deletions;
                    stats[author].dailyStats[dateKey].files++;
                }
            }
            return stats;
        }
        catch (error) {
            console.error('Error analyzing git log:', error);
            throw error;
        }
    }
    async analyzeRepository(repoPath, startDate, endDate) {
        this.repoPath = repoPath;
        // console.log(`\n=== Starting repository analysis ===`);
        // console.log(`Repository path: ${repoPath}`);
        // console.log(`Date range: ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);
        const git = (0, simple_git_1.default)(repoPath);
        const stats = {};
        try {
            // 获取原始git log输出
            const result = await git.raw([
                'log',
                '--all',
                '--no-merges',
                '--numstat',
                '--format=commit:%H%nauthor:%aN%nemail:%aE%ndate:%aI'
            ]);
            // console.log('\n=== Git log output ===');
            // 按提交分割
            const commits = result.split('\ncommit:').filter(c => c.trim());
            // console.log(`Found ${commits.length} commits`);
            for (const commitData of commits) {
                const lines = commitData.trim().split('\n');
                let hash = '', author = '', email = '', dateStr = '';
                let currentSection = '';
                let insertions = 0, deletions = 0, filesChanged = 0;
                // 解析提交头部信息
                for (const line of lines) {
                    if (line.startsWith('author:')) {
                        author = line.substring(7).trim();
                        // console.log('Author:', author);
                    }
                    else if (line.startsWith('email:')) {
                        email = line.substring(6).trim();
                    }
                    else if (line.startsWith('date:')) {
                        dateStr = line.substring(5).trim();
                        // console.log('Date:', dateStr);
                    }
                    else if (line.trim() && !line.startsWith('commit:')) {
                        // 解析文件统计
                        const parts = line.split('\t');
                        if (parts.length === 3) {
                            const [ins, dels] = parts;
                            const insCount = parseInt(ins) || 0;
                            const delCount = parseInt(dels) || 0;
                            insertions += insCount;
                            deletions += delCount;
                            filesChanged++;
                            // console.log(`File: ${parts[2]}, +${insCount} -${delCount}`);
                        }
                    }
                }
                // 解析日期
                const date = (0, moment_1.default)(dateStr);
                if (!date.isValid()) {
                    // console.warn(`Invalid date: ${dateStr}`);
                    continue;
                }
                // 检查日期范围
                if (date.isBefore(startDate) || date.isAfter(endDate)) {
                    // console.log(`Commit ${hash} outside date range (${date.format()} not in ${startDate.format()} - ${endDate.format()})`);
                    continue;
                }
                // console.log(`Changes: +${insertions} -${deletions} (${filesChanged} files)`);
                // 初始化作者统计
                if (!stats[author]) {
                    stats[author] = {
                        author,
                        email,
                        startDate,
                        endDate,
                        totalCommits: 0,
                        totalInsertions: 0,
                        totalDeletions: 0,
                        totalFiles: 0,
                        dailyStats: {}
                    };
                }
                // 初始化日期统计
                if (!stats[author].dailyStats[date.format('YYYY-MM-DD')]) {
                    stats[author].dailyStats[date.format('YYYY-MM-DD')] = {
                        commits: 0,
                        insertions: 0,
                        deletions: 0,
                        files: 0
                    };
                }
                // 更新统计
                const totalInsertions = insertions;
                const totalDeletions = deletions;
                const totalFiles = filesChanged;
                stats[author].totalCommits++;
                stats[author].totalInsertions += totalInsertions;
                stats[author].totalDeletions += totalDeletions;
                stats[author].totalFiles += totalFiles;
                stats[author].dailyStats[date.format('YYYY-MM-DD')].commits++;
                stats[author].dailyStats[date.format('YYYY-MM-DD')].insertions += totalInsertions;
                stats[author].dailyStats[date.format('YYYY-MM-DD')].deletions += totalDeletions;
                stats[author].dailyStats[date.format('YYYY-MM-DD')].files += totalFiles;
            }
            // console.log('\n=== Final Statistics ===');
            // for (const [author, authorStats] of Object.entries(stats)) {
            //     console.log(`\nAuthor: ${author}`);
            //     console.log(`Total commits: ${authorStats.totalCommits}`);
            //     console.log(`Total insertions: ${authorStats.totalInsertions}`);
            //     console.log(`Total deletions: ${authorStats.totalDeletions}`);
            //     console.log(`Total files: ${authorStats.totalFiles}`);
            //     console.log('Daily stats:', Object.keys(authorStats.dailyStats).length, 'days');
            // }
            return stats;
        }
        catch (error) {
            // console.error('Error analyzing repository:', error);
            throw error;
        }
    }
    processCommitStats(commit, fileStats, stats, startDate, endDate) {
        const { hash, author, email, date } = commit;
        // 检查日期范围
        const commitDate = date.clone().startOf('day');
        const rangeStart = moment_1.default.utc(startDate).startOf('day');
        const rangeEnd = moment_1.default.utc(endDate).endOf('day');
        if (commitDate.isBefore(rangeStart) || commitDate.isAfter(rangeEnd)) {
            // console.log(`Commit ${hash} outside date range (${commitDate.format()} not in ${rangeStart.format()} - ${rangeEnd.format()})`);
            return;
        }
        const dateKey = date.format('YYYY-MM-DD');
        // 初始化作者统计
        if (!stats[author]) {
            stats[author] = {
                author,
                email,
                startDate,
                endDate,
                totalCommits: 0,
                totalInsertions: 0,
                totalDeletions: 0,
                totalFiles: 0,
                dailyStats: {}
            };
        }
        // 初始化日期统计
        if (!stats[author].dailyStats[dateKey]) {
            stats[author].dailyStats[dateKey] = {
                commits: 0,
                insertions: 0,
                deletions: 0,
                files: 0
            };
        }
        // 更新统计
        const totalInsertions = fileStats.insertions.reduce((a, b) => a + b, 0);
        const totalDeletions = fileStats.deletions.reduce((a, b) => a + b, 0);
        const totalFiles = fileStats.insertions.length;
        stats[author].totalCommits++;
        stats[author].totalInsertions += totalInsertions;
        stats[author].totalDeletions += totalDeletions;
        stats[author].totalFiles += totalFiles;
        stats[author].dailyStats[dateKey].commits++;
        stats[author].dailyStats[dateKey].insertions += totalInsertions;
        stats[author].dailyStats[dateKey].deletions += totalDeletions;
        stats[author].dailyStats[dateKey].files += totalFiles;
        // console.log(`Processed commit ${hash}: +${totalInsertions} -${totalDeletions} (${totalFiles} files)`);
    }
    parseNumstat(diff) {
        const lines = diff.split('\n');
        let insertions = 0;
        let deletions = 0;
        let files = 0;
        for (const line of lines) {
            if (!line.trim())
                continue;
            const [ins, dels] = line.split('\t');
            if (!ins || !dels)
                continue;
            insertions += ins === '-' ? 0 : parseInt(ins, 10) || 0;
            deletions += dels === '-' ? 0 : parseInt(dels, 10) || 0;
            files++;
        }
        return { insertions, deletions, files };
    }
}
exports.GitContributionAnalyzer = GitContributionAnalyzer;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("moment");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContributionVisualization = void 0;
const vscode = __importStar(__webpack_require__(1));
const moment_1 = __importDefault(__webpack_require__(4));
class ContributionVisualization {
    constructor(context) {
        this.context = context;
        this.disposables = [];
        this.onTimeRangeChange = (callback) => this.timeRangeChangeCallback = callback;
    }
    dispose() {
        this.panel?.dispose();
        this.disposables.forEach(d => d.dispose());
    }
    async handleTimeRangeChange(days, startDate, endDate) {
        try {
            this.timeRangeChangeCallback(days, startDate, endDate);
        }
        catch (error) {
            console.error('Error updating time range:', error);
        }
    }
    async show(stats) {
        console.log('Showing contribution stats:', stats);
        if (this.panel)
            this.panel.reveal();
        else {
            this.panel = vscode.window.createWebviewPanel('codeActivityStats', 'Git Stats', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            });
            this.panel.onDidDispose(() => this.panel = undefined, null, this.disposables);
            // 添加消息监听器
            this.panel.webview.onDidReceiveMessage(async (message) => {
                switch (message.command) {
                    case 'timeRangeChanged':
                        await this.handleTimeRangeChange(message.days, message.startDate, message.endDate);
                        break;
                }
            }, undefined, this.disposables);
        }
        await this.callData(stats, false);
    }
    async callData(stats, onUpdate = true) {
        if (!this.panel)
            return;
        const authors = Object.values(stats);
        const dates = this.getAllDates(stats);
        // 准备数据
        const commitData = this.prepareCommitData(authors, dates);
        const changeData = this.prepareChangeData(authors, dates);
        if (onUpdate) {
            // 更新图表数据
            await this.panel.webview.postMessage({
                command: 'updateData',
                commitData: commitData,
                changeData: changeData,
                dataTable: authors
            });
        }
        else {
            this.panel.webview.html = `<!DOCTYPE html>
            <html>
            <head>
                <title>Git Stats</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
                <style>
                    :root {
                        --vscode-dropdown-background: var(--vscode-input-background);
                        --vscode-dropdown-foreground: var(--vscode-input-foreground);
                        --vscode-dropdown-border: var(--vscode-input-border);
                    }
                    .container {
                        padding: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .time-range-selector {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 4px 8px;
                        border-radius: 4px;
                    }
                    .date-picker {
                        background-color: var(--vscode-dropdown-background);
                        color: var(--vscode-dropdown-foreground);
                        border: 1px solid var(--vscode-dropdown-border);
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 13px;
                    }
                    .date-separator {
                        color: var(--vscode-foreground);
                        margin: 0 4px;
                    }
                    .chart-container {
                        position: relative;
                        height: 400px;
                        margin-bottom: 20px;
                        background-color: var(--vscode-editor-background);
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .chart-title {
                        margin-bottom: 15px;
                        color: var(--vscode-foreground);
                        font-size: 18px;
                        font-weight: 500;
                    }
                    .summary-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        margin-bottom: 30px;
                        background-color: var(--vscode-editor-background);
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .summary-table th, .summary-table td {
                        padding: 12px;
                        text-align: left;
                        border: 1px solid var(--vscode-dropdown-border);
                    }
                    .summary-table th {
                        background-color: var(--vscode-dropdown-background);
                        font-weight: 500;
                    }
                    .summary-table tr:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    .pie-chart-container {
                        position: absolute;
                        top: 100px;
                        left: 100px;
                        width: 150px;  /* 调整为150px */
                        height: 150px;  /* 调整为150px */
                        background-color: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        cursor: move;
                        z-index: 1000;
                        backdrop-filter: blur(3px);
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
                    }
                    .pie-chart-container:hover {
                        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                    }
                    select {
                        background-color: var(--vscode-dropdown-background);
                        color: var(--vscode-dropdown-foreground);
                        border: 1px solid var(--vscode-dropdown-border);
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 13px;
                    }
                    select:focus {
                        outline: none;
                        border-color: var(--vscode-focusBorder);
                    }
                    h1 {
                        margin: 0;
                        font-size: 24px;
                        color: var(--vscode-foreground);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Git Stats</h1>
                        <div class="time-range-selector">
                            <input type="date" id="startDate" class="date-picker" title="Start Date">
                            <span class="date-separator">to</span>
                            <input type="date" id="endDate" class="date-picker" title="End Date">
                            <select id="timeRange">
                                <option value="7" selected>Last Week</option>
                                <option value="30">Last Month</option>
                                <option value="90">Last 3 Months</option>
                                <option value="180">Last 6 Months</option>
                                <option value="365">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="pie-chart-container">
                            <canvas id="pieChart"></canvas>
                        </div>
                        <h2 class="chart-title">Commits</h2>
                        <canvas id="commitChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <div class="pie-chart-container">
                            <canvas id="linesChangedPieChart"></canvas>
                        </div>
                        <h2 class="chart-title">Lines Changed</h2>
                        <canvas id="changeChart"></canvas>
                    </div>
    
                    <h2>Summary</h2>
                    <table class="summary-table" id="tableSummary"></table>
                </div>
                <script>
                    // 拖动功能
                    const pieChartContainers = document.querySelectorAll('.pie-chart-container');
                    let isDragging = false;
                    let currentX;
                    let currentY;
                    let initialX;
                    let initialY;
                    let activePieChart = null;
    
                    pieChartContainers.forEach(container => {
                        container.addEventListener('mousedown', (e) => {
                            activePieChart = container;
                            dragStart(e);
                        });
                    });
                    
                    document.addEventListener('mousemove', drag);
                    document.addEventListener('mouseup', dragEnd);
    
                    function dragStart(e) {
                        if (!activePieChart) return;
                        initialX = e.clientX - activePieChart.offsetLeft;
                        initialY = e.clientY - activePieChart.offsetTop;
                        isDragging = true;
                    }
    
                    function drag(e) {
                        if (isDragging && activePieChart) {
                            e.preventDefault();
                            currentX = e.clientX - initialX;
                            currentY = e.clientY - initialY;
                            
                            // 限制在图表区域内
                            const container = activePieChart.closest('.chart-container');
                            const maxX = container.offsetWidth - activePieChart.offsetWidth;
                            const maxY = container.offsetHeight - activePieChart.offsetHeight;
                            
                            currentX = Math.max(0, Math.min(currentX, maxX));
                            currentY = Math.max(0, Math.min(currentY, maxY));
    
                            activePieChart.style.left = currentX + 'px';
                            activePieChart.style.top = currentY + 'px';
                        }
                    }
    
                    function dragEnd() {
                        isDragging = false;
                        activePieChart = null;
                    }
    
                    const vscode = acquireVsCodeApi();
                    let commitChart, changeChart, pieChart, linesChangedPieChart;
    
                    // 创建饼图
                    function createPieChart(data) {
                        const ctx = document.getElementById('pieChart');
                        const totalCommits = data.datasets.reduce((acc, dataset) => {
                            return acc + dataset.data.reduce((sum, val) => sum + val, 0);
                        }, 0);
                        
                        const pieData = {
                            labels: data.datasets.map(d => d.label),
                            datasets: [{
                                data: data.datasets.map(d => 
                                    d.data.reduce((sum, val) => sum + val, 0)
                                ),
                                backgroundColor: data.datasets.map(d => d.backgroundColor),
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1
                            }]
                        };
    
                        if (pieChart) {
                            pieChart.destroy();
                        }
    
                        pieChart = new Chart(ctx, {
                            type: 'pie',
                            data: pieData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = context.raw;
                                                const percentage = ((value / totalCommits) * 100).toFixed(1);
                                                return [
                                                    context.label,
                                                    'Commits: ' + value,
                                                    'Percentage: ' + percentage + '%'
                                                ];
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
    
                    // 创建Lines Changed饼图
                    function createLinesChangedPieChart(data) {
                        const ctx = document.getElementById('linesChangedPieChart');
                        const totalLines = data.datasets.reduce((acc, dataset) => {
                            return acc + dataset.data.reduce((sum, val) => sum + val, 0);
                        }, 0);
                        
                        const pieData = {
                            labels: data.datasets.map(d => d.label),
                            datasets: [{
                                data: data.datasets.map(d => 
                                    d.data.reduce((sum, val) => sum + val, 0)
                                ),
                                backgroundColor: data.datasets.map(d => d.backgroundColor),
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1
                            }]
                        };
    
                        if (linesChangedPieChart) {
                            linesChangedPieChart.destroy();
                        }
    
                        linesChangedPieChart = new Chart(ctx, {
                            type: 'pie',
                            data: pieData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const value = context.raw;
                                                const percentage = ((value / totalLines) * 100).toFixed(1);
                                                return [
                                                    context.label,
                                                    'Lines Changed: ' + value,
                                                    'Percentage: ' + percentage + '%'
                                                ];
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
    
                    // 更新现有的图表创建代码
                    function createCommitChart(data) {
                        const ctx = document.getElementById('commitChart');
                        if (commitChart) {
                            commitChart.destroy();
                        }
                        commitChart = new Chart(ctx, {
                            type: 'line',
                            data: data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                    intersect: false,
                                    mode: 'index'
                                },
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.dataset.label + ': ' + context.raw + ' commits';
                                            }
                                        }
                                    }
                                },
                                elements: {
                                    line: {
                                        tension: 0.4,
                                        cubicInterpolationMode: 'monotone'
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Date'
                                        },
                                        ticks: {
                                            maxRotation: 45,
                                            minRotation: 45
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Number of Commits'
                                        }
                                    }
                                }
                            }
                        });
    
                        // 创建饼图
                        createPieChart(data);
                    }
    
                    // 创建变更图表
                    function createChangeChart(data) {
                        const ctx = document.getElementById('changeChart');
                        if (changeChart) {
                            changeChart.destroy();
                        }
                        changeChart = new Chart(ctx, {
                            type: 'bar',
                            data: data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                    intersect: false,
                                    mode: 'index'
                                },
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.dataset.label + ': ' + context.raw + ' lines changed';
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Date'
                                        },
                                        ticks: {
                                            maxRotation: 45,
                                            minRotation: 45
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Lines Changed'
                                        }
                                    }
                                }
                            }
                        });
                        
                        // 创建Lines Changed饼图
                        createLinesChangedPieChart(data);
                    }
                    function buildTable(data) {
                        var table = document.getElementById('tableSummary');
                        table.innerHTML = '<tr> <th>Author</th> <th>Total Commits</th> <th>Lines Added</th> <th>Lines Deleted</th> <th>Files Changed</th> </tr>'
                        data.map(x => table.innerHTML += '<tr> <td>' + x.author + '</td> <td>' + x.totalCommits + '</td> <td>' + x.totalInsertions + '</td> <td>' + x.totalDeletions + '</td> <td>' + x.totalFiles + '</td>')
                    }
                    // 解析数据
                    const commitData = ` + JSON.stringify(commitData) + `;
                    const changeData = ` + JSON.stringify(changeData) + `;
    
                    console.log('Commit data:', commitData);
                    console.log('Change data:', changeData);
    
                    // 创建提交图表
                    createCommitChart(commitData);
    
                    // 创建变更图表
                    createChangeChart(changeData);
    
                    buildTable(` + JSON.stringify(authors) + `)
    
                    // 监听来自 VS Code 的消息
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'updateData':
                                // 更新所有图表
                                if (commitChart) {
                                    commitChart.data = message.commitData;
                                    commitChart.update();
                                    // 更新commits饼图
                                    createPieChart(message.commitData);
                                }
                                if (changeChart) {
                                    changeChart.data = message.changeData;
                                    changeChart.update();
                                    // 更新lines changed饼图
                                    createLinesChangedPieChart(message.changeData);
                                }
                                buildTable(message.dataTable)
                                break;
                        }
                    });
    
                    // 时间范围选择处理
                    const timeRangeSelect = document.getElementById('timeRange');
                    const startDateInput = document.getElementById('startDate');
                    const endDateInput = document.getElementById('endDate');
    
                    // 设置默认日期范围（最近一周）
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 6); // Last 7 days (including today)
                    
                    startDateInput.value = startDate.toISOString().split('T')[0];
                    endDateInput.value = endDate.toISOString().split('T')[0];
    
                    // 时间范围选择变化处理
                    timeRangeSelect.addEventListener('change', function(e) {
                        const value = this.value;
                        const today = new Date();
                        let start = new Date();
    
                        if (value === 'custom') {
                            return; // 保持当前选择的日期不变
                        }
    
                        const days = parseInt(value);
                        start.setDate(today.getDate() - (days - 1)); // -1是因为包含今天
    
                        startDateInput.value = start.toISOString().split('T')[0];
                        endDateInput.value = today.toISOString().split('T')[0];
    
                        // 通知扩展时间范围已更改
                        vscode.postMessage({
                            command: 'timeRangeChanged',
                            days: days
                        });
                    });
    
                    // 日期选择变化处理
                    function handleDateChange() {
                        const start = new Date(startDateInput.value);
                        const end = new Date(endDateInput.value);
                        
                        if (start && end && start <= end) {
                            // 计算天数差异
                            const diffTime = Math.abs(end - start);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 包含开始日期
                            
                            // 设置下拉框为custom
                            timeRangeSelect.value = 'custom';
                            
                            // 通知扩展时间范围已更改
                            vscode.postMessage({
                                command: 'timeRangeChanged',
                                days: diffDays,
                                startDate: startDateInput.value,
                                endDate: endDateInput.value
                            });
                        }
                    }
    
                    startDateInput.addEventListener('change', handleDateChange);
                    endDateInput.addEventListener('change', handleDateChange);
                </script>
            </body>
            </html>`;
        }
    }
    getAllDates(stats) {
        const startDate = moment_1.default.utc(Object.values(stats)[0]?.startDate);
        const endDate = moment_1.default.utc(Object.values(stats)[0]?.endDate);
        const dates = [];
        console.log('Date range:', startDate.format(), 'to', endDate.format());
        let currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate)) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
        return dates;
    }
    prepareCommitData(authors, dates) {
        // 过滤掉 stash 相关的作者
        authors = authors.filter(author => !author.author.toLowerCase().includes('stash'));
        const datasets = authors.map((author, index) => ({
            label: author.author,
            data: dates.map(date => author.dailyStats[date]?.commits || 0),
            borderColor: this.getColor(index),
            backgroundColor: this.getColor(index),
            fill: false,
            tension: 0.4, // 添加曲线张力
            cubicInterpolationMode: 'monotone' // 使用单调的三次插值
        }));
        return {
            labels: dates,
            datasets
        };
    }
    prepareChangeData(authors, dates) {
        // 过滤掉 stash 相关的作者
        authors = authors.filter(author => !author.author.toLowerCase().includes('stash'));
        const datasets = authors.map((author, index) => ({
            label: author.author,
            data: dates.map(date => {
                const stats = author.dailyStats[date];
                return stats ? stats.insertions + stats.deletions : 0;
            }),
            backgroundColor: this.getColor(index),
            stack: 'combined'
        }));
        return {
            labels: dates,
            datasets
        };
    }
    getColor(index) {
        const colors = [
            '#2196F3', // Blue
            '#4CAF50', // Green
            '#F44336', // Red
            '#FFC107', // Amber
            '#9C27B0', // Purple
            '#00BCD4', // Cyan
            '#FF9800', // Orange
            '#795548', // Brown
            '#607D8B', // Blue Grey
            '#E91E63' // Pink
        ];
        return colors[index % colors.length];
    }
}
exports.ContributionVisualization = ContributionVisualization;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map