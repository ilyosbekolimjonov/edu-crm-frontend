import { UploadFileOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

export default function GroupLessonDialogs({
    lessonCreateOpen,
    setLessonCreateOpen,
    creatingLesson,
    lessonCreateMode,
    setLessonCreateMode,
    lessonName,
    setLessonName,
    lessonAbout,
    setLessonAbout,
    handleCreateLesson,
    videoDialogOpen,
    setVideoDialogOpen,
    addingVideo,
    videoTargetLesson,
    videoUploadFile,
    setVideoUploadFile,
    videoForm,
    setVideoForm,
    handleAddVideoToLesson,
    videoListDialogOpen,
    setVideoListDialogOpen,
    videoListLesson,
    toPublicUrl,
}) {
    const closeLessonCreate = () => {
        if (creatingLesson) return;
        setLessonCreateOpen(false);
        setLessonName("");
        setLessonAbout("");
    };

    return (
        <>
            <Dialog open={lessonCreateOpen} onClose={closeLessonCreate} maxWidth="sm" fullWidth>
                <DialogTitle>Yo'qlama va mavzu kiritish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            <Chip
                                size="small"
                                clickable
                                label="O'quv reja bo'yicha"
                                onClick={() => setLessonCreateMode("PLAN")}
                                sx={{
                                    bgcolor: lessonCreateMode === "PLAN" ? "#ede9fe" : "#ffffff",
                                    color: lessonCreateMode === "PLAN" ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                            <Chip
                                size="small"
                                clickable
                                label="Boshqa"
                                onClick={() => setLessonCreateMode("CUSTOM")}
                                sx={{
                                    bgcolor: lessonCreateMode === "CUSTOM" ? "#ede9fe" : "#ffffff",
                                    color: lessonCreateMode === "CUSTOM" ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                        </Stack>

                        <TextField
                            label="Mavzu"
                            value={lessonName}
                            onChange={(event) => setLessonName(event.target.value)}
                            placeholder="CRM frontend"
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="Tavsif (ixtiyoriy)"
                            value={lessonAbout}
                            onChange={(event) => setLessonAbout(event.target.value)}
                            placeholder="Darsda ko'riladigan mavzular"
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
                            Video yoki dars materiali keyin "Videolar" bo'limida darsga biriktiriladi.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeLessonCreate} disabled={creatingLesson}>Bekor</Button>
                    <Button variant="contained" onClick={handleCreateLesson} disabled={creatingLesson}>
                        {creatingLesson ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={videoDialogOpen}
                onClose={() => (!addingVideo ? setVideoDialogOpen(false) : null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Video qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                            Dars: {videoTargetLesson?.name || "-"}
                        </Typography>
                        <Box
                            component="label"
                            sx={{
                                border: "1px dashed #8ad3c0",
                                borderRadius: 2,
                                p: { xs: 2, md: 3 },
                                textAlign: "center",
                                backgroundColor: "#f8fffc",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={(event) => setVideoUploadFile(event.target.files?.[0] || null)}
                            />
                            <UploadFileOutlined sx={{ fontSize: 36, color: "#1da67a", mb: 1 }} />
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                                Video faylni yuklash uchun faylni tanlang
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                Qo'llab-quvvatlanadigan formatlar: mp4, webm, mpeg, avi, mkv, mov
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#256d5a", mt: 0.75 }}>
                                {videoUploadFile ? `Tanlangan fayl: ${videoUploadFile.name}` : "Fayl tanlanmagan"}
                            </Typography>
                        </Box>
                        <TextField
                            label="Izoh (ixtiyoriy)"
                            value={videoForm.note}
                            onChange={(event) => setVideoForm((prev) => ({ ...prev, note: event.target.value }))}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setVideoDialogOpen(false)} disabled={addingVideo}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleAddVideoToLesson} disabled={addingVideo}>
                        {addingVideo ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={videoListDialogOpen} onClose={() => setVideoListDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{videoListLesson?.name || "Dars videolari"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.25} sx={{ pt: 1 }}>
                        {videoListLesson?.files?.length ? (
                            videoListLesson.files.map((item) => (
                                <Paper key={item.id} elevation={0} sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}>
                                    <Stack spacing={1}>
                                        <video controls src={toPublicUrl(item.file)} style={{ width: "100%", maxHeight: 260, borderRadius: 8 }} />
                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                            {item.note || "Izoh yo'q"}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            ))
                        ) : (
                            <Typography sx={{ color: "#6b7280" }}>
                                Bu darsga hali video biriktirilmagan.
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setVideoListDialogOpen(false)}>Yopish</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
