import EmptyState from "../common/EmptyState";
import PageHeader from "../common/PageHeader";
import SectionCard from "../common/SectionCard";

export default function TeacherStoreSection() {
    return (
        <div className="space-y-5">
            <SectionCard>
                <PageHeader
                    eyebrow="Do'kon"
                    title="Teacher do'koni"
                    description="Sovg'alar va boshqa imkoniyatlar bo'limi keyingi bosqichda qo'shiladi."
                />
            </SectionCard>

            <SectionCard>
                <EmptyState
                    title="Do'kon hali mavjud emas"
                    description="Bu bo'lim yaqin orada ishga tushiriladi."
                    className="py-14"
                />
            </SectionCard>
        </div>
    );
}
