const getInitials = (value) => {
    const name = String(value || "").trim();
    if (!name) return "T";
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0][0]?.toUpperCase() || "T";
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
};

export default function TeacherProfileCard({ profile, avatarSrc }) {
    return (
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-950">Profil</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Shaxsiy ma'lumotlar va parol sozlamalari.
                </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt="Teacher avatar"
                        className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-cover"
                    />
                ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-700">
                        {getInitials(profile?.user?.fullName)}
                    </div>
                )}
                <div>
                    <p className="font-bold text-slate-950">{profile?.user?.fullName || "-"}</p>
                    <p className="text-sm text-slate-500">{profile?.user?.email || "-"}</p>
                </div>
            </div>
        </div>
    );
}
