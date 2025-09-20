/**
 * InventoryComponent - Quản lý giao diện kho đồ và tương tác với items
 */
export class InventoryComponent {
    constructor(gameState, gameLogic) {
        this.gameState = gameState;
        this.gameLogic = gameLogic;
        this.isVisible = false;
        this.inventoryPanel = null;
        this.selectedItem = null;
        this.draggedItem = null;
        
        // Item tooltip
        this.tooltip = null;
        this.tooltipTimeout = null;
        
        // Inventory settings
        this.slotsPerRow = 5;
        this.slotSize = 60;
        this.slotSpacing = 5;
        
        // Bind methods
        this.handleSlotClick = this.handleSlotClick.bind(this);
        this.handleSlotDoubleClick = this.handleSlotDoubleClick.bind(this);
        this.handleSlotRightClick = this.handleSlotRightClick.bind(this);
        this.handleSlotMouseEnter = this.handleSlotMouseEnter.bind(this);
        this.handleSlotMouseLeave = this.handleSlotMouseLeave.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
    }

    /**
     * Khởi tạo inventory component
     */
    initialize() {
        this.createInventoryPanel();
        this.createTooltip();
        this.setupEventListeners();
        console.log('InventoryComponent initialized');
    }

    /**
     * Tạo panel inventory
     */
    createInventoryPanel() {
        const panelHTML = `
            <div id="inventoryPanel" class="inventory-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
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
                <div class="inventory-header" style="
                    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
                    padding: 15px 20px;
                    border-radius: 12px 12px 0 0;
                    border-bottom: 2px solid #444;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; color: #ffd700; font-size: 18px;">
                        🎒 Kho Đồ
                    </h3>
                    <button id="closeInventoryBtn" style="
                        background: #ff4444;
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 16px;
                    " title="Đóng kho đồ">×</button>
                </div>

                <!-- Inventory Content -->
                <div class="inventory-content" style="
                    padding: 20px;
                    max-height: 500px;
                    overflow-y: auto;
                ">
                    <!-- Capacity Info -->
                    <div class="capacity-info" style="
                        margin-bottom: 15px;
                        text-align: center;
                        color: #aaa;
                        font-size: 14px;
                    ">
                        Sức chứa: <span id="inventoryCount">0</span>/<span id="inventoryMax">20</span>
                    </div>

                    <!-- Equipment Section -->
                    <div class="equipment-section" style="
                        margin-bottom: 20px;
                        padding: 15px;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                        border: 1px solid #333;
                    ">
                        <h4 style="margin: 0 0 15px 0; color: #4caf50; text-align: center;">⚔️ Trang Bị</h4>
                        <div class="equipment-grid" style="
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 10px;
                            justify-items: center;
                        ">
                            <div class="equipment-slot" data-slot="weapon" style="
                                width: 60px;
                                height: 60px;
                                background: rgba(255, 255, 255, 0.1);
                                border: 2px dashed #666;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                position: relative;
                            " title="Vũ khí">
                                <span style="font-size: 24px;">⚔️</span>
                            </div>
                            <div class="equipment-slot" data-slot="armor" style="
                                width: 60px;
                                height: 60px;
                                background: rgba(255, 255, 255, 0.1);
                                border: 2px dashed #666;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                position: relative;
                            " title="Áo giáp">
                                <span style="font-size: 24px;">🛡️</span>
                            </div>
                            <div class="equipment-slot" data-slot="accessory" style="
                                width: 60px;
                                height: 60px;
                                background: rgba(255, 255, 255, 0.1);
                                border: 2px dashed #666;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                position: relative;
                            " title="Phụ kiện">
                                <span style="font-size: 24px;">💍</span>
                            </div>
                        </div>
                    </div>

                    <!-- Inventory Grid -->
                    <div class="inventory-grid" id="inventoryGrid" style="
                        display: grid;
                        grid-template-columns: repeat(${this.slotsPerRow}, 1fr);
                        gap: ${this.slotSpacing}px;
                        justify-items: center;
                    ">
                        <!-- Slots will be generated here -->
                    </div>
                </div>

                <!-- Item Detail Panel -->
                <div id="itemDetailPanel" class="item-detail-panel" style="
                    position: absolute;
                    right: -320px;
                    top: 0;
                    width: 300px;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    border: 2px solid #444;
                    border-radius: 0 15px 15px 0;
                    padding: 20px;
                    display: none;
                    overflow-y: auto;
                ">
                    <h4 style="margin: 0 0 15px 0; color: #ffd700;">Chi Tiết Vật Phẩm</h4>
                    <div id="itemDetailContent">
                        <!-- Item details will be shown here -->
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        this.inventoryPanel = document.getElementById('inventoryPanel');
    }

    /**
     * Tạo tooltip cho items
     */
    createTooltip() {
        const tooltipHTML = `
            <div id="itemTooltip" style="
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #444;
                border-radius: 8px;
                padding: 10px;
                color: white;
                font-size: 12px;
                pointer-events: none;
                z-index: 10000;
                display: none;
                max-width: 250px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            ">
                <!-- Tooltip content -->
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', tooltipHTML);
        this.tooltip = document.getElementById('itemTooltip');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeInventoryBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Click outside to close
        this.inventoryPanel.addEventListener('click', (e) => {
            if (e.target === this.inventoryPanel) {
                this.hide();
            }
        });

        // Listen to game state changes
        this.gameState.addEventListener('itemAdded', () => this.refresh());
        this.gameState.addEventListener('itemRemoved', () => this.refresh());
        this.gameState.addEventListener('itemEquipped', () => this.refresh());
        this.gameState.addEventListener('itemUnequipped', () => this.refresh());
    }

