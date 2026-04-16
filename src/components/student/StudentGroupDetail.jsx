import { Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

const formatDays = (days = []) => (Array.isArray(days) && days.length ? days.join(", ") : "-");
const isActiveGroup = (group) => group?.status === "ACTIVE" && (group?.membership?.status ? group.membership.status === "ACTIVE" : true);

export default function StudentGroupDetail({ group, lessons = [], onBack, onOpenLesson }) {
    if (!group) {
        return (
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ color: "#667085" }}>Guruh topilmadi.</Typography>
            </Paper>
        );
    }

    return (
        <Stack spacing={1.5}>
            <Button onClick={onBack} sx={{ alignSelf: "flex-start", textTransform: "none" }}>
                Ortga
            </Button>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                    <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: 26, fontWeight: 800 }}>{group.name}</Typography>
                        <Typography sx={{ color: "#667085" }}>Yo'nalish: {group.course?.name || "-"}</Typography>
                        <Typography sx={{ color: "#667085" }}>O'qituvchi: {group.mentor?.fullName || "-"}</Typography>
                    </Stack>
                    <Stack spacing={0.75} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                        <Chip size="small" color={isActiveGroup(group) ? "success" : "default"} label={isActiveGroup(group) ? "Faol" : "Tugagan"} />
                        <Typography sx={{ color: "#344054", fontSize: 14 }}>
                            {formatDays(group.schedule?.weekDays)} | {group.schedule?.startTime || "--:--"}
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            <Paper elevation={0} sx={{ border: "1px solid #dfe7e3", borderRadius: 1, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Mavzu</TableCell>
                            <TableCell>Homework</TableCell>
                            <TableCell>Video/Fayl</TableCell>
                            <TableCell>Sana</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!lessons.length ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography sx={{ color: "#667085", py: 1 }}>Bu guruhda hali darslar yo'q.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            lessons.map((lesson, index) => (
                                <TableRow
                                    key={lesson.id}
                                    hover
                                    onClick={() => onOpenLesson(lesson.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{lesson.name}</TableCell>
                                    <TableCell>{lesson.hasHomework ? "Bor" : "Yo'q"}</TableCell>
                                    <TableCell>{lesson.files?.length ? `${lesson.files.length} ta` : lesson.video && lesson.video !== "-" ? "Bor" : "-"}</TableCell>
                                    <TableCell>{new Date(lesson.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}
