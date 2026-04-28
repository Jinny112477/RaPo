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

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login");
                return;
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("password_change")
                .eq("user_id", user.id)
                .single();

            // Already changed password → go to dashboard
            if (profile?.password_change === true) {
                router.replace("/dashboard");
            }
        };
        check();
    }, []);

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");

        if (!password || !confirmPassword) return setError("All fields are required.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");
            const userId = user.id;

            // Step 1: Update the DB flag FIRST (before password change kills the session)
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ password_change: true })
                .eq("user_id", userId);
            if (profileError) throw profileError;

            // Step 2: Verify it saved
            const { data: verified } = await supabase
                .from("profiles")
                .select("password_change")
                .eq("user_id", userId)
                .single();
            if (!verified?.password_change) throw new Error("Failed to save flag. Please try again.");

            // Step 3: NOW update the password (this may invalidate the session)
            const { error: authError } = await supabase.auth.updateUser({ password });
            if (authError) throw authError;

            // Step 4: Sign out cleanly — session is unreliable after password change
            await supabase.auth.signOut();

            // ✅ No setTimeout needed — just redirect directly
            setSuccess("Password updated! Please sign in with your new password.");
            router.replace("/login?changed=true");

        } catch (err: any) {
            console.error("CHANGE PASSWORD ERROR:", err);
            // If password update failed but flag was set, revert the flag
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("profiles")
                    .update({ password_change: false })
                    .eq("user_id", user.id);
            }
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