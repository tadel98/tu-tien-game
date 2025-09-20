import { ArenaUtils, arenaRanks, seasonRewards } from '../core/GameData.js';

/**
 * ArenaRankingComponent - Quản lý giao diện xếp hạng đấu trường
 */
export class ArenaRankingComponent {
    constructor(gameState, gameLogic) {
        this.gameState = gameState;
        this.gameLogic = gameLogic;
        this.isVisible = false;
        this.arenaPanel = null;
        this.currentTab = 'ranking'; // 'ranking', 'leaderboard', 'history', 'rewards'
        
        // Bind methods
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleMatchTypeClick = this.handleMatchTypeClick.bind(this);
    }

    /**
     * Khởi tạo arena ranking component
     */
    initialize() {
        this.createArenaPanel();
        this.setupEventListeners();
        console.log('ArenaRankingComponent initialized');
    }

    /**
     * Tạo panel arena ranking
     */
    createArenaPanel() {
        const panelHTML = `
            <div id="arenaPanel" class="arena-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 800px;
                max-height: 700px;
                background: rgba(0, 0, 0, 0.95);
                border: 3px solid #444;
                border-radius: 15px;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: none;
                font-family: Arial, sans-serif;
                color: white;
            ">
                <!-- Header -->
                <div class="arena-header" style="
                    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
                    padding: 15px 20px;
                    border-radius: 12px 12px 0 0;
                    border-bottom: 2px solid #444;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #ffd700; font-size: 18px;">
                        🏆 Đấu Trường Tu Tiên
                    </h3>
                    <button id="closeArenaBtn" style="
                        background: #ff4444;
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 16px;
                    " title="Đóng">×</button>
                </div>

                <!-- Tabs -->
                <div class="arena-tabs" style="
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid #333;
                ">
                    <button class="arena-tab active" data-tab="ranking" style="
                        flex: 1; padding: 12px; background: none; border: none;
                        color: #ffd700; cursor: pointer; font-weight: bold;
                        border-bottom: 2px solid #ffd700;
                    ">📊 Xếp Hạng</button>
                    <button class="arena-tab" data-tab="leaderboard" style="
                        flex: 1; padding: 12px; background: none; border: none;
                        color: #aaa; cursor: pointer; font-weight: bold;
                        border-bottom: 2px solid transparent;
                    ">🏅 Bảng Xếp Hạng</button>
                    <button class="arena-tab" data-tab="history" style="
                        flex: 1; padding: 12px; background: none; border: none;
                        color: #aaa; cursor: pointer; font-weight: bold;
                        border-bottom: 2px solid transparent;
                    ">📜 Lịch Sử</button>
                    <button class="arena-tab" data-tab="rewards" style="
                        flex: 1; padding: 12px; background: none; border: none;
                        color: #aaa; cursor: pointer; font-weight: bold;
                        border-bottom: 2px solid transparent;
                    ">🎁 Phần Thưởng</button>
                </div>

                <!-- Content -->
                <div class="arena-content" style="
                    padding: 20px;
                    max-height: 500px;
                    overflow-y: auto;
                ">
                    <!-- Ranking Tab -->
                    <div id="rankingTab" class="arena-tab-content">
                        <!-- Player Stats -->
                        <div class="player-stats" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                            margin-bottom: 20px;
                        ">
                            <h4 style="margin: 0 0 15px 0; color: #4caf50; text-align: center;">
                                📊 Thống Kê Cá Nhân
                            </h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #ffd700;">🏆 Cấp Bậc:</span>
                                        <span id="currentRank" style="font-weight: bold; color: #ffd700;">Chưa Xếp Hạng</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #2196f3;">⭐ Điểm:</span>
                                        <span id="currentPoints" style="font-weight: bold;">1000</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #4caf50;">✅ Thắng:</span>
                                        <span id="wins" style="font-weight: bold;">0</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #f44336;">❌ Thua:</span>
                                        <span id="losses" style="font-weight: bold;">0</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #ff9800;">🔥 Chuỗi Thắng:</span>
                                        <span id="winStreak" style="font-weight: bold;">0</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #9c27b0;">📈 Tỷ Lệ Thắng:</span>
                                        <span id="winRate" style="font-weight: bold;">0%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #00bcd4;">🎯 Tổng Trận:</span>
                                        <span id="totalMatches" style="font-weight: bold;">0</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                        <span style="color: #e91e63;">🏅 Vị Trí:</span>
                                        <span id="leaderboardPosition" style="font-weight: bold;">#-</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Rank Progress -->
                            <div style="margin-top: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="color: #aaa; font-size: 12px;">Tiến độ lên cấp</span>
                                    <span id="rankProgress" style="color: #aaa; font-size: 12px;">0/200</span>
                                </div>
                                <div style="background: #333; height: 8px; border-radius: 4px;">
                                    <div id="rankProgressBar" style="
                                        background: linear-gradient(90deg, #4caf50, #8bc34a);
                                        height: 100%; border-radius: 4px; width: 0%;
                                        transition: width 0.3s ease;
                                    "></div>
                                </div>
                                <div id="nextRankInfo" style="
                                    color: #aaa; font-size: 11px; margin-top: 5px; text-align: center;
                                ">Cần 200 điểm để lên Đồng V</div>
                            </div>
                        </div>

                        <!-- Match Types -->
                        <div class="match-types" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                        ">
                            <h4 style="margin: 0 0 15px 0; color: #2196f3; text-align: center;">
                                ⚔️ Loại Trận Đấu
                            </h4>
                            
                            <div id="matchTypesList" style="display: grid; gap: 10px;">
                                <!-- Match types will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Leaderboard Tab -->
                    <div id="leaderboardTab" class="arena-tab-content" style="display: none;">
                        <div class="leaderboard" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                        ">
                            <h4 style="margin: 0 0 15px 0; color: #ffd700; text-align: center;">
                                🏅 Bảng Xếp Hạng Top 20
                            </h4>
                            
                            <div id="leaderboardList" style="max-height: 300px; overflow-y: auto;">
                                <!-- Leaderboard entries will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- History Tab -->
                    <div id="historyTab" class="arena-tab-content" style="display: none;">
                        <div class="match-history" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                        ">
                            <h4 style="margin: 0 0 15px 0; color: #9c27b0; text-align: center;">
                                📜 Lịch Sử Trận Đấu
                            </h4>
                            
                            <div id="matchHistoryList" style="max-height: 300px; overflow-y: auto;">
                                <!-- Match history will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Rewards Tab -->
                    <div id="rewardsTab" class="arena-tab-content" style="display: none;">
                        <div class="season-rewards" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                        ">
                            <h4 style="margin: 0 0 15px 0; color: #ff9800; text-align: center;">
                                🎁 Phần Thưởng Mùa Giải
                            </h4>
                            
                            <div style="margin-bottom: 15px; text-align: center;">
                                <div style="color: #aaa; font-size: 14px; margin-bottom: 5px;">
                                    Mùa hiện tại: <span id="seasonName" style="color: #ffd700;">Mùa Khởi Đầu</span>
                                </div>
                                <div style="color: #aaa; font-size: 12px;">
                                    Còn lại: <span id="seasonTimeRemaining" style="color: #4caf50;">30 ngày</span>
                                </div>
                            </div>
                            
                            <div id="currentRewards" style="
                                background: rgba(76, 175, 80, 0.1);
                                border: 1px solid #4caf50;
                                border-radius: 8px;
                                padding: 15px;
                                margin-bottom: 15px;
                            ">
                                <h5 style="margin: 0 0 10px 0; color: #4caf50;">Phần thưởng hiện tại</h5>
                                <div id="currentRewardsList">
                                    <!-- Current rewards will be populated here -->
                                </div>
                            </div>
                            
                            <div id="rewardsList" style="max-height: 200px; overflow-y: auto;">
                                <!-- All rewards will be populated here -->
                            </div>
                            
                            <div style="text-align: center; margin-top: 15px;">
                                <button id="claimRewardsBtn" style="
                                    background: #4caf50;
                                    border: none;
                                    color: white;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    font-weight: bold;
                                ">Nhận Phần Thưởng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.arenaPanel = document.getElementById('arenaPanel');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeArenaBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Tab clicks
        const tabs = document.querySelectorAll('.arena-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e, tab));
        });

        // Claim rewards button
        const claimBtn = document.getElementById('claimRewardsBtn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => this.claimSeasonRewards());
        }

        // Listen to game state changes
        this.gameState.addEventListener('arenaMatchCompleted', () => this.refresh());
        this.gameState.addEventListener('arenaRankChanged', () => this.refresh());
        this.gameState.addEventListener('leaderboardUpdated', () => this.refresh());
    }

    /**
     * Hiển thị arena panel
     */
    show() {
        this.isVisible = true;
        this.arenaPanel.style.display = 'block';
        this.refresh();
        
        // Animation
        this.arenaPanel.style.opacity = '0';
        this.arenaPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        requestAnimationFrame(() => {
            this.arenaPanel.style.transition = 'all 0.3s ease';
            this.arenaPanel.style.opacity = '1';
            this.arenaPanel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    /**
     * Ẩn arena panel
     */
    hide() {
        this.isVisible = false;
        
        // Animation
        this.arenaPanel.style.transition = 'all 0.3s ease';
        this.arenaPanel.style.opacity = '0';
        this.arenaPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.arenaPanel.style.display = 'none';
        }, 300);
    }

    /**
     * Toggle arena panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Refresh arena display
     */
    refresh() {
        this.updatePlayerStats();
        this.updateMatchTypes();
        this.updateLeaderboard();
        this.updateMatchHistory();
        this.updateSeasonRewards();
    }

    /**
     * Handle tab click
     */
    handleTabClick(e, tab) {
        const tabName = tab.dataset.tab;
        
        // Update tab appearance
        document.querySelectorAll('.arena-tab').forEach(t => {
            t.classList.remove('active');
            t.style.color = '#aaa';
            t.style.borderBottomColor = 'transparent';
        });
        
        tab.classList.add('active');
        tab.style.color = '#ffd700';
        tab.style.borderBottomColor = '#ffd700';
        
        // Show corresponding content
        document.querySelectorAll('.arena-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const targetContent = document.getElementById(`${tabName}Tab`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        this.currentTab = tabName;
        
        // Refresh specific tab content
        switch (tabName) {
            case 'leaderboard':
                this.updateLeaderboard();
                break;
            case 'history':
                this.updateMatchHistory();
                break;
            case 'rewards':
                this.updateSeasonRewards();
                break;
        }
    }

    /**
     * Update player stats display
     */
    updatePlayerStats() {
        const stats = this.gameLogic.getArenaStatistics();
        
        // Update basic stats
        document.getElementById('currentRank').textContent = stats.currentRank.name;
        document.getElementById('currentRank').style.color = stats.currentRank.color;
        document.getElementById('currentPoints').textContent = stats.points.toLocaleString();
        document.getElementById('wins').textContent = stats.wins;
        document.getElementById('losses').textContent = stats.losses;
        document.getElementById('winStreak').textContent = stats.winStreak;
        document.getElementById('winRate').textContent = `${(stats.winRate * 100).toFixed(1)}%`;
        document.getElementById('totalMatches').textContent = stats.totalMatches;
        document.getElementById('leaderboardPosition').textContent = `#${stats.leaderboardPosition}`;
        
        // Update rank progress
        if (stats.nextRank) {
            const currentPoints = stats.points;
            const currentRank = stats.currentRank;
            const nextRank = stats.nextRank;
            
            const pointsInCurrentRank = currentPoints - currentRank.minPoints;
            const pointsNeededForNext = nextRank.minPoints - currentRank.minPoints;
            const progress = Math.min(100, (pointsInCurrentRank / pointsNeededForNext) * 100);
            
            document.getElementById('rankProgress').textContent = 
                `${pointsInCurrentRank}/${pointsNeededForNext}`;
            document.getElementById('rankProgressBar').style.width = `${progress}%`;
            document.getElementById('nextRankInfo').textContent = 
                `Cần ${nextRank.minPoints - currentPoints} điểm để lên ${nextRank.name}`;
        } else {
            document.getElementById('rankProgress').textContent = 'MAX';
            document.getElementById('rankProgressBar').style.width = '100%';
            document.getElementById('nextRankInfo').textContent = 'Đã đạt cấp bậc cao nhất!';
        }
    }

