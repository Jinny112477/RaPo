// หน้า รายการ Activity ทั้งหมด ที่ DP เข้ามาดูได้(เฉพาะactive, มีview edit delete)

'use client';

import { useRopa } from '@/lib/ropaContext';
import { ActivityTable } from '@/components/ActivityTable';

export default function ActivitiesPage() {
    const { activities } = useRopa();

    console.log("ALL ACTIVITIES:", activities);
    console.log("STATUS LIST:", activities.map(a => a.status));
    console.log("FIRST ITEM:", activities[0]);

    //เอาเฉพาะ ACTIVE เท่านั้น
    const activeActivities = activities.filter(
        (a) => a.status?.trim().toUpperCase() === 'ACTIVE'
    );

    return <ActivityTable activities={activeActivities} />;
}