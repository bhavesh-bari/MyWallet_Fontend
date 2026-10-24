import React from 'react'
import Profile from '../components/Profile';
import BankingPageLayout from '../components/BankingPageLayout';

function page() {
    return (
        <BankingPageLayout>
            <Profile />
        </BankingPageLayout>
    )
}

export default page