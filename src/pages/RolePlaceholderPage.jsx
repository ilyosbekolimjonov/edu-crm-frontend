import { Box, Paper, Typography } from "@mui/material";

export default function RolePlaceholderPage({ title, description }) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                backgroundColor: "#f5f6f8",
            }}
        >
            <Paper elevation={0} sx={{ maxWidth: 520, p: 4, borderRadius: 3, textAlign: "center" }}>
                <Typography sx={{ fontSize: 28, fontWeight: 700, mb: 1.5 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#667085" }}>
                    {description}
                </Typography>
            </Paper>
        </Box>
    );
}
