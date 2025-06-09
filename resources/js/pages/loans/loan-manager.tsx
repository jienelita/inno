import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Alert, Button, Dropdown, message, Modal, Popconfirm, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { getLoanCodeFilters, modeMap, getStatusTag, loanCode, statusOptions, statusFilterOptions, permissionMap } from '@/lib/helpers'
import { Eye, Trash2 } from 'lucide-react';
import { DownOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { usePermission } from '@/hooks/usePermission';

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
    name: string;
    user_id: number;
}
interface LoanRecord {
    id: number;
    loan_details: string; // JSON string
    loan_code: number;
    status: number;
    reason: string;
    name: string;
    payment_mode: string;
    user_id: number;
    acc_status: number;
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
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [reasonText, setReasonText] = useState('');
    const [selectedLoan, setSelectedLoan] = useState<{ loanId: number; status: number } | null>(null);

    const { loan } = usePage().props as unknown as {
        loan: {
            data: LoanRecord[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            name: string;
        };
    };
    
    const { data, setData, post, get, processing, reset } = useForm({
        reason: '',
        status: 2,
    });
    const [isDisapproveModalOpen, setIsDisapproveModalOpen] = useState(false);
    const [disapproveReason, setDisapproveReason] = useState('');
    const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
    const handleTableChange: TableProps<LoanRecord>['onChange'] = (pagination, filters, sorter, extra) => {
        let sortField: string | undefined;
        let sortOrder: string | undefined;
        if (!Array.isArray(sorter)) {
            sortField = sorter.field as string;
            sortOrder =
                sorter.order === 'ascend'
                    ? 'asc'
                    : sorter.order === 'descend'
                        ? 'desc'
                        : undefined;
        }
        if (!Array.isArray(sorter)) {
            sortField = sorter.field as string;
            sortOrder = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : undefined;
        }
        const statusSet = Array.isArray(filters.status) ? filters.status : undefined;
        const searchLoanAmount = (filters.loan_amount as string[])?.[0];
        const loanAmount = Array.isArray(filters.loan_amount) ? filters.loan_amount : undefined;
        const userIds = Array.isArray(filters.applicantId) ? filters.applicantId : undefined;
        const query: Record<string, any> = {
            page: pagination.current,
            loan_amount: loanAmount,
            sort_field: sortField,
            sort_order: sortOrder,
            statusSetData: statusSet,
            user_id: userIds
        };
        const queryString = new URLSearchParams();
        Object.entries(query)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => queryString.append(`${key}[]`, v));
                } else {
                    queryString.append(key, value);
                }
            });
        get(`/loan-manager?${queryString}`, {
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
    const applicantFilters = Array.from(
        new Map(loan.data.map(item => [item.user_id, item.name])).entries()
    ).map(([user_id, name]) => ({
        text: name,
        value: user_id,
    }));

    const { hasPermission } = usePermission();
    const filteredStatusOptions = statusOptions?.filter((item) => {
        const perm = permissionMap[String(item?.key)];
        if (perm) {
            return hasPermission(perm[0], perm[1]);
        }
        return true;
    });

    const columns: TableColumnsType<LoanRecord> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'LoanId',
            render: (_: any, record: LoanRecord) => record.id,
        },
        {
            title: 'Applicant',
            dataIndex: 'user_id',
            key: 'applicantId',
            filters: applicantFilters,
            filterSearch: true,
            render: (_: any, record: LoanRecord) => record.name,
        },
        {
            title: 'Loan Code',
            dataIndex: 'loan_code',
            key: 'loanApplication',
            filters: getLoanCodeFilters(),
            filterSearch: true,
            onFilter: (value, record) => record.loan_code === value,
            render: (loan_code: number) => loanCode[loan_code] ?? 'Unknown',
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
            key: 'paymentMode',
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
            filters: statusFilterOptions, // e.g. { text: 'Approved', value: 1 }
            filterSearch: true,
            render: (_: any, record: LoanRecord) => {
                const { statusText, tagColor } = getStatusTag(record.status);
                const isDanger = tagColor === 'red';    // Disapproved
                const isWarning = tagColor === 'gold';  // Pending
                const handleMenuClick = (loanId: number) => (e: any) => {
                    const newStatus = parseInt(e.key);
                    if (newStatus === 2 || newStatus === 4) {
                        //setSelectedLoanId(loanId);
                        setSelectedLoan({ loanId, status: newStatus });
                        setIsDisapproveModalOpen(true);
                    } else {
                        post(`/loan-update-status/${newStatus}/${loanId}`, {
                            preserveState: true,
                            preserveScroll: true,
                            replace: true,
                            onSuccess: (page) => {
                                const res = page.props as any;
                                if (res.status > 1) {
                                    message.error(`${res.message}`);
                                } else {
                                    message.success(`${res.message}`);
                                }
                            },
                        });
                    }
                };
                const menuProps = {
                    items: filteredStatusOptions,
                    onClick: handleMenuClick(record.id),
                };
                
                const canShowDropdown =
                    (hasPermission('loan-manager', 'approved') &&
                        hasPermission('loan-manager', 'disapproved')) ||
                    user.is_admin === 3 ||
                    record.status !== 2;

                const shouldShowDropdown =
                    user.is_admin === 3 || // ✅ force show dropdown for admin
                    (record.status > 0 && record.acc_status > 0) ||
                    (!hasPermission('loan-manager', 'approved') &&
                        !hasPermission('loan-manager', 'disapproved'));

                const showSuccessTagInstead =
                    record.status === 1 &&
                    !hasPermission('loan-manager', 'approved') &&
                    user.is_admin !== 3; // ✅ don't show success tag for admin

                return (
                    <>
                        {(filteredStatusOptions?.length ?? 0) > 0 && (
                            <>
                                {canShowDropdown ? (
                                    showSuccessTagInstead ? (
                                        <Tag color="success">{statusText}</Tag>
                                    ) : shouldShowDropdown ? (
                                        <Dropdown
                                            menu={{ items: filteredStatusOptions, onClick: handleMenuClick(record.id) }}
                                            trigger={['click']}
                                        >
                                            <Button
                                                size="small"
                                                type={!isWarning && !isDanger ? 'primary' : 'default'}
                                                danger={isDanger}
                                                className={isWarning ? 'bg-yellow-400 text-black border-none hover:bg-yellow-500' : ''}
                                            >
                                                {statusText} <DownOutlined />
                                            </Button>
                                        </Dropdown>
                                    ) : (
                                        <Alert
                                            type="error"
                                            message={
                                                record.status === 0
                                                    ? 'Pending, please wait for validation'
                                                    : 'Validated but not yet confirmed from accounting'
                                            }
                                        />
                                    )
                                ) : (
                                    <Tag color={tagColor}>{statusText}</Tag>
                                )}
                            </>
                        )}
                    </>
                );
            },
        },
        {
            title: 'Payment Mode',
            dataIndex: 'loan_details',
            key: 'paymentMode',
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
            width: 100,
            render: (_: any, record: LoanRecord) => (
                <>
                    <div className='flex '>
                        <Link href={`/loan/view/${record.id}`} className="text-link cursor-auto"><Eye className='w-5 h-5 me-2'></Eye></Link>
                        {user.is_admin === 3 && (
                            <span className='cursor-pointer'>
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
                                        <Trash2 className='w-5 h-5 text-amber-800'></Trash2>
                                    </Tooltip>
                                </Popconfirm>
                            </span>
                        )}
                    </div>
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
            <Modal
                title={
                    selectedLoan?.status === 2
                        ? 'Reason for Disapproval'
                        : 'Reason for Reject.'
                }
                open={isDisapproveModalOpen}
                onOk={() => {
                    // if (!selectedLoanId) return;
                    // post(`/loan-update-reason/${selectedLoanId}`, {
                    if (!selectedLoan?.loanId) return;
                    post(`/loan-update-reason/${selectedLoan?.loanId}/${selectedLoan?.status}`, {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onSuccess: (page) => {
                            const res = page.props as any;
                            if (res.status > 1) {
                                message.error(res.message);
                            } else {
                                message.success(res.message);
                            }
                            setIsDisapproveModalOpen(false);
                            reset(); // clear form
                        },
                    });
                }}
                onCancel={() => {
                    setIsDisapproveModalOpen(false);
                    setDisapproveReason('');
                }}
                okText="Submit"
                cancelText="Cancel">
                <TextArea
                    rows={4}
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Please provide a reason for disapproval..."
                />
            </Modal>
        </AppLayout>
    )
}