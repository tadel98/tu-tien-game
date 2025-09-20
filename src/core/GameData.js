/**
 * GameData.js - Cơ sở dữ liệu tập trung cho tất cả game data
 */

/**
 * Database chứa tất cả thông tin vật phẩm
 */
export const itemDatabase = {
  // === CONSUMABLES ===
  'hp_potion_small': {
    id: 'hp_potion_small',
    name: 'Bình Máu Nhỏ',
    description: 'Hồi phục 50 điểm sinh lực.',
    type: 'consumable',
    rarity: 'common',
    icon: '🍷',
    effect: { type: 'HEAL', amount: 50 },
    value: 10
  },
  
  'hp_potion_medium': {
    id: 'hp_potion_medium',
    name: 'Bình Máu Trung',
    description: 'Hồi phục 150 điểm sinh lực.',
    type: 'consumable',
    rarity: 'uncommon',
    icon: '🧪',
    effect: { type: 'HEAL', amount: 150 },
    value: 30
  },
  
  'mana_potion_small': {
    id: 'mana_potion_small',
    name: 'Bình Mana Nhỏ',
    description: 'Hồi phục 30 điểm pháp lực.',
    type: 'consumable',
    rarity: 'common',
    icon: '💙',
    effect: { type: 'RESTORE_MANA', amount: 30 },
    value: 8
  },
  
  'gold_pouch': {
    id: 'gold_pouch',
    name: 'Túi Vàng',
    description: 'Nhận được 100 vàng.',
    type: 'consumable',
    rarity: 'common',
    icon: '💰',
    effect: { type: 'ADD_GOLD', amount: 100 },
    value: 50
  },
  
  'experience_pill': {
    id: 'experience_pill',
    name: 'Kinh Nghiệm Đan',
    description: 'Tăng kinh nghiệm dựa trên cấp độ hiện tại.',
    type: 'consumable',
    rarity: 'rare',
    icon: '💊',
    effect: { type: 'ADD_EXP', multiplier: 100 },
    value: 200
  },
  
  'cultivation_pill': {
    id: 'cultivation_pill',
    name: 'Tu Luyện Đan',
    description: 'Tăng 500 điểm tiến độ tu luyện.',
    type: 'consumable',
    rarity: 'uncommon',
    icon: '🔮',
    effect: { type: 'ADD_CULTIVATION', amount: 500 },
    value: 150
  },

  // === WEAPONS ===
  'wooden_sword': {
    id: 'wooden_sword',
    name: 'Kiếm Gỗ',
    description: 'Một thanh kiếm gỗ cơ bản cho người mới bắt đầu.',
    type: 'weapon',
    rarity: 'common',
    icon: '🗡️',
    stats: { attack: 5 },
    requirements: { level: 1 },
    value: 20
  },
  
  'iron_sword': {
    id: 'iron_sword',
    name: 'Kiếm Sắt',
    description: 'Một thanh kiếm sắt sắc bén và bền chắc.',
    type: 'weapon',
    rarity: 'uncommon',
    icon: '⚔️',
    stats: { attack: 15, speed: 2 },
    requirements: { level: 5 },
    value: 100
  },
  
  'steel_sword': {
    id: 'steel_sword',
    name: 'Kiếm Thép',
    description: 'Kiếm thép cao cấp với độ sắc bén vượt trội.',
    type: 'weapon',
    rarity: 'rare',
    icon: '⚔️',
    stats: { attack: 25, speed: 3, luck: 1 },
    requirements: { level: 10 },
    value: 300
  },
  
  'mystic_blade': {
    id: 'mystic_blade',
    name: 'Huyền Thiên Kiếm',
    description: 'Thanh kiếm huyền thoại chứa đựng sức mạnh cổ đại.',
    type: 'weapon',
    rarity: 'epic',
    icon: '🗡️',
    stats: { attack: 40, speed: 5, intelligence: 3, luck: 2 },
    requirements: { level: 20, cultivation_stage: 5 },
    value: 1000
  },

  // === ARMOR ===
  'cloth_robe': {
    id: 'cloth_robe',
    name: 'Áo Vải Thô',
    description: 'Áo vải đơn giản cung cấp bảo vệ cơ bản.',
    type: 'armor',
    rarity: 'common',
    icon: '👘',
    stats: { defense: 3, health: 10 },
    requirements: { level: 1 },
    value: 15
  },
  
  'leather_armor': {
    id: 'leather_armor',
    name: 'Áo Giáp Da',
    description: 'Áo giáp làm từ da thuộc bền chắc.',
    type: 'armor',
    rarity: 'uncommon',
    icon: '🛡️',
    stats: { defense: 8, health: 25, speed: 1 },
    requirements: { level: 5 },
    value: 80
  },
  
  'chain_mail': {
    id: 'chain_mail',
    name: 'Áo Xích',
    description: 'Áo giáp xích kim loại cung cấp bảo vệ tốt.',
    type: 'armor',
    rarity: 'rare',
    icon: '🛡️',
    stats: { defense: 15, health: 40, mana: 10 },
    requirements: { level: 10 },
    value: 250
  },
  
  'dragon_scale_armor': {
    id: 'dragon_scale_armor',
    name: 'Giáp Vảy Rồng',
    description: 'Áo giáp làm từ vảy rồng cổ đại, cực kỳ bền chắc.',
    type: 'armor',
    rarity: 'legendary',
    icon: '🛡️',
    stats: { defense: 30, health: 80, mana: 20, intelligence: 2 },
    requirements: { level: 25, cultivation_stage: 8 },
    value: 2000
  },

  // === ACCESSORIES ===
  'copper_ring': {
    id: 'copper_ring',
    name: 'Nhẫn Đồng',
    description: 'Chiếc nhẫn đồng đơn giản.',
    type: 'accessory',
    rarity: 'common',
    icon: '💍',
    stats: { luck: 1 },
    requirements: { level: 1 },
    value: 25
  },
  
  'silver_ring': {
    id: 'silver_ring',
    name: 'Nhẫn Bạc',
    description: 'Nhẫn bạc tinh xảo tăng trí tuệ.',
    type: 'accessory',
    rarity: 'uncommon',
    icon: '💍',
    stats: { intelligence: 3, luck: 2 },
    requirements: { level: 5 },
    value: 120
  },
  
  'jade_amulet': {
    id: 'jade_amulet',
    name: 'Bùa Ngọc Bích',
    description: 'Bùa hộ mệnh từ ngọc bích quý hiếm.',
    type: 'accessory',
    rarity: 'rare',
    icon: '🔮',
    stats: { intelligence: 5, mana: 15, luck: 3 },
    requirements: { level: 12 },
    value: 400
  },
  
  'phoenix_pendant': {
    id: 'phoenix_pendant',
    name: 'Mặt Dây Phượng Hoàng',
    description: 'Mặt dây chuyền hình phượng hoàng mang sức mạnh huyền bí.',
    type: 'accessory',
    rarity: 'legendary',
    icon: '🔥',
    stats: { intelligence: 8, mana: 30, luck: 5, speed: 3 },
    requirements: { level: 30, cultivation_stage: 10 },
    value: 3000
  },

  // === BOOTS ===
  'cloth_shoes': {
    id: 'cloth_shoes',
    name: 'Giày Vải',
    description: 'Đôi giày vải đơn giản và thoải mái.',
    type: 'boots',
    rarity: 'common',
    icon: '👟',
    stats: { speed: 2 },
    requirements: { level: 1 },
    value: 10
  },
  
  'leather_boots': {
    id: 'leather_boots',
    name: 'Ủng Da',
    description: 'Đôi ủng da bền chắc cho những chuyến phiêu lưu.',
    type: 'boots',
    rarity: 'uncommon',
    icon: '👢',
    stats: { speed: 4, defense: 2 },
    requirements: { level: 5 },
    value: 60
  },
  
  'wind_walker_boots': {
    id: 'wind_walker_boots',
    name: 'Ủng Phong Hành',
    description: 'Đôi ủng huyền thoại cho phép di chuyển như gió.',
    type: 'boots',
    rarity: 'epic',
    icon: '👢',
    stats: { speed: 10, luck: 3, intelligence: 2 },
    requirements: { level: 18, cultivation_stage: 6 },
    value: 800
  }
};

