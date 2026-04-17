import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@mui/material";
import HomeworkSubmissionDetailModal from "./HomeworkSubmissionDetailModal";
import StatusBadge, { HOMEWORK_STATUS_TABS } from "./StatusBadge";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

const getSubmissionPreview = (submission) => {
    const text = submission?.content || submission?.text || "";
    if (!text.trim()) return "Matn yuborilmagan";
    return text.trim().length > 110 ? `${text.trim().slice(0, 110)}...` : text.trim();
};

const getStudentName = (submission) =>
    submission?.studentFullName ||
    submission?.student?.fullName ||
    submission?.user?.fullName ||
    "O'quvchi";

const getCounts = (submissions) =>
    HOMEWORK_STATUS_TABS.reduce((acc, tab) => {
        acc[tab.value] = submissions.filter((submission) => submission.status === tab.value).length;
        return acc;
    }, {});

export default function HomeworkSubmissionListModal({
    open,
    onClose,
    reviewData,
    loading,
    error,
    onReviewSubmission,
}) {
    const [activeTab, setActiveTab] = useState("PENDING");
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState("");

    const submissions = useMemo(
        () => (Array.isArray(reviewData?.submissions) ? reviewData.submissions : []),
        [reviewData],
    );
    const counts = useMemo(() => getCounts(submissions), [submissions]);
    const filteredSubmissions = useMemo(
        () => submissions.filter((submission) => submission.status === activeTab),
        [activeTab, submissions],
    );

    useEffect(() => {
        if (open) {
            setActiveTab("PENDING");
            setSelectedSubmission(null);
            setActionError("");
        }
    }, [open, reviewData?.homework?.id]);

    const handleReview = async (payload) => {
        if (!selectedSubmission) return;
        setSaving(true);
        setActionError("");
        try {
            const reviewed = await onReviewSubmission(selectedSubmission.id, payload);
            setActiveTab(reviewed?.status || (payload.score < 60 ? "REJECTED" : "ACCEPTED"));
            setSelectedSubmission(null);
        } catch (reviewError) {
            const message =
                reviewError?.response?.data?.message ||
                reviewError?.message ||
                "Vazifani tekshirishda xatolik";
            setActionError(Array.isArray(message) ? message[0] : message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="lg" fullWidth>
                <div className="bg-white">
                    <div className="border-b border-slate-200 px-6 py-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">Vazifani tekshirish</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Dars:{" "}
                                    <span className="font-semibold text-slate-700">
                                        {reviewData?.lesson?.title || reviewData?.lesson?.name || "-"}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Vazifa:{" "}
                                    <span className="font-semibold text-slate-700">
                                        {reviewData?.homework?.title || reviewData?.homework?.task || "-"}
                                    </span>
                                </p>
                            </div>
                            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                                Jami: {submissions.length}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-5">
                        <div className="flex flex-wrap gap-2">
                            {HOMEWORK_STATUS_TABS.map((tab) => {
                                const active = activeTab === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                                            active
                                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {tab.label} ({counts[tab.value] || 0})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="max-h-[62vh] overflow-y-auto px-6 py-5">
                        {error || actionError ? (
                            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {error || actionError}
                            </div>
                        ) : null}

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-24 animate-pulse rounded-md border border-slate-200 bg-slate-50"
                                    />
                                ))}
                            </div>
                        ) : filteredSubmissions.length ? (
                            <div className="space-y-3">
                                {filteredSubmissions.map((submission) => (
                                    <article
                                        key={submission.id}
                                        className="rounded-md border border-slate-200 bg-white p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                                    >
                                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSubmission(submission)}
                                                className="min-w-0 text-left"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-bold text-slate-950">
                                                        {getStudentName(submission)}
                                                    </h3>
                                                    <StatusBadge status={submission.status} />
                                                </div>
                                                <p className="mt-1 text-xs font-medium text-slate-500">
                                                    Yuborilgan: {formatDate(submission.createdAt)}
                                                </p>
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                                    {getSubmissionPreview(submission)}
                                                </p>
                                            </button>

                                            <div className="flex items-center justify-between gap-3 lg:justify-end">
                                                <div className="text-sm text-slate-500">
                                                    {submission.score !== null && submission.score !== undefined
                                                        ? `${submission.score} ball`
                                                        : "Baholanmagan"}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSubmission(submission)}
                                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                                >
                                                    Ko'rish
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                <p className="text-base font-bold text-slate-800">Topshirilgan vazifa yo'q</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Bu status bo'yicha hali hech qanday javob kelmagan.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            </Dialog>

            <HomeworkSubmissionDetailModal
                open={Boolean(selectedSubmission)}
                onClose={() => (!saving ? setSelectedSubmission(null) : null)}
                submission={selectedSubmission}
                homework={reviewData?.homework}
                lesson={reviewData?.lesson}
                onReview={handleReview}
                saving={saving}
            />
        </>
    );
}
