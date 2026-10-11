import type { PersonaPreset, FinancialState } from '../types/finance';

export const DEFAULT_HOSTEL_HUSTLER: FinancialState = {
  currentDay: 11,
  startingBudget: 10000,
  emergencyBuffer: 1000,
  inflows: [
    { id: 'inf-2', title: 'Freelance Assignment Payment', amount: 1200, day: 15 }
  ],
  commitments: [
    { id: 'com-1', name: 'PG Room & Food Share', amount: 3500, dueDay: 5, category: 'Housing', isPaid: true, essential: true },
    { id: 'com-2', name: 'Hostel High-Speed Wi-Fi', amount: 499, dueDay: 10, category: 'Utilities', isPaid: true, essential: true },
    { id: 'com-3', name: 'Metro / Transit SmartCard', amount: 600, dueDay: 16, category: 'Transit', isPaid: false, essential: true },
    { id: 'com-4', name: 'Mid-Sem Project Printing & Lab Kit', amount: 450, dueDay: 21, category: 'Academic', isPaid: false, essential: true }
  ],
  subscriptions: [
    { id: 'sub-1', name: 'Spotify Student Premium', amount: 59, billingDay: 7, category: 'Music', isActive: true, iconName: 'Music' },
    { id: 'sub-2', name: 'Netflix Mobile HD', amount: 149, billingDay: 14, category: 'Streaming', isActive: true, iconName: 'Tv' },
    { id: 'sub-3', name: 'Campus Gym Pass', amount: 699, billingDay: 18, category: 'Fitness', isActive: true, iconName: 'Dumbbell' },
    { id: 'sub-4', name: 'Google One 100GB Cloud', amount: 130, billingDay: 25, category: 'Cloud', isActive: true, iconName: 'Cloud' }
  ],
  savingsGoals: [
    { id: 'goal-1', name: 'Sneaker Fund (Retro Dunks)', targetAmount: 3000, currentAmount: 1200, targetDay: 30, emoji: '👟', priority: 'HIGH' },
    { id: 'goal-2', name: 'Emergency Safety Cushion', targetAmount: 1500, currentAmount: 600, targetDay: 30, emoji: '🛡️', priority: 'HIGH' },
    { id: 'goal-3', name: 'Weekend Indie Concert Pass', targetAmount: 1200, currentAmount: 300, targetDay: 28, emoji: '🎟️', priority: 'MEDIUM' }
  ],
  transactions: [
    { id: 'tx-1', title: 'Canteen Breakfast & Chai (Week 1)', amount: 280, day: 2, category: 'Food & Dining' },
    { id: 'tx-2', title: 'Stationery Notebooks & Pen Drive', amount: 350, day: 3, category: 'Academic & Tech' },
    { id: 'tx-3', title: 'Late-Night Maggi & Chai with Roomies', amount: 160, day: 6, category: 'Food & Dining' },
    { id: 'tx-4', title: 'Blinkit Quick Grocery Run', amount: 340, day: 8, category: 'Shopping & Quick-Commerce' },
    { id: 'tx-5', title: 'Zomato Biryani Treat Post-Quiz', amount: 480, day: 9, category: 'Food & Dining' },
    { id: 'tx-6', title: 'Auto Rickshaw Rain Fare Split', amount: 140, day: 11, category: 'Transit & Commute' }
  ]
};

export const TECH_INTERN_PRESET: FinancialState = {
  currentDay: 14,
  startingBudget: 10000,
  emergencyBuffer: 800,
  inflows: [],
  commitments: [
    { id: 'com-in-1', name: 'Co-Living Deposit Share', amount: 4200, dueDay: 3, category: 'Housing', isPaid: true, essential: true },
    { id: 'com-in-2', name: 'Daily Rapid Metro Pass', amount: 1100, dueDay: 7, category: 'Transit', isPaid: true, essential: true },
    { id: 'com-in-3', name: 'Office Laptop Stand & Hub', amount: 850, dueDay: 18, category: 'Work', isPaid: false, essential: false }
  ],
  subscriptions: [
    { id: 'sub-in-1', name: 'ChatGPT Plus Student Sub', amount: 499, billingDay: 8, category: 'AI Tools', isActive: true, iconName: 'Cpu' },
    { id: 'sub-in-2', name: 'YouTube Premium Music', amount: 79, billingDay: 16, category: 'Entertainment', isActive: true, iconName: 'Youtube' },
    { id: 'sub-in-3', name: 'Cult.fit Pass Share', amount: 899, billingDay: 20, category: 'Fitness', isActive: true, iconName: 'Flame' }
  ],
  savingsGoals: [
    { id: 'goal-in-1', name: 'Mechanical Keyboard (Keychron)', targetAmount: 4500, currentAmount: 1000, targetDay: 30, emoji: '⌨️', priority: 'MEDIUM' },
    { id: 'goal-in-2', name: 'Safety Net Buffer', targetAmount: 1200, currentAmount: 500, targetDay: 30, emoji: '🛡️', priority: 'HIGH' }
  ],
  transactions: [
    { id: 'tx-in-1', title: 'Office Cafeteria Coffees (Week 1)', amount: 420, day: 4, category: 'Food & Dining' },
    { id: 'tx-in-2', title: 'Swiggy Dinner post Late Night Release', amount: 560, day: 9, category: 'Food & Dining' },
    { id: 'tx-in-3', title: 'Team Outing Cafe Contribution', amount: 650, day: 12, category: 'Entertainment & Social' }
  ]
};

