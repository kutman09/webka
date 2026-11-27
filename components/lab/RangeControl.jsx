import styles from './Lab.module.css';

export default function RangeControl({ id, label, min, max, step = 1, value, onChange, format }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className={styles.range}>
      <label htmlFor={id} className={styles.rangeLabel}>
        <span>{label}</span>
        <output htmlFor={id}>{format ? format(value) : value}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--fill': `${percent}%` }}
      />
    </div>
  );
}
