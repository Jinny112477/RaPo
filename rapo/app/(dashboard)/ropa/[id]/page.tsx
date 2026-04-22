'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';

export default function RopaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { activities } = useRopa()
    const activity = activities.find(a => a.id === params.id)

    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-sm">ไม่พบข้อมูลกิจกรรม</p>
                    <button onClick={() => router.back()}
                        className="mt-3 text-xs text-[#203690] hover:underline">
                        ← กลับ
                    </button>
                </div>
            </div>
        );
    }

    const statusBadge = (status: string) => {
        if (status === 'ACTIVE') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'REVIEW') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (status === 'DRAFT') return 'bg-gray-100 text-gray-600 border-gray-200';
        if (status === 'REJECTED') return 'bg-red-100 text-red-700 border-red-200';
        if (status === 'ARCHIVED') return 'bg-slate-100 text-slate-500 border-slate-200';
        return 'bg-gray-100 text-gray-600 border-gray-200';
    };

    const riskBadge = (risk: string) => {
        if (risk === 'LOW') return 'bg-green-100 text-green-700 border-green-200';
        if (risk === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (risk === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200';
        if (risk === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
        return '';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => router.back()}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    ← กลับ
                </button>
                <span className="text-gray-300">/</span>
                <p className="text-xs text-gray-500">รายละเอียดกิจกรรม</p>
            </div>

            <div className="max-w-3xl space-y-4">

                {/* Title + Status */}
                <div className="bg-white border border-black rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">{activity.id}</p>
                            <h1 className="text-xl font-bold text-gray-800">{activity.activityName}</h1>
                            <p className="text-sm text-gray-500 mt-1">{activity.department}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(activity.status)}`}>
                                {activity.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge(activity.riskLevel)}`}>
                                Risk: {activity.riskLevel}
                            </span>
                        </div>
                    </div>

                    {/* Rejection reason banner */}
                    {activity.status === 'REJECTED' && activity.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-700 mb-1">❌ เหตุผลที่ DPO ปฏิเสธ</p>
                            <p className="text-sm text-red-600">{activity.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Section 1: ข้อมูลทั่วไป */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-800 text-white px-5 py-3">
                        <p className="text-sm font-semibold">ข้อมูลทั่วไป</p>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'ชื่อกิจกรรม', value: activity.activityName },
                            { label: 'แผนก', value: activity.department },
                            { label: 'วัตถุประสงค์', value: activity.purpose },
                            { label: 'ฐานกฎหมาย', value: activity.legalBasis },
                            { label: 'ระยะเวลาเก็บรักษา', value: activity.retentionPeriod },
                            { label: 'เจ้าของ', value: activity.owner ?? '-' },
                            { label: 'วันที่สร้าง', value: activity.createdAt },
                            { label: 'อัปเดตล่าสุด', value: activity.updatedAt },
                        ].map(row => (
                            <div key={row.label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">{row.label}</p>
                                <p className="text-sm font-medium text-gray-700">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: ข้อมูลส่วนบุคคล */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-800 text-white px-5 py-3">
                        <p className="text-sm font-semibold">ข้อมูลส่วนบุคคล</p>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 mb-2">กลุ่มเจ้าของข้อมูล</p>
                            <div className="flex flex-wrap gap-1.5">
                                {activity.dataSubject.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 mb-2">ประเภทข้อมูล</p>
                            <div className="flex flex-wrap gap-1.5">
                                {activity.personalData.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 mb-2">การประมวลผล</p>
                            <div className="flex flex-wrap gap-1.5">
                                {activity.processing.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button onClick={() => router.back()}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        กลับ
                    </button>
                    {(activity.status === 'DRAFT' || activity.status === 'REJECTED') && (
                        <button
                            onClick={() => router.push(`/ropa/edit/${activity.id}`)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition text-white
                ${activity.status === 'REJECTED'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-[#203690] hover:bg-[#182a73]'}`}>
                            {activity.status === 'REJECTED' ? 'แก้ไขและส่งใหม่' : 'แก้ไข'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}