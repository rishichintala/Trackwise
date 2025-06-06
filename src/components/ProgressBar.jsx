export default function ProgressBar({ value, max }) {
    const pct = Math.min(value / max, 1) * 100;
    return (
      <div className="h-2 w-full bg-slate-200 rounded">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded transition-base ${value > max ? 'bg-red-500' : 'bg-brand'}`}
        />
      </div>
    );
  }
  