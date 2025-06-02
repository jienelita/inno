import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import EmailVerification from '@/components/email-verification';
import UserStatus from '@/components/dashboard/user-status';
import Deposits from '@/components/dashboard/deposits';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const Dashboard = () => {
    const props = usePage().props as {
        user?: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string;
            is_active: number;
        }
    };
    const user = props.user;
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                Loan Application
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                50
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                    For the month of <b>{monthName}</b>
                                </p>

                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                Total Online Members
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                50
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                    As of <b>{year}</b>
                                </p>

                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <div className="p-4 md:p-4">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                New Members
                            </p>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                50
                            </h4>
                            <div className="mt-4 items-end justify-between sm:mt-5">
                                <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                    For the month of <b>{monthName}</b>
                                </p>

                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">

                </div>
            </div>


        </AppLayout>
    );
}

export default Dashboard;