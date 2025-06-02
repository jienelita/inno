import AppLayout from '@/layouts/app-layout'
import { Head, router, Link, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types';
import { Button, Drawer, Dropdown, Form, Input, message, Modal, Space, Table, TableColumnsType, Tag, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { AdminuserStatus, isAdminCode, userStatus } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { Lock, LucideUserRoundCog, PencilIcon, Plus } from 'lucide-react';
import '@ant-design/v5-patch-for-react-19';
import type { MenuInfo } from 'rc-menu/lib/interface';
import AdminForm from '@/components/user/adminForm';
import AssignUserRole from '@/components/user/assignUserRole';
import UpdateUserRole from '@/components/user/updateUserRole';
import ChangePassword from '@/components/user/ChangePassword';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Manager',
        href: '/user-manager',
    },
];
interface Props {
    user_list: {
        user_id: number;
        first_name: string;
        last_name: string;
        name: string;
        created_at: string;
        is_active: number;
        email: string;
        is_admin: number;
    }[];
    role: Role[];
    role_group: RoleGroup[];
}
interface ExpandedDataType {
    key: React.Key;
    is_active: number;
    created_at: string;
    id: number;
}
interface DataType {
    key: React.Key;
    name: string;
    first_name: string;
    last_name: string;
    is_active: number;
    created_at: string;
    user_id: number;
    email: string;
    is_admin: number;
}
interface Role {
    id: number;
    role_name: string;
    created_at: string;
    permission: string;
}
interface RoleGroup {
    group_name: string;
    id: number;
}
interface RoleList{
    userId: number | any;
    length: number;
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
function UserManager({ user_list, role_group }: Props) {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [isDisableModalVisible, setIsDisableModalVisible] = useState(false);
    const [disableReason, setDisableReason] = useState('');
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const [pendingStatusChange, setPendingStatusChange] = useState<{ id: number; status: number } | null>(null);
    const [form] = Form.useForm();
    const [changePassForm] = Form.useForm();
    const dataSource: DataType[] = user_list.map((user) => ({
        key: user.user_id,
        user_id: user.user_id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        is_active: user.is_active,
        email: user.email,
        is_admin: user.is_admin
    }));
    const UserRolesCell = ({ userId }) => {
        const [roleList, setRoleList] = useState<RoleList>([]);
        useEffect(() => {
            const fetchAssignRoles = async () => {
                try {
                    const res = await fetch(`/user-role-assign/${userId}`);
                    const data = await res.json();
                    setRoleList(data || []);
                } catch (err) {
                    setRoleList([]);
                }
            };
            fetchAssignRoles();
        }, [userId]);
        
        return (
            <>
                {roleList.length === 0
                    ? <span>Admin: No roles needed</span>
                    : roleList.map((role, idx) => (
                        <span key={role.id} style={{ marginRight: 8 }}>
                            {role.role_name}
                            {idx < roleList.length - 1 ? ',' : ''}
                        </span>
                    ))
                }
            </>
        );
    };
    const expandColumns: TableColumnsType<ExpandedDataType> = [
        {
            title: 'Access',
            key: 'access',
            render: (_, record) => {                
                return (
                    <>
                         <UserRolesCell userId={record.id} /> 
                    </>
                );
            },
        },
        {
            title: 'Action',
            key: 'operation',
            render: (_, record) => {
                const dynamicMenu = {
                    items: Object.entries(AdminuserStatus).map(([key, { label, color }]) => ({
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
                            // 2 = Disabled Account
                            setPendingStatusChange({ id: record.id, status: selectedStatus });
                            setIsDisableModalVisible(true);
                        } else {
                            handleStatusChange(record.id, selectedStatus);
                        }
                    }
                };

                return (
                    <>
                        {user.id !== record.id && (
                            <Space size="middle">
                                <Dropdown menu={dynamicMenu}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        More <DownOutlined />
                                    </a>
                                </Dropdown>
                            </Space>
                        )}
                    </>
                );
            },
        },
    ];
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
        { title: 'ID', dataIndex: 'user_id', key: 'user_id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'User Type', dataIndex: 'is_admin', key: 'is_admin',
            render: (_, record) => (
                <>
                    {isAdminCode[record.is_admin]}
                </>
            ),
        },
        {
            title: 'Status', dataIndex: 'is_active', key: 'is_active',
            render: (value) => (
                <>
                    <Tag color={`${userStatus[value].color}`}>{userStatus[value].label}</Tag>
                </>
            ),
        },
        {
            title: 'Option',
            key: 'operation',
            render: (_, record) => (
                <>
                    {record.is_admin == 2 && (
                        <Tooltip placement="leftTop" title="Update User Role">
                            {/* <Button color="purple" variant="text" icon={<LucideUserRoundCog />} size="middle" className='me-1' onClick={() => showAssignDrawer(record.user_id)} /> */}
                            <Button
                                color="purple"
                                variant="text"
                                icon={<LucideUserRoundCog />}
                                size="middle"
                                className='me-1'
                                onClick={() => showUpModal(record.user_id, 1)} // <-- fix here
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Change Password">
                        <Button color="cyan" variant="text" icon={<Lock />} size="middle" className='me-1' onClick={() => showUpModal(record.user_id, 2)} />
                    </Tooltip>
                    <Tooltip placement="rightTop" title="Update">
                        <Link href={`member/${record.key}`}><Button type="link" icon={<PencilIcon />} size="small" /></Link>
                    </Tooltip>
                </>
            )
        }
    ];
    const expandedRowRender = (record: DataType) => (
        <Table
            columns={expandColumns}
            dataSource={[{
                key: record.key,
                is_active: record.is_active,
                created_at: record.created_at,
                id: record.user_id,
            }]}
            pagination={false}
        />
    );
    const [open, setOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [resetKey, setResetKey] = useState(0);

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const showAssignDrawer = (userId: number) => {
        setSelectedUserId(userId);
        setAssignOpen(true);
    };
    const onAssignDrawerClose = () => {
        setAssignOpen(false);
        setSelectedUserId(null);
        setResetKey(prev => prev + 1);
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModalUserId, setSelectedModalUserId] = useState<number | null>(null);
    const [modalType, setModalType] = useState<1 | 2>(1);

    const showUpModal = (userId: number, type: 1 | 2) => {
        setSelectedModalUserId(userId);
        setModalType(type);
        setIsModalOpen(true);
    };
    const handleUpCancel = () => {
        setIsModalOpen(false);
        setModalType(1);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Manager" />
            <div className="px-4 pt-4">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                    <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                        <Button className='ms-1' type="primary" icon={<Plus />} size='middle' onClick={showDrawer}>
                            Add New User
                        </Button>
                    </div>
                </div>
            </div>
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
            <Drawer
                title="Create a new account"
                width={720}
                onClose={onClose}
                open={open}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <AdminForm onClose={onClose} />
            </Drawer>
            <Drawer
                title="Update Assign Role"
                width={720}
                onClose={onAssignDrawerClose}
                open={assignOpen}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                <AssignUserRole onClose={onClose} userId={selectedUserId} role_group={role_group} resetFormKey={resetKey} />
            </Drawer>
            <Modal
                title={modalType === 1 ? "Update User Role" : "Change Password"}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={() => {
                    if (modalType === 1) {
                        form.validateFields().then(values => {
                            router.post(
                                '/update-user-assign-role',
                                {
                                    values,
                                    userId: selectedModalUserId
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        message.success('Status updated!');
                                        // form.resetFields();   // ⬅️ wipe the form
                                        onClose();
                                    },
                                }
                            );
                        });
                    } else if (modalType === 2) {
                        changePassForm.validateFields().then(values => {
                            // values.password is your new password
                            // Do your API call here
                            console.log(values.password);
                            let pass = values.password;
                            router.post(
                                '/user-password-update',
                                {
                                    pass,
                                    userId: selectedModalUserId
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        message.success('Password successfully updated!');
                                        changePassForm.resetFields();  // ⬅️ wipe the form
                                        setIsModalOpen(false);
                                    },
                                }
                            );


                        });
                    }
                    setIsModalOpen(false);
                }}
                onCancel={handleUpCancel}

            >
                {modalType === 1 ? (
                    <UpdateUserRole userId={selectedModalUserId} form={form} />
                ) : (
                    <ChangePassword userId={selectedModalUserId} form={changePassForm} />
                )}
            </Modal>
        </AppLayout>
    )
}

export default UserManager