/**
 * Loot tables cho các hoạt động khác nhau
 */
export const lootTables = {
  // Loot từ tu luyện
  cultivation: [
    { itemId: 'cultivation_pill', chance: 0.1, quantity: [1, 1] },
    { itemId: 'mana_potion_small', chance: 0.2, quantity: [1, 2] },
    { itemId: 'gold_pouch', chance: 0.15, quantity: [1, 1] }
  ],
  
  // Loot từ combat (tương lai)
  combat: [
    { itemId: 'hp_potion_small', chance: 0.3, quantity: [1, 3] },
    { itemId: 'iron_sword', chance: 0.05, quantity: [1, 1] },
    { itemId: 'leather_armor', chance: 0.03, quantity: [1, 1] },
    { itemId: 'experience_pill', chance: 0.08, quantity: [1, 1] }
  ],
  
  // Loot từ quest rewards
  quest_reward: [
    { itemId: 'steel_sword', chance: 0.2, quantity: [1, 1] },
    { itemId: 'chain_mail', chance: 0.15, quantity: [1, 1] },
    { itemId: 'jade_amulet', chance: 0.1, quantity: [1, 1] },
    { itemId: 'experience_pill', chance: 0.3, quantity: [2, 5] }
  ]
};

/**
 * Cultivation realms data
 */
