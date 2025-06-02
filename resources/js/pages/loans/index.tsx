import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button, message, Modal, Popconfirm, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { BookCheck, EyeIcon, Vibrate } from 'lucide-react';
import { loanCodeMap, getLoanCodeFilters, modeMap, getStatusTag } from '@/lib/helpers'
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Loans',
        href: '/loans',
    },
];

interface LoanDetails {
    loan_amount: string;
    payment_mode: string;
    term: string;
    netProceeds: string;
}

interface LoanRecord {
    id: number;
    loan_details: string; // JSON string
    loan_code: number;
    status: number; // 👈 NEW
    reason: string; //
    payment_mode: string;
}
type User = {
    id: number;
    name: string;
    email: string;
    is_admin: number;
};

type PageProps = {
    auth: {
        user: User;
    };
};
export default function Index() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const { post, get } = useForm();
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [reasonText, setReasonText] = useState('');
    const { loan } = usePage().props as unknown as {
        loan: {
            data: LoanRecord[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };

    const handleTableChange: TableProps<LoanRecord>['onChange'] = (pagination, filters, sorter, extra) => {
        let sortField: string | undefined;
        let sortOrder: string | undefined;

        if (!Array.isArray(sorter)) {
            sortField = sorter.field as string;
            sortOrder = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined;
        }
        const searchLoanAmount = (filters.loan_amount as string[])?.[0];

        const query: Record<string, any> = {
            page: pagination.current,
            loan_amount: searchLoanAmount,
            sort_field: sortField,
            sort_order: sortOrder,
        };

        const queryString = new URLSearchParams(
            Object.entries(query)
                .filter(([_, v]) => v !== undefined && v !== null && v !== '')
                .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
        ).toString();

        get(`/loans?${queryString}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['loan'],
        });
    };

    const confirmDelete = (id: number) => {
        post(`/loans/delete/${id}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: (page) => {
                const res = page.props as any;
                
                if (res.status === 1) {
                    message.error(`${res.message}`);
                } else {
                    message.success(`${res.message}`);
                }
            },
        });
    };

    const cancelDelete = () => {
        message.info('Delete cancelled');
    };

    const columns: TableColumnsType<LoanRecord> = [
        {
            title: 'Loan Application',
            dataIndex: 'loan_code',
            key: 'loanApplication',
            filters: getLoanCodeFilters(),
            filterSearch: true,
            onFilter: (value, record) => record.loan_code === value,
            render: (loan_code: number) => loanCodeMap[loan_code] ?? 'Unknown',
        },
        {
            title: 'Loan Amount',
            dataIndex: 'loan_details',
            key: 'loan_amount',
            filterSearch: true,
            filters: Array.from(new Set(loan.data.map(item => {
                try {
                    const details = JSON.parse(item.loan_details);
                    return details.loan_amount;
                } catch {
                    return null;
                }
            }))).filter(Boolean).map(amount => ({
                text: `₱ ${parseFloat(amount!).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                value: amount!,
            })),
            onFilter: (value, record) => {
                try {
                    const details = JSON.parse(record.loan_details);
                    return details.loan_amount.startsWith(value);
                } catch {
                    return false;
                }
            },
            render: (loan_details: string) => {
                const details: LoanDetails = JSON.parse(loan_details);
                return `₱ ${parseFloat(details.loan_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            },
        },
        {
            title: 'Net Proceeds',
            dataIndex: 'loan_details',
            key: 'aymentMode',
            sorter: (a, b) => {
                const d1 = JSON.parse(a.loan_details);
                const d2 = JSON.parse(b.loan_details);
                return parseFloat(d1.netProceeds) - parseFloat(d2.netProceeds);
            },
            render: (loan_details: string) => {
                const details: LoanDetails = JSON.parse(loan_details);
                return `₱ ${parseFloat(details.netProceeds).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_: any, record: LoanRecord) => {
                const { tagColor, statusText } = getStatusTag(record.status);
                return (
                    <div className="flex items-center gap-1">
                        <Tag color={tagColor}>{statusText}</Tag>
                    </div>
                );
            },
        },
        {
            title: 'Payment Mode',
            dataIndex: 'loan_details',
            key: 'paymentMode', // 🔁 use a unique key name
            sorter: (a, b) => {
                const d1 = JSON.parse(a.loan_details);
                const d2 = JSON.parse(b.loan_details);
                return parseFloat(d1.netProceeds) - parseFloat(d2.netProceeds);
            },
            render: (loan_details: string) => {
                const details: LoanDetails = JSON.parse(loan_details);
                const paymentMode = parseInt(details.payment_mode);
                const modeLabel = modeMap[paymentMode] ?? 'Unknown';
                return modeLabel;
            },
        },
        {
            title: 'Term (Months)',
            dataIndex: 'loan_details',
            key: 'term',
            sorter: (a, b) => {
                const d1 = JSON.parse(a.loan_details);
                const d2 = JSON.parse(b.loan_details);
                return parseInt(d1.term) - parseInt(d2.term);
            },
            render: (loan_details: string, record: LoanRecord, index: number) => {
                const details: LoanDetails = JSON.parse(loan_details);
                return `${details.term} month/s`;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: LoanRecord) => (
                <>
                    <Link href={`/loan/view/${record.id}`} className="text-link mr-4">View</Link>
                    <Popconfirm
                        title="Delete the loan"
                        description="Are you sure you want to delete this loan?"
                        onConfirm={() => confirmDelete(record.id)}
                        onCancel={cancelDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                        disabled={record.status === 1}>
                        <Tooltip title={record.status === 1 ? 'Cannot delete approved loan' : ''}>
                            <Button danger disabled={record.status === 1}>Delete</Button>
                        </Tooltip>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4">
                        <Table<LoanRecord>
                            rowKey="id"
                            dataSource={loan.data}
                            columns={columns}
                            pagination={{
                                current: loan.current_page,
                                pageSize: loan.per_page,
                                total: loan.total,
                            }}
                            onChange={handleTableChange}
                        />
                    </div>
                </div>
            </div>
            <Modal
                title="Disapproval Reason"
                open={isReasonModalOpen}
                onOk={() => setIsReasonModalOpen(false)}
                cancelButtonProps={{ style: { display: 'none' } }}
                okText="Close">
                <p>{reasonText}</p>
            </Modal>
        </AppLayout>
    )
}
