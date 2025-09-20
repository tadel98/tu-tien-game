/**
 * GameEngine - Lõi chính của game với vòng lặp game loop
 */
export class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // Danh sách các đối tượng cần update và render
        this.gameObjects = [];
        this.managers = {};
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFpsTime = 0;
        this.currentFps = 0;
    }
    
    /**
     * Khởi tạo game engine
     */
    initialize(canvasId = 'gameCanvas') {
        try {
            // Lấy canvas element
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas với ID '${canvasId}' không tìm thấy`);
            }
            
            // Lấy 2D rendering context
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Không thể lấy 2D rendering context');
            }
            
            // Thiết lập canvas
            this.setupCanvas();
            
            console.log('GameEngine đã được khởi tạo thành công');
            return true;
        } catch (error) {
            console.error('Lỗi khởi tạo GameEngine:', error);
            return false;
        }
    }
    
    /**
     * Thiết lập canvas
     */
    setupCanvas() {
        // Đảm bảo canvas có kích thước phù hợp
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Thiết lập context properties
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
    }
    
    /**
     * Đăng ký manager vào engine
     */
    registerManager(name, manager) {
        this.managers[name] = manager;
        if (manager.initialize) {
            manager.initialize(this);
        }
    }
    
    /**
     * Thêm game object vào danh sách
     */
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }
    
    /**
     * Xóa game object khỏi danh sách
     */
    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    /**
     * Bắt đầu game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('Game engine đã đang chạy');
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastFpsTime = this.lastTime;
        
        console.log('Bắt đầu game loop...');
        this.gameLoop();
    }
    
    /**
     * Dừng game loop
     */
    stop() {
        this.isRunning = false;
        console.log('Game loop đã dừng');
    }
    
    /**
     * Vòng lặp chính của game
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        
        // Kiểm tra FPS
        if (this.deltaTime >= this.frameInterval) {
            // Update game logic
            this.update(this.deltaTime);
            
            // Render graphics
            this.render();
            
            // Update FPS counter
            this.updateFPS(currentTime);
            
            this.lastTime = currentTime;
        }
        
        // Tiếp tục vòng lặp
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Cập nhật logic game
     */
    update(deltaTime) {
        // Update tất cả managers
        Object.values(this.managers).forEach(manager => {
            if (manager.update) {
                manager.update(deltaTime);
            }
        });
        
        // Update tất cả game objects
        this.gameObjects.forEach(gameObject => {
            if (gameObject.update) {
                gameObject.update(deltaTime);
            }
        });
    }
    
    /**
     * Render graphics
     */
    render() {
        // Xóa màn hình
        this.clearScreen();
        
        // Render tất cả managers
        Object.values(this.managers).forEach(manager => {
            if (manager.render) {
                manager.render(this.ctx);
            }
        });
        
        // Render tất cả game objects
        this.gameObjects.forEach(gameObject => {
            if (gameObject.render) {
                gameObject.render(this.ctx);
            }
        });
        
        // Render debug info
        this.renderDebugInfo();
    }
    
    /**
     * Xóa màn hình
     */
    clearScreen() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Cập nhật FPS counter
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsTime >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }
    
    /**
     * Render thông tin debug
     */
    renderDebugInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${this.currentFps}`, 10, 10);
        this.ctx.fillText(`Objects: ${this.gameObjects.length}`, 10, 25);
        this.ctx.fillText(`Managers: ${Object.keys(this.managers).length}`, 10, 40);
    }
    
    /**
     * Lấy kích thước canvas
     */
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    /**
     * Resize canvas
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupCanvas();
    }
    
    /**
     * Cleanup khi thoát game
     */
    destroy() {
        this.stop();
        
        // Cleanup managers
        Object.values(this.managers).forEach(manager => {
            if (manager.destroy) {
                manager.destroy();
            }
        });
        
        // Clear objects
        this.gameObjects = [];
        this.managers = {};
        
        console.log('GameEngine đã được cleanup');
    }
}