export const cultivationRealms = [
  {
    name: 'Phàm Nhân',
    stages: 9,
    multiplier: 1,
    description: 'Cảnh giới khởi đầu của con đường tu luyện'
  },
  {
    name: 'Luyện Khí',
    stages: 9,
    multiplier: 2,
    description: 'Bắt đầu tích tụ và điều khiển khí trong cơ thể'
  },
  {
    name: 'Trúc Cơ',
    stages: 9,
    multiplier: 4,
    description: 'Xây dựng nền tảng vững chắc cho tu luyện'
  },
  {
    name: 'Kim Đan',
    stages: 9,
    multiplier: 8,
    description: 'Hình thành kim đan trong đan điền'
  },
  {
    name: 'Nguyên Anh',
    stages: 9,
    multiplier: 16,
    description: 'Nguyên anh thoát xác, bước vào cảnh giới cao hơn'
  },
  {
    name: 'Hóa Thần',
    stages: 9,
    multiplier: 32,
    description: 'Nguyên anh hóa thần, sức mạnh tăng vọt'
  }
];

/**
 * Rarity colors và multipliers
 */
export const rarityData = {
  common: {
    name: 'Phổ Thông',
    color: '#9e9e9e',
    statMultiplier: 1.0,
    valueMultiplier: 1.0
  },
  uncommon: {
    name: 'Không Phổ Biến',
    color: '#4caf50',
    statMultiplier: 1.2,
    valueMultiplier: 1.5
  },
  rare: {
    name: 'Hiếm',
    color: '#2196f3',
    statMultiplier: 1.5,
    valueMultiplier: 2.5
  },
  epic: {
    name: 'Sử Thi',
    color: '#9c27b0',
    statMultiplier: 2.0,
    valueMultiplier: 5.0
  },
  legendary: {
    name: 'Huyền Thoại',
    color: '#ff9800',
    statMultiplier: 3.0,
    valueMultiplier: 10.0
  }
};

/**
 * Equipment slots configuration
 */
export const equipmentSlots = {
  weapon: {
    name: 'Vũ Khí',
    icon: '⚔️',
    allowedTypes: ['weapon']
  },
  armor: {
    name: 'Áo Giáp',
    icon: '🛡️',
    allowedTypes: ['armor']
  },
  accessory: {
    name: 'Phụ Kiện',
    icon: '💍',
    allowedTypes: ['accessory']
  },
  boots: {
    name: 'Giày Dép',
    icon: '👢',
    allowedTypes: ['boots']
  }
};

