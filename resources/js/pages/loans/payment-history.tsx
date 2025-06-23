import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Button, Col, message, Modal, Popconfirm, Row, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { BookCheck, CircleArrowOutUpRight, Coins, EyeIcon, HandCoins, Vibrate } from 'lucide-react';
import { loanCodeMap, getLoanCodeFilters, modeMap, getStatusTag, PrefixCode } from '@/lib/helpers'
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payment History', href: '/payment-history' },
];

type Account = {
    id: number;
    cid: number;
    account_no: string;
    br_code: number;
    balance: string;
    prefix: number;
    accid: number;
    members_id: number;
    is_balance: number;
    chd: number;
}

interface Props {
    account: Account[];
}
interface PaymentRecord {
    cid: number,
    recid: number,
    acc_no: number,
    chd: number,
    trn: number,
    trn_desc: string,
    trn_mode: string,
    trn_amount: string,
    balance_amount: string,
    trn_date: string,
}

export default function PaymentHistory({ account }: Props) {
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[] | null>(null);
    const [activeAccId, setActiveAccId] = useState<number | null>(null);

    const LoadRecords = async (accountNo: string, cid: number) => {
        try {
            const res = await fetch(`/account-history/${accountNo}/${cid}`);
            const data = await res.json();
            setPaymentHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };
    // if (paymentHistory !== null) {
    const columns = [
        {
            title: 'Balance Amount',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
        },
        {
            title: 'Transaction Amount',
            dataIndex: 'trn_amount',
            key: 'trn_amount',
            // render: (balance_amount: number) => `₱${balance_amount.toFixed(2)}`,
        },
        {
            title: 'Description',
            dataIndex: 'trn_desc',
            key: 'trn_desc',
        },
        {
            title: 'Transaction Date',
            dataIndex: 'trn_date',
            key: 'trn_date',
            render: (date: string) => {
                const options: Intl.DateTimeFormatOptions = {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                };
                return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
            },
        },
    ];
    //   }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4">
                        <Row gutter={[16, 16]}>
                            <Col span={7}>
                                {account.map((acc) => (
                                    <div key={acc.id} className={`flex items-center justify-between border border-border rounded-xl gap-2 px-4 py-4 mb-2 ${activeAccId === acc.id ? 'bg-yellow-100 border-yellow-400' : 'bg-secondary-transparent'}`}>
                                        <div className="flex items-center gap-3.5">
                                            {PrefixCode(acc.accid)}
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-mono hover:text-primary mb-px">
                                                    {acc.account_no.trim()}-{acc.chd}
                                                </div>
                                                <span className="text-sm text-secondary-foreground">
                                                    {acc.prefix}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <span className="kt-badge kt-badge-sm kt-badge-success kt-badge-outline">
                                                <Button
                                                    type="dashed"
                                                    onClick={() => {
                                                        setActiveAccId(acc.id); // ✅ mark as active
                                                        LoadRecords(acc.account_no.trim(), acc.cid);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </Col>
                            <Col span={17}>
                                {paymentHistory !== null && (
                                    <>
                                        <div className="border border-border rounded-xl gap-2 px-4 py-4 bg-secondary-transparent mb-2">
                                            <Table
                                                dataSource={paymentHistory}
                                                columns={columns}
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                            />
                                        </div>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

        </AppLayout>
    )
}
