import EmptyState from "../common/EmptyState";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";

const moneyFormatter = new Intl.NumberFormat("uz-UZ");

const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
    return null;
};

const pickField = (row, fields) => {
    for (const field of fields) {
        const value = row?.[field];
        if (value !== null && value !== undefined && value !== "") return value;
    }
    return null;
};

const normalizeRow = (row, index) => {
    const amount = toNumber(pickField(row, ["amount", "salary", "total", "totalAmount", "paidAmount"]));
    const title = pickField(row, ["title", "name", "period", "month", "label"]) || `Hisobot #${index + 1}`;
    const status = pickField(row, ["status", "state"]);
    const note = pickField(row, ["comment", "note", "description"]);
    const date = pickField(row, ["paidAt", "paymentDate", "date", "createdAt", "updatedAt"]);

    return {
        id: row?.id || `${title}-${index}`,
        title,
        amount,
        status,
        note,
        date,
    };
};

const formatDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString();
};

export default function TeacherFinanceSection({ rows = [], loading, hasRealData }) {
    const normalizedRows = rows.map((row, index) => normalizeRow(row, index));

    return (
        <div className="space-y-5">
            <SectionCard>
                <PageHeader
                    eyebrow="Moliya"
                    title="Maosh va to'lovlar"
                    description="Teacher paneldagi moliyaviy ma'lumotlar shu bo'limda ko'rsatiladi."
                />
            </SectionCard>

            <SectionCard>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                        ))}
                    </div>
                ) : hasRealData ? (
                    <div className="space-y-3">
                        {normalizedRows.map((row) => (
                            <article
                                key={row.id}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900">{row.title}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            {row.status ? (
                                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                    {row.status}
                                                </span>
                                            ) : null}
                                            {formatDate(row.date) ? (
                                                <span className="text-xs text-slate-500">{formatDate(row.date)}</span>
                                            ) : null}
                                        </div>
                                        {row.note ? (
                                            <p className="mt-2 text-sm text-slate-600">{row.note}</p>
                                        ) : null}
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                                        <p className="text-xs font-medium text-slate-500">Miqdor</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {row.amount !== null ? `${moneyFormatter.format(row.amount)} so'm` : "-"}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Moliya ma'lumotlari hali tayyor emas"
                        description="Bu bo'limga maosh va to'lovlar ma'lumoti keyinchalik qo'shiladi."
                        className="py-14"
                    />
                )}
            </SectionCard>
        </div>
    );
}