/**
 * Arena Ranking System Data
 */
export const arenaRanks = [
  {
    name: 'Chưa Xếp Hạng',
    minPoints: 0,
    maxPoints: 799,
    icon: '❓',
    color: '#9e9e9e',
    tier: 0,
    description: 'Chưa tham gia đấu trường'
  },
  {
    name: 'Đồng V',
    minPoints: 800,
    maxPoints: 999,
    icon: '🥉',
    color: '#cd7f32',
    tier: 1,
    description: 'Bậc thấp nhất của đấu trường'
  },
  {
    name: 'Đồng IV',
    minPoints: 1000,
    maxPoints: 1199,
    icon: '🥉',
    color: '#cd7f32',
    tier: 2,
    description: 'Đồng cấp 4'
  },
  {
    name: 'Đồng III',
    minPoints: 1200,
    maxPoints: 1399,
    icon: '🥉',
    color: '#cd7f32',
    tier: 3,
    description: 'Đồng cấp 3'
  },
  {
    name: 'Đồng II',
    minPoints: 1400,
    maxPoints: 1599,
    icon: '🥉',
    color: '#cd7f32',
    tier: 4,
    description: 'Đồng cấp 2'
  },
  {
    name: 'Đồng I',
    minPoints: 1600,
    maxPoints: 1799,
    icon: '🥉',
    color: '#cd7f32',
    tier: 5,
    description: 'Đồng cấp 1'
  },
  {
    name: 'Bạc V',
    minPoints: 1800,
    maxPoints: 1999,
    icon: '🥈',
    color: '#c0c0c0',
    tier: 6,
    description: 'Bạc cấp 5'
  },
  {
    name: 'Bạc IV',
    minPoints: 2000,
    maxPoints: 2199,
    icon: '🥈',
    color: '#c0c0c0',
    tier: 7,
    description: 'Bạc cấp 4'
  },
  {
    name: 'Bạc III',
    minPoints: 2200,
    maxPoints: 2399,
    icon: '🥈',
    color: '#c0c0c0',
    tier: 8,
    description: 'Bạc cấp 3'
  },
  {
    name: 'Bạc II',
    minPoints: 2400,
    maxPoints: 2599,
    icon: '🥈',
    color: '#c0c0c0',
    tier: 9,
    description: 'Bạc cấp 2'
  },
  {
    name: 'Bạc I',
    minPoints: 2600,
    maxPoints: 2799,
    icon: '🥈',
    color: '#c0c0c0',
    tier: 10,
    description: 'Bạc cấp 1'
  },
  {
    name: 'Vàng V',
    minPoints: 2800,
    maxPoints: 2999,
    icon: '🥇',
    color: '#ffd700',
    tier: 11,
    description: 'Vàng cấp 5'
  },
  {
    name: 'Vàng IV',
    minPoints: 3000,
    maxPoints: 3199,
    icon: '🥇',
    color: '#ffd700',
    tier: 12,
    description: 'Vàng cấp 4'
  },
  {
    name: 'Vàng III',
    minPoints: 3200,
    maxPoints: 3399,
    icon: '🥇',
    color: '#ffd700',
    tier: 13,
    description: 'Vàng cấp 3'
  },
  {
    name: 'Vàng II',
    minPoints: 3400,
    maxPoints: 3599,
    icon: '🥇',
    color: '#ffd700',
    tier: 14,
    description: 'Vàng cấp 2'
  },
  {
    name: 'Vàng I',
    minPoints: 3600,
    maxPoints: 3799,
    icon: '🥇',
    color: '#ffd700',
    tier: 15,
    description: 'Vàng cấp 1'
  },
  {
    name: 'Bạch Kim V',
    minPoints: 3800,
    maxPoints: 3999,
    icon: '💎',
    color: '#e5e4e2',
    tier: 16,
    description: 'Bạch Kim cấp 5'
  },
  {
    name: 'Bạch Kim IV',
    minPoints: 4000,
    maxPoints: 4199,
    icon: '💎',
    color: '#e5e4e2',
    tier: 17,
    description: 'Bạch Kim cấp 4'
  },
  {
    name: 'Bạch Kim III',
    minPoints: 4200,
    maxPoints: 4399,
    icon: '💎',
    color: '#e5e4e2',
    tier: 18,
    description: 'Bạch Kim cấp 3'
  },
  {
    name: 'Bạch Kim II',
    minPoints: 4400,
    maxPoints: 4599,
    icon: '💎',
    color: '#e5e4e2',
    tier: 19,
    description: 'Bạch Kim cấp 2'
  },
  {
    name: 'Bạch Kim I',
    minPoints: 4600,
    maxPoints: 4799,
    icon: '💎',
    color: '#e5e4e2',
    tier: 20,
    description: 'Bạch Kim cấp 1'
  },
  {
    name: 'Kim Cương V',
    minPoints: 4800,
    maxPoints: 4999,
    icon: '💠',
    color: '#b9f2ff',
    tier: 21,
    description: 'Kim Cương cấp 5'
  },
  {
    name: 'Kim Cương IV',
    minPoints: 5000,
    maxPoints: 5199,
    icon: '💠',
    color: '#b9f2ff',
    tier: 22,
    description: 'Kim Cương cấp 4'
  },
  {
    name: 'Kim Cương III',
    minPoints: 5200,
    maxPoints: 5399,
    icon: '💠',
    color: '#b9f2ff',
    tier: 23,
    description: 'Kim Cương cấp 3'
  },
  {
    name: 'Kim Cương II',
    minPoints: 5400,
    maxPoints: 5599,
    icon: '💠',
    color: '#b9f2ff',
    tier: 24,
    description: 'Kim Cương cấp 2'
  },
  {
    name: 'Kim Cương I',
    minPoints: 5600,
    maxPoints: 5799,
    icon: '💠',
    color: '#b9f2ff',
    tier: 25,
    description: 'Kim Cương cấp 1'
  },
  {
    name: 'Thần Thoại',
    minPoints: 5800,
    maxPoints: 9999,
    icon: '👑',
    color: '#ff6b6b',
    tier: 26,
    description: 'Cấp bậc cao nhất - Chỉ dành cho những cao thủ thực sự'
  }
];

