import { router, useForm } from '@inertiajs/react';
import { Alert, Button, Checkbox, Collapse, Divider, Form, Input, message, Spin, Typography } from 'antd';
import type { CheckboxProps, FormProps } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
const { Title } = Typography;

type FieldType = {
  roleName?: string;
};
interface Role {
  id: number;
  name: string;
  slug: string;
  with_status: number;
  permission: string;
}

interface RoleGroup {
  group_name: string;
  id: number;
}
interface RoleComponentsProps {
  roleId: number | null;
  role_group: RoleGroup[];
  onClose: () => void;
  resetFormKey: number;
}
export default function UpdateRole({ roleId, role_group, onClose, resetFormKey }: RoleComponentsProps) {
  const [loadingGroup, setLoadingGroup] = useState<number | null>(null);
  const [rolesByGroup, setRolesByGroup] = useState<Record<number, Role[]>>({});
  const [form] = Form.useForm<FieldType>();
  const { reset } = useForm({});
  const [roleList, setRoleList] = useState<Role | null>(null);

  const onFinish = (values: any) => {
    router.post(
      `/update-role/${roleId}`,
      {
        permissions: values.permissions,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          message.success('Role successfully updated!');
          form.resetFields();
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
    form.resetFields();
  }, [resetFormKey]);
  useEffect(() => {
    role_group.forEach((group) => {
      fetchRoles(group.id);
    });
  }, []);
  useEffect(() => {
    if (roleId === null) {
      setRoleList(null);
      return;
    }
    const fetchAssignRoles = async () => {
      try {
        const res = await fetch(`/update-role/${roleId}`);
        const data = await res.json();
        setRoleList(data || null);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchAssignRoles();
  }, [roleId]);
  useEffect(() => {
    if (!roleList) return;
    const permissions: Record<string, string[]> = {};
    try {

      const parsed = JSON.parse(roleList.permission);
      console.log(parsed);
      Object.entries(parsed).forEach(([slug, perms]) => {
        permissions[slug] = perms as string[];
      });
    } catch (e) {
      console.error('Failed to parse permissions', e);
    }
    setInitialPermissionValues({ permissions });
  }, [roleList, resetFormKey]);
  const [initialPermissionValues, setInitialPermissionValues] = useState({});
  useEffect(() => {
    if (form && initialPermissionValues && Object.keys(initialPermissionValues).length > 0) {
      form.setFieldsValue(initialPermissionValues);
    }
  }, [initialPermissionValues, form]);


  return (
    <>
      <Alert
        message="Warning"
        description="This will update users roles. Whoever assign to this role, it will affect the user permission."
        type="error"
      />
      <Form
        form={form}
        initialValues={initialPermissionValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >

        {role_group.map((group) => {
          const groupId = group.id ?? group.id;
          const roles = rolesByGroup[groupId] || [];
          const items = roles.map((role) => {
            const itemWithStatus = role.with_status === 1;
            const perms = itemWithStatus
              ? ['view', 'edit', 'create', 'delete', 'pending', 'approved', 'disapproved', 'validated', 'reject' , 'pre-approved', 'deny' ,'crop']
              : ['view', 'edit', 'create', 'delete'];
            return {
              key: String(role.id),
              label: role.name,
              children: (
                <>
                  <Form.Item name={['permissions', role.slug]} className="!mb-0">
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
                </>
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