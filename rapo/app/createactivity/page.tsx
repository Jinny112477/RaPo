"use client";
import { useState } from "react";

export default function CreateActivityPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Activity</h1>

      {step === 1 && (
        <div>
          <input placeholder="Activity Name" className="border p-2 mb-2 w-full" />
          <button onClick={() => setStep(2)} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>Processing...</p>
          <button onClick={() => setStep(3)} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Accept Terms</p>
          <button onClick={() => setStep(4)} className="bg-green-500 text-white px-4 py-2 rounded">Accept</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <p>Saved!</p>
        </div>
      )}
    </div>
    );
}