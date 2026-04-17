"use client"

import { useState } from "react"
import { Filter } from "lucide-react"

const activities = [
  { id: 1, name: "เก็บข้อมูลนักศึกษา", status: "ACTIVE" },
  { id: 2, name: "สมัครงาน", status: "REVIEW" },
  { id: 3, name: "อบรม", status: "REVIEW" },
  { id: 4, name: "ฝึกงาน", status: "DRAFT" },
]

export default function DashboardPage() {

  // SEARCH
  const [search, setSearch] = useState("")
  // STATUS FILTER
  const [statusFilter, setStatusFilter] = useState("ALL")
  // FILTER DATA
  const filtered = activities.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter
    return matchSearch && matchStatus
  })
  // CALCULATE STATS
  const total = activities.length
  const active = activities.filter(a => a.status === "ACTIVE").length
  const review = activities.filter(a => a.status === "REVIEW").length
  const draft = activities.filter(a => a.status === "DRAFT").length

  // STATS 
  const stats = [
    { title: "ALL ACTIVITIES", value: total, sub: "กิจกรรมทั้งหมด" },
    { title: "ACTIVE", value: active, sub: "กำลังใช้งาน", color: "text-green-600" },
    { title: "REVIEW", value: review, sub: "รอทบทวน", color: "text-red-600" },
    { title: "DRAFT", value: draft, sub: "แบบร่าง", color: "text-gray-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* OVERVIEW */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Overview
        </h1>
        <p className="text-xs text-gray-500">
          ข้อมูล ณ วันที่ 5 เมษายน 2568
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const filterValue =
            s.title === "ALL ACTIVITIES" ? "ALL" : s.title
          const isActive = statusFilter === filterValue

          return (
            <button
              key={s.title}
              onClick={() => setStatusFilter(filterValue)}
              className={`
          group cursor-pointer
          bg-white border rounded-lg px-4 py-3 text-left
          transition-all duration-200
          hover:shadow-md hover:border-blue-400
          ${isActive
                  ? "ring-2 ring-blue-600 border-blue-600 shadow-sm"
                  : "border-gray-200"}
        `}
            >
              <div className="flex justify-between items-start">
                <p className="text-[11px] text-gray-500 group-hover:text-blue-600">
                  {s.title}
                </p>
                {/* <span className="text-[10px] text-gray-300 group-hover:text-blue-500">
  ⌕
</span> */}
<span
  className="
    p-1
    rounded-md
    border
    border-gray-200
    text-gray-400
    group-hover:text-blue-600
    group-hover:border-blue-400
    transition
  "
>
  <Filter size={12} />
</span>
    
              </div>

              <p className={`text-xl font-semibold mt-1 ${s.color || "text-gray-900"}`}>
                {s.value}
              </p>             
              <p className="text-[11px] text-gray-400">{s.sub}</p>
            </button>
          )
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              กิจกรรมล่าสุด
            </h2>
            <p className="text-xs text-gray-500">
              แสดงรายการกิจกรรมการประมวลผลข้อมูล
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-medium">ชื่อกิจกรรม</th>
              <th className="px-6 py-3 text-left font-medium">วัตถุประสงค์</th>
              <th className="px-6 py-3 text-left font-medium">ฐานกฎหมาย</th>
              <th className="px-6 py-3 text-left font-medium">ผู้รับข้อมูล</th>
              <th className="px-6 py-3 text-left font-medium">สถานะ</th>
              <th className="px-6 py-3 text-left font-medium">จัดการ</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700">
            {filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50 transition">

                <td className="px-6 py-4 font-medium text-gray-900">
                  {a.name}
                </td>

                <td className="px-6 py-4 text-gray-500">-</td>
                <td className="px-6 py-4 text-gray-500">-</td>
                <td className="px-6 py-4 text-gray-500">-</td>

                {/* STATUS BADGE */}
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium
              ${a.status === "ACTIVE" && "bg-green-100 text-green-700"}
              ${a.status === "REVIEW" && "bg-yellow-100 text-yellow-700"}
              ${a.status === "DRAFT" && "bg-gray-100 text-gray-600"}
            `}
                  >
                    {a.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-400">
                  -
                </td>

              </tr>
            ))}
          </tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-400">
                ไม่พบข้อมูลกิจกรรม
              </td>
            </tr>
          )}
        </table>

      </div>
    </div>
  )
}