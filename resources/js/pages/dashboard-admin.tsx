import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/inertia';

import { Col, Row } from 'antd';
import BasicChart from '@/components/chart/basic-chart';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];
type Props = {
    loan_application: number;
    loan_application_approved: number;
    loan_application_disapproved: number;
    total_members: number,
    total_members_application: number;
    total_members_approved: number
};
const Dashboard = ({loan_application, loan_application_approved, loan_application_disapproved, total_members, total_members_application, total_members_approved} : Props) => {
    const props = usePage().props as {
        user?: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string;
            is_active: number;
        }
        quote?: {
            message: string;
            author: string;
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
                <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 ">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl font-medium leading-none text-mono">
                            Welcome <b>{user?.name}</b>!!!
                        </h1>
                        <div className="flex items-center gap-2 text-sm font-normal text-secondary-foreground">
                            {props.quote?.message} - {props.quote?.author}
                        </div>
                    </div>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={4}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm  text-gray-700 dark:text-gray-400">
                                            Loan Application
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {loan_application}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                For the month of <b>{monthName}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm  text-gray-700 dark:text-gray-400">
                                            Loan Approved
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {loan_application_approved}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                For the month of <b>{monthName}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm  text-gray-700 dark:text-gray-400">
                                            Loan Disapproved
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {loan_application_disapproved}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                For the month of <b>{monthName}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>

                        </Row>
                    </Col>
                    <Col span={4}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                            Total Members
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {total_members}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                As of <b>{year}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                            Members Approved
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {total_members_approved}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                For the month of <b>{monthName}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                                    <div className="p-4 md:p-4">
                                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                            Members Application
                                        </p>
                                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                            {total_members_application}
                                        </h4>
                                        <div className="mt-4 items-end justify-between sm:mt-5">
                                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                                                For the month of <b>{monthName}</b>
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={16}>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                            <BasicChart />
                        </div>
                    </Col>
                </Row>

            </div>


        </AppLayout>
    );
}

export default Dashboard;