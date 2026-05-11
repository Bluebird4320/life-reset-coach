export type CategoryId =
  | 'side-income'
  | 'learning'
  | 'health'
  | 'lifestyle'
  | 'relationships'
  | 'other';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: 'side-income', label: '副業・収入', emoji: '💰', color: '#7B5EA7' },
  { id: 'learning', label: '学習・スキル', emoji: '📚', color: '#42A5F5' },
  { id: 'health', label: '健康・運動', emoji: '🏃', color: '#66BB6A' },
  { id: 'lifestyle', label: '生活改善', emoji: '🌱', color: '#26C6DA' },
  { id: 'relationships', label: '人間関係', emoji: '🤝', color: '#EF5350' },
  { id: 'other', label: 'その他', emoji: '⭐', color: '#8878B8' },
];
