import { Paper } from "@mui/material";
import GroupAttendancePanel from "./GroupAttendancePanel";
import GroupDetailHeader from "./GroupDetailHeader";
import GroupLessonsPanel from "./GroupLessonsPanel";

function TabButton({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                active
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
            {children}
        </button>
    );
}

export default function GroupDetailPanel({
    group,
    canManageGroups,
    groupViewTabs,
    groupViewTab,
    setGroupViewTab,
    onBack,
    onEdit,
    onAddMentor,
    onAddStudent,
    lessonsProps,
    attendanceProps,
}) {
    return (
        <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2", minWidth: 0, overflow: "hidden" }}
        >
            <div className="space-y-5">
                <GroupDetailHeader
                    group={group}
                    canManageGroups={canManageGroups}
                    onBack={onBack}
                    onEdit={onEdit}
                    onAddMentor={onAddMentor}
                    onAddStudent={onAddStudent}
                />

                <div className="flex flex-wrap gap-2">
                    {groupViewTabs.map((tab) => (
                        <TabButton
                            key={tab.value}
                            active={groupViewTab === tab.value}
                            onClick={() => setGroupViewTab(tab.value)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>

                {groupViewTab === "DARSLAR" ? (
                    <GroupLessonsPanel selectedGroup={group} {...lessonsProps} />
                ) : (
                    <GroupAttendancePanel group={group} {...attendanceProps} />
                )}
            </div>
        </Paper>
    );
}
