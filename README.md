# MyGame - Game Tu Tiên

Một game tu tiên đơn giản được phát triển bằng HTML5, CSS3 và JavaScript ES6 modules.

## Cấu trúc Dự án

```
MyGame/
├── index.html              # File chính để chạy game
├── README.md              # Hướng dẫn này
├── src/                   # Mã nguồn chính
│   ├── core/              # Lõi game
│   │   ├── GameEngine.js    # Game engine với game loop
│   │   └── GameApplication.js # Ứng dụng chính
│   ├── managers/          # Các manager
│   │   ├── GameState.js     # Quản lý trạng thái game
│   │   ├── GameLogic.js     # Logic game
│   │   └── UIManager.js     # Quản lý giao diện
│   ├── components/        # Các component UI
│   └── helpers/           # Các utility functions
└── assets/                # Tài nguyên (hình ảnh, âm thanh)
```

## Cách Chạy Game

1. **Sử dụng Web Server:**
   ```bash
   # Với Python 3
   python -m http.server 8000
   
   # Hoặc với Node.js (nếu có npx)
   npx serve .
   ```

2. **Mở trình duyệt và truy cập:**
   ```
   http://localhost:8000
   ```

## Tính Năng Hiện Tại

### ✅ Đã Hoàn Thành
- **Game Engine:** Vòng lặp game cơ bản với update và render
- **Game State:** Quản lý trạng thái người chơi, tài nguyên, inventory
- **Game Logic:** Hệ thống tu luyện, level up, tính toán stats
- **UI Manager:** Giao diện hiển thị thông tin player và tài nguyên
- **Auto Save:** Tự động lưu game mỗi 5 phút
- **Event System:** Hệ thống sự kiện để giao tiếp giữa các components

### 🎮 Gameplay Cơ Bản
- **Nhân vật:** Tên, cấp độ, experience, health, mana
- **Tu luyện:** Hệ thống cảnh giới với nhiều tầng
- **Tài nguyên:** Vàng, linh thạch, đan dược
- **Progression:** Tự động tăng tài nguyên và tiến độ tu luyện

### 🎯 Sẽ Phát Triển
- Hệ thống combat
- Inventory và equipment chi tiết
- Quest system
- Kỹ năng và pháp thuật
- Map và exploration
- Multiplayer features

## Điều Khiển

- **ESC:** Mở/đóng menu game
- **Space:** Tạm dừng/tiếp tục game
- **Ctrl+S:** Lưu game thủ công
- **Click các nút:** Tương tác với UI

## Kiến Trúc Code

### GameEngine
- Quản lý vòng lặp game (60 FPS)
- Update và render tất cả components
- Quản lý performance và debug info

### GameState  
- Lưu trữ toàn bộ trạng thái game
- Event system để notify changes
- Save/Load functionality
- Auto-save mỗi 5 phút

### GameLogic
- Tính toán progression và stats
- Hệ thống tu luyện và level up
- Combat calculations
- Resource generation

### UIManager
- Quản lý giao diện HTML
- Real-time updates
- Notification system
- Responsive design

## Performance

- **FPS:** 60 FPS target với automatic frame limiting
- **Memory:** Efficient object pooling cho UI elements
- **Storage:** LocalStorage cho save data
- **Updates:** UI update mỗi 100ms để optimize performance

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

*Yêu cầu hỗ trợ ES6 modules và Canvas API*

## Development

Để phát triển thêm tính năng:

1. **Thêm Component mới:** Tạo file trong `/src/components/`
2. **Thêm Manager:** Tạo file trong `/src/managers/`
3. **Thêm Helper:** Tạo utility functions trong `/src/helpers/`
4. **Register với GameEngine:** Sử dụng `gameEngine.registerManager()`

## Troubleshooting

**Game không load:**
- Kiểm tra console để xem error messages
- Đảm bảo chạy qua web server, không mở file trực tiếp
- Kiểm tra browser có hỗ trợ ES6 modules

**Performance issues:**
- Mở F12 và check FPS counter
- Giảm số lượng UI updates nếu cần
- Check memory usage trong Performance tab

## License

MIT License - Tự do sử dụng và phát triển.
