'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  activityId: string
}

export default function RopaDPForm({ activityId }: Props) {
  const router = useRouter()

  const [form, setForm] = useState({
    processingName: '',
    purpose: '',
    dataSubject: '',
    dataCategory: '',
    legalBasis: '',
    retention: '',
    recipient: '',
    security: ''
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    const payload = {
      id: Date.now().toString(),
      activityId,
      ...form
    }

    console.log('SAVE DP', payload)

    alert('DP Form saved (mock)')
    router.back()
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">
        Create Data Processing
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Activity ID: {activityId}
      </p>

      <div className="bg-white border rounded-xl p-6 space-y-5">

        <div>
          <label className="text-sm font-medium">Processing Name</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.processingName}
            onChange={(e) => handleChange('processingName', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Purpose</label>
          <textarea
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Data Subject</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.dataSubject}
              onChange={(e) => handleChange('dataSubject', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data Category</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.dataCategory}
              onChange={(e) => handleChange('dataCategory', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Legal Basis</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.legalBasis}
            onChange={(e) => handleChange('legalBasis', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Retention Period</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.retention}
              onChange={(e) => handleChange('retention', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Recipient</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.recipient}
              onChange={(e) => handleChange('recipient', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Security Measures</label>
          <textarea
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.security}
            onChange={(e) => handleChange('security', e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="bg-[#203690] text-white px-5 py-2 rounded-lg hover:bg-[#182a73]"
          >
            Save DP
          </button>

          <button
            onClick={() => router.back()}
            className="border px-5 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}