import { Paper, Stack, Typography } from "@mui/material";

export default function StudentPlaceholder({ title }) {
    return (
        <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{title}</Typography>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1 }}>
                <Typography sx={{ color: "#667085" }}>Bu bo'lim keyinroq ishlab chiqiladi.</Typography>
            </Paper>
        </Stack>
    );
}
