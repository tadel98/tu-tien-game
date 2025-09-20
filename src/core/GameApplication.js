import { GameEngine } from './GameEngine.js';
import { GameState } from '../managers/GameState.js';
import { UIManager } from '../managers/UIManager.js';
import { GameLogic } from '../managers/GameLogic.js';

/**
 * GameApplication - Lớp chính khởi tạo và điều khiển toàn bộ game
 */
class GameApplication {
    constructor() {
        this.gameEngine = null;
        this.gameState = null;
        this.uiManager = null;
        this.gameLogic = null;
        this.isInitialized = false;
    }

    /**
     * Khởi tạo ứng dụng game
     */
    async initialize() {
        try {
            console.log('Đang khởi tạo Game Application...');
            
            // Hiển thị loading screen
            this.showLoadingScreen();
            
            // Khởi tạo Game Engine
            this.gameEngine = new GameEngine();
            if (!this.gameEngine.initialize('gameCanvas')) {
                throw new Error('Không thể khởi tạo Game Engine');
            }
            
            // Khởi tạo Game State
            this.gameState = new GameState();
            this.gameEngine.registerManager('gameState', this.gameState);
            
            // Khởi tạo Game Logic
            this.gameLogic = new GameLogic(this.gameState);
            this.gameEngine.registerManager('gameLogic', this.gameLogic);
            
            // Khởi tạo UI Manager
            this.uiManager = new UIManager(this.gameState);
            this.gameEngine.registerManager('uiManager', this.uiManager);
            
            // Thiết lập event listeners
            this.setupEventListeners();
            
            // Load dữ liệu game
            await this.loadGameData();
            
            // Khởi tạo UI ban đầu
            this.uiManager.initializeUI();
            
            this.isInitialized = true;
            console.log('Game Application đã được khởi tạo thành công');
            
            // Ẩn loading screen và bắt đầu game
            this.hideLoadingScreen();
            this.start();
            
        } catch (error) {
            console.error('Lỗi khởi tạo Game Application:', error);
            this.showErrorMessage('Không thể khởi tạo game: ' + error.message);
        }
    }

    /**
     * Load dữ liệu game từ localStorage hoặc server
     */
    async loadGameData() {
        try {
            // Thử load từ localStorage trước
            const savedData = localStorage.getItem('mygame_save');
            if (savedData) {
                const gameData = JSON.parse(savedData);
                this.gameState.loadFromData(gameData);
                console.log('Đã load dữ liệu game từ localStorage');
            } else {
                // Nếu không có save data, khởi tạo dữ liệu mới
                this.gameState.initializeNewGame();
                console.log('Khởi tạo game mới');
            }
        } catch (error) {
            console.warn('Không thể load dữ liệu game:', error);
            this.gameState.initializeNewGame();
        }
    }

    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Beforeunload để save game
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        console.log('Event listeners đã được thiết lập');
    }

    /**
     * Xử lý resize window
     */
    handleResize() {
        if (this.gameEngine && this.gameEngine.canvas) {
            const container = document.getElementById('gameContainer');
            const rect = container.getBoundingClientRect();
            this.gameEngine.resize(rect.width, rect.height);
            
            if (this.uiManager) {
                this.uiManager.handleResize();
            }
        }
    }

    /**
     * Xử lý keyboard input
     */
    handleKeyDown(event) {
        // ESC - Menu
        if (event.code === 'Escape') {
            this.toggleGameMenu();
            event.preventDefault();
        }
        
        // Space - Pause/Resume
        if (event.code === 'Space') {
            this.togglePause();
            event.preventDefault();
        }
        
        // S - Save game
        if (event.ctrlKey && event.code === 'KeyS') {
            this.saveGame();
            event.preventDefault();
        }
    }

    /**
     * Xử lý keyboard release
     */
    handleKeyUp(event) {
        // Có thể xử lý các phím thả ra ở đây
    }

    /**
     * Bắt đầu game
     */
    start() {
        if (!this.isInitialized) {
            console.error('Game chưa được khởi tạo');
            return;
        }
        
        this.gameEngine.start();
        console.log('Game đã bắt đầu');
    }

    /**
     * Tạm dừng game
     */
    pause() {
        if (this.gameEngine) {
            this.gameEngine.stop();
            console.log('Game đã tạm dừng');
        }
    }

    /**
     * Tiếp tục game
     */
    resume() {
        if (this.gameEngine && this.isInitialized) {
            this.gameEngine.start();
            console.log('Game đã tiếp tục');
        }
    }

    /**
     * Toggle pause/resume
     */
    togglePause() {
        if (this.gameEngine.isRunning) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /**
     * Toggle game menu
     */
    toggleGameMenu() {
        if (this.uiManager) {
            this.uiManager.toggleGameMenu();
        }
    }

    /**
     * Save game
     */
    saveGame() {
        try {
            const gameData = this.gameState.exportData();
            localStorage.setItem('mygame_save', JSON.stringify(gameData));
            console.log('Đã lưu game thành công');
            
            if (this.uiManager) {
                this.uiManager.showNotification('Game đã được lưu!');
            }
        } catch (error) {
            console.error('Lỗi lưu game:', error);
            if (this.uiManager) {
                this.uiManager.showNotification('Lỗi lưu game!', 'error');
            }
        }
    }

    /**
     * Reset game
     */
    resetGame() {
        if (confirm('Bạn có chắc muốn reset game? Tất cả tiến độ sẽ bị mất!')) {
            localStorage.removeItem('mygame_save');
            this.gameState.initializeNewGame();
            if (this.uiManager) {
                this.uiManager.updateAllUI();
                this.uiManager.showNotification('Game đã được reset!');
            }
        }
    }

    /**
     * Hiển thị loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Ẩn loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /**
     * Hiển thị thông báo lỗi
     */
    showErrorMessage(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="color: #ff4444;">Lỗi</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">
                        Tải lại trang
                    </button>
                </div>
            `;
        }
    }

    /**
     * Cleanup khi thoát game
     */
    destroy() {
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.saveGame);
        
        console.log('GameApplication đã được cleanup');
    }
}

// Khởi tạo và chạy game khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, đang khởi tạo game...');
    
    // Tạo instance game application toàn cục để có thể truy cập từ console
    window.gameApp = new GameApplication();
    window.gameApp.initialize();
});

export default GameApplication;
