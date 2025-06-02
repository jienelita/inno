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
type Props = {
      disaproved_res: string;
};
const Dashboard = ({ disaproved_res }: Props) => {
    const props = usePage().props as {
        user?: {
            id: number;
            name: string;
            email: string;
            email_verified_at: string;
            status: number;
            is_active: number; 
        }
    };
    const user = props.user;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {user?.email_verified_at === null && (
                    <EmailVerification title='Verify your email address.' children='Please verify your email address.' showDetails={true} />
                )}
                <UserStatus data={user}  reason={disaproved_res} />
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                        <Deposits type="savings" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">

                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">

                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">

                </div>
            </div>


        </AppLayout>
    );
}

export default Dashboard;