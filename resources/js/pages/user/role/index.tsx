import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types';
import '@ant-design/v5-patch-for-react-19';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Checkbox, Drawer, Form, Input, message, Modal, Space, Table, Tooltip } from 'antd';
import { Plus, Trash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormProps, TableProps, TableColumnsType } from 'antd';
import { formatDateTime } from '@/lib/helpers';
import RoleComponents from '@/components/role/role';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Manager',
        href: '/role-manager',
    },
];
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
interface Props {
    role: Role[];
    role_group: RoleGroup[];
}
interface DataType {
    key: React.Key;
    id: number;
    role_name: string;
    created_at: string;
    permission: string;
}
function roleIndex({ role, role_group }: Props) {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [open, setOpen] = useState(false);
    const showDrawer = () => {
        
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const dataSource: DataType[] = role.map((role) => ({
        key: role.id,
        id: role.id,
        role_name: role.role_name,
        permission: role.permission,
        created_at: role.created_at,
    }));

    const columns: TableColumnsType<DataType> = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Role Name', dataIndex: 'role_name', key: 'role_name' },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_, record) => (
                <>
                    {formatDateTime(record.created_at)}
                </>
            )
        },
        {
            title: 'Option',
            key: 'operation',
            render: (_, record) => (
                <>
                    <Tooltip title="Delete Permission">
                        <Button color="red" variant="text" icon={<Trash2 />} size="middle" className='me-1' />
                    </Tooltip>
                </>
            )
        }
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Manager" />
            <div className="px-4 pt-4">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                    <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                        <Button className='ms-1' type="primary" icon={<Plus />} size='middle' onClick={showDrawer}>
                            Add New Role
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
                                expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.permission}</p>,
                                expandedRowKeys,
                                rowExpandable: (record) => record.role_name !== 'Not Expandable',
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
                title="Add New Role"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={open}
                width={720}
            >
                <RoleComponents onClose={onClose} role_group={role_group} />
            </Drawer>
        </AppLayout>
    )
}

export default roleIndex