import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react'
import '@ant-design/v5-patch-for-react-19';
import { Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';
import { formatDate } from '@/lib/helpers';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Database Manager', href: '/database-manager' },
];
// interface DataType {
//     id: number;
//     cid: number;
//     first_name: string;
//     last_name: string;
//     address: string;
//     updated_at: string
// }
export default function DatabaseManagerIndex() {
    // const { members } = usePage().props as unknown as {
    //     members: {
    //         data: DataType[];
    //         current_page: number;
    //         last_page: number;
    //         per_page: number;
    //         total: number;
    //         name: string;
    //     };
    // };
    // const columns: TableColumnsType<DataType> = [
    //     {
    //         title: 'User ID',
    //         dataIndex: 'id',
    //         key: 'id',
    //     },
    //     {
    //         title: 'CID',
    //         dataIndex: 'cid',
    //         key: 'cid',
    //     },
    //     {
    //         title: 'Name',
    //         key: 'name',
    //         dataIndex: 'name',
    //         render: (_: any, members) => (
    //             <>
    //                 {members.first_name} {members.last_name}
    //             </>
    //         )
    //     }
    // ];

    // const rowSelection: TableProps<DataType>['rowSelection'] = {
    //     onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    //         console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    //     },
    //     getCheckboxProps: (record: DataType) => ({
    //         disabled: record.first_name === 'Disabled User', // Column configuration not to be checked
    //         name: record.first_name,
    //     }),
    // };
    // const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4">
                        {/* <Table<DataType>
                            rowSelection={{ type: selectionType, ...rowSelection }}
                            columns={columns}
                            dataSource={members.data}
                            pagination={{
                                current: members.current_page,
                                pageSize: members.per_page,
                                total: members.total,
                            }}
                        /> */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
