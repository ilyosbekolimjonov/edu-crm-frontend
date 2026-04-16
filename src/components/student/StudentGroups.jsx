import { useMemo, useState } from "react";
import { Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

const formatDays = (days = []) => (Array.isArray(days) && days.length ? days.join(", ") : "-");
const isActiveGroup = (group) => group.status === "ACTIVE" && (group.membership?.status ? group.membership.status === "ACTIVE" : true);
const statusLabel = (group) => (isActiveGroup(group) ? "Faol" : "Tugagan");
const STATUS_TABS = [
    { value: "ACTIVE", label: "Faol" },
    { value: "ARCHIVE", label: "Tugagan" },
];

export default function StudentGroups({ groups = [], onOpenGroup }) {
    const [statusFilter, setStatusFilter] = useState("ACTIVE");
    const filteredGroups = useMemo(
        () =>
            groups.filter((group) =>
                statusFilter === "ACTIVE" ? isActiveGroup(group) : !isActiveGroup(group)
            ),
        [groups, statusFilter]
    );

    return (
        <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Guruhlar</Typography>
                <Stack direction="row" spacing={1}>
                    {STATUS_TABS.map((tab) => (
                        <Chip
                            key={tab.value}
                            label={tab.label}
                            clickable
                            color={statusFilter === tab.value ? "success" : "default"}
                            variant={statusFilter === tab.value ? "filled" : "outlined"}
                            onClick={() => setStatusFilter(tab.value)}
                            sx={{ borderRadius: 1, fontWeight: 700 }}
                        />
                    ))}
                </Stack>
            </Stack>
            <Paper elevation={0} sx={{ border: "1px solid #dfe7e3", borderRadius: 1, overflow: "hidden" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Guruh nomi</TableCell>
                            <TableCell>Yo'nalishi</TableCell>
                            <TableCell>O'qituvchi</TableCell>
                            <TableCell>Jadval</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!filteredGroups.length ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography sx={{ color: "#667085", py: 1 }}>
                                        {groups.length ? "Bu statusda guruh topilmadi." : "Sizga hali guruh biriktirilmagan."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGroups.map((group, index) => (
                                <TableRow
                                    key={group.id}
                                    hover
                                    onClick={() => onOpenGroup(group.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{group.name}</TableCell>
                                    <TableCell>{group.course?.name || "-"}</TableCell>
                                    <TableCell>{group.mentor?.fullName || "-"}</TableCell>
                                    <TableCell sx={{ minWidth: 220 }}>
                                        {formatDays(group.schedule?.weekDays)} | {group.schedule?.startTime || "--:--"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            color={isActiveGroup(group) ? "success" : "default"}
                                            label={statusLabel(group)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Stack>
    );
}
