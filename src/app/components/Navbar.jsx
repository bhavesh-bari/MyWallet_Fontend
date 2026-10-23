'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuthSession } from '../lib/auth';
import {
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    History,
    User,
    LogOut,
    ChevronDown,
    Menu,
    X,
    ShieldCheck,
    Bell,
    Sparkles,
    CreditCard,
    Copy,
    Check
} from 'lucide-react';

export default function Navbar({
    activeAccount = 'ACC109',
    userName = 'Bhavesh Bari',
    onActionSelect
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const profileRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const quickActions = [
        {
            id: 'deposit',
            label: 'Deposit',
            icon: ArrowDownLeft,
            href: '/deposit'
        },
        {
            id: 'withdraw',
            label: 'Withdraw',
            icon: ArrowUpRight,
            href: '/withdraw'
        },
        {
            id: 'transfer',
            label: 'Transfer',
            icon: ArrowRightLeft,
            href: '/transfer'
        },
        {
            id: 'balance',
            label: 'Check Balance',
            icon: Wallet,
            href: '/balance'
        },
        {
            id: 'history',
            label: 'History',
            icon: History,
            href: '/history'
        }
    ];

    const handleActionClick = (actionId) => {
        if (onActionSelect) onActionSelect(actionId);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        clearAuthSession();
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        router.replace('/auth');
    };

    const copyAccountNum = () => {
        navigator.clipboard.writeText(activeAccount);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getInitials = (name) => {
        if (!name) return 'WB';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-2xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* 1. Brand Logo & Security Status */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition duration-300">
                                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition duration-300" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                        MyWallet
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        PRO
                                    </span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-medium tracking-wider flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Encrypted & Secure
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* 2. Desktop Quick Banking Actions */}
                    <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            const isActive = pathname === action.href;

                            return (
                                <Link
                                    key={action.id}
                                    href={action.href}
                                    onClick={() => handleActionClick(action.id)}
                                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-md shadow-indigo-500/20"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`w-4 h-4 z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span className="z-10">{action.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 3. Right Section: Account Pill, Notifications, Profile */}
                    <div className="hidden sm:flex items-center gap-3">

                        {/* Active Account Pill */}
                        <button
                            onClick={copyAccountNum}
                            title="Click to copy account number"
                            className="group bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs transition duration-200"
                        >
                            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] text-slate-400 font-medium leading-none">Active Account</span>
                                <span className="font-mono text-slate-200 font-bold leading-tight flex items-center gap-1">
                                    {activeAccount}
                                    {copied ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                    )}
                                </span>
                            </div>
                        </button>

                        {/* Notification Button */}
                        <button
                            aria-label="Notifications"
                            className="relative p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
                        </button>

                        {/* Profile Dropdown Container */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-1.5 pr-3 transition text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/20">
                                    {getInitials(userName)}
                                </div>
                                <div className="hidden md:block leading-tight">
                                    <span className="block text-xs font-semibold text-slate-200">{userName}</span>
                                    <span className="block text-[10px] text-slate-400">Retail Client</span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown Menu */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs divide-y divide-slate-800/60"
                                    >
                                        <div className="px-3 py-2.5">
                                            <p className="font-bold text-slate-100 text-sm">{userName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-amber-400" /> Premium Member
                                            </p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                                            >
                                                <User className="w-4 h-4 text-indigo-400" />
                                                <span>Profile & Settings</span>
                                            </Link>
                                        </div>

                                        <div className="pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition font-medium"
                                            >
                                                <LogOut className="w-4 h-4 text-rose-400" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 4. Mobile Controls (Notifications + Menu Toggle) */}
                    <div className="flex lg:hidden items-center gap-2">
                        <button
                            aria-label="Notifications"
                            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
                        >
                            <Bell className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* 5. Mobile Drawer Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-4 space-y-4 shadow-inner"
                    >
                        {/* User Account Info Card */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                    {getInitials(userName)}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-100">{userName}</div>
                                    <div className="text-[10px] font-mono text-slate-400">Acc: {activeAccount}</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active
                            </span>
                        </div>

                        {/* Quick Actions Header */}
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                            Quick Operations
                        </div>

                        {/* Quick Operations Action Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                const isActive = pathname === action.href;
                                return (
                                    <Link
                                        key={action.id}
                                        href={action.href}
                                        onClick={() => handleActionClick(action.id)}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition ${isActive
                                                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                        <span>{action.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Settings & Logout */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-slate-300 hover:bg-slate-900 rounded-xl text-xs font-semibold"
                            >
                                <User className="w-4 h-4 text-indigo-400" /> Profile & Security Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold"
                            >
                                <LogOut className="w-4 h-4 text-rose-500" /> Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}