export const FREELANCE_CREATIVE_PRESET: FinancialState = {
  currentDay: 8,
  startingBudget: 10000,
  emergencyBuffer: 1200,
  inflows: [
    { id: 'inf-cr-2', title: 'Logo Design Completion Gig', amount: 2500, day: 19 }
  ],
  commitments: [
    { id: 'com-cr-1', name: 'Studio Desk Space Rental', amount: 3200, dueDay: 4, category: 'Work', isPaid: true, essential: true },
    { id: 'com-cr-2', name: 'Fiber Internet 300Mbps', amount: 899, dueDay: 12, category: 'Utilities', isPaid: false, essential: true },
    { id: 'com-cr-3', name: 'Domain & Hosting Renewal', amount: 650, dueDay: 22, category: 'Tech', isPaid: false, essential: true }
  ],
  subscriptions: [
    { id: 'sub-cr-1', name: 'Adobe Creative Cloud Mobile', amount: 499, billingDay: 9, category: 'Design', isActive: true, iconName: 'Palette' },
    { id: 'sub-cr-2', name: 'Midjourney Pro Share', amount: 399, billingDay: 13, category: 'AI Tools', isActive: true, iconName: 'Sparkles' },
    { id: 'sub-cr-3', name: 'Spotify Music', amount: 119, billingDay: 15, category: 'Music', isActive: true, iconName: 'Music' }
  ],
  savingsGoals: [
    { id: 'goal-cr-1', name: 'Drawing Tablet Upgrade', targetAmount: 3800, currentAmount: 1400, targetDay: 30, emoji: '🎨', priority: 'HIGH' },
    { id: 'goal-cr-2', name: 'Emergency Tax Buffer', targetAmount: 2000, currentAmount: 700, targetDay: 30, emoji: '🛡️', priority: 'MEDIUM' }
  ],
  transactions: [
    { id: 'tx-cr-1', title: 'Specialty Cold Brew Beans', amount: 390, day: 3, category: 'Food & Dining' },
    { id: 'tx-cr-2', title: 'Mockup Asset Pack Purchase', amount: 450, day: 6, category: 'Academic & Tech' }
  ]
};

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'hostel-hustler',
    name: 'College Hosteler',
    avatar: '🎒',
    tagline: 'PG Rent + Daily Canteen + Sneaker Goal',
    description: 'Realistic college student managing PG rent, campus chai runs, and saving for sneakers on ₹10k.',
    state: DEFAULT_HOSTEL_HUSTLER
  },
  {
    id: 'tech-intern',
    name: 'First-Month Intern',
    avatar: '💻',
    tagline: 'High Commute + Cafe Bills + Tight Runway',
    description: 'Tech intern facing high commute fares and social pressure. At risk of mid-month cash depletion.',
    state: TECH_INTERN_PRESET
  },
  {
    id: 'freelance-creative',
    name: 'Freelance Creator',
    avatar: '🎨',
    tagline: 'SaaS Subs + Mid-Month Gig Inflows',
    description: 'Design freelancer balancing creative tool subscriptions with irregular client payment cycles.',
    state: FREELANCE_CREATIVE_PRESET
  }
];

export const UNEXPECTED_SHOCKS_POOL = [
  { id: 'shk-1', title: 'Flat Tyre & Tube Replacement', amount: 450, category: 'Transit & Commute' as const, severity: 'LOW' },
  { id: 'shk-2', title: 'Shattered Phone Screen Glass', amount: 1400, category: 'Health & Emergency' as const, severity: 'HIGH' },
  { id: 'shk-3', title: 'Sudden Dental Cavity / Antibiotics', amount: 850, category: 'Health & Emergency' as const, severity: 'MEDIUM' },
  { id: 'shk-4', title: 'Best Friend Surprise Birthday Split', amount: 650, category: 'Entertainment & Social' as const, severity: 'MEDIUM' },
  { id: 'shk-5', title: 'Semester Lab Manuals & Late Fine', amount: 500, category: 'Academic & Tech' as const, severity: 'LOW' },
  { id: 'shk-6', title: 'Emergency Uber in Heavy Torrential Rain', amount: 380, category: 'Transit & Commute' as const, severity: 'LOW' }
];
