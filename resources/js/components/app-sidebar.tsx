import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calculator, Cog, Database, Files, HandCoins, History, LayoutGrid, List, MessageCircle, User, UserCog, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermission } from '@/hooks/usePermission';
import { Drawer, FloatButton } from 'antd';
import { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import MemberChat from './chat/MemberChat';

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

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const { hasPermission } = usePermission();
    const mainNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        ...(user.is_admin === 0
            ?
            [
                {
                    title: 'Loans',
                    href: '/loans',
                    icon: HandCoins,
                    children: [
                        {
                            title: 'My Application',
                            href: '/loans',
                            icon: List,
                        },
                        {
                            title: 'Loan Calculator',
                            href: '/loan/loan-calculator',
                            icon: Calculator,
                        },
                        {
                            title: 'Payment History',
                            href: '/payment-history',
                            icon: History,
                        },
                    ],
                },
                {
                    title: 'File Manager',
                    href: '/file-manager',
                    icon: Files,
                },
            ]
            : []),

        //...(user.is_admin === 3 || user.is_admin === 2
        // ? [


        // ]
        //  : []
        //  ),

        ...(hasPermission('members-section', 'view')
            ? [{
                title: 'Members',
                href: '/members',
                icon: Users,
            }]
            : []
        ),

        ...(user.is_admin === 3 || user.is_admin === 2
            ? [
                {
                    title: 'Loan Manager',
                    href: '/loan-manager',
                    icon: List,
                },
            ]
            : []
        ),

        // ]
        //  : []
        //   ),

    ];

    const footerNavItems: NavItem[] = [
        ...(user.is_admin === 3
            ? [
                {
                    title: 'User Manager',

                    href: '/user-manager',
                    icon: UserCog,
                },
                {
                    title: 'Role Manager',

                    href: '/role-manager',
                    icon: Cog,
                },
                {
                    title: 'Database Manager',

                    href: '/database-manager',
                    icon: Database,
                },
                {
                    title: 'Chat Support',
                    href: '/chat-support',
                    icon: MessageCircle,
                },
            ]
            : []),

    ];

    const [open, setOpen] = useState(false);
    const showMessageChatDrawer = () => {
        setOpen(true);
    };

    const onCloseMessageChat = () => {
        setOpen(false);
    };
    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
            {user.is_admin === 0 && (
                <>
                    <FloatButton
                        onClick={showMessageChatDrawer}
                        icon={<QuestionCircleOutlined />}
                        type="primary"
                        style={{ insetInlineEnd: 24 }}
                        tooltip={<div>Contact Us!</div>} />
                    <Drawer
                        title="Magrow Chat Support"
                        //closable={{ 'aria-label': 'Close Button' }}
                        onClose={onCloseMessageChat}
                        placement="right" closable={false}
                        open={open}
                        width={400}
                    >
                        <MemberChat />
                    </Drawer>
                </>
            )}
        </>
    );
}