import { GameDataUtils, equipmentSlots, rarityData } from '../core/GameData.js';

/**
 * EquipmentComponent - Quản lý giao diện trang bị và stats
 */
export class EquipmentComponent {
    constructor(gameState, gameLogic) {
        this.gameState = gameState;
        this.gameLogic = gameLogic;
        this.isVisible = false;
        this.equipmentPanel = null;
        
        // Bind methods
        this.handleSlotClick = this.handleSlotClick.bind(this);
        this.handleStatHover = this.handleStatHover.bind(this);
    }

    /**
     * Khởi tạo equipment component
     */
    initialize() {
        this.createEquipmentPanel();
        this.setupEventListeners();
        console.log('EquipmentComponent initialized');
    }

    /**
     * Tạo panel equipment
     */
    createEquipmentPanel() {
        const panelHTML = `
            <div id="equipmentPanel" class="equipment-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
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
                <div class="equipment-header" style="
                    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
                    padding: 15px 20px;
                    border-radius: 12px 12px 0 0;
                    border-bottom: 2px solid #444;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #ffd700; font-size: 18px;">
                        ⚔️ Trang Bị & Thuộc Tính
                    </h3>
                    <button id="closeEquipmentBtn" style="
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
                <div class="equipment-content" style="
                    padding: 20px;
                    max-height: 600px;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                ">
                    <!-- Equipment Slots -->
                    <div class="equipment-slots-section">
                        <h4 style="margin: 0 0 15px 0; color: #4caf50; text-align: center;">
                            🛡️ Trang Bị Hiện Tại
                        </h4>
                        
                        <div class="equipment-grid" style="
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin-bottom: 20px;
                        ">
                            <div class="equipment-slot-container" data-slot="weapon">
                                <div class="equipment-slot-label" style="
                                    text-align: center;
                                    color: #aaa;
                                    font-size: 12px;
                                    margin-bottom: 5px;
                                ">Vũ Khí</div>
                                <div class="equipment-slot" data-slot="weapon" style="
                                    width: 80px;
                                    height: 80px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 2px dashed #666;
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    margin: 0 auto;
                                    transition: all 0.3s ease;
                                " title="Vũ khí">
                                    <span style="font-size: 32px;">⚔️</span>
                                </div>
                            </div>

                            <div class="equipment-slot-container" data-slot="armor">
                                <div class="equipment-slot-label" style="
                                    text-align: center;
                                    color: #aaa;
                                    font-size: 12px;
                                    margin-bottom: 5px;
                                ">Áo Giáp</div>
                                <div class="equipment-slot" data-slot="armor" style="
                                    width: 80px;
                                    height: 80px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 2px dashed #666;
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    margin: 0 auto;
                                    transition: all 0.3s ease;
                                " title="Áo giáp">
                                    <span style="font-size: 32px;">🛡️</span>
                                </div>
                            </div>

                            <div class="equipment-slot-container" data-slot="accessory">
                                <div class="equipment-slot-label" style="
                                    text-align: center;
                                    color: #aaa;
                                    font-size: 12px;
                                    margin-bottom: 5px;
                                ">Phụ Kiện</div>
                                <div class="equipment-slot" data-slot="accessory" style="
                                    width: 80px;
                                    height: 80px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 2px dashed #666;
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    margin: 0 auto;
                                    transition: all 0.3s ease;
                                " title="Phụ kiện">
                                    <span style="font-size: 32px;">💍</span>
                                </div>
                            </div>

                            <div class="equipment-slot-container" data-slot="boots">
                                <div class="equipment-slot-label" style="
                                    text-align: center;
                                    color: #aaa;
                                    font-size: 12px;
                                    margin-bottom: 5px;
                                ">Giày Dép</div>
                                <div class="equipment-slot" data-slot="boots" style="
                                    width: 80px;
                                    height: 80px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 2px dashed #666;
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    margin: 0 auto;
                                    transition: all 0.3s ease;
                                " title="Giày dép">
                                    <span style="font-size: 32px;">👢</span>
                                </div>
                            </div>
                        </div>

                        <!-- Equipment Info -->
                        <div id="selectedEquipmentInfo" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 15px;
                            min-height: 100px;
                        ">
                            <div style="color: #aaa; text-align: center; padding: 20px;">
                                Click vào slot trang bị để xem chi tiết
                            </div>
                        </div>
                    </div>

                    <!-- Stats Section -->
                    <div class="stats-section">
                        <h4 style="margin: 0 0 15px 0; color: #2196f3; text-align: center;">
                            📊 Thuộc Tính Nhân Vật
                        </h4>
                        
                        <!-- Current Stats -->
                        <div class="current-stats" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 15px;
                        ">
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #ff6b6b;">⚔️ Tấn Công:</span>
                                <span id="statAttack" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #4caf50;">🛡️ Phòng Thủ:</span>
                                <span id="statDefense" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #2196f3;">❤️ Sinh Lực:</span>
                                <span id="statHealth" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #9c27b0;">💙 Pháp Lực:</span>
                                <span id="statMana" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #ffeb3b;">⚡ Tốc Độ:</span>
                                <span id="statSpeed" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #00bcd4;">🧠 Trí Tuệ:</span>
                                <span id="statIntelligence" style="font-weight: bold;">0</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; margin: 8px 0;">
                                <span style="color: #4caf50;">🍀 May Mắn:</span>
                                <span id="statLuck" style="font-weight: bold;">0</span>
                            </div>
                        </div>

                        <!-- Power Rating -->
                        <div class="power-rating" style="
                            background: linear-gradient(135deg, #ff9800, #f57c00);
                            border-radius: 8px;
                            padding: 15px;
                            text-align: center;
                            margin-bottom: 15px;
                        ">
                            <div style="font-size: 14px; margin-bottom: 5px;">Sức Mạnh Tổng Thể</div>
                            <div id="totalPower" style="font-size: 24px; font-weight: bold;">0</div>
                        </div>

                        <!-- Equipment Bonuses -->
                        <div class="equipment-bonuses" style="
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid #333;
                            border-radius: 8px;
                            padding: 15px;
                        ">
                            <h5 style="margin: 0 0 10px 0; color: #ffd700;">✨ Bonus Từ Trang Bị</h5>
                            <div id="equipmentBonusStats">
                                <div style="color: #aaa; text-align: center; padding: 10px;">
                                    Chưa có trang bị nào
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.equipmentPanel = document.getElementById('equipmentPanel');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeEquipmentBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Equipment slot clicks
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            slot.addEventListener('click', (e) => this.handleSlotClick(e, slot));
            slot.addEventListener('mouseenter', () => {
                slot.style.background = 'rgba(255, 255, 255, 0.2)';
                slot.style.transform = 'scale(1.05)';
            });
            slot.addEventListener('mouseleave', () => {
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
                slot.style.transform = 'scale(1)';
            });
        });

        // Listen to game state changes
        this.gameState.addEventListener('itemEquipped', () => this.refresh());
        this.gameState.addEventListener('itemUnequipped', () => this.refresh());
        this.gameState.addEventListener('statsChanged', () => this.refresh());
        this.gameState.addEventListener('levelUp', () => this.refresh());
    }

    /**
     * Hiển thị equipment panel
     */
    show() {
        this.isVisible = true;
        this.equipmentPanel.style.display = 'block';
        this.refresh();
        
        // Animation
        this.equipmentPanel.style.opacity = '0';
        this.equipmentPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        requestAnimationFrame(() => {
            this.equipmentPanel.style.transition = 'all 0.3s ease';
            this.equipmentPanel.style.opacity = '1';
            this.equipmentPanel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    /**
     * Ẩn equipment panel
     */
    hide() {
        this.isVisible = false;
        
        // Animation
        this.equipmentPanel.style.transition = 'all 0.3s ease';
        this.equipmentPanel.style.opacity = '0';
        this.equipmentPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.equipmentPanel.style.display = 'none';
        }, 300);
    }

    /**
     * Toggle equipment panel visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Refresh equipment display
     */
    refresh() {
        this.updateEquipmentSlots();
        this.updateStats();
        this.updateEquipmentBonuses();
    }

    /**
     * Update equipment slots display
     */
    updateEquipmentSlots() {
        const equipment = this.gameState.inventory.equipment;
        
        Object.keys(equipmentSlots).forEach(slotType => {
            const slot = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
            if (!slot) return;
            
            const equippedItem = equipment[slotType];
            
            if (equippedItem) {
                // Show equipped item
                const itemData = GameDataUtils.getItem(equippedItem.id);
                const rarityColor = rarityData[equippedItem.rarity]?.color || '#9e9e9e';
                
                slot.innerHTML = `<span style="font-size: 32px;">${itemData?.icon || '📦'}</span>`;
                slot.style.border = `2px solid ${rarityColor}`;
                slot.style.background = `${rarityColor}20`;
                slot.style.boxShadow = `0 0 15px ${rarityColor}40`;
                
                // Add item name below
                const container = slot.closest('.equipment-slot-container');
                let nameElement = container.querySelector('.item-name');
                if (!nameElement) {
                    nameElement = document.createElement('div');
                    nameElement.className = 'item-name';
                    nameElement.style.cssText = `
                        text-align: center;
                        font-size: 10px;
                        color: ${rarityColor};
                        margin-top: 5px;
                        font-weight: bold;
                    `;
                    container.appendChild(nameElement);
                }
                nameElement.textContent = equippedItem.name;
                nameElement.style.color = rarityColor;
            } else {
                // Show empty slot
                const slotInfo = equipmentSlots[slotType];
                slot.innerHTML = `<span style="font-size: 32px;">${slotInfo.icon}</span>`;
                slot.style.border = '2px dashed #666';
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
                slot.style.boxShadow = 'none';
                
                // Remove item name
                const container = slot.closest('.equipment-slot-container');
                const nameElement = container.querySelector('.item-name');
                if (nameElement) {
                    nameElement.remove();
                }
            }
        });
    }

    /**
     * Update stats display
     */
    updateStats() {
        const player = this.gameState.player;
        const stats = player.stats;
        
        // Update individual stats
        document.getElementById('statAttack').textContent = stats.attack;
        document.getElementById('statDefense').textContent = stats.defense;
        document.getElementById('statHealth').textContent = player.maxHealth;
        document.getElementById('statMana').textContent = player.maxMana;
        document.getElementById('statSpeed').textContent = stats.speed;
        document.getElementById('statIntelligence').textContent = stats.intelligence;
        document.getElementById('statLuck').textContent = stats.luck;
        
        // Update total power
        const totalPower = this.gameLogic.calculatePlayerPower();
        document.getElementById('totalPower').textContent = totalPower.toLocaleString();
    }

    /**
     * Update equipment bonuses display
     */
    updateEquipmentBonuses() {
        const equipment = this.gameState.inventory.equipment;
        const bonusContainer = document.getElementById('equipmentBonusStats');
        
        let totalBonuses = {
            attack: 0, defense: 0, health: 0, mana: 0,
            speed: 0, intelligence: 0, luck: 0
        };
        
        let hasEquipment = false;
        
        Object.values(equipment).forEach(item => {
            if (item && item.stats) {
                hasEquipment = true;
                Object.keys(item.stats).forEach(stat => {
                    if (totalBonuses.hasOwnProperty(stat)) {
                        totalBonuses[stat] += item.stats[stat];
                    }
                });
            }
        });
        
        if (!hasEquipment) {
            bonusContainer.innerHTML = `
                <div style="color: #aaa; text-align: center; padding: 10px;">
                    Chưa có trang bị nào
                </div>
            `;
            return;
        }
        
        const statNames = {
            attack: '⚔️ Tấn Công',
            defense: '🛡️ Phòng Thủ',
            health: '❤️ Sinh Lực',
            mana: '💙 Pháp Lực',
            speed: '⚡ Tốc Độ',
            intelligence: '🧠 Trí Tuệ',
            luck: '🍀 May Mắn'
        };
        
        const bonusHTML = Object.entries(totalBonuses)
            .filter(([stat, value]) => value > 0)
            .map(([stat, value]) => `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span style="color: #4caf50;">${statNames[stat]}:</span>
                    <span style="color: #4caf50; font-weight: bold;">+${value}</span>
                </div>
            `)
            .join('');
        
        bonusContainer.innerHTML = bonusHTML || `
            <div style="color: #aaa; text-align: center; padding: 10px;">
                Trang bị không có bonus stats
            </div>
        `;
    }

    /**
     * Handle equipment slot click
     */
    handleSlotClick(e, slot) {
        const slotType = slot.dataset.slot;
        const equippedItem = this.gameState.inventory.equipment[slotType];
        
        if (equippedItem) {
            // Show item details
            this.showEquipmentDetails(equippedItem, slotType);
        } else {
            // Show empty slot info
            this.showEmptySlotInfo(slotType);
        }
    }

    /**
     * Show equipment details
     */
    showEquipmentDetails(item, slotType) {
        const itemData = GameDataUtils.getItem(item.id);
        const rarityColor = rarityData[item.rarity]?.color || '#9e9e9e';
        const rarityName = rarityData[item.rarity]?.name || 'Không rõ';
        
        const detailHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 48px; margin-bottom: 10px;">
                    ${itemData?.icon || '📦'}
                </div>
                <h4 style="margin: 0; color: ${rarityColor}; font-size: 16px;">
                    ${item.name}
                </h4>
                <p style="margin: 5px 0; color: #aaa; font-size: 12px;">
                    ${equipmentSlots[slotType]?.name} - ${rarityName}
                </p>
            </div>
            
            ${item.stats ? `
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #4caf50; margin-bottom: 8px;">📊 Thuộc tính:</h5>
                    ${this.formatItemStats(item.stats)}
                </div>
            ` : ''}
            
            ${item.description ? `
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #2196f3; margin-bottom: 8px;">📝 Mô tả:</h5>
                    <p style="color: #ccc; font-size: 12px; line-height: 1.4;">
                        ${item.description}
                    </p>
                </div>
            ` : ''}
            
            <div style="text-align: center;">
                <button onclick="window.equipmentComponent.unequipItem('${slotType}')" style="
                    background: #f44336;
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                ">
                    🗑️ Tháo Trang Bị
                </button>
            </div>
        `;
        
        document.getElementById('selectedEquipmentInfo').innerHTML = detailHTML;
    }