    /**
     * Update match types display
     */
    updateMatchTypes() {
        const matchTypesList = document.getElementById('matchTypesList');
        const availableTypes = this.gameLogic.getAvailableMatchTypes();
        
        matchTypesList.innerHTML = '';
        
        availableTypes.forEach(matchType => {
            const cooldownInfo = this.gameLogic.getMatchTypeCooldownInfo(matchType);
            const matchTypeData = this.gameState.arena.availableMatchTypes.includes(matchType) ? 
                this.gameState.arena.availableMatchTypes[matchType] : null;
            
            if (!matchTypeData) return;
            
            const isAvailable = cooldownInfo.isAvailable;
            const cooldownRemaining = cooldownInfo.cooldownRemaining;
            
            const matchTypeElement = document.createElement('div');
            matchTypeElement.style.cssText = `
                background: ${isAvailable ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
                border: 1px solid ${isAvailable ? '#4caf50' : '#f44336'};
                border-radius: 8px;
                padding: 15px;
                cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                transition: all 0.2s ease;
            `;
            
            matchTypeElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h5 style="margin: 0 0 5px 0; color: ${isAvailable ? '#4caf50' : '#f44336'};">
                            ${matchTypeData.name}
                        </h5>
                        <p style="margin: 0; color: #aaa; font-size: 12px;">
                            ${matchTypeData.description}
                        </p>
                        ${!isAvailable ? `
                            <p style="margin: 5px 0 0 0; color: #f44336; font-size: 11px;">
                                Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s
                            </p>
                        ` : ''}
                    </div>
                    <button style="
                        background: ${isAvailable ? '#4caf50' : '#666'};
                        border: none;
                        color: white;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                        font-weight: bold;
                        font-size: 12px;
                    " ${isAvailable ? '' : 'disabled'}>
                        ${isAvailable ? 'Tham Gia' : 'Không Khả Dụng'}
                    </button>
                </div>
            `;
            
            if (isAvailable) {
                matchTypeElement.addEventListener('click', () => this.handleMatchTypeClick(matchType));
            }
            
            matchTypesList.appendChild(matchTypeElement);
        });
    }

    /**
     * Update leaderboard display
     */
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        const leaderboard = this.gameLogic.getLeaderboard(20);
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = `
                <div style="text-align: center; color: #aaa; padding: 20px;">
                    Chưa có dữ liệu bảng xếp hạng
                </div>
            `;
            return;
        }
        
        leaderboardList.innerHTML = leaderboard.map((entry, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
            const isCurrentPlayer = entry.playerName === this.gameState.player.name;
            
            return `
                <div style="
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 10px; margin: 5px 0;
                    background: ${isCurrentPlayer ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
                    border: 1px solid ${isCurrentPlayer ? '#ffd700' : '#333'};
                    border-radius: 5px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px;">${rankIcon}</span>
                        <span style="font-weight: bold; color: ${isCurrentPlayer ? '#ffd700' : 'white'};">
                            #${rank}
                        </span>
                        <span style="color: ${isCurrentPlayer ? '#ffd700' : '#aaa'};">
                            ${entry.playerName}
                        </span>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #2196f3; font-weight: bold;">
                            ${entry.points.toLocaleString()} điểm
                        </div>
                        <div style="color: #aaa; font-size: 11px;">
                            ${entry.wins}W ${entry.losses}L (${(entry.winRate * 100).toFixed(1)}%)
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update match history display
     */
    updateMatchHistory() {
        const matchHistoryList = document.getElementById('matchHistoryList');
        const history = this.gameLogic.getRecentMatchHistory(10);
        
        if (history.length === 0) {
            matchHistoryList.innerHTML = `
                <div style="text-align: center; color: #aaa; padding: 20px;">
                    Chưa có lịch sử trận đấu
                </div>
            `;
            return;
        }
        
        matchHistoryList.innerHTML = history.map(match => {
            const isWin = match.result === 'win';
            const resultIcon = isWin ? '✅' : '❌';
            const resultColor = isWin ? '#4caf50' : '#f44336';
            const pointsChange = match.pointsChange > 0 ? `+${match.pointsChange}` : `${match.pointsChange}`;
            const pointsColor = match.pointsChange > 0 ? '#4caf50' : '#f44336';
            
            const matchDate = new Date(match.timestamp);
            const timeStr = matchDate.toLocaleString('vi-VN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div style="
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 10px; margin: 5px 0;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid #333;
                    border-radius: 5px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">${resultIcon}</span>
                        <div>
                            <div style="color: ${resultColor}; font-weight: bold;">
                                ${isWin ? 'Thắng' : 'Thua'} vs ${match.opponentName}
                            </div>
                            <div style="color: #aaa; font-size: 11px;">
                                ${timeStr} • ${match.matchType}
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${pointsColor}; font-weight: bold;">
                            ${pointsChange} điểm
                        </div>
                        <div style="color: #aaa; font-size: 11px;">
                            ${Math.floor(match.duration / 1000)}s
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update season rewards display
     */
    updateSeasonRewards() {
        const seasonInfo = this.gameLogic.getArenaSeasonInfo();
        const currentRewards = this.gameState.getCurrentSeasonRewards();
        
        // Update season info
        document.getElementById('seasonName').textContent = seasonInfo.name;
        document.getElementById('seasonTimeRemaining').textContent = 
            `${seasonInfo.daysRemaining} ngày`;
        
        // Update current rewards
        const currentRewardsList = document.getElementById('currentRewardsList');
        currentRewardsList.innerHTML = `
            <div style="display: flex; gap: 15px; justify-content: center;">
                ${currentRewards.gold > 0 ? `
                    <div style="text-align: center;">
                        <div style="color: #ffd700; font-size: 18px;">💰</div>
                        <div style="color: #ffd700; font-weight: bold;">${currentRewards.gold.toLocaleString()}</div>
                        <div style="color: #aaa; font-size: 11px;">Vàng</div>
                    </div>
                ` : ''}
                ${currentRewards.spiritStones > 0 ? `
                    <div style="text-align: center;">
                        <div style="color: #00bcd4; font-size: 18px;">💎</div>
                        <div style="color: #00bcd4; font-weight: bold;">${currentRewards.spiritStones.toLocaleString()}</div>
                        <div style="color: #aaa; font-size: 11px;">Linh Thạch</div>
                    </div>
                ` : ''}
                ${currentRewards.cultivationPills > 0 ? `
                    <div style="text-align: center;">
                        <div style="color: #9c27b0; font-size: 18px;">🔮</div>
                        <div style="color: #9c27b0; font-weight: bold;">${currentRewards.cultivationPills.toLocaleString()}</div>
                        <div style="color: #aaa; font-size: 11px;">Tu Luyện Đan</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Update all rewards list
        const rewardsList = document.getElementById('rewardsList');
        rewardsList.innerHTML = Object.entries(seasonRewards).map(([rankName, rewards]) => {
            const rankData = arenaRanks.find(r => r.name === rankName);
            if (!rankData) return '';
            
            return `
                <div style="
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 8px; margin: 3px 0;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid #333;
                    border-radius: 5px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">${rankData.icon}</span>
                        <span style="color: ${rankData.color}; font-weight: bold;">
                            ${rankName}
                        </span>
                    </div>
                    <div style="color: #aaa; font-size: 12px;">
                        ${rewards.gold > 0 ? `💰${rewards.gold}` : ''}
                        ${rewards.spiritStones > 0 ? ` 💎${rewards.spiritStones}` : ''}
                        ${rewards.cultivationPills > 0 ? ` 🔮${rewards.cultivationPills}` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Handle match type click
     */
    handleMatchTypeClick(matchType) {
        const result = this.gameLogic.startArenaMatch(matchType);
        if (result) {
            this.showNotification(`Trận đấu ${result.result === 'win' ? 'thắng' : 'thua'}! ${result.pointsChange > 0 ? '+' : ''}${result.pointsChange} điểm`);
            this.refresh();
        } else {
            this.showNotification('Không thể tham gia trận đấu này!', 'error');
        }
    }

    /**
     * Claim season rewards
     */
    claimSeasonRewards() {
        const rewards = this.gameLogic.claimSeasonRewards();
        this.showNotification(`Đã nhận phần thưởng mùa giải!`, 'success');
        this.refresh();
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.uiManager && window.uiManager.showNotification) {
            window.uiManager.showNotification(message, type);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.arenaPanel) {
            this.arenaPanel.remove();
        }
        console.log('ArenaRankingComponent destroyed');
    }
}

// Make available globally for onclick handlers
window.arenaRankingComponent = null;
