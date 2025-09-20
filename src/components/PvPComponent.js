import { ArenaUtils, arenaMatchTypes, arenaOpponents } from '../core/GameData.js';

/**
 * PvPComponent - Quản lý giao diện đấu trường PvP
 */
export class PvPComponent {
    constructor(gameState, gameLogic) {
        this.gameState = gameState;
        this.gameLogic = gameLogic;
        this.isVisible = false;
        this.pvpPanel = null;
        this.currentMatch = null;
        this.matchAnimation = null;
        
        // Bind methods
        this.handleMatchStart = this.handleMatchStart.bind(this);
        this.handleMatchEnd = this.handleMatchEnd.bind(this);
    }

    /**
     * Khởi tạo PvP component
     */
    initialize() {
        this.createPvPPanel();
        this.setupEventListeners();
        console.log('PvPComponent initialized');
    }

    /**
     * Tạo panel PvP
     */
    createPvPPanel() {
        const panelHTML = `
            <div id="pvpPanel" class="pvp-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 700px;
                max-height: 600px;
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
                <div class="pvp-header" style="
                    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
                    padding: 15px 20px;
                    border-radius: 12px 12px 0 0;
                    border-bottom: 2px solid #444;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #ff6b6b; font-size: 18px;">
                        ⚔️ Đấu Trường PvP
                    </h3>
                    <button id="closePvPBtn" style="
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

                <!-- Content -->
                <div class="pvp-content" style="padding: 20px;">
                    <!-- Match Selection -->
                    <div id="matchSelection" class="match-selection">
                        <h4 style="margin: 0 0 15px 0; color: #4caf50; text-align: center;">
                            🎯 Chọn Loại Trận Đấu
                        </h4>
                        
                        <div id="matchTypesGrid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 15px;
                            margin-bottom: 20px;
                        ">
                            <!-- Match types will be populated here -->
                        </div>
                        
                        <!-- Quick Match Button -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <button id="quickMatchBtn" style="
                                background: linear-gradient(135deg, #4caf50, #45a049);
                                border: none;
                                color: white;
                                padding: 15px 30px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: bold;
                                font-size: 16px;
                                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                                transition: all 0.3s ease;
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                ⚡ Trận Đấu Nhanh
                            </button>
                        </div>
                    </div>

                    <!-- Match In Progress -->
                    <div id="matchInProgress" class="match-in-progress" style="display: none;">
                        <h4 style="margin: 0 0 15px 0; color: #ff9800; text-align: center;">
                            ⚔️ Trận Đấu Đang Diễn Ra
                        </h4>
                        
                        <!-- Match Info -->
                        <div style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                            margin-bottom: 20px;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div style="text-align: center; flex: 1;">
                                    <div style="font-size: 24px; margin-bottom: 5px;">${this.gameState.player.name}</div>
                                    <div style="color: #4caf50; font-weight: bold;" id="playerPower">0</div>
                                    <div style="color: #aaa; font-size: 12px;">Sức mạnh</div>
                                </div>
                                
                                <div style="text-align: center; flex: 1;">
                                    <div style="font-size: 24px; color: #ff6b6b;">VS</div>
                                    <div style="color: #aaa; font-size: 12px;">Đấu trường</div>
                                </div>
                                
                                <div style="text-align: center; flex: 1;">
                                    <div style="font-size: 24px; margin-bottom: 5px;" id="opponentName">Đối thủ</div>
                                    <div style="color: #f44336; font-weight: bold;" id="opponentPower">0</div>
                                    <div style="color: #aaa; font-size: 12px;">Sức mạnh</div>
                                </div>
                            </div>
                            
                            <!-- Match Progress -->
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="color: #aaa; font-size: 12px;">Tiến độ trận đấu</span>
                                    <span id="matchProgress" style="color: #aaa; font-size: 12px;">0%</span>
                                </div>
                                <div style="background: #333; height: 8px; border-radius: 4px;">
                                    <div id="matchProgressBar" style="
                                        background: linear-gradient(90deg, #ff6b6b, #ff9800);
                                        height: 100%; border-radius: 4px; width: 0%;
                                        transition: width 0.3s ease;
                                    "></div>
                                </div>
                            </div>
                            
                            <!-- Match Stats -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <div style="color: #4caf50; font-size: 14px; margin-bottom: 5px;">Tỷ lệ thắng</div>
                                    <div id="winChance" style="color: #4caf50; font-weight: bold; font-size: 18px;">50%</div>
                                </div>
                                <div>
                                    <div style="color: #2196f3; font-size: 14px; margin-bottom: 5px;">Thời gian</div>
                                    <div id="matchTime" style="color: #2196f3; font-weight: bold; font-size: 18px;">0s</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Match Actions -->
                        <div style="text-align: center;">
                            <button id="cancelMatchBtn" style="
                                background: #f44336;
                                border: none;
                                color: white;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                                margin-right: 10px;
                            ">Hủy Trận Đấu</button>
                        </div>
                    </div>

                    <!-- Match Result -->
                    <div id="matchResult" class="match-result" style="display: none;">
                        <h4 style="margin: 0 0 15px 0; color: #ffd700; text-align: center;">
                            🏆 Kết Quả Trận Đấu
                        </h4>
                        
                        <div id="resultContent" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <!-- Result content will be populated here -->
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button id="playAgainBtn" style="
                                background: #4caf50;
                                border: none;
                                color: white;
                                padding: 12px 25px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                                margin-right: 10px;
                            ">Chơi Lại</button>
                            <button id="closeResultBtn" style="
                                background: #666;
                                border: none;
                                color: white;
                                padding: 12px 25px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                            ">Đóng</button>
                        </div>
                    </div>

                    <!-- Arena Stats Preview -->
                    <div id="arenaStatsPreview" style="
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid #333;
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                    ">
                        <h5 style="margin: 0 0 10px 0; color: #ffd700; text-align: center;">
                            📊 Thống Kê Đấu Trường
                        </h5>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #aaa;">Cấp bậc:</span>
                                <span id="previewRank" style="color: #ffd700; font-weight: bold;">Chưa Xếp Hạng</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #aaa;">Điểm:</span>
                                <span id="previewPoints" style="color: #2196f3; font-weight: bold;">1000</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #aaa;">Thắng:</span>
                                <span id="previewWins" style="color: #4caf50; font-weight: bold;">0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #aaa;">Thua:</span>
                                <span id="previewLosses" style="color: #f44336; font-weight: bold;">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.pvpPanel = document.getElementById('pvpPanel');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closePvPBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Quick match button
        const quickMatchBtn = document.getElementById('quickMatchBtn');
        if (quickMatchBtn) {
            quickMatchBtn.addEventListener('click', () => this.startQuickMatch());
        }

        // Cancel match button
        const cancelMatchBtn = document.getElementById('cancelMatchBtn');
        if (cancelMatchBtn) {
            cancelMatchBtn.addEventListener('click', () => this.cancelMatch());
        }

        // Play again button
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.playAgain());
        }

        // Close result button
        const closeResultBtn = document.getElementById('closeResultBtn');
        if (closeResultBtn) {
            closeResultBtn.addEventListener('click', () => this.closeResult());
        }

        // Listen to game state changes
        this.gameState.addEventListener('arenaMatchCompleted', (data) => this.handleMatchCompleted(data));
        this.gameState.addEventListener('arenaRankChanged', () => this.updateArenaStatsPreview());
    }

    /**
     * Hiển thị PvP panel
     */
    show() {
        this.isVisible = true;
        this.pvpPanel.style.display = 'block';
        this.updateMatchTypes();
        this.updateArenaStatsPreview();
        
        // Animation
        this.pvpPanel.style.opacity = '0';
        this.pvpPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        requestAnimationFrame(() => {
            this.pvpPanel.style.transition = 'all 0.3s ease';
            this.pvpPanel.style.opacity = '1';
            this.pvpPanel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    /**
     * Ẩn PvP panel
     */
    hide() {
        this.isVisible = false;
        
        // Cancel any ongoing match
        if (this.currentMatch) {
            this.cancelMatch();
        }
        
        // Animation
        this.pvpPanel.style.transition = 'all 0.3s ease';
        this.pvpPanel.style.opacity = '0';
        this.pvpPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.pvpPanel.style.display = 'none';
        }, 300);
    }

    /**
     * Toggle PvP panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Update match types display
     */
    updateMatchTypes() {
        const matchTypesGrid = document.getElementById('matchTypesGrid');
        const availableTypes = this.gameLogic.getAvailableMatchTypes();
        
        matchTypesGrid.innerHTML = '';
        
        availableTypes.forEach(matchType => {
            const cooldownInfo = this.gameLogic.getMatchTypeCooldownInfo(matchType);
            const matchTypeData = arenaMatchTypes[matchType];
            
            if (!matchTypeData) return;
            
            const isAvailable = cooldownInfo.isAvailable;
            const cooldownRemaining = cooldownInfo.cooldownRemaining;
            
            const matchTypeElement = document.createElement('div');
            matchTypeElement.style.cssText = `
                background: ${isAvailable ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
                border: 2px solid ${isAvailable ? '#4caf50' : '#f44336'};
                border-radius: 10px;
                padding: 20px;
                cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                transition: all 0.3s ease;
                text-align: center;
            `;
            
            matchTypeElement.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 10px;">
                    ${this.getMatchTypeIcon(matchType)}
                </div>
                <h5 style="margin: 0 0 8px 0; color: ${isAvailable ? '#4caf50' : '#f44336'};">
                    ${matchTypeData.name}
                </h5>
                <p style="margin: 0 0 10px 0; color: #aaa; font-size: 12px;">
                    ${matchTypeData.description}
                </p>
                ${!isAvailable ? `
                    <div style="color: #f44336; font-size: 11px; margin-bottom: 10px;">
                        Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s
                    </div>
                ` : ''}
                <button style="
                    background: ${isAvailable ? '#4caf50' : '#666'};
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                    font-weight: bold;
                    font-size: 12px;
                    width: 100%;
                " ${isAvailable ? '' : 'disabled'}>
                    ${isAvailable ? 'Tham Gia' : 'Không Khả Dụng'}
                </button>
            `;
            
            if (isAvailable) {
                matchTypeElement.addEventListener('click', () => this.startMatch(matchType));
                matchTypeElement.addEventListener('mouseenter', () => {
                    if (isAvailable) {
                        matchTypeElement.style.transform = 'scale(1.05)';
                        matchTypeElement.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                    }
                });
                matchTypeElement.addEventListener('mouseleave', () => {
                    matchTypeElement.style.transform = 'scale(1)';
                    matchTypeElement.style.boxShadow = 'none';
                });
            }
            
            matchTypesGrid.appendChild(matchTypeElement);
        });
    }

    /**
     * Get match type icon
     */
    getMatchTypeIcon(matchType) {
        const icons = {
            'RANKED': '🏆',
            'PRACTICE': '🥊',
            'TOURNAMENT': '👑'
        };
        return icons[matchType] || '⚔️';
    }

    /**
     * Start a match
     */
    startMatch(matchType) {
        if (this.currentMatch) {
            this.showNotification('Đã có trận đấu đang diễn ra!', 'warning');
            return;
        }
        
        const result = this.gameLogic.startArenaMatch(matchType);
        if (result) {
            this.currentMatch = result;
            this.showMatchInProgress(result);
        } else {
            this.showNotification('Không thể bắt đầu trận đấu!', 'error');
        }
    }

    /**
     * Start quick match
     */
    startQuickMatch() {
        const availableTypes = this.gameLogic.getAvailableMatchTypes();
        if (availableTypes.length === 0) {
            this.showNotification('Không có loại trận đấu nào khả dụng!', 'error');
            return;
        }
        
        // Prefer RANKED, fallback to PRACTICE
        const matchType = availableTypes.includes('RANKED') ? 'RANKED' : availableTypes[0];
        this.startMatch(matchType);
    }

    /**
     * Show match in progress
     */
    showMatchInProgress(match) {
        // Hide match selection, show match in progress
        document.getElementById('matchSelection').style.display = 'none';
        document.getElementById('matchInProgress').style.display = 'block';
        document.getElementById('matchResult').style.display = 'none';
        
        // Update match info
        document.getElementById('opponentName').textContent = match.opponentName;
        document.getElementById('playerPower').textContent = match.playerPower.toLocaleString();
        document.getElementById('opponentPower').textContent = match.opponentPower.toLocaleString();
        document.getElementById('winChance').textContent = `${(match.winChance * 100).toFixed(1)}%`;
        
        // Start match animation
        this.startMatchAnimation(match);
    }

    /**
     * Start match animation
     */
    startMatchAnimation(match) {
        let progress = 0;
        let timeElapsed = 0;
        const totalDuration = match.duration;
        
        this.matchAnimation = setInterval(() => {
            timeElapsed += 100;
            progress = (timeElapsed / totalDuration) * 100;
            
            // Update progress bar
            document.getElementById('matchProgressBar').style.width = `${Math.min(100, progress)}%`;
            document.getElementById('matchProgress').textContent = `${Math.min(100, Math.floor(progress))}%`;
            document.getElementById('matchTime').textContent = `${Math.floor(timeElapsed / 1000)}s`;
            
            // Add some visual effects
            if (progress > 50 && progress < 60) {
                document.getElementById('matchProgressBar').style.background = 'linear-gradient(90deg, #ff6b6b, #ff9800, #ffd700)';
            }
            
            if (progress >= 100) {
                this.endMatch(match);
            }
        }, 100);
    }

    /**
     * End match
     */
    endMatch(match) {
        if (this.matchAnimation) {
            clearInterval(this.matchAnimation);
            this.matchAnimation = null;
        }
        
        this.currentMatch = null;
        this.showMatchResult(match);
    }

    /**
     * Show match result
     */
    showMatchResult(match) {
        // Hide match in progress, show result
        document.getElementById('matchInProgress').style.display = 'none';
        document.getElementById('matchResult').style.display = 'block';
        
        const isWin = match.result === 'win';
        const resultIcon = isWin ? '🏆' : '💀';
        const resultColor = isWin ? '#4caf50' : '#f44336';
        const resultText = isWin ? 'THẮNG' : 'THUA';
        const pointsChange = match.pointsChange > 0 ? `+${match.pointsChange}` : `${match.pointsChange}`;
        const pointsColor = match.pointsChange > 0 ? '#4caf50' : '#f44336';
        
        document.getElementById('resultContent').innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">${resultIcon}</div>
            <h3 style="margin: 0 0 10px 0; color: ${resultColor};">
                ${resultText}
            </h3>
            <p style="margin: 0 0 15px 0; color: #aaa;">
                vs ${match.opponentName} (Cấp ${match.opponentLevel})
            </p>
            <div style="
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            ">
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span style="color: #aaa;">Điểm thay đổi:</span>
                    <span style="color: ${pointsColor}; font-weight: bold; font-size: 18px;">
                        ${pointsChange}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span style="color: #aaa;">Tỷ lệ thắng:</span>
                    <span style="color: #2196f3; font-weight: bold;">
                        ${(match.winChance * 100).toFixed(1)}%
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span style="color: #aaa;">Thời gian:</span>
                    <span style="color: #ff9800; font-weight: bold;">
                        ${Math.floor(match.duration / 1000)}s
                    </span>
                </div>
            </div>
        `;
        
        // Show notification
        this.showNotification(
            `Trận đấu ${isWin ? 'thắng' : 'thua'}! ${pointsChange} điểm`,
            isWin ? 'success' : 'error'
        );
    }

    /**
     * Cancel match
     */
    cancelMatch() {
        if (this.matchAnimation) {
            clearInterval(this.matchAnimation);
            this.matchAnimation = null;
        }
        
        this.currentMatch = null;
        
        // Show match selection
        document.getElementById('matchSelection').style.display = 'block';
        document.getElementById('matchInProgress').style.display = 'none';
        document.getElementById('matchResult').style.display = 'none';
        
        this.showNotification('Đã hủy trận đấu', 'info');
    }

    /**
     * Play again
     */
    playAgain() {
        // Show match selection
        document.getElementById('matchSelection').style.display = 'block';
        document.getElementById('matchResult').style.display = 'none';
        
        // Update match types
        this.updateMatchTypes();
    }

    /**
     * Close result
     */
    closeResult() {
        // Show match selection
        document.getElementById('matchSelection').style.display = 'block';
        document.getElementById('matchResult').style.display = 'none';
    }

    /**
     * Handle match completed event
     */
    handleMatchCompleted(data) {
        // This is called when a match is completed via GameLogic
        // The match animation should already be handled by the UI
    }

    /**
     * Update arena stats preview
     */
    updateArenaStatsPreview() {
        const stats = this.gameLogic.getArenaStatistics();
        
        document.getElementById('previewRank').textContent = stats.currentRank.name;
        document.getElementById('previewRank').style.color = stats.currentRank.color;
        document.getElementById('previewPoints').textContent = stats.points.toLocaleString();
        document.getElementById('previewWins').textContent = stats.wins;
        document.getElementById('previewLosses').textContent = stats.losses;
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
        if (this.matchAnimation) {
            clearInterval(this.matchAnimation);
        }
        
        if (this.pvpPanel) {
            this.pvpPanel.remove();
        }
        
        console.log('PvPComponent destroyed');
    }
}

// Make available globally for onclick handlers
window.pvpComponent = null;
