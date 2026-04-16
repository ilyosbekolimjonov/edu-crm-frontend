import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import logo from "../../assets/logo.svg"

const getInitials = (value) => {
    const fullName = String(value || "").trim();
    if (!fullName) return "U";
    const words = fullName.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0][0]?.toUpperCase() || "U";
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
};

export default function SidebarNav({ items, bottomItems = [], activeItem, onSelect, identity = null, showBrand = true }) {
    const renderItem = (item) => (
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
                color: activeItem === item.label ? "#fff" : item.color || "#4f566b",
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
    );

    return (
        <Box
            sx={{
                width: 230,
                backgroundColor: "#ffffff",
                borderRight: "1px solid #ebedf2",
                px: 2,
                py: 2,
                display: { xs: "none", md: "block" },
                minHeight: "100vh",
            }}
        >
            <Stack sx={{ minHeight: "calc(100vh - 32px)" }}>
                {identity ? (
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{
                            mb: 2,
                            p: 1.25,
                            borderRadius: 2,
                            border: "1px solid #e4e7ec",
                            bgcolor: "#f8fafc",
                        }}
                    >
                        <Avatar
                            src={identity.imageUrl || undefined}
                            sx={{
                                width: 42,
                                height: 42,
                                bgcolor: "#ecfdf3",
                                color: "#027a48",
                                fontWeight: 700,
                                fontSize: 14,
                            }}
                        >
                            {getInitials(identity.fullName)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1d2939" }} noWrap>
                                {identity.fullName || "Ustoz"}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#667085" }} noWrap>
                                {identity.subtitle || "Mentor"}
                            </Typography>
                        </Box>
                    </Stack>
                ) : null}

                {showBrand ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, px: 1 }}>
                        <Box component="img" src={logo} alt="Knowna logo" sx={{ width: 30 }}/>
                        <Typography sx={{ fontWeight: 700, color: "#5e4ea7" }}>KNOWVA</Typography>
                    </Stack>
                ) : null}

                <Stack spacing={1}>
                    {items.map(renderItem)}
                </Stack>

                {bottomItems.length ? (
                    <Stack spacing={1} sx={{ mt: "auto", pt: 2, borderTop: "1px solid #eef0f4" }}>
                        {bottomItems.map(renderItem)}
                    </Stack>
                ) : null}
            </Stack>
        </Box>
    );
}
