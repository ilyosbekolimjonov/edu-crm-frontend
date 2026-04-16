const uniqueStudentCount = (groups = []) => {
    const ids = new Set();
    groups.forEach((group) => {
        (group.studentGroups || []).forEach((item) => {
            if (item.user?.id) ids.add(item.user.id);
        });
    });
    return ids.size;
};

export default function TeacherOverviewSection({ profile, groups = [], submissions = [], loading }) {
    const activeGroups = groups.filter((group) => group.status === "ACTIVE").length;
    const pendingSubmissions = submissions.filter((submission) => submission.status === "PENDING").length;
    const reviewedSubmissions = submissions.filter((submission) => submission.status !== "PENDING").length;

    const stats = [
        { label: "Guruhlar", value: groups.length },
        { label: "Faol guruhlar", value: activeGroups },
        { label: "O'quvchilar", value: uniqueStudentCount(groups) },
        { label: "Kutilayotgan vazifalar", value: pendingSubmissions },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-md border border-slate-200 bg-white" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <SectionCard>
                <PageHeader
                    eyebrow="Teacher panel"
                    title={`Xush kelibsiz, ${profile?.user?.fullName || "ustoz"}`}
                    description="Bugungi ishlar: guruhlaringizni kuzating, dars e'lon qiling, video yoki fayl biriktiring va topshirilgan vazifalarni tekshiring."
                />
            </SectionCard>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard>
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-950">Mening guruhlarim</h3>
                        <span className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
                            {groups.length} ta
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {groups.slice(0, 5).map((group) => (
                            <div
                                key={group.id}
                                className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center"
                            >
                                <div>
                                    <p className="font-bold text-slate-950">{group.name}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {group.course?.name || "Kurs biriktirilmagan"} - {group.startTime || "-"}
                                    </p>
                                </div>
                                <StatusBadge status={group.status === "ACTIVE" ? "ACCEPTED" : "INACTIVE"}>{group.status}</StatusBadge>
                            </div>
                        ))}

                        {!groups.length ? (
                            <EmptyState
                                title="Guruh topilmadi"
                                description="Sizga biriktirilgan guruhlar shu yerda ko'rinadi."
                            />
                        ) : null}
                    </div>
                </SectionCard>

                <SectionCard>
                    <h3 className="text-lg font-bold text-slate-950">Vazifalar holati</h3>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-sm font-semibold text-yellow-800">Kutayotgan</p>
                            <p className="mt-1 text-2xl font-bold text-yellow-900">{pendingSubmissions}</p>
                        </div>
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <p className="text-sm font-semibold text-green-700">Tekshirilgan</p>
                            <p className="mt-1 text-2xl font-bold text-green-800">{reviewedSubmissions}</p>
                        </div>
                    </div>
                </SectionCard>
            </section>
        </div>
    );
}
import EmptyState from "../common/EmptyState";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";
import StatusBadge from "../common/StatusBadge";
