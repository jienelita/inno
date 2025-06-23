import AppLayout from '@/layouts/app-layout'
import { Head, router, Link, usePage, useForm } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types';
import { Button, Drawer, Dropdown, Input, message, Modal, Space, Table, TableColumnsType, Tag, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { formatDateTime, memberFilterOptions, memberOptions, membertatusTag, permissionMemberMap, userStatus } from '@/lib/helpers';
import { useState } from 'react';
import { Eye, PencilIcon, RefreshCw } from 'lucide-react';
import UserInformation from '@/components/user/userInformation';
import '@ant-design/v5-patch-for-react-19';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { usePermission } from '@/hooks/usePermission';
import UpdateDatabase from '@/components/user/UpdateDatabase';
import axios from 'axios';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: '/members',
    },
];

// interface Props {
//     user_list: {
//         current_page: number;
//         last_page: number;
//         per_page: number;
//         total: number;
//         data: UserList[];
//     };
// }
interface UserList {
    user_id: number;
    cid: number;
    first_name: string;
    last_name: string;
    name: string;
    bithdate: string;
    phone_number: string;
    created_at: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    is_active: number;
    status: number;
    email: string;
    email_verified_at: string;
}
interface ExpandedDataType {
    key: React.Key;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    is_active: number;
    created_at: string;
    id: number
}
interface DataType {
    key: React.Key;
    cid: number;
    name: string;
    first_name: string;
    last_name: string;
    bithdate: string;
    phone_number: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    is_active: number;
    status: number;
    created_at: string;
    user_id: number;
    email: string;
    email_verified_at: string;
}
interface UserType {
    user_id: number;
    cid: number;
    first_name: string;
    last_name: string;
    bithdate: string;
    phone_number: string;
    created_at: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    is_active: number;
    status: number;
    email: string;
    name: string;
    email_verified_at: string;
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
        message: string;
    };
};
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
function index() {

    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState<{ open: boolean; location: number | null }>({ open: false, location: null });
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    const { user_list } = usePage().props as unknown as {
        user_list: {
            data: UserList[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            name: string;
        };
    };

    const [isDisableModalVisible, setIsDisableModalVisible] = useState(false);
    const [disableReason, setDisableReason] = useState('');
    const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number; status: number } | null>(null);
    const [memberStatusChange, setMemberStatusChange] = useState<{ id: number; status: number } | null>(null);
    const [isMemberModalVisible, setMemberModalVisible] = useState(false);
    const [disapprovedReason, setDisapprovedReason] = useState('');
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const showDrawer = (user: UserType, location: number) => {
        console.log(location);
        setSelectedUser(user);
        setOpen({ open: true, location: location });
        //  setDrawer({ open: true, location: location });
    };
    const onClose = () => {
        setOpen({ open: false, location: 0 });
        setSelectedUser(null);
    };

    const dataSource: DataType[] = user_list.data.map((user) => ({
        key: user.user_id,
        cid: user.cid,
        user_id: user.user_id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        bithdate: user.bithdate,
        phone_number: user.phone_number,
        created_at: user.created_at,
        birth_place: user.birth_place,
        current_address: user.current_address,
        permanent_address: user.permanent_address,
        is_active: user.is_active,
        email: user.email,
        email_verified_at: user.email_verified_at,
        status: user.status
    }));

    const expandColumns: TableColumnsType<ExpandedDataType> = [
        { title: 'Current Address', dataIndex: 'current_address', key: 'current_address' },
        { title: 'Permanent Address', dataIndex: 'permanent_address', key: 'permanent_address' },
        {
            title: 'Submitted at', dataIndex: 'created_at', key: 'created_at',
            render: (value) => formatDateTime(value)
        },

        { //this section should be admin area only.
            title: 'Action',
            key: 'operation',
            render: (_, record) => {
                const dynamicMenu = {
                    items: Object.entries(userStatus).map(([key, { label, color }]) => ({
                        key,
                        label: (
                            <span>
                                <Tag color={color}>{label}</Tag>
                            </span>
                        ),
                    })),
                    onClick: ({ key }: MenuInfo) => {
                        const selectedStatus = Number(key);
                        if (selectedStatus === 2) {
                            setPendingStatusChange({ id: record.id, status: selectedStatus });
                            setIsDisableModalVisible(true);
                        } else {
                            handleStatusChange(record.id, selectedStatus);
                        }
                    }
                };

                return (
                    <Space size="middle">
                        {user.is_admin == 1 || user.is_admin == 3 && (
                            <Dropdown menu={dynamicMenu}>
                                <a onClick={(e) => e.preventDefault()}>
                                    More <DownOutlined />
                                </a>
                            </Dropdown>
                        )}
                    </Space>
                );
            },
        },

    ];
    const { hasPermission } = usePermission();
    const handleStatusChange = async (id: number, status: number, reason?: string) => {
        try {
            router.post(
                '/user-manager/update-status',
                { id, status, reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Status updated!');
                    },
                }
            );
        } catch (error) {
            console.error(error);
            message.error('Something went wrong');
        }
    };
    const handleMemberStatusChange = async (id: number, status: number, reason?: string) => {
        try {
            router.post(
                '/user-manager/member-status',
                { id, status, reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Status updated!');
                    },
                }
            );
        } catch (error) {
            console.error(error);
            message.error('Something went wrong');
        }
    };
    const filteredMemberOptions = memberOptions?.filter((item) => {
        const perm = permissionMemberMap[String(item?.key)];
        if (perm) {
            return hasPermission(perm[0], perm[1]);
        }
        return true;
    });

    const [loadingId, setLoadingId] = useState<number | null>(null);

    const updatemembersDatabase = (userinfo: any) => {
        setLoadingId(userinfo.user_id); // set the loading row's ID
        router.post(
            '/update-user-database',
            {
                records: userinfo
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoadingId(null); // reset when done
                    message.success('Account successfully updated!');
                },
                onError: () => {
                    setLoadingId(null);
                    message.error('Unable to update!');
                }
            }
        );
    };

    const spinStyle = {
        animation: 'spin 1s linear infinite'
    };
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [editedCid, setEditedCid] = useState<number | undefined>(undefined);
    const [data, setData] = useState<DataType[]>(dataSource);

    const saveCid = (userId: number) => {
        console.log(editedCid);
        if (typeof editedCid !== 'number') {
            message.warning('N');
            setEditingKey(null);
            return;
        }

        router.post(
            `/update-cid/${userId}`, // Laravel route
            { cid: editedCid },
            {
                preserveScroll: true,
                onSuccess: (e) => {
                    if (e.props.status === 0) {
                        message.error('Unable to save string, please check your input.');
                    } else if (e.props.status === 1) {
                        message.error('CID already exist. Please double check.');
                    } else {
                        setData((prev) =>
                            prev.map((item) =>
                                item.user_id === userId ? { ...item, cid: editedCid } : item
                            )
                        );
                        setEditingKey(null);
                        message.success('CID updated!');
                    }
                },
                onError: () => {
                    message.error('Failed to update CID');
                },
            }
        );
    };
    const allowedAdmins = [1, 3];
    const columns: TableColumnsType<DataType> = [
        { title: 'ID', dataIndex: 'user_id', key: 'user_id' },
        {
            title: 'CID',
            dataIndex: 'cid',
            key: 'cid',
            render: (text, record) =>
                editingKey === record.key && allowedAdmins.includes(user.is_admin) ? (
                    <Input
                        type="text"
                        value={editedCid}
                        style={{ width: '90px' }}
                        onChange={(e) => {
                            const value = e.target.value;
                            const numericValue = value === '' ? undefined : Number(value);
                            setEditedCid(numericValue);
                        }}
                        onPressEnter={() => saveCid(record.user_id)}
                        onBlur={() => saveCid(record.user_id)}
                        autoFocus
                    />
                ) : (
                    <Tooltip title="Update CID">
                        <span
                            onClick={() => {
                                setEditingKey(record.user_id);
                                setEditedCid(record.cid);
                            }}
                            style={{ cursor: 'pointer', color: '#1890ff' }}
                        >
                            {text === null ? (
                                <>NULL</>
                            ) : (
                                <>{text}</>
                            )}
                        </span>
                    </Tooltip>
                ),
        },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone Number', dataIndex: 'phone_number', key: 'phone_number' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: memberFilterOptions,
            filterSearch: true,
            render: (_, record) => {
                const { statusText, tagColor } = membertatusTag(record.status);
                const isDanger = tagColor === 'red';    // Disapproved
                const isWarning = tagColor === 'gold';  // Pending
                const handleMenuClick = (userid: number) => (e: any) => {
                    const newStatus = parseInt(e.key);
                    if (newStatus === 2) {
                        setMemberStatusChange({ id: userid, status: newStatus });
                        setMemberModalVisible(true);
                    } else {
                        handleMemberStatusChange(userid, newStatus, '');
                    }
                };
                return (
                    <>
                        <Dropdown
                            menu={{
                                items: filteredMemberOptions,
                                onClick: handleMenuClick(record.user_id)
                            }}
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
                    </>
                );
            },
        },
        {
            title: 'Action',
            key: 'operation',
            render: (_, record) => (
                <Space>
                    {hasPermission('members-section', 'view') && (
                        <Tooltip title="View"><Button color="cyan" variant="text" icon={<Eye />} size="middle" onClick={() => showDrawer(record, 1)} /></Tooltip>
                    )}
                    {hasPermission('members-section', 'edit') && (
                        <Tooltip title="Update"><Link href={`member/${record.key}`}><Button type="link" icon={<PencilIcon />} size="small" /></Link></Tooltip>
                    )}
                    {user.is_admin === 3 && record.cid !== null && (
                        // <Tooltip title="Update Records"><Button color="red" variant="text" icon={<RefreshCcw />} size="middle" onClick={() => showDrawer(record, 2)} /></Tooltip>
                        <Tooltip title="Update Records">
                            <Button
                                color="red"
                                variant="text"
                                size="middle"
                                onClick={() => updatemembersDatabase(record)}
                                disabled={loadingId === record.user_id}
                            ><RefreshCw style={loadingId === record.user_id ? spinStyle : {}} /></Button>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];
    const expandedRowRender = (record: DataType) => (
        <Table
            columns={expandColumns}
            dataSource={[{
                key: record.key,
                birth_place: record.birth_place,
                current_address: record.current_address,
                permanent_address: record.permanent_address,
                is_active: record.is_active,
                created_at: record.created_at,
                id: record.user_id
            }]}
            pagination={false}
        />
    );

    // level two drawer start
    const [isLevelTwoOpen, setIsLevelTwoOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [accountDetails, setAccountDetails] = useState<PaymentRecord[] | null>(null);
    const openLevelTwo = async (accountNo: string, cid: number) => {
        setSelectedAccount(accountNo);
        setIsLevelTwoOpen(true);
        try {
            const res = await axios.get(`/account-history/${accountNo}/${cid}`);
            setAccountDetails(res.data);
        } catch (error) {
            console.error('Failed to fetch account:', error);
            setAccountDetails(null);
        }
    };
    const columnsHistory = [
        {
            title: 'Balance Amount',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
        },
        {
            title: 'Transaction Amount',
            dataIndex: 'trn_amount',
            key: 'trn_amount',
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
    const { get } = useForm();
    const handleTableChange = (
        pagination: any,
        filters: any,
        _sorter: any,
        _extra: any
    ) => {
        const statusSet = Array.isArray(filters.status) ? filters.status : undefined;
        const query: Record<string, any> = {
            page: pagination.current,
            statusSetData: statusSet,
            pagesize: pagination.pageSize
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
        get(`/members?${queryString}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['user_list'], // <-- this should match your Inertia prop key
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members Manager" />
            {/* we can add header here
            <div className="px-4 pt-4">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                    <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                         
                    </div>
                </div>
            </div>
            */}
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4">

                        <Table<DataType>
                            columns={columns}
                            expandable={{
                                expandedRowRender,
                                expandedRowKeys,
                                onExpand: (expanded, record) => {
                                    setExpandedRowKeys(expanded ? [record.key] : []);
                                },
                            }}
                            dataSource={dataSource}
                            //dataSource={user_list.data}
                            size="middle"
                            onChange={handleTableChange}
                            pagination={{
                                current: user_list.current_page,
                                pageSize: user_list.per_page,
                                total: user_list.total,
                            }}
                        />

                    </div>
                </div>
            </div>
            <Drawer
                title="Member Profile"
                width={open.location === 1 ? (`60%`) : (720)}
                onClose={onClose}
                open={open.open}
                styles={{ body: { paddingBottom: 80 } }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                    </Space>
                }
            >
                {open.location === 1 ? (
                    <>
                        {selectedUser && (
                            <>
                                <UserInformation user={selectedUser} openLevelTwo={openLevelTwo} />
                                <Drawer
                                    title={`Account Details for ${selectedAccount}`}
                                    width={700}
                                    open={isLevelTwoOpen}
                                    onClose={() => {
                                        setIsLevelTwoOpen(false);
                                        setAccountDetails(null); // optional
                                    }}
                                >
                                    {accountDetails ? (
                                        <Table
                                            dataSource={accountDetails}
                                            columns={columnsHistory}
                                            rowKey="id"
                                            pagination={{ pageSize: 10 }}
                                        />
                                    ) : (
                                        <p>Loading or no data...</p>
                                    )}
                                </Drawer>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {selectedUser && (<UpdateDatabase userinfo={selectedUser} />)}
                    </>
                )}

            </Drawer>
            <Modal
                title="Disable Account"
                open={isDisableModalVisible}
                onOk={() => {
                    if (!disableReason.trim()) {
                        return message.error('Please provide a reason.');
                    }

                    if (pendingStatusChange) {
                        handleStatusChange(pendingStatusChange.id, pendingStatusChange.status, disableReason);
                    }

                    setIsDisableModalVisible(false);
                    setDisableReason('');
                    setPendingStatusChange(null);
                }}
                onCancel={() => {
                    setIsDisableModalVisible(false);
                    setDisableReason('');
                    setPendingStatusChange(null);
                }}
                okText="Confirm"
                cancelText="Cancel"
            >
                <p>Please provide a reason for disabling this account:</p>
                <Input.TextArea
                    rows={4}
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    placeholder="Enter reason here..."
                />
            </Modal>
            <Modal
                title="Disapproved reason"
                open={isMemberModalVisible}
                onOk={() => {
                    if (!disapprovedReason.trim()) {
                        return message.error('Please provide a reason.');
                    }

                    if (memberStatusChange) {
                        handleMemberStatusChange(memberStatusChange.id, memberStatusChange.status, disapprovedReason);
                    }

                    setMemberModalVisible(false);
                    setDisapprovedReason('');
                    setMemberStatusChange(null);
                }}
                onCancel={() => {
                    setMemberModalVisible(false);
                    setDisapprovedReason('');
                    setMemberStatusChange(null);
                }}
                okText="Confirm"
                cancelText="Cancel"
            >
                <p>Please provide a reason for disapproval:</p>
                <Input.TextArea
                    rows={4}
                    value={disapprovedReason}
                    onChange={(e) => setDisapprovedReason(e.target.value)}
                    placeholder="Enter reason here..."
                />
            </Modal>

        </AppLayout>
    )
}

export default index