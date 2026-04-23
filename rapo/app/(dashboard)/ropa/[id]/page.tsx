'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRopa } from '@/lib/ropaContext';
import { SubActivity, SecurityMeasures } from '@/types';

export default function RopaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { activities } = useRopa();
    const activity = activities.find(a => a.id === params.id);

    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-sm">ไม่พบข้อมูลกิจกรรม</p>
                    <button onClick={() => router.back()} className="mt-3 text-xs text-[#203690] hover:underline">← กลับ</button>
                </div>
            </div>
        );
    }

    const isCtrl = activity.formType === 'controller';

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

    const InfoRow = ({ label, value }: { label: string; value?: string | string[] | null }) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        return (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1.5">
                        {value.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{v}</span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{value}</p>
                )}
            </div>
        );
    };

    const SectionHeader = ({ num, title, color = 'bg-gray-800' }: { num: string; title: string; color?: string }) => (
        <div className={`${color} text-white px-5 py-3 flex items-center gap-2`}>
            <span className="w-6 h-6 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">{num}</span>
            <p className="text-sm font-semibold">{title}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Back nav */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">← กลับ</button>
                <span className="text-gray-300">/</span>
                <p className="text-xs text-gray-500">รายละเอียดกิจกรรม</p>
            </div>

            <div className="max-w-4xl space-y-4">

                {/* Title + Status */}
                <div className="bg-white border border-black rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">{activity.id}</p>
                            <h1 className="text-xl font-bold text-gray-800">{activity.activityName}</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border mr-2 ${isCtrl ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                    {isCtrl ? 'Data Controller' : 'Data Processor'}
                                </span>
                                {activity.department}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(activity.status)}`}>{activity.status}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge(activity.riskLevel)}`}>Risk: {activity.riskLevel}</span>
                        </div>
                    </div>
                    {activity.status === 'REJECTED' && activity.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-700 mb-1">❌ เหตุผลที่ DPO ปฏิเสธ</p>
                            <p className="text-sm text-red-600">{activity.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Section: ผู้ลงบันทึก ROPA */}
                {activity.recorder && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <SectionHeader num="0" title="รายละเอียดของผู้ลงบันทึก ROPA" />
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow label="ชื่อ-นามสกุล / ชื่อองค์กร" value={activity.recorder.name} />
                            <InfoRow label="เบอร์โทรศัพท์" value={activity.recorder.phone} />
                            <InfoRow label="อีเมล" value={activity.recorder.email} />
                            <InfoRow label="ที่อยู่" value={activity.recorder.address} />
                        </div>
                    </div>
                )}

                {/* Section: ข้อมูลกิจกรรมหลัก */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <SectionHeader num="1-2" title="ข้อมูลกิจกรรมการประมวลผล" />
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isCtrl ? (
                            <InfoRow label="1. ชื่อเจ้าของข้อมูลส่วนบุคคล" value={activity.dataOwnerName} />
                        ) : (
                            <>
                                <InfoRow label="1. ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล" value={activity.processorName} />
                                <InfoRow label="2. ที่อยู่ผู้ควบคุมข้อมูลส่วนบุคคล (ผู้ว่าจ้าง)" value={activity.controllerAddress} />
                            </>
                        )}
                        <InfoRow label={isCtrl ? '2. กิจกรรมการประมวลผล' : '3. กิจกรรมการประมวลผล'} value={activity.activityName} />
                        <InfoRow label="วันที่สร้าง" value={new Date(activity.createdAt).toLocaleDateString('th-TH')} />
                        <InfoRow label="อัปเดตล่าสุด" value={new Date(activity.updatedAt).toLocaleDateString('th-TH')} />
                    </div>
                </div>

                {/* Sub Activities */}
                {activity.subActivities && activity.subActivities.length > 0 && (
                    <div className="space-y-4">
                        {activity.subActivities.map((sub: SubActivity, idx: number) => (
                            <div key={sub.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-[#1a3a6b] text-white px-5 py-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                                    <p className="text-sm font-semibold">วัตถุประสงค์ที่ {idx + 1}: {sub.purpose || '(ไม่ระบุ)'}</p>
                                </div>
                                <div className="p-5 space-y-4">

                                    {/* ข้อ 3: วัตถุประสงค์ */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoRow label={`ข้อ ${isCtrl ? 3 : 4}. วัตถุประสงค์ของการประมวลผล`} value={sub.purpose} />
                                    </div>

                                    {/* ข้อ 4/5: ข้อมูลส่วนบุคคลที่จัดเก็บ */}
                                    <InfoRow label={`ข้อ ${isCtrl ? 4 : 5}. ข้อมูลส่วนบุคคลที่จัดเก็บ`} value={sub.personalDataItems} />

                                    {/* ข้อ 5/6 และ 6/7 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoRow label={`ข้อ ${isCtrl ? 5 : 6}. หมวดหมู่ของข้อมูล`} value={sub.dataCategory} />
                                        <InfoRow label={`ข้อ ${isCtrl ? 6 : 7}. ประเภทของข้อมูล`} value={sub.dataType} />
                                    </div>

                                    {/* ข้อ 7/8: วิธีการได้มา */}
                                    <InfoRow label={`ข้อ ${isCtrl ? 7 : 8}. วิธีการได้มาซึ่งข้อมูล`} value={sub.collectionMethod} />

                                    {/* ข้อ 8/9: แหล่งที่มา */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoRow label={`ข้อ ${isCtrl ? 8 : 9}. แหล่งที่ได้มา — จากเจ้าของข้อมูลโดยตรง`} value={sub.sourceFromOwner || undefined} />
                                        <InfoRow label={`ข้อ ${isCtrl ? 8 : 9}. แหล่งที่ได้มา — จากแหล่งอื่น`} value={sub.sourceFromOther || undefined} />
                                    </div>

                                    {/* ข้อ 9/10: ฐานการประมวลผล */}
                                    <InfoRow label={`ข้อ ${isCtrl ? 9 : 10}. ฐานในการประมวลผล`} value={sub.legalBasis} />

                                    {/* ข้อ 10: ผู้เยาว์ (DC เท่านั้น) */}
                                    {isCtrl && (
                                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                                            <p className="text-xs font-semibold text-amber-700">ข้อ 10. การขอความยินยอมของผู้เยาว์</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <InfoRow label="อายุไม่เกิน 10 ปี" value={sub.minorConsentUnder10 || undefined} />
                                                <InfoRow label="อายุ 10–20 ปี" value={sub.minorConsentAge10to20 || undefined} />
                                            </div>
                                        </div>
                                    )}

                                    {/* ข้อ 11: การโอนข้อมูลต่างประเทศ */}
                                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                                        <p className="text-xs font-semibold text-slate-600">ข้อ {isCtrl ? 11 : 11}. ส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoRow label="มีการส่งหรือโอนข้อมูลไปต่างประเทศ" value={sub.transferAbroad} />
                                            {sub.transferAbroad === 'มี' && <>
                                                <InfoRow label="ประเทศปลายทาง" value={sub.transferCountry || undefined} />
                                                <InfoRow label="ส่งในกลุ่มบริษัทในเครือ" value={sub.transferAffiliate || undefined} />
                                                {sub.transferAffiliate === 'ใช่' && <InfoRow label="ชื่อบริษัทในเครือ" value={sub.transferAffiliateCompany || undefined} />}
                                                <InfoRow label="วิธีการโอนข้อมูล" value={sub.transferMethod || undefined} />
                                                <InfoRow label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง" value={sub.transferStandard || undefined} />
                                                <InfoRow label="ข้อยกเว้นตามมาตรา 28" value={sub.transferException28 || undefined} />
                                            </>}
                                        </div>
                                    </div>

                                    {/* ข้อ 12: นโยบายการเก็บรักษา */}
                                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                                        <p className="text-xs font-semibold text-slate-600">ข้อ {isCtrl ? 12 : 12}. นโยบายการเก็บรักษาข้อมูลส่วนบุคคล</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoRow label="ประเภทของข้อมูลที่จัดเก็บ" value={sub.storageType} />
                                            <InfoRow label="วิธีการเก็บรักษาข้อมูล" value={sub.storageMethod || undefined} />
                                            <InfoRow label="ระยะเวลาการเก็บรักษาข้อมูล" value={sub.retentionPeriod || undefined} />
                                            <InfoRow label="สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล" value={sub.accessRights || undefined} />
                                            <InfoRow label="วิธีการลบหรือทำลายข้อมูลเมื่อสิ้นสุดระยะเวลา" value={sub.deletionMethod || undefined} />
                                        </div>
                                    </div>

                                    {/* ข้อ 13/14 (DC เท่านั้น) */}
                                    {isCtrl && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InfoRow label="ข้อ 13. การใช้หรือเปิดเผยข้อมูลที่ได้รับยกเว้นไม่ต้องขอความยินยอม" value={sub.exemptDisclosure || undefined} />
                                            <InfoRow label="ข้อ 14. การปฏิเสธคำขอหรือคำคัดค้านการใช้สิทธิ" value={sub.rightsDenial || undefined} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* มาตรการรักษาความมั่นคงปลอดภัย (ข้อ 15 DC / 13 DP) */}
                {activity.securityMeasures && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <SectionHeader num={isCtrl ? '15' : '13'} title="คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย" color="bg-slate-700" />
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoRow label="มาตรการเชิงองค์กร (Organizational)" value={(activity.securityMeasures as SecurityMeasures).organizational || undefined} />
                            <InfoRow label="มาตรการเชิงเทคนิค (Technical)" value={(activity.securityMeasures as SecurityMeasures).technical || undefined} />
                            <InfoRow label="มาตรการทางกายภาพ (Physical)" value={(activity.securityMeasures as SecurityMeasures).physical || undefined} />
                            <InfoRow label="การควบคุมการเข้าถึงข้อมูล (Access Control)" value={(activity.securityMeasures as SecurityMeasures).accessControl || undefined} />
                            <InfoRow label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" value={(activity.securityMeasures as SecurityMeasures).userResponsibility || undefined} />
                            <InfoRow label="มาตรการตรวจสอบย้อนหลัง (Audit Trail)" value={(activity.securityMeasures as SecurityMeasures).auditTrail || undefined} />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pb-6">
                    <button onClick={() => router.back()} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">กลับ</button>
                    {(activity.status === 'DRAFT' || activity.status === 'REJECTED') && (
                        <button
                            onClick={() => router.push(`/ropa/edit/${activity.id}`)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition text-white ${activity.status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#203690] hover:bg-[#182a73]'}`}>
                            {activity.status === 'REJECTED' ? 'แก้ไขและส่งใหม่' : 'แก้ไข'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
