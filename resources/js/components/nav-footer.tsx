import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import { Drawer, FloatButton } from 'antd';
import { useState, type ComponentPropsWithoutRef } from 'react';
import MemberChat from './chat/MemberChat';
import '@ant-design/v5-patch-for-react-19';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <>
            <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                >
                                    <Link href={item.href} target="_blank" rel="noopener noreferrer">
                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <hr className='mt-2' />
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
