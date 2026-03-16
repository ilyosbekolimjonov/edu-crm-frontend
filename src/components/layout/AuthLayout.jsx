export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f7f7f4]">
            <div className="hidden lg:flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#f6f1e8] via-[#eee7db] to-[#e9dfd2]">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-20 h-56 w-56 rounded-full bg-[#d2b48c] blur-3xl" />
                    <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-[#b8c99d] blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c7b6e5] blur-3xl" />
                </div>

                <div className="relative z-10 max-w-[520px] px-10 text-center">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/70 shadow-lg backdrop-blur">
                        <span className="text-3xl font-bold text-[#9c6b3f]">E</span>
                    </div>

                    <h1 className="text-4xl font-bold text-[#2f2a24] leading-tight">
                        EduCore Admin Panel
                    </h1>

                    <p className="mt-4 text-lg text-[#5f584f] leading-8">
                        Kurslar, foydalanuvchilar va boshqaruv jarayonlarini bitta joydan
                        nazorat qiling.
                    </p>

                    <div className="mt-10 rounded-[32px] border border-white/50 bg-white/50 p-6 shadow-2xl backdrop-blur">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="rounded-2xl bg-[#fff8ef] p-4">
                                <p className="text-sm text-[#8b6b48]">Xavfsiz kirish</p>
                                <p className="mt-2 text-xl font-semibold text-[#2f2a24]">
                                    JWT Auth
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#f3f9ed] p-4">
                                <p className="text-sm text-[#69814f]">Boshqaruv</p>
                                <p className="mt-2 text-xl font-semibold text-[#2f2a24]">
                                    Admin Tools
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#f5f0ff] p-4">
                                <p className="text-sm text-[#7d63a8]">Kelajak uchun</p>
                                <p className="mt-2 text-xl font-semibold text-[#2f2a24]">
                                    Multi Role
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#eef8fb] p-4">
                                <p className="text-sm text-[#4c7383]">Tayyor</p>
                                <p className="mt-2 text-xl font-semibold text-[#2f2a24]">
                                    Scalable UI
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center px-6 py-10 sm:px-10 bg-[#fcfcfb]">
                {children}
            </div>
        </div>
    );
}