    /**
     * Hiển thị inventory
     */
    show() {
        this.isVisible = true;
        this.inventoryPanel.style.display = 'block';
        this.refresh();
        
        // Animation
        this.inventoryPanel.style.opacity = '0';
        this.inventoryPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        requestAnimationFrame(() => {
            this.inventoryPanel.style.transition = 'all 0.3s ease';
            this.inventoryPanel.style.opacity = '1';
            this.inventoryPanel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    /**
     * Ẩn inventory
     */
    hide() {
        this.isVisible = false;
        this.hideTooltip();
        this.hideItemDetail();
        
        // Animation
        this.inventoryPanel.style.transition = 'all 0.3s ease';
        this.inventoryPanel.style.opacity = '0';
        this.inventoryPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.inventoryPanel.style.display = 'none';
        }, 300);
    }

    /**
     * Toggle inventory visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Refresh inventory display
     */
    refresh() {
        this.updateCapacityInfo();
        this.updateEquipmentSlots();
        this.updateInventoryGrid();
    }

    /**
     * Update capacity information
     */
    updateCapacityInfo() {
        const countElement = document.getElementById('inventoryCount');
        const maxElement = document.getElementById('inventoryMax');
        
        if (countElement) {
            countElement.textContent = this.gameState.inventory.items.length;
        }
        if (maxElement) {
            maxElement.textContent = this.gameState.inventory.maxSlots;
        }
    }

    /**
     * Update equipment slots
     */
    updateEquipmentSlots() {
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        
        equipmentSlots.forEach(slot => {
            const slotType = slot.dataset.slot;
            const equippedItem = this.gameState.inventory.equipment[slotType];
            
            // Clear slot
            slot.innerHTML = '';
            slot.className = 'equipment-slot';
            slot.dataset.slot = slotType;
            
            if (equippedItem) {
                // Show equipped item
                slot.innerHTML = this.createItemElement(equippedItem, true);
                slot.style.border = '2px solid #4caf50';
                slot.style.background = 'rgba(76, 175, 80, 0.2)';
            } else {
                // Show empty slot icon
                const icons = {
                    weapon: '⚔️',
                    armor: '🛡️',
                    accessory: '💍',
                    boots: '👢'
                };
                slot.innerHTML = `<span style="font-size: 24px;">${icons[slotType] || '📦'}</span>`;
                slot.style.border = '2px dashed #666';
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
            }
            
            // Add event listeners
            this.addSlotEventListeners(slot, equippedItem);
        });
    }

    /**
     * Update inventory grid
     */
    updateInventoryGrid() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;
        
        // Clear grid
        grid.innerHTML = '';
        
        // Create slots
        for (let i = 0; i < this.gameState.inventory.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slotIndex = i;
            slot.style.cssText = `
                width: ${this.slotSize}px;
                height: ${this.slotSize}px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #444;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
            `;
            
            // Add item if exists
            const item = this.gameState.inventory.items[i];
            if (item) {
                slot.innerHTML = this.createItemElement(item);
                slot.style.border = '2px solid ' + this.getRarityColor(item.rarity);
                slot.style.background = this.getRarityColor(item.rarity, 0.2);
            }
            
            // Add event listeners
            this.addSlotEventListeners(slot, item);
            
            grid.appendChild(slot);
        }
    }

