"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

export default function ChangePasswordPage() {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // GET: Profiles
    useEffect(() => {
        const check = async () => {
            const res = await fetch(`${API_URL}/api/me`, {
                headers: {
                    Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                }
            });

            const data = await res.json();

            if (data.mustChangePassword) {
                router.replace("/change-password");
            } else {
                router.replace("/dashboard");
            }
        };

        check();
    }, []);

    // PUT: handle change password
    const handleChangePassword = async () => {
        setError("");

        if (!password || !confirmPassword)
            return setError("All fields are required.");

        if (password.length < 6)
            return setError("Password must be at least 6 characters.");

        if (password !== confirmPassword)
            return setError("Passwords do not match.");

        setLoading(true);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                throw new Error("Session not found. Please login again.");
            }

            const res = await fetch(`${API_URL}/api/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to change password");
            }

            // ✅ success
            await supabase.auth.signOut();
            router.replace("/login");

        } catch (err: any) {
            console.error("CHANGE PASSWORD ERROR:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1e3a6e] flex items-center justify-center">
            <div className="bg-white w-[420px] rounded-xl shadow-lg overflow-hidden">
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"></div>
                <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                    <h1 className="text-xl font-semibold text-slate-800 mb-0.5">Update your Password</h1>
                    <p className="text-sm text-gray-500">
                        For security reasons, you must change your password before continuing.
                    </p>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                            {success}
                        </div>
                    )}
                </div>
                <div className="p-6 space-y-4">
                    <div className="relative">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                            NEW PASSWORD
                        </label>

                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPw((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/60 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <EyeIcon open={showPw} />
                        </button>
                    </div>
                    <div className="relative">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">CONFIRM PASSWORD</label>
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPw((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/60 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <EyeIcon open={showPw} />
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-4 py-2 bg-[#203690] text-white rounded-lg text-sm hover:bg-[#182a73] disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}