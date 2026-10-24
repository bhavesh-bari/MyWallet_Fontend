import React from 'react'
import Deposit from '../components/Deposite';
import BankingPageLayout from '../components/BankingPageLayout';

function page() {
    return (
        <BankingPageLayout>
            <Deposit />
        </BankingPageLayout>
    )
}

export default page