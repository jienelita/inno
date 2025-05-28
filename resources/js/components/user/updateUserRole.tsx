import { Form, Select } from 'antd';
import React, { useEffect, useState } from 'react'
interface Props {
    userId: number | null;
    form: any;
}
interface Role {
    id: number;
    role_name: string;
}
type RoleList = Role[];
export default function UpdateUserRole({ userId, form }: Props) {
    const [allroleList, setRoleAllList] = useState<RoleList | null>(null);
    const [roleList, setRoleList] = useState<RoleList | null>(null);
    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const res = await fetch('/role-list/0');
                const data = await res.json();
                setRoleAllList(data || null);
            } catch (err) {
                console.error('Error fetching image:', err);
            } finally {
                //  setLoading(false);
            }
        };
        fetchAllRoles();
    }, []);

    useEffect(() => {
        if (userId === null) {
            setRoleList(null);
            form.setFieldsValue({ role: [] });
            return;
        }
        const fetchAssignRoles = async () => {
            try {
                const res = await fetch(`/user-role-assign/${userId}`);
                const data = await res.json();
                setRoleList(data || null);
                form.setFieldsValue({
                    role: (data || []).map((role: any) => String(role.id)),
                });
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };
        fetchAssignRoles();
    }, [userId, form]);


    return (
        <Form form={form} layout="vertical">
            <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select at least one role' }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select one or more roles"
                    options={
                        allroleList?.map((role) => ({
                            value: String(role.id),
                            label: role.role_name,
                        })) ?? []
                    }
                />
            </Form.Item>
        </Form>
    )
}