/**
 * Arena Season Rewards
 */
export const seasonRewards = {
  'Chưa Xếp Hạng': { gold: 0, spiritStones: 0, cultivationPills: 0 },
  'Đồng V': { gold: 100, spiritStones: 5, cultivationPills: 1 },
  'Đồng IV': { gold: 200, spiritStones: 10, cultivationPills: 2 },
  'Đồng III': { gold: 300, spiritStones: 15, cultivationPills: 3 },
  'Đồng II': { gold: 400, spiritStones: 20, cultivationPills: 4 },
  'Đồng I': { gold: 500, spiritStones: 25, cultivationPills: 5 },
  'Bạc V': { gold: 750, spiritStones: 40, cultivationPills: 8 },
  'Bạc IV': { gold: 1000, spiritStones: 50, cultivationPills: 10 },
  'Bạc III': { gold: 1250, spiritStones: 60, cultivationPills: 12 },
  'Bạc II': { gold: 1500, spiritStones: 70, cultivationPills: 14 },
  'Bạc I': { gold: 1750, spiritStones: 80, cultivationPills: 16 },
  'Vàng V': { gold: 2500, spiritStones: 120, cultivationPills: 25 },
  'Vàng IV': { gold: 3000, spiritStones: 140, cultivationPills: 30 },
  'Vàng III': { gold: 3500, spiritStones: 160, cultivationPills: 35 },
  'Vàng II': { gold: 4000, spiritStones: 180, cultivationPills: 40 },
  'Vàng I': { gold: 4500, spiritStones: 200, cultivationPills: 45 },
  'Bạch Kim V': { gold: 6000, spiritStones: 300, cultivationPills: 60 },
  'Bạch Kim IV': { gold: 7000, spiritStones: 350, cultivationPills: 70 },
  'Bạch Kim III': { gold: 8000, spiritStones: 400, cultivationPills: 80 },
  'Bạch Kim II': { gold: 9000, spiritStones: 450, cultivationPills: 90 },
  'Bạch Kim I': { gold: 10000, spiritStones: 500, cultivationPills: 100 },
  'Kim Cương V': { gold: 15000, spiritStones: 750, cultivationPills: 150 },
  'Kim Cương IV': { gold: 17500, spiritStones: 875, cultivationPills: 175 },
  'Kim Cương III': { gold: 20000, spiritStones: 1000, cultivationPills: 200 },
  'Kim Cương II': { gold: 22500, spiritStones: 1125, cultivationPills: 225 },
  'Kim Cương I': { gold: 25000, spiritStones: 1250, cultivationPills: 250 },
  'Thần Thoại': { gold: 50000, spiritStones: 2500, cultivationPills: 500 }
};

