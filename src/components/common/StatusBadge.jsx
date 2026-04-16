export const HOMEWORK_STATUS_TABS = [
    { value: "PENDING", label: "Kutayotgan" },
    { value: "REJECTED", label: "Qaytarilgan" },
    { value: "ACCEPTED", label: "Qabul qilingan" },
];

export const HOMEWORK_STATUS_META = {
    PENDING: {
        label: "Kutayotgan",
        className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    },
    REJECTED: {
        label: "Qaytarilgan",
        className: "border-red-200 bg-red-50 text-red-700",
    },
    ACCEPTED: {
        label: "Qabul qilingan",
        className: "border-green-200 bg-green-50 text-green-700",
    },
    INACTIVE: {
        label: "Nofaol",
        className: "border-slate-200 bg-slate-100 text-slate-600",
    },
};

export const getHomeworkStatusMeta = (status) =>
    HOMEWORK_STATUS_META[status] || HOMEWORK_STATUS_META.PENDING;

export default function StatusBadge({ status, children, className = "" }) {
    const meta = getHomeworkStatusMeta(status);

    return (
        <span
            className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-semibold ${meta.className} ${className}`}
        >
            {children || meta.label}
        </span>
    );
}
