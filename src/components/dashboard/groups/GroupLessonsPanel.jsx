import { ArrowBack, DeleteOutline, SmartDisplayOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import HomeworkReviewSection from "../HomeworkReviewSection";

function TabButton({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
            {children}
        </button>
    );
}

export default function GroupLessonsPanel({
    lessonTabs,
    lessonSubTab,
    setLessonSubTab,
    onCreateLesson,
    homeworkEditorLesson,
    setHomeworkEditorLesson,
    homeworkTask,
    setHomeworkTask,
    homeworkUploadFile,
    setHomeworkUploadFile,
    creatingHomework,
    handleCreateHomework,
    lessonsLoading,
    lessonsData,
    openHomeworkEditor,
    openVideoDialog,
    openVideoListDialog,
    handleDeleteLesson,
    selectedGroup,
    loadLessons,
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    {lessonTabs.map((tab) => (
                        <TabButton
                            key={tab}
                            active={lessonSubTab === tab}
                            onClick={() => setLessonSubTab(tab)}
                        >
                            {tab}
                        </TabButton>
                    ))}
                </div>
                {lessonSubTab === "Uyga vazifa" ? (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onCreateLesson}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Dars e'lon qilish
                    </Button>
                ) : null}
            </div>

            {homeworkEditorLesson ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #edf0f5", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <IconButton size="small" onClick={() => setHomeworkEditorLesson(null)}>
                            <ArrowBack fontSize="small" />
                        </IconButton>
                        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                            {homeworkEditorLesson.homework
                                ? "Uyga vazifani boshqarish"
                                : "Yangi uyga vazifa yaratish"}
                        </Typography>
                    </Stack>

                    <Stack spacing={2} sx={{ maxWidth: 680 }}>
                        <TextField label="Mavzu" value={homeworkEditorLesson.name} fullWidth disabled />
                        <TextField
                            label="Izoh"
                            value={homeworkTask}
                            onChange={(event) => setHomeworkTask(event.target.value)}
                            multiline
                            minRows={5}
                            fullWidth
                        />
                        <Stack spacing={0.75}>
                            <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                                Fayl yuklash (ixtiyoriy)
                            </Typography>
                            <Button variant="outlined" component="label" sx={{ width: "fit-content" }}>
                                Fayl tanlash
                                <input
                                    type="file"
                                    hidden
                                    onChange={(event) => setHomeworkUploadFile(event.target.files?.[0] || null)}
                                />
                            </Button>
                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                {homeworkUploadFile ? homeworkUploadFile.name : "Fayl tanlanmagan"}
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" spacing={1.25}>
                            <Button onClick={() => setHomeworkEditorLesson(null)} disabled={creatingHomework}>
                                Bekor qilish
                            </Button>
                            <Button variant="contained" onClick={handleCreateHomework} disabled={creatingHomework}>
                                {creatingHomework ? "Saqlanmoqda..." : "E'lon qilish"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            ) : lessonSubTab === "Uyga vazifa" ? (
                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", border: "1px solid #edf0f5", borderRadius: 2 }}>
                    <Table size="small" sx={{ minWidth: 940 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Mavzu</TableCell>
                                <TableCell>Fayllar</TableCell>
                                <TableCell>Uyga vazifa</TableCell>
                                <TableCell>Yaratilgan sana</TableCell>
                                <TableCell align="right">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lessonsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : lessonsData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Darslar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lessonsData.map((lesson, index) => (
                                    <TableRow key={lesson.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={lesson.name}
                                                sx={{
                                                    bgcolor: "#ecfdf3",
                                                    color: "#027a48",
                                                    borderRadius: 1,
                                                    maxWidth: 520,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{lesson.files?.length ?? 0}</TableCell>
                                        <TableCell>{lesson.homework ? "Bor" : "Yo'q"}</TableCell>
                                        <TableCell>{new Date(lesson.createdAt).toLocaleString()}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={() => openHomeworkEditor(lesson)}
                                                    sx={{ textTransform: "none", borderRadius: 1 }}
                                                >
                                                    {lesson.homework ? "Vazifani boshqarish" : "Vazifa e'lon qilish"}
                                                </Button>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteLesson(lesson)}>
                                                    <DeleteOutline fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Box>
            ) : lessonSubTab === "Videolar" ? (
                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", border: "1px solid #edf0f5", borderRadius: 2 }}>
                    <Table size="small" sx={{ minWidth: 920 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Mavzu</TableCell>
                                <TableCell>Video soni</TableCell>
                                <TableCell>Qo'shilgan vaqt</TableCell>
                                <TableCell align="right">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lessonsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : lessonsData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Darslar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lessonsData.map((lesson, index) => (
                                    <TableRow key={lesson.id} hover>
                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{index + 1}</TableCell>
                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{lesson.name}</TableCell>
                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{lesson.files?.length ?? 0}</TableCell>
                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{new Date(lesson.createdAt).toLocaleString()}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    startIcon={<SmartDisplayOutlined fontSize="small" />}
                                                    onClick={() => openVideoDialog(lesson)}
                                                >
                                                    Video qo'shish
                                                </Button>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteLesson(lesson)}>
                                                    <DeleteOutline fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Box>
            ) : lessonSubTab === "Vazifani tekshirish" ? (
                <HomeworkReviewSection
                    lessons={lessonsData}
                    loading={lessonsLoading}
                    onReviewSaved={() => selectedGroup && loadLessons(selectedGroup.id)}
                />
            ) : null}
        </section>
    );
}
