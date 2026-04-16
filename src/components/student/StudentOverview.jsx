import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";

const stats = [
    { key: "groupCount", label: "Guruhlar" },
    { key: "lessonsCount", label: "Darslar" },
    { key: "watchedLessonsCount", label: "Ko'rilgan darslar" },
    { key: "homeworkCount", label: "Topshiriqlar" },
    { key: "submittedHomeworkCount", label: "Yuborilganlar" },
];

export default function StudentOverview({ dashboard }) {
    const attendance = dashboard?.attendanceSummary || {};

    return (
        <Stack spacing={2}>
            <Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#1d2b25" }}>
                    Salom, {dashboard?.profile?.fullName || "student"}
                </Typography>
                <Typography sx={{ color: "#667085" }}>
                    Bugungi darslaringiz, topshiriqlaringiz va davomat holatingiz.
                </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, gap: 1.5 }}>
                {stats.map((item) => (
                    <Paper key={item.key} elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                        <Typography sx={{ color: "#667085", fontSize: 13 }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#147d64" }}>
                            {dashboard?.[item.key] ?? 0}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                        <Typography sx={{ fontWeight: 700 }}>Davomat</Typography>
                        <Typography sx={{ color: "#667085", fontSize: 14 }}>
                            Bor: {attendance.present ?? 0}, Yo'q: {attendance.absent ?? 0}, Jami: {attendance.total ?? 0}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#147d64" }}>
                        {attendance.percent ?? 0}%
                    </Typography>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={attendance.percent ?? 0}
                    sx={{ mt: 1.5, height: 8, borderRadius: 1, bgcolor: "#edf2ef", "& .MuiLinearProgress-bar": { bgcolor: "#147d64" } }}
                />
            </Paper>
        </Stack>
    );
}
