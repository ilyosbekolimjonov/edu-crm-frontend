import { Box, Paper, Stack, Typography } from "@mui/material";
import logo from "../../assets/logo.svg"

export default function SidebarNav({ items, activeItem, onSelect }) {
    return (
        <Box
            sx={{
                width: 230,
                backgroundColor: "#ffffff",
                borderRight: "1px solid #ebedf2",
                px: 2,
                py: 2,
                display: { xs: "none", md: "block" },
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, px: 1 }}>
                <Box component="img" src={logo} alt="Knowna logo" sx={{ width: 30 }}/>
                <Typography sx={{ fontWeight: 700, color: "#5e4ea7" }}>KNOWVA</Typography>
            </Stack>

            <Stack spacing={1}>
                {items.map((item) => (
                    <Paper
                        key={item.label}
                        elevation={0}
                        onClick={() => onSelect(item.label)}
                        sx={{
                            p: "10px 12px",
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            userSelect: "none",
                            bgcolor: activeItem === item.label ? "#7f56d9" : "transparent",
                            color: activeItem === item.label ? "#fff" : "#4f566b",
                            border: activeItem === item.label ? "none" : "1px solid transparent",
                            transition: "all 0.15s ease",
                            "&:hover": {
                                bgcolor: activeItem === item.label ? "#7f56d9" : "#f5f6fa",
                            },
                        }}
                    >
                        {item.icon}
                        <Typography sx={{ fontSize: 14, fontWeight: activeItem === item.label ? 600 : 500 }}>
                            {item.label}
                        </Typography>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