/**
 * Arena Match Types
 */
export const arenaMatchTypes = {
  RANKED: {
    name: 'Xếp Hạng',
    description: 'Trận đấu tính điểm xếp hạng',
    pointsMultiplier: 1.0,
    cooldown: 0, // No cooldown
    requirements: { level: 5 }
  },
  PRACTICE: {
    name: 'Luyện Tập',
    description: 'Trận đấu không tính điểm, dùng để luyện tập',
    pointsMultiplier: 0,
    cooldown: 0,
    requirements: { level: 1 }
  },
  TOURNAMENT: {
    name: 'Giải Đấu',
    description: 'Giải đấu đặc biệt với phần thưởng lớn',
    pointsMultiplier: 2.0,
    cooldown: 3600000, // 1 hour cooldown
    requirements: { level: 10, rank: 'Bạc V' }
  }
};

/**
 * Arena AI Opponents Database
 */
export const arenaOpponents = [
  {
    id: 'novice_warrior',
    name: 'Chiến Sĩ Mới',
    level: 5,
    power: 500,
    aiDifficulty: 'easy',
    description: 'Một chiến sĩ mới bắt đầu con đường đấu trường'
  },
  {
    id: 'experienced_fighter',
    name: 'Võ Sĩ Kinh Nghiệm',
    level: 10,
    power: 1200,
    aiDifficulty: 'medium',
    description: 'Võ sĩ đã có kinh nghiệm chiến đấu'
  },
  {
    id: 'arena_veteran',
    name: 'Cựu Binh Đấu Trường',
    level: 15,
    power: 2000,
    aiDifficulty: 'hard',
    description: 'Cựu binh từng tham gia nhiều trận đấu'
  },
  {
    id: 'elite_combatant',
    name: 'Chiến Binh Ưu Tú',
    level: 20,
    power: 3500,
    aiDifficulty: 'expert',
    description: 'Chiến binh ưu tú với kỹ năng cao'
  },
  {
    id: 'arena_champion',
    name: 'Vô Địch Đấu Trường',
    level: 25,
    power: 5000,
    aiDifficulty: 'master',
    description: 'Vô địch đấu trường với sức mạnh khủng khiếp'
  }
];

/**
 * Arena Utility Functions
 */
export class ArenaUtils {
  /**
   * Get rank by points
   */
  static getRankByPoints(points) {
    return arenaRanks.find(rank => 
      points >= rank.minPoints && points <= rank.maxPoints
    ) || arenaRanks[0];
  }

  /**
   * Get next rank
   */
  static getNextRank(currentRank) {
    const currentIndex = arenaRanks.findIndex(rank => rank.name === currentRank.name);
    return currentIndex < arenaRanks.length - 1 ? arenaRanks[currentIndex + 1] : null;
  }

