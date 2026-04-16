"use client"

import { useState } from "react"

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
      <div className="bg-white border border-black px-5 py-4 rounded-b-md mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-1">Overview</p>
        <p className="text-[11px] text-gray-500 mb-4">
          ข้อมูล ณ วันที่ 5 เมษายน 2568
        </p>

        <div className="grid grid-cols-5 gap-2 text-[11px]">
          <div className="bg-gray-50 px-2 py-2 rounded border text-center text-black">DATA CONTROLLER</div>
          <div className="bg-gray-50 px-2 py-2 rounded border text-center text-black">DATA PROCESSOR</div>
          <div className="bg-gray-50 px-2 py-2 rounded border text-center text-black">DPO</div>
          <div className="bg-gray-50 px-2 py-2 rounded border text-center text-black">Personal Data Act</div>
          <div className="bg-gray-50 px-2 py-2 rounded border text-center text-black">LAST EDIT</div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.title} className="bg-white border border-black rounded-md px-4 py-3">
            <p className="text-[11px] text-black">{s.title}</p>
            <p className={`text-xl font-semibold ${s.color || "text-black"}`}>
              {s.value}
            </p>
            <p className="text-[11px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-black rounded-md overflow-hidden">
        <div className="flex gap-2 px-4 py-2 border-b">
          {["ALL", "ACTIVE", "REVIEW", "DRAFT"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded border transition
        ${statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
                }
      `}
            >
              {s}
            </button>
          ))}
        </div>
        {/* HEADER + SEARCH */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <p className="text-sm font-semibold text-gray-700">กิจกรรมล่าสุด</p>

          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหากิจกรรม"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1.5 text-sm w-56 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1.5 text-black text-sm"></span>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-100 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-2 text-left">วัตถุประสงค์</th>
              <th className="px-4 py-2 text-left">ฐานกฎหมาย</th>
              <th className="px-4 py-2 text-left">ผู้รับข้อมูล</th>
              <th className="px-4 py-2 text-left">สถานะ</th>
              <th className="px-4 py-2 text-left">จัดการ</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700">
            {filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">-</td>

                <td className={`px-4 py-3 font-medium
                  ${a.status === "ACTIVE" && "text-green-600"}
                  ${a.status === "REVIEW" && "text-yellow-600"}
                  ${a.status === "DRAFT" && "text-gray-500"}
                `}>
                  {a.status}
                </td>

                <td className="px-4 py-3"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}