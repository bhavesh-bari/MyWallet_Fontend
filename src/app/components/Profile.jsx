'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    Mail,
    Phone,
    RefreshCw,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';
import { getAuthHeaders } from '../lib/auth';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserProfile = useCallback(async (signal) => {
        try {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (!storedUserInfo) {
                throw new Error('Unable to identify your user account. Please sign in again.');
            }

            let userInfo;
            try {
                userInfo = JSON.parse(storedUserInfo);
            } catch {
                throw new Error('Your saved account information is invalid. Please sign in again.');
            }

            const userId = userInfo?.id;
            const validUserId =
                (typeof userId === 'number' && Number.isSafeInteger(userId) && userId > 0) ||
                (typeof userId === 'string' && /^[1-9]\d*$/.test(userId));

            if (!validUserId) {
                throw new Error('Unable to identify your user account. Please sign in again.');
            }

            const params = new URLSearchParams({ id: String(userId) });
            const response = await fetch(
                `${process.env.BACKEND_URI}/api/auth/profile?${params.toString()}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    signal,
                },
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load your profile.');
            }

            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('The profile response was not in the expected format.');
            }

            return { profile: data, profileError: null };
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                return { profile: null, profileError: null };
            }

            return {
                profile: null,
                profileError: fetchError.message || 'Failed to load your profile.',
            };
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchUserProfile(controller.signal).then(({ profile, profileError }) => {
            if (controller.signal.aborted) {
                return;
            }

            setUser(profile);
            setError(profileError);
            setLoading(false);
        });

        return () => controller.abort();
    }, [fetchUserProfile]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchUserProfile().then(({ profile, profileError }) => {
            setUser(profile);
            setError(profileError);
            setLoading(false);
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-6">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="ml-auto px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                        <ShieldCheck className="w-4 h-4" /> ACCOUNT IDENTITY
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Your account information.
                    </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-mono text-slate-300">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ID: #{user.id}</span>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-200/80">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">
                            {user.name || 'Unnamed User'}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Full Name
                        </div>
                        <p className="text-sm font-medium text-slate-900">{user.name || '—'}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                        </div>
                        <p className="text-sm font-mono text-slate-900">{user.email || '—'}</p>
                    </div>

                    <div className="md:col-span-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                        </div>
                        <p className="text-sm font-mono text-slate-900">{user.phone || '—'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
