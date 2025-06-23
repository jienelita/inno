import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react'
import '@ant-design/v5-patch-for-react-19';
import { Button, Table, TableColumnsType, TableProps } from 'antd';
import { useState } from 'react';
import { formatDate } from '@/lib/helpers';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Database Manager', href: '/database-manager' },
];

interface Props {
    records: Records
}

type Records = {
    total_user: number,
    created_at: string,
    total_records_count: number,
}

export default function DatabaseManagerIndex({ records }: Props) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        setLoading(true);
        router.post(
            '/generate-database-records', // Laravel route
            {},
            {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database Manager" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                Last Generate
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                {formatDate(records.created_at)}
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">

                                </p>

                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                Total Members Generate
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                {records.total_user}
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">

                                </p>

                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                Total Payment Transaction History
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                {records.total_records_count}
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">

                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <div className="p-4 md:p-4">
                        <Button type="primary" loading={loading} onClick={handleGenerate}>
                            Generate Now!
                        </Button>
                    </div>
                </div>
            </div>


        </AppLayout>
    );
}
