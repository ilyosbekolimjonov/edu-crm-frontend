import useAuthStore from "../store/auth.store";

export default function AdminDashboardPage() {
    const { role, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-[#f7f7f4] p-8">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-[#2f2a24]">
                        Admin Dashboard
                    </h1>
                    <p className="mt-3 text-[#6d665d]">Siz tizimga kirdingiz.</p>
                    <p className="mt-2 text-[#9c6b3f] font-medium">Role: {role}</p>

                    <button
                        onClick={logout}
                        className="mt-6 rounded-2xl bg-[#9c6b3f] px-5 py-3 text-white transition hover:opacity-90"
                    >
                        Chiqish
                    </button>
                </div>
            </div>
        </div>
    );
}