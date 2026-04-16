import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

export default function GroupManagementDialogs({
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    mentorAddOpen,
    setMentorAddOpen,
    studentAddOpen,
    setStudentAddOpen,
    submitting,
    renderForm,
    handleCreate,
    handleUpdate,
    mentors,
    students,
    quickMentorIds,
    setQuickMentorIds,
    quickStudentIds,
    setQuickStudentIds,
    applyMentorQuickAdd,
    applyStudentQuickAdd,
}) {
    return (
        <>
            <Dialog open={createOpen} onClose={() => (!submitting ? setCreateOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Yangi guruh</DialogTitle>
                <DialogContent>{renderForm()}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} disabled={submitting}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={submitting}>{submitting ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => (!submitting ? setEditOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Guruhni tahrirlash</DialogTitle>
                <DialogContent>{renderForm()}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={submitting}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={submitting}>{submitting ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={mentorAddOpen} onClose={() => setMentorAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>O'qituvchi qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            select
                            label="Mentorlar"
                            value={quickMentorIds}
                            onChange={(e) => setQuickMentorIds(e.target.value)}
                            fullWidth
                            slotProps={{ select: { multiple: true } }}
                        >
                            {mentors.map((mentor) => <MenuItem key={mentor.id} value={mentor.id}>{mentor.fullName}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setMentorAddOpen(false)}>Bekor</Button>
                    <Button variant="contained" onClick={applyMentorQuickAdd}>Saqlash</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={studentAddOpen} onClose={() => setStudentAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>O'quvchi qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            select
                            label="O'quvchilar"
                            value={quickStudentIds}
                            onChange={(e) => setQuickStudentIds(e.target.value)}
                            fullWidth
                            slotProps={{ select: { multiple: true } }}
                        >
                            {students.map((student) => <MenuItem key={student.id} value={student.id}>{student.fullName}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStudentAddOpen(false)}>Bekor</Button>
                    <Button variant="contained" onClick={applyStudentQuickAdd}>Saqlash</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
