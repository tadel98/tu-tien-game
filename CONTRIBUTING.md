# 🤝 Contributing to Tu Tiên Game

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Tu Tiên Game! Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng.

## 📋 Cách Đóng Góp

### 1. **Báo Cáo Lỗi (Bug Reports)**
- Sử dụng [GitHub Issues](https://github.com/yourusername/tu-tien-game/issues)
- Mô tả chi tiết lỗi và cách tái tạo
- Bao gồm thông tin hệ thống (OS, Node.js version, etc.)

### 2. **Đề Xuất Tính Năng (Feature Requests)**
- Tạo issue với label "enhancement"
- Mô tả rõ ràng tính năng mong muốn
- Giải thích lý do tại sao tính năng này hữu ích

### 3. **Đóng Góp Code**
- Fork repository
- Tạo feature branch
- Commit changes
- Tạo Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- Git

### Setup
```bash
# 1. Fork và clone repository
git clone https://github.com/yourusername/tu-tien-game.git
cd tu-tien-game

# 2. Install dependencies
npm install

# 3. Setup environment
cp env.production.example .env.development

# 4. Start MongoDB
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod

# 5. Run development server
npm run dev
```

## 📝 Coding Standards

### JavaScript/Node.js
- Sử dụng ES6+ syntax
- 2 spaces cho indentation
- Semicolons bắt buộc
- JSDoc comments cho functions
- ESLint configuration

### HTML/CSS
- Semantic HTML5
- CSS Grid/Flexbox
- Mobile-first responsive design
- BEM methodology cho CSS classes

### Git Commit Messages
```
type(scope): description

feat(auth): add JWT authentication
fix(ui): resolve mobile layout issue
docs(readme): update installation guide
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
- Aim for >80% code coverage
- Test critical game logic
- Test authentication flows
- Test multiplayer features

## 📁 Project Structure

```
src/
├── core/           # Core game logic
├── components/     # UI components
├── managers/       # Game managers
├── helpers/        # Utility functions
models/             # Database models
services/           # Business logic
routes/             # API routes
middleware/         # Express middleware
database/           # Database connection
config/             # Configuration files
utils/              # Utility functions
```

## 🎮 Game Development Guidelines

### Game Logic
- Server-side validation cho tất cả actions
- Client-side chỉ hiển thị UI
- Sử dụng Socket.IO cho real-time features
- Implement proper error handling

### Database
- Sử dụng Mongoose schemas
- Implement proper indexing
- Add validation rules
- Handle migrations carefully

### Security
- Validate all inputs
- Use bcrypt cho passwords
- Implement rate limiting
- Sanitize user data

## 🔄 Pull Request Process

### Before Submitting
1. **Fork** repository
2. **Create** feature branch từ `main`
3. **Make** changes
4. **Test** thoroughly
5. **Update** documentation nếu cần

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on development environment
4. **Approval** and merge

## 🐛 Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 10]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome 91]
- Game Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem
```

## 💡 Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context or screenshots
```

## 📚 Documentation

### Code Documentation
- JSDoc cho functions
- README cho modules
- Inline comments cho complex logic
- API documentation

### User Documentation
- Game guides
- Installation instructions
- Troubleshooting guides
- FAQ

## 🏷️ Labels

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information is requested

### PR Labels
- `ready for review`: Ready for code review
- `work in progress`: Still being worked on
- `needs testing`: Requires testing
- `breaking change`: Breaking change

## 🎯 Roadmap

### Short Term
- [ ] Mobile app
- [ ] More game modes
- [ ] Social features
- [ ] Performance optimization

### Long Term
- [ ] 3D graphics
- [ ] VR support
- [ ] AI opponents
- [ ] Cross-platform play

## 📞 Getting Help

- **Discord**: [Join our Discord](https://discord.gg/tu-tien-game)
- **GitHub Discussions**: [Community discussions](https://github.com/yourusername/tu-tien-game/discussions)
- **Email**: dev@tu-tien-game.com

## 🙏 Recognition

Contributors sẽ được:
- Liệt kê trong README
- Nhận badge "Contributor"
- Được mời tham gia Discord server
- Có cơ hội trở thành maintainer

---

**Cảm ơn bạn đã đóng góp cho Tu Tiên Game! 🐉**