  /**
   * Calculate points change based on match result
   */
  static calculatePointsChange(winnerPoints, loserPoints, matchType = 'RANKED') {
    const basePoints = 25;
    const multiplier = arenaMatchTypes[matchType]?.pointsMultiplier || 1.0;
    
    // ELO-like calculation
    const expectedScore = 1 / (1 + Math.pow(10, (loserPoints - winnerPoints) / 400));
    const actualScore = 1; // Winner always gets 1
    
    const pointsChange = Math.round(basePoints * (actualScore - expectedScore) * multiplier);
    
    return Math.max(5, Math.min(50, pointsChange)); // Clamp between 5-50
  }

  /**
   * Get season rewards for rank
   */
  static getSeasonRewards(rankName) {
    return seasonRewards[rankName] || seasonRewards['Chưa Xếp Hạng'];
  }

  /**
   * Generate AI opponent based on player level and rank
   */
  static generateAIOpponent(playerLevel, playerRank) {
    const playerTier = playerRank.tier;
    
    // Find opponents within reasonable range
    const suitableOpponents = arenaOpponents.filter(opponent => {
      const levelDiff = Math.abs(opponent.level - playerLevel);
      return levelDiff <= 5; // Within 5 levels
    });
    
    if (suitableOpponents.length === 0) {
      return arenaOpponents[0]; // Fallback to first opponent
    }
    
    // Weight selection based on player tier
    const weights = suitableOpponents.map(opponent => {
      const baseWeight = 1;
      const levelWeight = Math.max(0.1, 1 - Math.abs(opponent.level - playerLevel) / 10);
      return baseWeight * levelWeight;
    });
    
    // Select weighted random opponent
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < suitableOpponents.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return suitableOpponents[i];
      }
    }
    
    return suitableOpponents[0];
  }

  /**
   * Check if player can participate in match type
   */
  static canParticipate(player, matchType) {
    const match = arenaMatchTypes[matchType];
    if (!match) return false;
    
    const req = match.requirements;
    
    if (req.level && player.level < req.level) return false;
    if (req.rank) {
      const playerRank = this.getRankByPoints(player.arenaStats.points);
      const requiredRank = arenaRanks.find(r => r.name === req.rank);
      if (requiredRank && playerRank.tier < requiredRank.tier) return false;
    }
    
    return true;
  }

  /**
   * Get leaderboard position
   */
  static getLeaderboardPosition(playerPoints, leaderboard) {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
    const position = sortedLeaderboard.findIndex(entry => entry.points <= playerPoints);
    return position === -1 ? sortedLeaderboard.length + 1 : position + 1;
  }
}

/**
 * Utility functions
 */
export class GameDataUtils {
  /**
   * Get item by ID
   */
  static getItem(itemId) {
    return itemDatabase[itemId] || null;
  }
  
  /**
   * Get items by type
   */
  static getItemsByType(type) {
    return Object.values(itemDatabase).filter(item => item.type === type);
  }
  
  /**
   * Get items by rarity
   */
  static getItemsByRarity(rarity) {
    return Object.values(itemDatabase).filter(item => item.rarity === rarity);
  }
  
  /**
   * Check if player meets item requirements
   */
  static meetsRequirements(item, player) {
    if (!item.requirements) return true;
    
    const req = item.requirements;
    
    if (req.level && player.level < req.level) return false;
    if (req.cultivation_stage && player.cultivation.stage < req.cultivation_stage) return false;
    
    return true;
  }
  
  /**
   * Generate random loot from table
   */
  static generateLoot(lootTableName, playerLevel = 1, luckBonus = 0) {
    const lootTable = lootTables[lootTableName];
    if (!lootTable) return [];
    
    const loot = [];
    
    lootTable.forEach(entry => {
      const adjustedChance = entry.chance * (1 + luckBonus * 0.01);
      if (Math.random() < adjustedChance) {
        const minQty = entry.quantity[0];
        const maxQty = entry.quantity[1];
        const quantity = Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;
        
        loot.push({
          itemId: entry.itemId,
          quantity: quantity
        });
      }
    });
    
    return loot;
  }
}
