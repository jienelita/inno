import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import NetCash from '@/components/loan/netCash';
import Lad from '@/components/loan/lad';
import Apl from '@/components/loan/apl';

const onChange = (key: string) => {
    //console.log(key);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Loans',
        href: '/loans',
    },
    {
        title: 'Calculator',
        href: '/loans-calculator',
    },
];
export default function Calculator() {
    const props = usePage().props as {
        account_balance?: {
            id: number;
            cid: string;
            net_cash: string;
            la_capital_share: string;
            apl_ca: string;
        };
        gallery?: { image_name: string; image_path: string }[];
    };
    const account_balance = props.account_balance;
    const gallery = props.gallery;

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Net Cash',
            children: <NetCash balance={account_balance} gallery={gallery} />,
            
        },
        {
            key: '2',
            label: 'LAD',
            children: <Lad balance={account_balance} gallery={gallery} />,
        },
        {
            key: '3',
            label: 'APL (CA)',
            children: <Apl balance={account_balance} gallery={gallery} />,
        },
        // {
        //     key: '4',
        //     label: 'Appliance Loan',
        //     children: <ApplianceLoan />,
        // },
        // {
        //     key: '5',
        //     label: 'Salary Loan',
        //     children: <SalaryLoan />,
        // },
        // {
        //     key: '6',
        //     label: 'Production Loan',
        //     children: <ProductionLoan />,
        // }

    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Calculator" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4 dark:text-white/90">
                        <Tabs defaultActiveKey="1" items={items} onChange={onChange}/>
                    </div >
                </div >
            </div >
        </AppLayout >
    )
}
