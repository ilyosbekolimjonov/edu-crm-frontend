import { ArrowBack } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";

export default function GroupDetailHeader({
    group,
    canManageGroups,
    onBack,
    onEdit,
    onAddMentor,
    onAddStudent,
}) {
    return (
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <IconButton size="small" onClick={onBack}>
                    <ArrowBack fontSize="small" />
                </IconButton>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-700">Guruh tafsiloti</p>
                    <h2 className="truncate text-2xl font-bold text-slate-950">{group?.name || "-"}</h2>
                </div>
            </div>

            {canManageGroups ? (
                <div className="flex flex-wrap gap-2">
                    <Button size="small" onClick={onEdit} sx={{ textTransform: "none" }}>
                        Tahrirlash
                    </Button>
                    <Button size="small" onClick={onAddMentor} sx={{ textTransform: "none" }}>
                        + O'qituvchi qo'shish
                    </Button>
                    <Button size="small" onClick={onAddStudent} sx={{ textTransform: "none" }}>
                        + O'quvchi qo'shish
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
