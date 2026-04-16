import { useState } from "react";
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";

export default function StudentHomeworks({ homeworks = [], onSubmit, submittingId }) {
    const [forms, setForms] = useState({});

    const changeField = (id, field) => (event) => {
        setForms((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: event.target.value },
        }));
    };

    const changeFile = (id) => (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 1) {
            toast.error("Faqat bitta fayl tanlash mumkin");
            event.target.value = "";
            return;
        }
        setForms((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || {}), file: files[0] || null },
        }));
    };

    const handleSubmit = async (homework) => {
        const form = forms[homework.id] || {};
        const text = form.text?.trim();

        if (!text) {
            toast.error("Matn majburiy");
            return;
        }

        const payload = new FormData();
        payload.append("text", text);
        if (form.file) payload.append("file", form.file);
        await onSubmit(homework.id, payload);
        setForms((prev) => ({ ...prev, [homework.id]: { text: "", file: null } }));
    };

    if (!homeworks.length) {
        return (
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ color: "#667085" }}>Hozircha topshiriq yo'q.</Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Homeworks</Typography>
            {homeworks.map((homework) => (
                <Paper key={homework.id} elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                    <Stack spacing={1.5}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                            <Box>
                                <Typography sx={{ fontWeight: 700 }}>{homework.lesson?.name || "Dars"}</Typography>
                                <Typography sx={{ color: "#667085", fontSize: 14 }}>
                                    {homework.lesson?.group?.course?.name || "Kurs"} | {homework.lesson?.group?.name || "Guruh"}
                                </Typography>
                            </Box>
                            <Chip
                                size="small"
                                color={homework.submitted ? "success" : "warning"}
                                label={homework.submissionStatus || "Yuborilmagan"}
                                sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
                            />
                        </Stack>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>{homework.task}</Typography>
                        {homework.file ? <Typography sx={{ color: "#147d64", fontSize: 14 }}>Fayl: {homework.file}</Typography> : null}

                        {homework.submitted ? (
                            <Box sx={{ bgcolor: "#f4f7f6", p: 1.5, borderRadius: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Yuborilgan javob</Typography>
                                <Typography sx={{ color: "#344054", whiteSpace: "pre-wrap" }}>{homework.submission?.text}</Typography>
                                <Typography sx={{ color: "#667085", fontSize: 13 }}>Fayl: {homework.submission?.file}</Typography>
                                <Typography sx={{ color: "#667085", fontSize: 13 }}>Ball: {homework.submission?.score ?? "-"}</Typography>
                                {homework.submission?.comment || homework.submission?.reason ? (
                                    <Typography sx={{ color: "#b42318", fontSize: 13 }}>Izoh: {homework.submission.comment || homework.submission.reason}</Typography>
                                ) : null}
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                <TextField
                                    label="Javob matni"
                                    value={forms[homework.id]?.text || ""}
                                    onChange={changeField(homework.id, "text")}
                                    multiline
                                    minRows={3}
                                    required
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
                                    <input type="file" hidden multiple={false} onChange={changeFile(homework.id)} />
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <UploadFileOutlined sx={{ color: "#667085" }} />
                                        <Box>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Fayl biriktirish (ixtiyoriy)</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#667085" }}>
                                                {forms[homework.id]?.file?.name || "Fayl tanlanmagan"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={() => handleSubmit(homework)}
                                    disabled={submittingId === homework.id}
                                    sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 1, bgcolor: "#147d64" }}
                                >
                                    {submittingId === homework.id ? "Yuborilmoqda..." : "Yuborish"}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}
