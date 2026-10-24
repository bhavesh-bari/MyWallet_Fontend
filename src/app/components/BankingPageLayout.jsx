'use client';

import Navbar from './Navbar';

export default function BankingPageLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="pt-8">{children}</main>
        </div>
    );
}
