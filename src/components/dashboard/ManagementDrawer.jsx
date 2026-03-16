import {
    Box,
    Chip,
    Drawer,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

const manageTabs = [
    "Kurslar",
    "Xonalar",
    "Guruhlar",
    "Xodimlar",
    "Sabablar",
    "Rollar",
    "Coin",
    "Xabar yuborish",
    "Tekshiruv",
];

export default function ManagementDrawer({
    open,
    activeTab,
    onTabChange,
    onClose,
    coursesData,
    roomsData,
    groupsData,
}) {
    return (
        <Drawer
            open={open}
            variant="persistent"
            anchor="left"
            sx={{
                display: { xs: "none", md: "block" },
                "& .MuiDrawer-paper": {
                    left: 230,
                    width: "calc(100vw - 230px)",
                    borderRight: "1px solid #e9ecf2",
                    boxSizing: "border-box",
                    backgroundColor: "#f5f6fa",
                },
            }}
        >
            <Box sx={{ height: "100%", p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: 36, fontWeight: 700, color: "#1f2533" }}>
                            Boshqarish
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                                <Refresh fontSize="small" />
                            </IconButton>
                            <Chip label="Yopish" size="small" onClick={onClose} clickable />
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.7} sx={{ flexWrap: "wrap", mb: 2 }}>
                        {manageTabs.map((tab) => (
                            <Chip
                                key={tab}
                                label={tab}
                                size="small"
                                onClick={() => onTabChange(tab)}
                                clickable
                                sx={{
                                    bgcolor: activeTab === tab ? "#ede9fe" : "#ffffff",
                                    color: activeTab === tab ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                        ))}
                    </Stack>

                    {activeTab === "Kurslar" && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1.5 }}>Kurslar</Typography>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                                    gap: 1,
                                }}
                            >
                                {coursesData.length === 0 ? (
                                    <Typography sx={{ color: "#6b7280" }}>Kurslar topilmadi</Typography>
                                ) : (
                                    coursesData.map((course) => (
                                        <Paper key={course.id} elevation={0} sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}>
                                            <Typography sx={{ fontWeight: 700 }}>{course.name}</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
                                                Daraja: {course.level || "-"}
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                Kategoriya: {course.category?.name || "-"}
                                            </Typography>
                                        </Paper>
                                    ))
                                )}
                            </Box>
                        </Paper>
                    )}

                    {activeTab === "Xonalar" && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1.5 }}>Xonalar</Typography>
                            <Stack spacing={1}>
                                {roomsData.length === 0 ? (
                                    <Typography sx={{ color: "#6b7280" }}>Xonalar topilmadi</Typography>
                                ) : (
                                    roomsData.map((room) => (
                                        <Paper key={room.id} elevation={0} sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}>
                                            <Typography sx={{ fontWeight: 700 }}>{room.name}</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                Sig'im: {room.capacity} | Holat: {room.isActive ? "Faol" : "Nofaol"}
                                            </Typography>
                                        </Paper>
                                    ))
                                )}
                            </Stack>
                        </Paper>
                    )}

                    {activeTab === "Guruhlar" && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                            <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1.5 }}>Guruhlar</Typography>
                            <Stack spacing={1}>
                                {groupsData.length === 0 ? (
                                    <Typography sx={{ color: "#6b7280" }}>Guruhlar topilmadi</Typography>
                                ) : (
                                    groupsData.map((group) => (
                                        <Paper key={group.id} elevation={0} sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}>
                                            <Typography sx={{ fontWeight: 700 }}>{group.name}</Typography>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                Vaqt: {group.startTime || "-"} | Talabalar: {group.students}
                                            </Typography>
                                        </Paper>
                                    ))
                                )}
                            </Stack>
                        </Paper>
                    )}

                    {(activeTab === "Xodimlar" ||
                        activeTab === "Sabablar" ||
                        activeTab === "Rollar" ||
                        activeTab === "Coin" ||
                        activeTab === "Xabar yuborish" ||
                        activeTab === "Tekshiruv") && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                            <Typography sx={{ color: "#6b7280" }}>
                                Bu bo'lim uchun backend endpoint hozircha mavjud emas.
                            </Typography>
                        </Paper>
                    )}
            </Box>
        </Drawer>
    );
}
