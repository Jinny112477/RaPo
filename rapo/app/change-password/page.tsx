"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // GET: Profiles
    useEffect(() => {
        const check = async () => {
            const res = await fetch("http://localhost:5001/api/me", {
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

            await fetch("http://localhost:5001/api/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ password }),
            });

            // Event Force to signout then login again
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white w-[420px] rounded-xl shadow-lg overflow-hidden">
                <div className="bg-black text-white px-6 py-3 text-sm font-medium">
                    Change Password
                </div>
                <div className="p-6 space-y-4">
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
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#203690]"
                        />
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-4 py-2 bg-[#203690] text-white rounded-lg text-sm hover:bg-[#182a73] disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}