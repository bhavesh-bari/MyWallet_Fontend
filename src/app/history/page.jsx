import React from 'react'
import TransactionHistory from '../components/Transactions';
import BankingPageLayout from '../components/BankingPageLayout';

function page() {
    return (
        <BankingPageLayout>
            <TransactionHistory />
        </BankingPageLayout>
    )
}

export default page