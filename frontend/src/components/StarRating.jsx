export default function StarRating({ value = 0, onChange, size = 'text-lg' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((s) => (
        <span
          key={s}
          onClick={() => onChange && onChange(s)}
          className={`${onChange ? 'cursor-pointer' : ''} ${s <= Math.round(value) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
