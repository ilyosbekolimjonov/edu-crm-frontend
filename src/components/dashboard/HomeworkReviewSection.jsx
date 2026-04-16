import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/axios";
import HomeworkSubmissionListModal from "./HomeworkSubmissionListModal";
import { HOMEWORK_STATUS_TABS } from "./StatusBadge";

const EMPTY_COUNTS = {
    PENDING: 0,
    REJECTED: 0,
    ACCEPTED: 0,
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");

const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message || error?.message || fallback;
    return Array.isArray(message) ? message[0] : message;
};

const getCounts = (submissions = []) =>
    HOMEWORK_STATUS_TABS.reduce(
        (acc, tab) => ({
            ...acc,
            [tab.value]: submissions.filter((submission) => submission.status === tab.value).length,
        }),
        { ...EMPTY_COUNTS },
    );

const normalizeReviewData = (payload, row) => {
    if (Array.isArray(payload)) {
        return {
            homework: row.homework,
            lesson: row.lesson,
            submissions: payload,
        };
    }

    return {
        homework: payload?.homework || row.homework,
        lesson: payload?.lesson || row.lesson,
        submissions: Array.isArray(payload?.submissions) ? payload.submissions : [],
    };
};

export default function HomeworkReviewSection({ lessons = [], loading, onReviewSaved }) {
    const [summaries, setSummaries] = useState({});
    const [sectionLoading, setSectionLoading] = useState(false);
    const [sectionError, setSectionError] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedReviewData, setSelectedReviewData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    const homeworkRows = useMemo(
        () =>
            lessons
                .filter((lesson) => lesson?.homework?.id)
                .map((lesson) => ({
                    id: lesson.homework.id,
                    lesson: {
                        id: lesson.id,
                        title: lesson.name,
                        name: lesson.name,
                    },
                    homework: {
                        id: lesson.homework.id,
                        title: lesson.homework.task || "Uyga vazifa",
                        task: lesson.homework.task || "Uyga vazifa",
                        file: lesson.homework.file,
                        fileUrl: lesson.homework.file,
                        createdAt: lesson.homework.createdAt || lesson.createdAt,
                    },
                })),
        [lessons],
    );

    const homeworkKey = homeworkRows.map((row) => row.id).join(",");

    const fetchReviewData = async (row) => {
        const { data } = await api.get(`/homeworks/${row.id}/submissions`);
        return normalizeReviewData(data, row);
    };

    useEffect(() => {
        let active = true;

        const loadSummaries = async () => {
            if (!homeworkRows.length) {
                setSummaries({});
                setSectionError("");
                return;
            }

            setSectionLoading(true);
            setSectionError("");
            const results = await Promise.allSettled(
                homeworkRows.map(async (row) => {
                    const reviewData = await fetchReviewData(row);
                    return [row.id, reviewData];
                }),
            );

            if (!active) return;

            const nextSummaries = {};
            const failed = [];
            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    const [homeworkId, reviewData] = result.value;
                    nextSummaries[homeworkId] = reviewData;
                } else {
                    failed.push(homeworkRows[index]?.homework?.title || "Vazifa");
                }
            });

            setSummaries(nextSummaries);
            setSectionError(
                failed.length
                    ? "Ba'zi vazifalar bo'yicha topshirilmalar yuklanmadi. Sahifani yangilamasdan qayta urinib ko'ring."
                    : "",
            );
            setSectionLoading(false);
        };

        loadSummaries();

        return () => {
            active = false;
        };
    }, [homeworkKey]);

    const openReview = async (row) => {
        setSelectedRow(row);
        setSelectedReviewData(summaries[row.id] || normalizeReviewData(null, row));
        setModalOpen(true);
        setModalLoading(true);
        setModalError("");

        try {
            const reviewData = await fetchReviewData(row);
            setSelectedReviewData(reviewData);
            setSummaries((prev) => ({ ...prev, [row.id]: reviewData }));
        } catch (error) {
            setModalError(getErrorMessage(error, "Topshirilgan vazifalar yuklanmadi"));
        } finally {
            setModalLoading(false);
        }
    };

    const handleReviewSubmission = async (submissionId, payload) => {
        if (!selectedRow) return;

        await api.patch(`/submissions/${submissionId}/review`, payload);
        toast.success(payload.status === "ACCEPTED" ? "Vazifa qabul qilindi" : "Vazifa qaytarildi");

        const reviewData = await fetchReviewData(selectedRow);
        setSelectedReviewData(reviewData);
        setSummaries((prev) => ({ ...prev, [selectedRow.id]: reviewData }));
        if (onReviewSaved) {
            await onReviewSaved();
        }
    };

    if (loading) {
        return (
            <div className="rounded-md border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500">
                Darslar yuklanmoqda...
            </div>
        );
    }

    if (!homeworkRows.length) {
        return (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-base font-bold text-slate-800">Tekshiriladigan vazifa yo'q</p>
                <p className="mt-1 text-sm text-slate-500">
                    Avval darsga uyga vazifa biriktiring, keyin bu yerda topshirilmalar ko'rinadi.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Vazifani tekshirish</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Guruhdagi barcha uyga vazifalar va topshirilgan javoblar holati.
                        </p>
                    </div>
                    <div className="text-sm font-semibold text-slate-600">
                        {homeworkRows.length} ta vazifa
                    </div>
                </div>
            </div>

            {sectionError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {sectionError}
                </div>
            ) : null}

            <div className="space-y-2.5">
                {homeworkRows.map((row) => {
                    const reviewData = summaries[row.id];
                    const counts = reviewData ? getCounts(reviewData.submissions) : EMPTY_COUNTS;
                    const isLoadingCounts = sectionLoading && !reviewData;

                    return (
                        <article
                            key={row.id}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-emerald-200"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        {row.lesson.title}
                                    </p>
                                    <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-900">
                                        {row.homework.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Yaratilgan sana: {formatDate(row.homework.createdAt)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {HOMEWORK_STATUS_TABS.map((tab) => (
                                        <div
                                            key={tab.value}
                                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
                                        >
                                            <span className="text-[11px] font-semibold text-slate-500">{tab.label}</span>
                                            <span className="text-xs font-bold text-slate-900">
                                                {isLoadingCounts ? "..." : counts[tab.value] || 0}
                                            </span>
                                        </div>
                                    ))}

                                <button
                                    type="button"
                                    onClick={() => openReview(row)}
                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Tekshirish
                                </button>
                            </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <HomeworkSubmissionListModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedRow(null);
                    setSelectedReviewData(null);
                    setModalError("");
                }}
                reviewData={selectedReviewData}
                loading={modalLoading}
                error={modalError}
                onReviewSubmission={handleReviewSubmission}
            />
        </div>
    );
}
