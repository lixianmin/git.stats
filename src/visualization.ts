import * as vscode from 'vscode';
import * as path from 'path';
import { AuthorStats } from './gitAnalyzer';
import moment from 'moment';

export class ContributionVisualization {
    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];
    private timeRangeChangeCallback: (days: number, startDate?: string, endDate?: string) => void;
    constructor(private context: vscode.ExtensionContext) {}

    public onTimeRangeChange = (callback: (days: number, startDate?: string, endDate?: string) => void) => this.timeRangeChangeCallback = callback;

    public dispose() {
        this.panel?.dispose();
        this.disposables.forEach(d => d.dispose());
    }
    private async handleTimeRangeChange(days: number, startDate?: string, endDate?: string) {
        try {
            this.timeRangeChangeCallback(days, startDate, endDate)
        } catch (error) {
            console.error('Error updating time range:', error);
        }
    }

    public async show(stats: { [author: string]: AuthorStats }) {
        console.log('Showing contribution stats:', stats);

        if (this.panel)
            this.panel.reveal()
        else {
            this.panel = vscode.window.createWebviewPanel(
                'codeActivityStats',
                'Git Stats',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [this.context.extensionUri]
                }
            );
            this.panel.onDidDispose(() => this.panel = undefined, null, this.disposables);
            // 添加消息监听器
            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'timeRangeChanged':
                            await this.handleTimeRangeChange(message.days, message.startDate, message.endDate);
                            break;
                    }
                }, undefined, this.disposables
            );
        }
        await this.callData(stats, false)
    }

    public async callData(stats: { [author: string]: AuthorStats }, onUpdate: boolean = true) {
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
    
                    buildTable(`+ JSON.stringify(authors) + `)
    
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

    private getAllDates(stats: { [author: string]: AuthorStats }): string[] {
        const startDate = moment.utc(Object.values(stats)[0]?.startDate);
        const endDate = moment.utc(Object.values(stats)[0]?.endDate);
        const dates: string[] = [];

        console.log('Date range:', startDate.format(), 'to', endDate.format());

        let currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate)) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }

        return dates;
    }

    private prepareCommitData(authors: AuthorStats[], dates: string[]) {
        // 过滤掉 stash 相关的作者
        authors = authors.filter(author =>
            !author.author.toLowerCase().includes('stash')
        );

        const datasets = authors.map((author, index) => ({
            label: author.author,
            data: dates.map(date => author.dailyStats[date]?.commits || 0),
            borderColor: this.getColor(index),
            backgroundColor: this.getColor(index),
            fill: false,
            tension: 0.4,  // 添加曲线张力
            cubicInterpolationMode: 'monotone'  // 使用单调的三次插值
        }));

        return {
            labels: dates,
            datasets
        };
    }

    private prepareChangeData(authors: AuthorStats[], dates: string[]) {
        // 过滤掉 stash 相关的作者
        authors = authors.filter(author =>
            !author.author.toLowerCase().includes('stash')
        );

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

    private getColor(index: number): string {
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
            '#E91E63'  // Pink
        ];
        return colors[index % colors.length];
    }
}
