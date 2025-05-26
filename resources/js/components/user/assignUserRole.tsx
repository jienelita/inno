
import { router, useForm } from '@inertiajs/react';
import { Button, Checkbox, Collapse, Divider, Form, Input, message, Spin, Typography } from 'antd';
import type { CheckboxProps, FormProps } from 'antd';
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
  permission: string;
}
type RoleList = Role[];

interface RoleGroup {
  group_name: string;
  id: number;
}
interface RoleComponentsProps {
  userId: number | null;
  role_group: RoleGroup[];
  onClose: () => void;
}


export default function AssignUserRole({ userId, role_group, onClose }: RoleComponentsProps) {
  const [loadingGroup, setLoadingGroup] = useState<number | null>(null);
  const [rolesByGroup, setRolesByGroup] = useState<Record<number, Role[]>>({});

  const [form] = Form.useForm<FieldType>();
  const { reset } = useForm({});

  const onFinish = (values: any) => {
    router.post(
      `/update-user-assign-role/${userId}`,
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

  const [roleList, setRoleList] = useState<RoleList | null>(null);

  useEffect(() => {
    if (userId === null) {
      setRoleList(null);
      return;
    }

    const fetchAssignRoles = async () => {
      try {
        const res = await fetch(`/user-role-assign/${userId}`);
        const data = await res.json();
        setRoleList(data || null);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };

    fetchAssignRoles();
  }, [userId]);

  // useEffect(() => {
  //   if (roleList) {
  //     const parsed = roleList.map((listrole) => {
  //       try {
  //         return JSON.parse(listrole.permission);
  //       } catch (e) {
  //         return null;
  //       }
  //     });
  //     setParsedPermissions(parsed);
  //   }
  // }, [roleList]);




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

        {role_group.map((group) => {
          const groupId = group.id ?? group.id;
          const roles = rolesByGroup[groupId] || [];

          const items = roles.map((role) => {
            const itemWithStatus = role.with_status === 1;
            const perms = itemWithStatus
              ? ['view', 'edit', 'create', 'delete', 'pending', 'approved', 'disapproved', 'validated']
              : ['view', 'edit', 'create', 'delete'];

            // Find matchedPermissions for this role.slug
            let matchedPermissions: string[] = [];

            roleList?.forEach((listrole) => {
              try {
                const parsed = JSON.parse(listrole.permission);
                if (parsed[role.slug]) {
                  matchedPermissions = parsed[role.slug];
                }
              } catch (e) {
                console.error('Invalid JSON in permission', e);
              }
            });

            return {
              key: String(role.id),
              label: role.name,
              children: (
                <>
                  <Form.Item
                    name={['permissions', role.slug]}
                    className="!mb-0"
                  >
                    <Checkbox.Group>
                      <div className="grid grid-cols-4 gap-2">
                        {perms.map((perm) => (
                          <>
                            <div key={perm}>
                              <input
                                type="checkbox"
                                value={perm}
                                checked={matchedPermissions?.includes(perm)}
                                readOnly // prevents React warning for uncontrolled input
                              />{' '}
                              {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </div>
                          </>
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


{/* <Form.Item name={['permissions', role.slug]} className="!mb-0">
                      <Checkbox.Group defaultValue={matchedPermissions}>
                        <div className="grid grid-cols-4 gap-2">
                          {perms.map((perm) => (
                            <Checkbox key={perm} value={perm}>
                              {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </Checkbox>
                          ))}
                        </div>
                      </Checkbox.Group>
                    </Form.Item> */}