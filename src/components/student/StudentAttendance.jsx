import { MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export default function StudentAttendance({ attendance, groups = [], selectedGroupId, onChangeGroup }) {
    const records = attendance?.records || [];
    const summary = attendance?.summary || {};

    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Attendance</Typography>
            <TextField
                select
                label="Guruh bo'yicha filter"
                value={selectedGroupId || ""}
                onChange={(event) => onChangeGroup(event.target.value)}
                sx={{ maxWidth: 360 }}
            >
                <MenuItem value="">Barcha guruhlar</MenuItem>
                {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                        {group.name}
                    </MenuItem>
                ))}
            </TextField>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Xulosa</Typography>
                <Typography sx={{ color: "#667085" }}>
                    Jami: {summary.total ?? 0}, Bor: {summary.present ?? 0}, Yo'q: {summary.absent ?? 0}, Foiz: {summary.percent ?? 0}%
                </Typography>
            </Paper>

            {!records.length ? (
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                    <Typography sx={{ color: "#667085" }}>Davomat yozuvlari topilmadi.</Typography>
                </Paper>
            ) : (
                records.map((item) => (
                    <Paper key={item.id} elevation={0} sx={{ p: 1.5, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                            <Typography sx={{ fontWeight: 700 }}>
                                {new Date(item.lessonDate).toLocaleDateString()} | {item.group?.name}
                            </Typography>
                            <Typography sx={{ color: item.present ? "#147d64" : "#b42318", fontWeight: 700 }}>
                                {item.present ? "Bor" : "Yo'q"}
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: "#667085", fontSize: 14 }}>{item.group?.course?.name || "Kurs"}</Typography>
                    </Paper>
                ))
            )}
        </Stack>
    );
}
