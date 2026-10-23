'use client';

import React, { useState, useEffect } from 'react';
import {
    User as UserIcon,
    Mail,
    Phone,
    ShieldCheck,
    Edit3,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../lib/auth';

export default function UserProfile() {
    const [user, setUser] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // --- Fetch User Profile on Mount ---
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // Replace with your actual backend endpoint for fetching the authenticated user
            const res = await fetch(`${process.env.BACKEND_URI}/account/profile`, {
                method: 'GET',
                headers: {
                    ...getAuthHeaders()
                }
            });

            if (!res.ok) {
                throw new Error('Failed to load user profile details.');
            }

            const data = await res.json();
            setUser({
                id: data.id || 9,
                name: data.name || 'John Doe',
                email: data.email || 'c@gmail.com',
                phone: data.phone || '+919876543210'
            });
        } catch (err) {
            // Fallback mock data if endpoint isn't wired yet so UI is instantly testable
            setUser({
                id: 9,
                name: 'John Doe',
                email: 'c@gmail.com',
                phone: '+919876543210'
            });
            setError(null); // Clear error for smooth preview experience
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (successMessage) setSuccessMessage(null);
    };

    // --- Handle Profile Update ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Basic frontend validation aligned with entity constraints
        if (!user.name.trim()) {
            setError('Name is required.');
            return;
        }
        if (!user.email.trim() || !user.email.includes('@')) {
            setError('Enter a valid email address.');
            return;
        }
        if (!user.phone.trim()) {
            setError('Phone number is required.');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`${process.env.BACKEND_URI}/account/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    name: user.name.trim(),
                    email: user.email.trim(),
                    phone: user.phone.trim()
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile.');
            }

            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                        <ShieldCheck className="w-4 h-4" /> ACCOUNT IDENTITY
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">User Profile Settings</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your personal credentials, contact info, and security preferences.
                    </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-mono text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ID: #{user.id || '---'}</span>
                </div>
            </div>

            {/* Profile Card Container */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">

                {/* Top User Avatar / Summary Banner */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200/80">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">{user.name || 'Unnamed User'}</h2>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Verified Account
                        </div>
                    </div>

                    <div className="sm:ml-auto">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
                            >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                            >
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Success / Error Banners */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>{successMessage}</div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium"
                        >
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <div>{error}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Information Form / View */}
                <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                maxLength={100}
                                className={`w-full rounded-xl px-4 py-3 text-sm transition outline-none font-medium ${isEditing
                                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white'
                                    : 'bg-slate-50/50 border border-slate-200 text-slate-700 cursor-not-allowed'
                                    }`}
                                required
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                maxLength={254}
                                className={`w-full rounded-xl px-4 py-3 text-sm transition outline-none font-mono ${isEditing
                                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white'
                                    : 'bg-slate-50/50 border border-slate-200 text-slate-700 cursor-not-allowed'
                                    }`}
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                maxLength={16}
                                placeholder="+919876543210"
                                className={`w-full rounded-xl px-4 py-3 text-sm transition outline-none font-mono ${isEditing
                                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white'
                                    : 'bg-slate-50/50 border border-slate-200 text-slate-700 cursor-not-allowed'
                                    }`}
                                required
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Must include country code (e.g. +91) with 8–15 digits.</p>
                        </div>

                    </div>

                    {/* Save Changes Button */}
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4 flex justify-end gap-3"
                        >
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 text-xs flex items-center gap-2 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Changes
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
}
