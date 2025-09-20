/**
 * UIManager - Quản lý giao diện người dùng
 */
export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameEngine = null;
        this.uiContainer = null;
        this.uiElements = new Map();
        this.notifications = [];
        this.isMenuOpen = false;
        
        // Bind methods
        this.updateUI = this.updateUI.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // UI update intervals
        this.lastUIUpdate = 0;
        this.uiUpdateInterval = 100; // Update UI every 100ms
    }

    /**
     * Initialize UI Manager
     */
    initialize(gameEngine) {
        this.gameEngine = gameEngine;
        this.uiContainer = document.getElementById('gameUI');
        
        if (!this.uiContainer) {
            console.error('UI Container not found');
            return false;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('UIManager initialized');
        return true;
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        this.createMainHUD();
        this.createNotificationArea();
        this.updateAllUI();
        
        // Listen to game state changes
        this.gameState.addEventListener('levelUp', (data) => {
            this.showNotification(`Chúc mừng! Đã lên cấp ${data.newLevel}!`, 'success');
        });
        
        this.gameState.addEventListener('cultivationBreakthrough', (data) => {
            this.showNotification(`Đột phá tu luyện! ${data.realm} Tầng ${data.stage}`, 'achievement');
        });
        
        this.gameState.addEventListener('realmAdvancement', (data) => {
            this.showNotification(`Tiến lên cảnh giới mới: ${data.newRealm}!`, 'legendary');
        });
    }

    /**
     * Create main HUD elements
     */
    createMainHUD() {
        const hudHTML = `
            <div id="mainHUD" class="ui-element" style="
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #444;
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-family: Arial, sans-serif;
                min-width: 300px;
                z-index: 20;
            ">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #ffd700;">
                    <span id="playerName">${this.gameState.player.name}</span>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: #00ff00;">Cấp độ:</span> 
                    <span id="playerLevel">${this.gameState.player.level}</span>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: #ff6b6b;">Sinh lực:</span> 
                    <span id="playerHealth">${this.gameState.player.health}</span>/<span id="playerMaxHealth">${this.gameState.player.maxHealth}</span>
                    <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div id="healthBar" style="background: #ff6b6b; height: 100%; border-radius: 4px; width: ${(this.gameState.player.health / this.gameState.player.maxHealth) * 100}%;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: #4dabf7;">Pháp lực:</span> 
                    <span id="playerMana">${this.gameState.player.mana}</span>/<span id="playerMaxMana">${this.gameState.player.maxMana}</span>
                    <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div id="manaBar" style="background: #4dabf7; height: 100%; border-radius: 4px; width: ${(this.gameState.player.mana / this.gameState.player.maxMana) * 100}%;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: #ffa726;">Kinh nghiệm:</span> 
                    <span id="playerExp">${this.gameState.player.experience}</span>/<span id="playerExpNext">${this.gameState.player.experienceToNext}</span>
                    <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div id="expBar" style="background: #ffa726; height: 100%; border-radius: 4px; width: ${(this.gameState.player.experience / this.gameState.player.experienceToNext) * 100}%;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <span style="color: #9c27b0;">Tu luyện:</span> 
                    <span id="cultivationRealm">${this.gameState.player.cultivation.realm}</span> 
                    Tầng <span id="cultivationStage">${this.gameState.player.cultivation.stage}</span>
                    <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div id="cultivationBar" style="background: #9c27b0; height: 100%; border-radius: 4px; width: ${(this.gameState.player.cultivation.progress / this.gameState.player.cultivation.progressToNext) * 100}%;"></div>
                    </div>
                </div>
            </div>

            <div id="resourcePanel" class="ui-element" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #444;
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-family: Arial, sans-serif;
                min-width: 200px;
                z-index: 20;
            ">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #ffd700;">
                    Tài Nguyên
                </div>
                
                <div style="margin-bottom: 5px;">
                    <span style="color: #ffd700;">💰 Vàng:</span> 
                    <span id="goldAmount">${this.gameState.resources.gold}</span>
                </div>
                
                <div style="margin-bottom: 5px;">
                    <span style="color: #00ffff;">💎 Linh thạch:</span> 
                    <span id="spiritStones">${this.gameState.resources.spirit_stones}</span>
                </div>
                
                <div style="margin-bottom: 5px;">
                    <span style="color: #ff69b4;">💊 Đan dược:</span> 
                    <span id="cultivationPills">${this.gameState.resources.cultivation_pills}</span>
                </div>
            </div>

            <div id="actionPanel" class="ui-element" style="
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #444;
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-family: Arial, sans-serif;
                z-index: 20;
                display: flex;
                gap: 10px;
            ">
                <button id="cultivateBtn" class="action-button" onclick="window.gameApp.uiManager.handleCultivateClick()" style="
                    background: #9c27b0;
                    border: none;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#7b1fa2'" onmouseout="this.style.background='#9c27b0'">
                    Tu Luyện
                </button>
                
                <button id="inventoryBtn" class="action-button" onclick="window.gameApp.uiManager.toggleInventory()" style="
                    background: #2196f3;
                    border: none;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#1976d2'" onmouseout="this.style.background='#2196f3'">
                    Kho Đồ
                </button>
                
                <button id="characterBtn" class="action-button" onclick="window.gameApp.uiManager.toggleCharacterPanel()" style="
                    background: #4caf50;
                    border: none;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#388e3c'" onmouseout="this.style.background='#4caf50'">
                    Nhân Vật
                </button>
                
                <button id="saveBtn" class="action-button" onclick="window.gameApp.saveGame()" style="
                    background: #ff9800;
                    border: none;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
                    Lưu Game
                </button>
            </div>
        `;
        
        this.uiContainer.innerHTML = hudHTML;
    }

    /**
     * Create notification area
     */
    createNotificationArea() {
        const notificationHTML = `
            <div id="notificationArea" style="
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 100;
                pointer-events: none;
            "></div>
        `;
        
        this.uiContainer.insertAdjacentHTML('beforeend', notificationHTML);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Click events are handled via onclick attributes in HTML for simplicity
        // For a more complex system, you'd want to use addEventListener
    }

    /**
     * Update UI elements
     */
    update(deltaTime) {
        this.lastUIUpdate += deltaTime;
        
        if (this.lastUIUpdate >= this.uiUpdateInterval) {
            this.updateDynamicElements();
            this.updateNotifications(deltaTime);
            this.lastUIUpdate = 0;
        }
    }

    /**
     * Update dynamic UI elements (bars, numbers that change frequently)
     */
    updateDynamicElements() {
        const player = this.gameState.player;
        const resources = this.gameState.resources;
        
        // Update health bar
        const healthPercent = (player.health / player.maxHealth) * 100;
        const healthBar = document.getElementById('healthBar');
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
        }
        
        // Update mana bar
        const manaPercent = (player.mana / player.maxMana) * 100;
        const manaBar = document.getElementById('manaBar');
        if (manaBar) {
            manaBar.style.width = `${manaPercent}%`;
        }
        
        // Update experience bar
        const expPercent = (player.experience / player.experienceToNext) * 100;
        const expBar = document.getElementById('expBar');
        if (expBar) {
            expBar.style.width = `${expPercent}%`;
        }
        
        // Update cultivation bar
        const cultivationPercent = (player.cultivation.progress / player.cultivation.progressToNext) * 100;
        const cultivationBar = document.getElementById('cultivationBar');
        if (cultivationBar) {
            cultivationBar.style.width = `${cultivationPercent}%`;
        }
        
        // Update resource numbers
        const goldElement = document.getElementById('goldAmount');
        if (goldElement) {
            goldElement.textContent = Math.floor(resources.gold);
        }
        
        const spiritStoneElement = document.getElementById('spiritStones');
        if (spiritStoneElement) {
            spiritStoneElement.textContent = resources.spirit_stones;
        }
        
        const pillsElement = document.getElementById('cultivationPills');
        if (pillsElement) {
            pillsElement.textContent = resources.cultivation_pills;
        }
    }

    /**
     * Update all UI elements
     */
    updateAllUI() {
        const player = this.gameState.player;
        const resources = this.gameState.resources;
        
        // Update player info
        this.updateElement('playerName', player.name);
        this.updateElement('playerLevel', player.level);
        this.updateElement('playerHealth', player.health);
        this.updateElement('playerMaxHealth', player.maxHealth);
        this.updateElement('playerMana', player.mana);
        this.updateElement('playerMaxMana', player.maxMana);
        this.updateElement('playerExp', player.experience);
        this.updateElement('playerExpNext', player.experienceToNext);
        this.updateElement('cultivationRealm', player.cultivation.realm);
        this.updateElement('cultivationStage', player.cultivation.stage);
        
        // Update resources
        this.updateElement('goldAmount', Math.floor(resources.gold));
        this.updateElement('spiritStones', resources.spirit_stones);
        this.updateElement('cultivationPills', resources.cultivation_pills);
        
        // Update bars
        this.updateDynamicElements();
    }

    /**
     * Update individual element
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration,
            timeLeft: duration
        };
        
        this.notifications.push(notification);
        this.createNotificationElement(notification);
    }

    /**
     * Create notification element
     */
    createNotificationElement(notification) {
        const colors = {
            info: '#2196f3',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            achievement: '#9c27b0',
            legendary: '#ffd700'
        };
        
        const notificationArea = document.getElementById('notificationArea');
        if (!notificationArea) return;
        
        const notificationElement = document.createElement('div');
        notificationElement.id = `notification-${notification.id}`;
        notificationElement.style.cssText = `
            background: ${colors[notification.type] || colors.info};
            color: white;
            padding: 10px 20px;
            margin: 5px 0;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        notificationElement.textContent = notification.message;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        notificationArea.appendChild(notificationElement);
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, notification.duration);
    }

    /**
     * Remove notification
     */
    removeNotification(notificationId) {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
            element.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
        
        // Remove from array
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    /**
     * Update notifications
     */
    updateNotifications(deltaTime) {
        this.notifications.forEach(notification => {
            notification.timeLeft -= deltaTime;
            if (notification.timeLeft <= 0) {
                this.removeNotification(notification.id);
            }
        });
    }

    /**
     * Handle cultivate button click
     */
    handleCultivateClick() {
        // Simple cultivation - add progress manually
        const player = this.gameState.player;
        const progressGain = 100; // Manual cultivation gives more progress
        
        player.cultivation.progress += progressGain;
        this.showNotification(`Tu luyện +${progressGain} tiến độ`, 'info');
        
        // Check for breakthrough
        if (player.cultivation.progress >= player.cultivation.progressToNext) {
            // Let GameLogic handle the breakthrough in next update
        }
    }

    /**
     * Toggle inventory panel
     */
    toggleInventory() {
        this.showNotification('Tính năng kho đồ sẽ được phát triển trong phiên bản tiếp theo!', 'info');
    }

    /**
     * Toggle character panel
     */
    toggleCharacterPanel() {
        this.showNotification('Tính năng thông tin nhân vật sẽ được phát triển!', 'info');
    }

    /**
     * Toggle game menu
     */
    toggleGameMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (this.isMenuOpen) {
            this.showNotification('Menu game (ESC để đóng)', 'info');
        }
    }

    /**
     * Handle resize
     */
    handleResize() {
        // Adjust UI elements for new screen size if needed
        console.log('UI resized');
    }

    /**
     * Handle click events
     */
    handleClick(event) {
        // Handle general click events if needed
    }

    /**
     * Render (if needed for canvas-based UI elements)
     */
    render(ctx) {
        // This can be used for rendering UI elements directly on canvas
        // For now, we're using HTML-based UI, so this is empty
    }

    /**
     * Cleanup
     */
    destroy() {
        // Clear all UI elements
        if (this.uiContainer) {
            this.uiContainer.innerHTML = '';
        }
        
        // Clear notifications
        this.notifications = [];
        
        console.log('UIManager destroyed');
    }
}