    /**
     * Show empty slot info
     */
    showEmptySlotInfo(slotType) {
        const slotInfo = equipmentSlots[slotType];
        
        const infoHTML = `
            <div style="text-align: center; color: #aaa; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">
                    ${slotInfo.icon}
                </div>
                <h4 style="margin: 0; color: #666;">
                    ${slotInfo.name} Trống
                </h4>
                <p style="margin: 10px 0; font-size: 12px;">
                    Mở kho đồ để trang bị ${slotInfo.name.toLowerCase()}
                </p>
            </div>
        `;
        
        document.getElementById('selectedEquipmentInfo').innerHTML = infoHTML;
    }

    /**
     * Unequip item
     */
    unequipItem(slotType) {
        const success = this.gameLogic.unequipItem(slotType);
        if (success) {
            this.showNotification(`Đã tháo trang bị!`);
            this.showEmptySlotInfo(slotType);
        }
    }

    /**
     * Format item stats for display
     */
    formatItemStats(stats) {
        const statNames = {
            attack: '⚔️ Tấn Công',
            defense: '🛡️ Phòng Thủ',
            health: '❤️ Sinh Lực',
            mana: '💙 Pháp Lực',
            speed: '⚡ Tốc Độ',
            intelligence: '🧠 Trí Tuệ',
            luck: '🍀 May Mắn'
        };
        
        return Object.entries(stats)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => `
                <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                    <span style="color: #4caf50;">${statNames[key] || key}:</span>
                    <span style="color: #4caf50; font-weight: bold;">+${value}</span>
                </div>
            `)
            .join('');
    }

    /**
     * Show notification
     */
    showNotification(message) {
        if (window.uiManager && window.uiManager.showNotification) {
            window.uiManager.showNotification(message);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.equipmentPanel) {
            this.equipmentPanel.remove();
        }
        console.log('EquipmentComponent destroyed');
    }
}

// Make available globally for onclick handlers
window.equipmentComponent = null;