    /**
     * Create item element HTML
     */
    createItemElement(item, isEquipped = false) {
        const iconMap = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍',
            boots: '👢',
            consumable: '💊',
            material: '🔮',
            book: '📖'
        };
        
        const icon = iconMap[item.type] || '📦';
        const quantity = item.quantity > 1 ? `<span style="
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: #333;
            color: white;
            border-radius: 10px;
            padding: 1px 4px;
            font-size: 10px;
            font-weight: bold;
        ">${item.quantity}</span>` : '';
        
        return `
            <span style="font-size: 24px;">${icon}</span>
            ${quantity}
        `;
    }

    /**
     * Add event listeners to slot
     */
    addSlotEventListeners(slot, item) {
        // Click events
        slot.addEventListener('click', (e) => this.handleSlotClick(e, slot, item));
        slot.addEventListener('dblclick', (e) => this.handleSlotDoubleClick(e, slot, item));
        slot.addEventListener('contextmenu', (e) => this.handleSlotRightClick(e, slot, item));
        
        // Mouse events for tooltip
        slot.addEventListener('mouseenter', (e) => this.handleSlotMouseEnter(e, slot, item));
        slot.addEventListener('mouseleave', (e) => this.handleSlotMouseLeave(e, slot, item));
        
        // Drag and drop (if item exists)
        if (item) {
            slot.draggable = true;
            slot.addEventListener('dragstart', (e) => this.handleDragStart(e, slot, item));
            slot.addEventListener('dragend', (e) => this.handleDragEnd(e, slot, item));
        }
        
        // Drop zone
        slot.addEventListener('dragover', (e) => this.handleDragOver(e, slot));
        slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
    }

    /**
     * Handle slot click
     */
    handleSlotClick(e, slot, item) {
        e.preventDefault();
        
        if (item) {
            this.selectedItem = item;
            this.showItemDetail(item);
            
            // Visual feedback
            document.querySelectorAll('.inventory-slot, .equipment-slot').forEach(s => {
                s.style.boxShadow = '';
            });
            slot.style.boxShadow = '0 0 15px #ffd700';
        }
    }

    /**
     * Handle slot double click (use/equip item)
     */
    handleSlotDoubleClick(e, slot, item) {
        e.preventDefault();
        
        if (item) {
            this.useItem(item);
        }
    }

    /**
     * Handle right click (context menu)
     */
    handleSlotRightClick(e, slot, item) {
        e.preventDefault();
        
        if (item) {
            this.showContextMenu(e, item);
        }
    }

    /**
     * Handle mouse enter (show tooltip)
     */
    handleSlotMouseEnter(e, slot, item) {
        if (item) {
            this.tooltipTimeout = setTimeout(() => {
                this.showTooltip(e, item);
            }, 500);
        }
    }

    /**
     * Handle mouse leave (hide tooltip)
     */
    handleSlotMouseLeave(e, slot, item) {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        this.hideTooltip();
    }

    /**
     * Handle drag start
     */
    handleDragStart(e, slot, item) {
        this.draggedItem = { item, sourceSlot: slot };
        slot.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Handle drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle drop
     */
    handleDrop(e, targetSlot) {
        e.preventDefault();
        
        if (this.draggedItem) {
            const { item, sourceSlot } = this.draggedItem;
            
            // Handle different drop scenarios
            if (targetSlot.classList.contains('equipment-slot')) {
                // Dropping on equipment slot
                const slotType = targetSlot.dataset.slot;
                if (item.type === slotType) {
                    this.gameState.equipItem(item.id);
                }
            } else if (targetSlot.classList.contains('inventory-slot')) {
                // Dropping on inventory slot
                const targetIndex = parseInt(targetSlot.dataset.slotIndex);
                const sourceIndex = parseInt(sourceSlot.dataset.slotIndex);
                
                if (targetIndex !== sourceIndex) {
                    this.swapItems(sourceIndex, targetIndex);
                }
            }
        }
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e, slot, item) {
        slot.style.opacity = '1';
        this.draggedItem = null;
    }

    /**
     * Use item
     */
    useItem(item) {
        switch (item.type) {
            case 'weapon':
            case 'armor':
            case 'accessory':
            case 'boots':
                // Equip item
                if (this.gameState.equipItem(item.id)) {
                    this.showNotification(`Đã trang bị ${item.name}!`);
                }
                break;
                
            case 'consumable':
                // Use consumable
                if (this.gameLogic.useConsumable(item)) {
                    this.showNotification(`Đã sử dụng ${item.name}!`);
                }
                break;
                
            default:
                this.showNotification(`Không thể sử dụng ${item.name}`);
        }
    }

    /**
     * Swap items between slots
     */
    swapItems(fromIndex, toIndex) {
        const items = this.gameState.inventory.items;
        
        // Simple swap
        const temp = items[fromIndex];
        items[fromIndex] = items[toIndex];
        items[toIndex] = temp;
        
        // Clean up undefined slots
        this.gameState.inventory.items = items.filter(item => item !== undefined);
        
        this.refresh();
    }

    /**
     * Show item tooltip
     */
    showTooltip(e, item) {
        if (!this.tooltip) return;
        
        const tooltipHTML = `
            <div style="font-weight: bold; color: ${this.getRarityColor(item.rarity)}; margin-bottom: 5px;">
                ${item.name}
            </div>
            <div style="color: #aaa; margin-bottom: 5px;">
                ${this.getItemTypeText(item.type)} - ${this.getRarityText(item.rarity)}
            </div>
            ${item.stats ? this.formatItemStats(item.stats) : ''}
            ${item.description ? `<div style="color: #ccc; margin-top: 5px; font-style: italic;">${item.description}</div>` : ''}
            <div style="color: #666; margin-top: 5px; font-size: 11px;">
                ${item.quantity > 1 ? `Số lượng: ${item.quantity}` : ''}
                ${item.quantity > 1 ? '<br>' : ''}
                Click đúp để sử dụng
            </div>
        `;
        
        this.tooltip.innerHTML = tooltipHTML;
        this.tooltip.style.display = 'block';
        
        // Position tooltip
        const x = e.clientX + 10;
        const y = e.clientY + 10;
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
        
        // Keep tooltip in viewport
        const rect = this.tooltip.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.tooltip.style.left = `${e.clientX - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.tooltip.style.top = `${e.clientY - rect.height - 10}px`;
        }
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }

    /**
     * Show item detail panel
     */
    showItemDetail(item) {
        const detailPanel = document.getElementById('itemDetailPanel');
        const detailContent = document.getElementById('itemDetailContent');
        
        if (!detailPanel || !detailContent) return;
        
        const detailHTML = `
            <div class="item-detail-header" style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 48px; margin-bottom: 10px;">
                    ${this.getItemIcon(item)}
                </div>
                <h3 style="margin: 0; color: ${this.getRarityColor(item.rarity)};">
                    ${item.name}
                </h3>
                <p style="margin: 5px 0; color: #aaa;">
                    ${this.getItemTypeText(item.type)} - ${this.getRarityText(item.rarity)}
                </p>
            </div>
            
            ${item.stats ? `
                <div class="item-stats" style="margin-bottom: 15px;">
                    <h4 style="color: #4caf50; margin-bottom: 10px;">📊 Thuộc tính:</h4>
                    ${this.formatItemStats(item.stats, true)}
                </div>
            ` : ''}
            
            ${item.description ? `
                <div class="item-description" style="margin-bottom: 15px;">
                    <h4 style="color: #2196f3; margin-bottom: 10px;">📝 Mô tả:</h4>
                    <p style="color: #ccc; line-height: 1.4;">${item.description}</p>
                </div>
            ` : ''}
            
            <div class="item-actions" style="margin-top: 20px;">
                <button onclick="window.inventoryComponent.useItem(window.inventoryComponent.selectedItem)" style="
                    width: 100%;
                    background: #4caf50;
                    border: none;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-bottom: 10px;
                ">
                    ${this.getUseButtonText(item)}
                </button>
                
                <button onclick="window.inventoryComponent.dropItem(window.inventoryComponent.selectedItem)" style="
                    width: 100%;
                    background: #f44336;
                    border: none;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🗑️ Vứt bỏ
                </button>
            </div>
            
            ${item.quantity > 1 ? `
                <div style="margin-top: 10px; text-align: center; color: #aaa;">
                    Số lượng: ${item.quantity}
                </div>
            ` : ''}
        `;
        
        detailContent.innerHTML = detailHTML;
        detailPanel.style.display = 'block';
    }

    /**
     * Hide item detail panel
     */
    hideItemDetail() {
        const detailPanel = document.getElementById('itemDetailPanel');
        if (detailPanel) {
            detailPanel.style.display = 'none';
        }
        this.selectedItem = null;
    }

    /**
     * Drop item
     */
    dropItem(item) {
        if (confirm(`Bạn có chắc muốn vứt bỏ ${item.name}?`)) {
            this.gameState.removeItem(item.id, 1);
            this.hideItemDetail();
            this.showNotification(`Đã vứt bỏ ${item.name}`);
        }
    }

    /**
     * Utility methods
     */
    getRarityColor(rarity, alpha = 1) {
        const colors = {
            common: `rgba(169, 169, 169, ${alpha})`,
            uncommon: `rgba(76, 175, 80, ${alpha})`,
            rare: `rgba(33, 150, 243, ${alpha})`,
            epic: `rgba(156, 39, 176, ${alpha})`,
            legendary: `rgba(255, 193, 7, ${alpha})`
        };
        return colors[rarity] || colors.common;
    }

    getRarityText(rarity) {
        const texts = {
            common: 'Phổ thông',
            uncommon: 'Không phổ biến',
            rare: 'Hiếm',
            epic: 'Sử thi',
            legendary: 'Huyền thoại'
        };
        return texts[rarity] || 'Không rõ';
    }

    getItemTypeText(type) {
        const types = {
            weapon: 'Vũ khí',
            armor: 'Áo giáp',
            accessory: 'Phụ kiện',
            boots: 'Giày',
            consumable: 'Tiêu hao',
            material: 'Nguyên liệu',
            book: 'Sách'
        };
        return types[type] || 'Vật phẩm';
    }

    getItemIcon(item) {
        const icons = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍',
            boots: '👢',
            consumable: '💊',
            material: '🔮',
            book: '📖'
        };
        return icons[item.type] || '📦';
    }

    getUseButtonText(item) {
        const texts = {
            weapon: '⚔️ Trang bị',
            armor: '🛡️ Trang bị',
            accessory: '💍 Trang bị',
            boots: '👢 Trang bị',
            consumable: '💊 Sử dụng',
            book: '📖 Đọc'
        };
        return texts[item.type] || '📦 Sử dụng';
    }

    formatItemStats(stats, detailed = false) {
        const statNames = {
            attack: detailed ? '⚔️ Tấn công' : 'ATK',
            defense: detailed ? '🛡️ Phòng thủ' : 'DEF',
            health: detailed ? '❤️ Sinh lực' : 'HP',
            mana: detailed ? '💙 Pháp lực' : 'MP',
            speed: detailed ? '⚡ Tốc độ' : 'SPD',
            intelligence: detailed ? '🧠 Trí tuệ' : 'INT',
            luck: detailed ? '🍀 May mắn' : 'LUK'
        };
        
        const statEntries = Object.entries(stats)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => {
                const name = statNames[key] || key;
                const color = value > 0 ? '#4caf50' : '#f44336';
                if (detailed) {
                    return `<div style="color: ${color}; margin: 3px 0;">${name}: +${value}</div>`;
                } else {
                    return `<span style="color: ${color};">${name}: +${value}</span>`;
                }
            });
        
        return detailed ? statEntries.join('') : statEntries.join('<br>');
    }

    showNotification(message) {
        // Use UIManager notification system if available
        if (window.uiManager && window.uiManager.showNotification) {
            window.uiManager.showNotification(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.inventoryPanel) {
            this.inventoryPanel.remove();
        }
        if (this.tooltip) {
            this.tooltip.remove();
        }
        console.log('InventoryComponent destroyed');
    }
}

// Make available globally for onclick handlers
window.inventoryComponent = null;
