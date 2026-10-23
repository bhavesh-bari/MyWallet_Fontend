'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Navbar from './Navbar';
import AccountSelector from './AccountSelector';
import BalanceCard from './BalanceCard';
import MetricsCard from './MetricsCard';
import RecentTransactionsTable from './RecentTransactionsTable';
import PinModal from './PinModal';
import { getAuthHeaders, getAuthenticatedUserId } from '../lib/auth';

export default function HomePage() {
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  // Balance visibility & caching per account
  const [accountBalances, setAccountBalances] = useState({});

  // PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(null);
  const [userName, setUserName] = useState('User');
  useEffect(() => {
    const fetchAccounts = async () => {
      const userId = getAuthenticatedUserId();
      if (!userId) {
        setAccountsError('Unable to identify your user account. Please sign in again.');
        setAccountsLoading(false);
        return;
      }
      const storedUserInfo = localStorage.getItem('userInfo');

      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          setUserName(userInfo.name || 'User');
        } catch (error) {
          console.error('Invalid userInfo in localStorage:', error);
          setUserName('User');
        }
      }
      try {
        const res = await fetch(
          `${process.env.BACKEND_URI}/account/allaccounts?id=${encodeURIComponent(userId)}`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to load your accounts.');
        if (!Array.isArray(data))
          throw new Error('The accounts response was not in the expected format.');

        const fetchedAccounts = data.map((account) => ({
          accountNumber: account.accountNumber,
          type: account.accountType,
          currency: '₹',
        }));

        setAccounts(fetchedAccounts);
        setSelectedAccount((currentAccount) =>
          fetchedAccounts.some((account) => account.accountNumber === currentAccount)
            ? currentAccount
            : fetchedAccounts[0]?.accountNumber || ''
        );
      } catch (err) {
        setAccountsError(err.message || 'Failed to load your accounts.');
      } finally {
        setAccountsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const controller = new AbortController();
    const fetchRecentTransactions = async () => {
      setTransactionsLoading(true);
      setTransactionsError(null);
      setRecentTransactions([]);

      try {
        const params = new URLSearchParams({
          account: selectedAccount,
          page: '0',
          size: '3',
        });
        const res = await fetch(
          `${process.env.BACKEND_URI}/transaction/history?${params.toString()}`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
            signal: controller.signal,
          }
        );
        const responseText = await res.text();
        let data = null;
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch {
            if (res.ok) {
              throw new Error('The transaction history response was not valid JSON.');
            }
          }
        }

        if (!res.ok) {
          throw new Error(data?.message || `Failed to load recent transactions (${res.status}).`);
        }
        if (!Array.isArray(data?.content)) {
          throw new Error('The transaction history response was not in the expected format.');
        }

        setRecentTransactions(data.content.slice(0, 3));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setTransactionsError(err.message || 'Failed to load recent transactions.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setTransactionsLoading(false);
        }
      }
    };

    fetchRecentTransactions();
    return () => controller.abort();
  }, [selectedAccount]);

  const activeAccountData = accounts.find(
    (acc) => acc.accountNumber === selectedAccount
  ) || {
    accountNumber: '',
    type: 'ACCOUNT',
    currency: '₹',
  };

  const activeBalanceState = accountBalances[selectedAccount] || {
    visible: false,
    amount: null,
    loading: false,
  };

  const handleToggleBalanceRequest = () => {
    if (activeBalanceState.visible) {
      setAccountBalances((prev) => ({
        ...prev,
        [selectedAccount]: { ...activeBalanceState, visible: false },
      }));
    } else {
      setPin('');
      setPinError(null);
      setIsPinModalOpen(true);
    }
  };

  const handleExecuteBalanceFetch = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }

    setAccountBalances((prev) => ({
      ...prev,
      [selectedAccount]: { ...activeBalanceState, loading: true },
    }));
    setPinError(null);
    setIsPinModalOpen(false);

    try {
      const res = await fetch(`${process.env.BACKEND_URI}/account/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ account: selectedAccount, pin: pin.trim() }),
      });

      const responseText = await res.text();
      let data = null;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          if (res.ok) {
            throw new Error('The balance response was not valid JSON.');
          }
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('The balance request was unauthorized. Please sign in again and verify the backend accepts the Bearer token for this endpoint.');
        }
        throw new Error(data?.message || `Failed to authorize balance inquiry (${res.status}).`);
      }

      const balance = typeof data === 'number' ? data : Number(data.balance);
      if (!Number.isFinite(balance)) {
        throw new Error('The balance response was not in the expected format.');
      }

      setAccountBalances((prev) => ({
        ...prev,
        [selectedAccount]: {
          visible: true,
          amount: balance,
          loading: false,
        },
      }));
    } catch (err) {
      setAccountBalances((prev) => ({
        ...prev,
        [selectedAccount]: {
          ...activeBalanceState,
          loading: false,
        },
      }));
      setPinError(err.message || 'Failed to authorize balance inquiry.');
      setIsPinModalOpen(true);
    } finally {
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-indigo-500 selection:text-white">
      <Navbar activeAccount={selectedAccount} userName={userName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Header & Account Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 border border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> BCrypt & TransactionTemplate Protected
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white pt-1">
              Welcome back, <span className="text-indigo-400">{userName}</span> 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Manage core banking operations, concurrency locks, and real-time ledger transfers.
            </p>
          </div>

          <AccountSelector
            accounts={accounts}
            loading={accountsLoading}
            error={accountsError}
            selectedAccount={selectedAccount}
            onSelectAccount={setSelectedAccount}
          />
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BalanceCard
            activeAccountData={activeAccountData}
            activeBalanceState={activeBalanceState}
            selectedAccount={selectedAccount}
            onToggleBalance={handleToggleBalanceRequest}
          />
          <MetricsCard />
        </div>

        {/* Recent Transactions Section */}
        <RecentTransactionsTable
          transactions={recentTransactions}
          loading={transactionsLoading}
          error={transactionsError}
        />
      </main>


      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        pin={pin}
        setPin={setPin}
        pinError={pinError}
        onSubmit={handleExecuteBalanceFetch}
        loading={activeBalanceState.loading}
        selectedAccount={selectedAccount}
      />
    </div>
  );
}