import React from 'react'
import Balance from '../components/Balance';
import BankingPageLayout from '../components/BankingPageLayout';

function page() {
    return (
        <BankingPageLayout>
            <Balance />
        </BankingPageLayout>
    )
}

export default page