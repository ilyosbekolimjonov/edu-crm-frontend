export default function EmptyState({ title, description, className = "" }) {
    return (
        <div className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center ${className}`}>
            <p className="text-base font-bold text-slate-800">{title}</p>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
    );
}
