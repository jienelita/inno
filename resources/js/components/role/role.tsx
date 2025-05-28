
import { router, useForm } from '@inertiajs/react';
import { Button, Checkbox, Collapse, Form, Input, message, Spin, Typography } from 'antd';
import type { FormProps } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
const { Title } = Typography;
const { Panel } = Collapse;

type FieldType = {
  roleName?: string;
};

interface Role {
  id: number;
  name: string;
  slug: string;
  with_status: number;
}

interface RoleGroup {
  group_name: string;
  id: number;
}
interface RoleComponentsProps {
  onClose: () => void;
  role_group: RoleGroup[];
}
export default function RoleComponents({ onClose, role_group }: RoleComponentsProps) {
  const [loadingGroup, setLoadingGroup] = useState<number | null>(null);
  const [rolesByGroup, setRolesByGroup] = useState<Record<number, Role[]>>({});

  const [form] = Form.useForm<FieldType>();
  const { reset } = useForm({});
  // const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  const onFinish = (values: any) => {
    router.post(
      '/save-role',
      {
        rolename: values.roleName,
        permissions: values.permissions,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          message.success('Status updated!');
          form.resetFields();   // ⬅️ wipe the form
          onClose();
        },
      }
    );
    reset();
    onClose();
  };
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const fetchRoles = async (groupId: number) => {
    console.log(groupId);
    setLoadingGroup(groupId);
    try {
      const response = await axios.get(`/list-of-roles/${groupId}`);
      setRolesByGroup((prev) => ({ ...prev, [groupId]: response.data }));
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoadingGroup(null);
    }
  };

  useEffect(() => {
    role_group.forEach((group) => {
      fetchRoles(group.id);
    });
  }, []);

  return (
    <>
      <Form
        form={form}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Role name"
          name="roleName"
          rules={[{ required: true, message: 'Please input role name!' }]}
        >
          <Input />
        </Form.Item>

        {role_group.map((group) => {
          const groupId = group.id ?? group.id;
          const roles = rolesByGroup[groupId] || [];
          const items = roles.map((role) => {
            const itemWithStatus = role.with_status === 1;
            const perms = itemWithStatus
              ? ['view', 'edit', 'create', 'delete', 'pending', 'approved', 'disapproved', 'validated', 'crop']
              : ['view', 'edit', 'create', 'delete'];
            return {
              key: String(role.id),
              label: role.name,
              children: (
                <Form.Item
                  name={['permissions', role.slug]}
                  className="!mb-0"
                >
                  <Checkbox.Group>
                    <div className="grid grid-cols-4 gap-2">
                      {perms.map((perm) => (
                        <Checkbox key={perm} value={perm}>
                          {perm.charAt(0).toUpperCase() + perm.slice(1)}
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </Form.Item>
              )
            };
          });

          return (
            <div key={groupId}>
              <Title level={5} className="mt-4">
                {group.group_name}
              </Title>

              <Collapse
                accordion
                items={
                  loadingGroup === groupId
                    ? [{
                      key: 'loading',
                      label: 'Loading...',
                      children: <Spin />
                    }]
                    : items.length > 0
                      ? items
                      : [{
                        key: 'empty',
                        label: 'No roles',
                        children: 'No roles available.'
                      }]
                }
              />
            </div>
          );
        })}

        <div className='mt-5'>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </div>
      </Form>
    </>
  );
}