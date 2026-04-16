import { useMemo, useState } from "react";
import { Box, Button, Chip, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../services/axios";

const isVideoFile = (value = "") => /\.(mp4|webm|ogg|mov|m4v)$/i.test(value) || /youtube\.com|youtu\.be/i.test(value);
const isDirectVideo = (value = "") => /\.(mp4|webm|ogg|mov|m4v)$/i.test(value);
const toPublicUrl = (value = "") => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${api.defaults.baseURL}${value}`;
};

export default function StudentLessonDetail({ lesson, onBack, onSubmitHomework, submitting }) {
    const [activeVideo, setActiveVideo] = useState("");
    const [submissionText, setSubmissionText] = useState("");
    const [submissionFile, setSubmissionFile] = useState(null);

    const videos = useMemo(() => {
        const items = [];
        if (lesson?.video && lesson.video !== "-" && isVideoFile(lesson.video)) {
            items.push({ id: "main", label: "Asosiy video", file: lesson.video });
        }
        (lesson?.files || []).forEach((file) => {
            if (isVideoFile(file.file)) {
                items.push({ id: file.id, label: file.note || `Video ${items.length + 1}`, file: file.file });
            }
        });
        return items;
    }, [lesson]);

    const activeVideoItem = videos.find((item) => item.file === activeVideo) || videos[0];
    const homework = lesson?.homework || null;
    const ownSubmission = homework?.submissions?.[0] || null;
    const nonVideoFiles = (lesson?.files || []).filter((file) => !isVideoFile(file.file));

    const handleSubmit = async () => {
        const text = submissionText.trim();
        if (!text) {
            toast.error("Javob matni majburiy");
            return;
        }
        const payload = new FormData();
        payload.append("text", text);
        if (submissionFile) payload.append("file", submissionFile);
        await onSubmitHomework(homework.id, payload);
        setSubmissionText("");
        setSubmissionFile(null);
    };

    const handleSubmissionFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 1) {
            toast.error("Faqat bitta fayl tanlash mumkin");
            event.target.value = "";
            return;
        }
        setSubmissionFile(files[0] || null);
    };

    if (!lesson) {
        return (
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ color: "#667085" }}>Dars topilmadi.</Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Button onClick={onBack} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
                Ortga
            </Button>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800 }}>{lesson.name}</Typography>
                <Typography sx={{ color: "#667085", mb: 1 }}>
                    {lesson.group?.name || "Guruh"} | {new Date(lesson.createdAt).toLocaleDateString()}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{lesson.about || "Tavsif yo'q"}</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 1 }}>Video va fayllar</Typography>
                {activeVideoItem && isDirectVideo(activeVideoItem.file) ? (
                    <video
                        controls
                        src={toPublicUrl(activeVideoItem.file)}
                        style={{ width: "100%", maxHeight: 420, borderRadius: 8, background: "#111" }}
                    />
                ) : activeVideoItem ? (
                    <Link href={toPublicUrl(activeVideoItem.file)} target="_blank" rel="noreferrer">
                        Videoni ochish
                    </Link>
                ) : (
                    <Typography sx={{ color: "#667085" }}>Video biriktirilmagan.</Typography>
                )}

                {videos.length > 1 ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                        {videos.map((item) => (
                            <Chip
                                key={item.id}
                                clickable
                                label={item.label}
                                color={(activeVideoItem?.file || videos[0]?.file) === item.file ? "success" : "default"}
                                onClick={() => setActiveVideo(item.file)}
                            />
                        ))}
                    </Stack>
                ) : null}

                {nonVideoFiles.length ? (
                    <Box sx={{ mt: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Fayllar</Typography>
                        <Stack spacing={0.5}>
                            {nonVideoFiles.map((file) => (
                                <Link key={file.id} href={toPublicUrl(file.file)} target="_blank" rel="noreferrer">
                                    {file.note || file.file}
                                </Link>
                            ))}
                        </Stack>
                    </Box>
                ) : null}
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 1 }}>Topshiriq</Typography>
                {homework ? (
                    <Stack spacing={1}>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>{homework.task}</Typography>
                        {homework.file ? (
                            <Link href={toPublicUrl(homework.file)} target="_blank" rel="noreferrer">
                                Topshiriq fayli
                            </Link>
                        ) : null}
                    </Stack>
                ) : (
                    <Typography sx={{ color: "#667085" }}>Bu dars uchun homework yo'q.</Typography>
                )}
            </Paper>

            {homework ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 1 }}>Mening javobim</Typography>
                    {ownSubmission ? (
                        <Stack spacing={0.75}>
                            <Chip
                                size="small"
                                sx={{ alignSelf: "flex-start" }}
                                color={ownSubmission.status === "ACCEPTED" ? "success" : ownSubmission.status === "REJECTED" ? "error" : "warning"}
                                label={ownSubmission.status === "ACCEPTED" ? "Qabul qilindi" : ownSubmission.status === "REJECTED" ? "Rad etildi" : "Tekshirilmoqda"}
                            />
                            <Typography sx={{ whiteSpace: "pre-wrap" }}>{ownSubmission.text}</Typography>
                            <Typography sx={{ color: "#667085", fontSize: 14 }}>Yuborilgan: {new Date(ownSubmission.createdAt).toLocaleString()}</Typography>
                            {ownSubmission.file ? (
                                <Link href={toPublicUrl(ownSubmission.file)} target="_blank" rel="noreferrer">
                                    Yuborilgan fayl
                                </Link>
                            ) : (
                                <Typography sx={{ color: "#667085", fontSize: 14 }}>Fayl biriktirilmagan</Typography>
                            )}
                        </Stack>
                    ) : (
                        <Stack spacing={1}>
                            <TextField
                                label="Javob matni"
                                value={submissionText}
                                onChange={(event) => setSubmissionText(event.target.value)}
                                multiline
                                minRows={3}
                                fullWidth
                            />
                            <Box
                                component="label"
                                sx={{
                                    border: "1px dashed #b9bec8",
                                    borderRadius: 1,
                                    p: 1.5,
                                    cursor: "pointer",
                                    bgcolor: "#fafbfc",
                                    maxWidth: 360,
                                }}
                            >
                                <input type="file" hidden multiple={false} onChange={handleSubmissionFileChange} />
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <UploadFileOutlined sx={{ color: "#667085" }} />
                                    <Box>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Fayl biriktirish (ixtiyoriy)</Typography>
                                        <Typography sx={{ fontSize: 12, color: "#667085" }}>
                                            {submissionFile ? submissionFile.name : "Fayl tanlanmagan"}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={submitting}
                                sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 1, bgcolor: "#147d64" }}
                            >
                                {submitting ? "Yuborilmoqda..." : "Yuborish"}
                            </Button>
                        </Stack>
                    )}
                </Paper>
            ) : null}

            {ownSubmission ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 1 }}>Natija</Typography>
                    <Typography sx={{ color: "#344054" }}>
                        Status: {ownSubmission.status === "ACCEPTED" ? "Qabul qilindi" : ownSubmission.status === "REJECTED" ? "Rad etildi" : "Tekshirilmoqda"}
                    </Typography>
                    <Typography sx={{ color: "#667085" }}>
                        Ball: {ownSubmission.score ?? "-"}
                    </Typography>
                    <Typography sx={{ color: "#667085" }}>
                        Tekshirilgan vaqt: {ownSubmission.updatedAt ? new Date(ownSubmission.updatedAt).toLocaleString() : "-"}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
                        Izoh: {ownSubmission.comment || ownSubmission.reason || "Hali izoh yo'q"}
                    </Typography>
                </Paper>
            ) : null}
        </Stack>
    );
}
