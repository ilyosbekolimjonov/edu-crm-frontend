export default function TeacherPasswordForm({
    enabled,
    onToggle,
    currentPassword,
    password,
    confirmPassword,
    onChange,
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="font-bold text-slate-950">Parolni o'zgartirish</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Joriy parolni kiritib, yangi parolni tasdiqlang.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                    {enabled ? "Bekor qilish" : "Parolni o'zgartirish"}
                </button>
            </div>

            {enabled ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={onChange("currentPassword")}
                        placeholder="Joriy parol"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={onChange("password")}
                        placeholder="Yangi parol"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={onChange("confirmPassword")}
                        placeholder="Yangi parolni tasdiqlang"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
            ) : null}
        </section>
    );
}
