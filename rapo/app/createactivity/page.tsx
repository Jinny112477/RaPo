"use client"

import { useState } from "react"

export default function CreateActivityPage() {
  const [form, setForm] = useState({
    name: "",
    department: "",
    purpose: "",
    legalBasis: "",
    status: "DRAFT",
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    console.log(form)
    alert("บันทึกสำเร็จ (mock)")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-black rounded-md p-6 space-y-6"
      >

        {/* SECTION 1 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            1. ข้อมูลกิจกรรม
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-gray-600">ชื่อกิจกรรม *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-black px-3 py-2 rounded mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">ฝ่าย/หน่วยงาน *</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border border-black px-3 py-2 rounded mt-1 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-600">
                วัตถุประสงค์ในการประมวลผลข้อมูล *
              </label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="w-full border border-black px-3 py-2 rounded mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">
                ฐานกฎหมาย (Legal Basis) *
              </label>
              <select
                name="legalBasis"
                value={form.legalBasis}
                onChange={handleChange}
                className="w-full border border-black px-3 py-2 rounded mt-1 text-sm"
              >
                <option value="">เลือก</option>
                <option value="CONSENT">Consent</option>
                <option value="CONTRACT">Contract</option>
                <option value="LEGAL">Legal Obligation</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">สถานะ</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-black px-3 py-2 rounded mt-1 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-black rounded text-sm"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-900 text-white rounded text-sm"
          >
            บันทึก
          </button>
        </div>

      </form>
    </div>
  )
}