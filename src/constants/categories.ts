/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpenseCategory } from '../types';

export interface CategoryMeta {
  id: ExpenseCategory;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  Food: {
    id: 'Food',
    name: 'Food & Dining',
    iconName: 'Utensils',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    accentHex: '#F59E0B',
  },
  Transport: {
    id: 'Transport',
    name: 'Transport & Cab',
    iconName: 'Car',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    accentHex: '#3B82F6',
  },
  Entertainment: {
    id: 'Entertainment',
    name: 'Entertainment & Gaming',
    iconName: 'Gamepad2',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    accentHex: '#A855F7',
  },
  Shopping: {
    id: 'Shopping',
    name: 'Shopping & Drops',
    iconName: 'ShoppingBag',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    accentHex: '#EC4899',
  },
  Health: {
    id: 'Health',
    name: 'Health & Fitness',
    iconName: 'HeartPulse',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    accentHex: '#10B981',
  },
  Education: {
    id: 'Education',
    name: 'Education & Courses',
    iconName: 'GraduationCap',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    accentHex: '#06B6D4',
  },
  Subscriptions: {
    id: 'Subscriptions',
    name: 'Subscriptions & OTT',
    iconName: 'Tv',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    accentHex: '#6366F1',
  },
  Savings: {
    id: 'Savings',
    name: 'Savings & Lockbox',
    iconName: 'PiggyBank',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    accentHex: '#14B8A6',
  },
  Other: {
    id: 'Other',
    name: 'Miscellaneous',
    iconName: 'Layers',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    accentHex: '#94A3B8',
  },
};

export interface DecisionPreset {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  emoji: string;
  tagline: string;
}

export const GEN_Z_PRESETS: DecisionPreset[] = [
  {
    id: 'swiggy-craving',
    title: 'Midnight Munchies',
    amount: 650,
    category: 'Food',
    emoji: '🍕',
    tagline: 'Gourmet pizza & boba craving at 1 AM',
  },
  {
    id: 'concert-pass',
    title: 'Sunburn Music Fest',
    amount: 1800,
    category: 'Entertainment',
    emoji: '🎟️',
    tagline: 'Phase 1 early bird pass with squad',
  },
  {
    id: 'sneaker-drop',
    title: 'Limited Sneaker Drop',
    amount: 3500,
    category: 'Shopping',
    emoji: '👟',
    tagline: 'SNKRS release before resell markup',
  },
  {
    id: 'weekend-trip',
    title: 'Lonavala Weekend Getaway',
    amount: 2400,
    category: 'Transport',
    emoji: '🚗',
    tagline: 'Split cab fare, resort share & toll passes',
  },
  {
    id: 'gym-membership',
    title: 'Gym & Protein Stack',
    amount: 1200,
    category: 'Health',
    emoji: '💪',
    tagline: 'Month pass renewal + whey isolate scoop',
  },
  {
    id: 'ai-tools',
    title: 'Dev Pro Subscriptions',
    amount: 1500,
    category: 'Subscriptions',
    emoji: '⚡',
    tagline: 'Copilot + Cursor pro monthly bundle',
  },
];
