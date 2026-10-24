import React from 'react'
import Withdraw from '../components/Withdraw';
import BankingPageLayout from '../components/BankingPageLayout';

function page() {
    return (
        <BankingPageLayout>
            <Withdraw />
        </BankingPageLayout>
    )
}

export default page