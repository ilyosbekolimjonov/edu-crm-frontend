import { DeleteOutline, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

export default function GroupListPanel({
    activeTab,
    setActiveTab,
    filteredGroups,
    groupStats,
    loading,
    canManageGroups,
    openView,
    openEdit,
    handleArchiveToggle,
    handleDelete,
    openCreate,
}) {
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                    gap: 1,
                }}
            >
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                    <Chip
                        size="small"
                        clickable
                        label="Faol guruhlar"
                        onClick={() => setActiveTab("ACTIVE")}
                        sx={{ bgcolor: activeTab === "ACTIVE" ? "#ede9fe" : "#ffffff", color: activeTab === "ACTIVE" ? "#6d3ee6" : "#4b5563" }}
                    />
                    <Chip
                        size="small"
                        clickable
                        label="Arxiv"
                        onClick={() => setActiveTab("ARCHIVED")}
                        sx={{ bgcolor: activeTab === "ARCHIVED" ? "#ede9fe" : "#ffffff", color: activeTab === "ARCHIVED" ? "#6d3ee6" : "#4b5563" }}
                    />
                    <Chip
                        size="small"
                        clickable
                        label="Barchasi"
                        onClick={() => setActiveTab("ALL")}
                        sx={{ bgcolor: activeTab === "ALL" ? "#ede9fe" : "#ffffff", color: activeTab === "ALL" ? "#6d3ee6" : "#4b5563" }}
                    />
                </Stack>
                {canManageGroups ? (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={openCreate}
                        sx={{ alignSelf: { xs: "flex-start", sm: "center" }, textTransform: "none" }}
                    >
                        Guruh qo'shish
                    </Button>
                ) : null}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" }, gap: 1 }}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Jami guruhlar</Typography>
                    <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalGroups}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>O'qituvchilar</Typography>
                    <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalMentors}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>O'quvchilar</Typography>
                    <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalStudents}</Typography>
                </Paper>
            </Box>

            <Paper elevation={0} sx={{ border: "1px solid #e9ecf2", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 1080 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>Nomi</TableCell>
                                <TableCell>Kurs</TableCell>
                                <TableCell>Davomiylik</TableCell>
                                <TableCell>Vaqt</TableCell>
                                <TableCell>Ochilgan sana</TableCell>
                                <TableCell>Xona</TableCell>
                                <TableCell>O'qituvchi</TableCell>
                                <TableCell>Talabalar</TableCell>
                                <TableCell align="right">Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10}>
                                        <Typography sx={{ py: 2, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10}>
                                        <Typography sx={{ py: 2, color: "#6b7280" }}>Guruhlar topilmadi</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGroups.map((group) => (
                                    <TableRow key={group.id} hover>
                                        <TableCell>
                                            <Chip size="small" label={group.status} color={group.status === "ACTIVE" ? "success" : "default"} />
                                        </TableCell>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.course?.name || "-"}</TableCell>
                                        <TableCell>{group.durationMinutes} min</TableCell>
                                        <TableCell>{group.startTime}</TableCell>
                                        <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{group.room?.name || "-"}</TableCell>
                                        <TableCell>
                                            {(group.mentorAssignments?.length || 0) > 0
                                                ? group.mentorAssignments.map((item) => item.mentor?.fullName).filter(Boolean).join(", ")
                                                : group.mentor?.fullName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {group.studentGroups?.filter((sg) => sg.user?.role === "STUDENT" && sg.user?.isActive === true).length || 0}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => openView(group)}>
                                                <VisibilityOutlined fontSize="small" />
                                            </IconButton>
                                            {canManageGroups ? (
                                                <>
                                                    <IconButton size="small" onClick={() => openEdit(group)}>
                                                        <EditOutlined fontSize="small" />
                                                    </IconButton>
                                                    <Button size="small" onClick={() => handleArchiveToggle(group)} sx={{ textTransform: "none", minWidth: 48 }}>
                                                        {group.status === "ACTIVE" ? "Arxiv" : "Aktiv"}
                                                    </Button>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(group)}>
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                </>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        </>
    );
}
