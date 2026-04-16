import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";

export default function StudentLessons({ lessons = [], selectedLesson, loadingLesson, onOpenLesson, onCloseLesson }) {
    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Lessons</Typography>

            {!lessons.length ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                    <Typography sx={{ color: "#667085" }}>Hozircha darslar topilmadi.</Typography>
                </Paper>
            ) : (
                lessons.map((lesson) => (
                    <Paper key={lesson.id} elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                            <Box>
                                <Typography sx={{ fontWeight: 700 }}>{lesson.name}</Typography>
                                <Typography sx={{ color: "#667085", fontSize: 14 }}>
                                    {lesson.group?.course?.name || "Kurs"} | {lesson.group?.name || "Guruh"}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip size="small" color={lesson.viewed ? "success" : "default"} label={lesson.viewed ? "Ko'rilgan" : "Yangi"} />
                                    {lesson.hasHomework ? <Chip size="small" label="Homework bor" /> : null}
                                </Stack>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => onOpenLesson(lesson.id)}
                                disabled={loadingLesson}
                                sx={{ alignSelf: { xs: "flex-start", md: "center" }, textTransform: "none", borderRadius: 1 }}
                            >
                                Ochish
                            </Button>
                        </Stack>
                    </Paper>
                ))
            )}

            {selectedLesson ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #b7d6cb", borderRadius: 1, bgcolor: "#fbfffd" }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{selectedLesson.name}</Typography>
                            <Typography sx={{ color: "#667085" }}>
                                {selectedLesson.group?.course?.name || "Kurs"} | {selectedLesson.group?.mentor?.fullName || "Mentor"}
                            </Typography>
                        </Box>
                        <Button onClick={onCloseLesson} sx={{ textTransform: "none" }}>
                            Yopish
                        </Button>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography sx={{ whiteSpace: "pre-wrap", mb: 1.5 }}>{selectedLesson.about || "Tavsif yo'q"}</Typography>
                    <Typography sx={{ color: "#344054", mb: 1 }}>Video: {selectedLesson.video || "-"}</Typography>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Fayllar</Typography>
                    {selectedLesson.files?.length ? (
                        <Stack spacing={0.5}>
                            {selectedLesson.files.map((file) => (
                                <Typography key={file.id} sx={{ color: "#147d64", fontSize: 14 }}>
                                    {file.file} {file.note ? `- ${file.note}` : ""}
                                </Typography>
                            ))}
                        </Stack>
                    ) : (
                        <Typography sx={{ color: "#667085", fontSize: 14 }}>Fayl yo'q.</Typography>
                    )}
                    {selectedLesson.homework ? (
                        <Box sx={{ mt: 1.5 }}>
                            <Typography sx={{ fontWeight: 700 }}>Homework</Typography>
                            <Typography sx={{ color: "#344054" }}>{selectedLesson.homework.task}</Typography>
                        </Box>
                    ) : null}
                </Paper>
            ) : null}
        </Stack>
    );
}
