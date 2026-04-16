export default function SectionCard({ children, className = "" }) {
    return (
        <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
            {children}
        </section>
    );
}
