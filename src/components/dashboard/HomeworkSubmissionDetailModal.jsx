import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@mui/material";
import api from "../../services/axios";
import StatusBadge from "./StatusBadge";

const toPublicUrl = (filePath) => {
    if (!filePath) return "";
    if (/^https?:\/\//i.test(filePath)) return filePath;
    return `${api.defaults.baseURL}${filePath}`;
};

const isImageFile = (filePath) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filePath || "");
const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

export default function HomeworkSubmissionDetailModal({
    open,
    onClose,
    submission,
    homework,
    lesson,
    onReview,
    saving,
}) {
    const [score, setScore] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const fileUrl = useMemo(
        () => toPublicUrl(submission?.fileUrl || submission?.file),
        [submission],
    );

    useEffect(() => {
        setScore(submission?.score ?? "");
        setComment(submission?.comment || "");
        setError("");
    }, [submission]);

    const studentName =
        submission?.studentFullName ||
        submission?.student?.fullName ||
        submission?.user?.fullName ||
        "O'quvchi";
    const content = submission?.content || submission?.text || "";
    const status = submission?.status || "PENDING";

    const submitReview = () => {
        const numericScore = Number(score);
        if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 100) {
            setError("Ball 0 dan 100 gacha butun son bo'lishi kerak");
            return;
        }

        setError("");
        onReview({
            score: numericScore,
            comment: comment.trim(),
        });
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="lg" fullWidth>
            <div className="bg-white">
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-700">Vazifani tekshirish</p>
                            <h2 className="mt-1 text-2xl font-bold text-slate-950">{studentName}</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {lesson?.title || lesson?.name || "-"} - {homework?.title || homework?.task || "-"}
                            </p>
                        </div>
                        <StatusBadge status={status} />
                    </div>
                </div>

                <div className="grid max-h-[72vh] gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    <div className="space-y-4">
                        <section className="rounded-md border border-slate-200 bg-white p-4">
                            <div className="mb-3 grid gap-2 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        O'quvchi
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{studentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Yuborilgan vaqt
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(submission?.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-md border border-slate-200 bg-white p-4">
                            <h3 className="text-base font-bold text-slate-950">Javob matni</h3>
                            <div className="mt-3 min-h-32 rounded-md border border-slate-100 bg-slate-50 p-4">
                                {content ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{content}</p>
                                ) : (
                                    <p className="text-sm text-slate-500">Matn yuborilmagan.</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-md border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-base font-bold text-slate-950">Biriktirilgan fayl</h3>
                                {fileUrl ? (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        Faylni ochish
                                    </a>
                                ) : null}
                            </div>

                            {fileUrl ? (
                                <div className="mt-4">
                                    {isImageFile(fileUrl) ? (
                                        <img
                                            src={fileUrl}
                                            alt="Topshirilgan fayl"
                                            className="max-h-96 w-full rounded-md border border-slate-200 object-contain"
                                        />
                                    ) : (
                                        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
                                            <p className="text-sm font-semibold text-slate-800">
                                                Fayl preview mavjud emas.
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Faylni yangi oynada ochib yoki yuklab ko'ring.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-slate-500">Fayl biriktirilmagan.</p>
                            )}
                        </section>
                    </div>

                    <aside className="rounded-md border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-base font-bold text-slate-950">Baholash paneli</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Ball 60 dan past bo'lsa rad etiladi, 60 yoki undan yuqori bo'lsa qabul qilinadi.
                        </p>

                        <label className="mt-5 block text-sm font-semibold text-slate-700">
                            Ball (0-100)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(event) => setScore(event.target.value)}
                                disabled={saving}
                                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />
                        </label>

                        <label className="mt-4 block text-sm font-semibold text-slate-700">
                            Izoh
                            <textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                disabled={saving}
                                rows={7}
                                className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />
                        </label>

                        {submission?.score !== null && submission?.score !== undefined ? (
                            <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Avvalgi baho
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {submission.score} ball
                                </p>
                            </div>
                        ) : null}

                        {error ? (
                            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {error}
                            </div>
                        ) : null}
                    </aside>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Bekor qilish
                    </button>
                    <button
                        type="button"
                        onClick={submitReview}
                        disabled={saving}
                        className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
