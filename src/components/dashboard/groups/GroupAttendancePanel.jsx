import {
    Box,
    Button,
    Chip,
    MenuItem,
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
import { FileDownloadOutlined } from "@mui/icons-material";

const monthToString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const dateKey = (yearMonth, day) => `${yearMonth}-${String(day).padStart(2, "0")}`;

export default function GroupAttendancePanel({
    group,
    viewMonth,
    setViewMonth,
    lessonDaysInMonth,
    filteredAttendanceStudents,
    attendanceNameFilter,
    setAttendanceNameFilter,
    attendanceDayFilter,
    setAttendanceDayFilter,
    attendanceStatusFilter,
    setAttendanceStatusFilter,
    exportAttendance,
    hasPendingAttendanceChanges,
    pendingAttendanceChanges,
    savingAttendance,
    setPendingAttendanceChanges,
    saveAttendanceChanges,
    isLessonDay,
    effectiveAttendanceMap,
    stageAttendance,
}) {
    return (
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ minWidth: 0 }}>
            <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #edf0f5", borderRadius: 2, minWidth: 280 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Ma'lumotlar</Typography>
                <Typography sx={{ fontSize: 13 }}>Kurs: {group.course?.name || "-"}</Typography>
                <Typography sx={{ fontSize: 13 }}>Kurs narxi: {group.course?.price || "-"}</Typography>
                <Typography sx={{ fontSize: 13 }}>Dars kunlari: {(group.weekDays || []).join(", ")}</Typography>
                <Typography sx={{ fontSize: 13 }}>Dars vaqti: {group.startTime || "-"}</Typography>
                <Typography sx={{ fontSize: 13, mb: 1 }}>Davomiylik: {group.durationMinutes || 0} min</Typography>

                <Typography sx={{ fontWeight: 700, mt: 1 }}>O'qituvchilar</Typography>
                {(group.mentorAssignments || []).map((item) => (
                    <Typography key={item.mentorId} sx={{ fontSize: 12, color: "#4b5563" }}>
                        {item.mentor?.fullName}
                    </Typography>
                ))}

                <Typography sx={{ fontWeight: 700, mt: 1 }}>Talabalar</Typography>
                {(group.studentGroups || []).map((item) => (
                    <Typography key={item.userId} sx={{ fontSize: 12, color: "#4b5563" }}>
                        {item.user?.fullName}
                    </Typography>
                ))}
            </Paper>

            <Box sx={{ flex: "1 1 0", width: 0, minWidth: 0 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 1 }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontWeight: 700 }}>Davomat</Typography>
                        <Button
                            size="small"
                            onClick={() => {
                                const [y, m] = viewMonth.split("-").map(Number);
                                setViewMonth(monthToString(new Date(y, m - 2, 1)));
                            }}
                        >
                            {"<"}
                        </Button>
                        <Typography sx={{ fontSize: 13 }}>{viewMonth}</Typography>
                        <Button
                            size="small"
                            onClick={() => {
                                const [y, m] = viewMonth.split("-").map(Number);
                                setViewMonth(monthToString(new Date(y, m, 1)));
                            }}
                        >
                            {">"}
                        </Button>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                            flexWrap: "wrap",
                            justifyContent: { xs: "flex-start", md: "flex-end" },
                            width: "100%",
                        }}
                    >
                        <TextField
                            size="small"
                            placeholder="Student qidirish"
                            value={attendanceNameFilter}
                            onChange={(e) => setAttendanceNameFilter(e.target.value)}
                            sx={{ width: { xs: "100%", sm: 220 } }}
                        />
                        <TextField
                            size="small"
                            select
                            value={attendanceDayFilter}
                            onChange={(e) => setAttendanceDayFilter(e.target.value)}
                            sx={{ width: { xs: "100%", sm: 96 } }}
                        >
                            <MenuItem value="">Kun</MenuItem>
                            {lessonDaysInMonth.map((day) => (
                                <MenuItem key={day} value={String(day)}>{day}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            select
                            value={attendanceStatusFilter}
                            onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                            sx={{ width: { xs: "100%", sm: 128 } }}
                        >
                            <MenuItem value="ALL">Barchasi</MenuItem>
                            <MenuItem value="PRESENT">Bor</MenuItem>
                            <MenuItem value="ABSENT">Yo'q</MenuItem>
                            <MenuItem value="NONE">Belgilanmagan</MenuItem>
                        </TextField>
                        <Button size="small" startIcon={<FileDownloadOutlined fontSize="small" />} onClick={exportAttendance}>
                            Export
                        </Button>
                        {hasPendingAttendanceChanges ? (
                            <Chip size="small" color="warning" label={`${Object.keys(pendingAttendanceChanges).length} ta o'zgarish`} />
                        ) : null}
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setPendingAttendanceChanges({})}
                            disabled={!hasPendingAttendanceChanges || savingAttendance}
                        >
                            Bekor
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={saveAttendanceChanges}
                            disabled={!hasPendingAttendanceChanges || savingAttendance}
                        >
                            {savingAttendance ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                    </Stack>
                </Stack>

                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", border: "1px solid #edf0f5", borderRadius: 2 }}>
                    <Table size="small" sx={{ minWidth: `${220 + (lessonDaysInMonth.length * 54)}px` }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nomi</TableCell>
                                {lessonDaysInMonth.map((day) => (
                                    <TableCell key={day} align="center">{day}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAttendanceStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.fullName}</TableCell>
                                    {lessonDaysInMonth.map((day) => {
                                        const activeDay = isLessonDay(day);
                                        const cellKey = `${student.id}-${dateKey(viewMonth, day)}`;
                                        const value = effectiveAttendanceMap.get(cellKey);
                                        const changed = Boolean(pendingAttendanceChanges[cellKey]);
                                        return (
                                            <TableCell key={day} align="center" sx={{ py: 0.5, px: 0.5 }}>
                                                <Box
                                                    sx={{
                                                        width: 58,
                                                        height: 28,
                                                        mx: "auto",
                                                        display: "grid",
                                                        gridTemplateColumns: "1fr 1fr",
                                                        border: changed ? "2px solid #f59e0b" : "1px solid #d0d5dd",
                                                        borderRadius: 1,
                                                        overflow: "hidden",
                                                        bgcolor: value === true ? "#dcfce7" : value === false ? "#fee2e2" : "#f8fafc",
                                                        opacity: activeDay ? 1 : 0.45,
                                                    }}
                                                >
                                                    <Box
                                                        onClick={() => activeDay && stageAttendance(student.id, day, false)}
                                                        sx={{
                                                            cursor: activeDay ? "pointer" : "default",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: value === false ? "#fff" : "#b42318",
                                                            bgcolor: value === false ? "#d92d20" : "transparent",
                                                        }}
                                                    >
                                                        {value === false ? "Yo'q" : "-"}
                                                    </Box>
                                                    <Box
                                                        onClick={() => activeDay && stageAttendance(student.id, day, true)}
                                                        sx={{
                                                            cursor: activeDay ? "pointer" : "default",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: value === true ? "#fff" : "#027a48",
                                                            bgcolor: value === true ? "#12b76a" : "transparent",
                                                            borderLeft: "1px solid #d0d5dd",
                                                        }}
                                                    >
                                                        {value === true ? "Bor" : "-"}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </Stack>
    );
}
