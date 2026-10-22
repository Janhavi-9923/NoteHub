const ICONS = {
  KNOWLEDGE_SHARER: '📘',
  CONSISTENT_CONTRIBUTOR: '🔥',
  QUALITY_CONTRIBUTOR: '⭐',
  HELPFUL_SCHOLAR: '🤝',
  TOP_CONTRIBUTOR: '🏆',
};

export default function BadgeChip({ badge }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      <span>{ICONS[badge.key] || '🎖️'}</span>
      {badge.name}
    </span>
  );
}
