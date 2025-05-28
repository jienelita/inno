import AppLayout from '@/layouts/app-layout'
import { Head, router, Link, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types';
import { Button, Drawer, Dropdown, Input, message, Modal, Space, Table, TableColumnsType, Tag } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { formatDate, formatDateTime, userStatus } from '@/lib/helpers';
import { useState } from 'react';
import { Eye, PencilIcon } from 'lucide-react';
import UserInformation from '@/components/user/userInformation';
import '@ant-design/v5-patch-for-react-19';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { usePermission } from '@/hooks/usePermission';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: '/members',
    },
];
interface Props {
    user_list: {
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
        email: string;
        email_verified_at: string;
    }[];
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
    };
};
function index({ user_list }: Props) {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isDisableModalVisible, setIsDisableModalVisible] = useState(false);
    const [disableReason, setDisableReason] = useState('');
    const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number; status: number } | null>(null);
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const showDrawer = (user: UserType) => {
        setSelectedUser(user);
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
        setSelectedUser(null);
    };
    const dataSource: DataType[] = user_list.map((user) => ({
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
        email_verified_at: user.email_verified_at
    }));

    const expandColumns: TableColumnsType<ExpandedDataType> = [
        { title: 'Birth Place', dataIndex: 'birth_place', key: 'birth_place' },
        { title: 'Current Address', dataIndex: 'current_address', key: 'current_address' },
        { title: 'Permanent Address', dataIndex: 'permanent_address', key: 'permanent_address' },
        {
            title: 'Submitted at', dataIndex: 'created_at', key: 'created_at',
            render: (value) => formatDateTime(value)
        },
        {
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
                    // onClick: ({ key }: MenuInfo) => handleStatusChange(record.id, Number(key)),
                    onClick: ({ key }: MenuInfo) => {
                        const selectedStatus = Number(key);
                        if (selectedStatus === 2) {
                            // 2 = Disabled Account
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

    const columns: TableColumnsType<DataType> = [
        { title: 'CID', dataIndex: 'cid', key: 'cid' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Birth Date', dataIndex: 'bithdate', key: 'bithdate',
            render: (value) => formatDate(value)
        },
        { title: 'Phone Number', dataIndex: 'phone_number', key: 'phone_number' },
        {
            title: 'Status', dataIndex: 'is_active', key: 'is_active',
            render: (value) => (
                <>
                    <Tag color={`${userStatus[value].color}`}>{userStatus[value].label}</Tag>
                </>
            ),
        },
        {
            title: 'Action',
            key: 'operation',
            render: (_, record) => (
                <>
                    {hasPermission('members-section', 'view') && (
                        <Button color="cyan" variant="text" icon={<Eye />} size="middle" className='me-1' onClick={() => showDrawer(record)} />
                    )}
                    {hasPermission('members-section', 'edit') && (
                        <Link href={`member/${record.key}`}><Button type="link" icon={<PencilIcon />} size="small" /></Link>
                    )}
                </>
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans" />
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
                            size="middle"
                        />

                    </div>
                </div>
            </div>
            <Drawer
                title="Member Profile"
                width={720}
                onClose={onClose}
                open={open}
                styles={{ body: { paddingBottom: 80 } }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                    </Space>
                }
            >
                {selectedUser && (
                    <UserInformation user={selectedUser} />
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

        </AppLayout>
    )
}

export default index