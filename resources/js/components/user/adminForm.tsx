import { Button, Col, DatePicker, Form, Input, message, Row, Select, Space } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import type { FormProps } from 'antd';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
type FieldType = {
    fname?: string;
    lname?: string;
    email?: string;
    password?: string;
    remember?: string;
    user_type?: string;
    role?: string;
};
interface Props {
    onClose: () => void;
}
interface Role {
    image_name: string;
    reason: string;
    disable_by: string;
}
type RoleList = Role[];
export default function AdminForm({ onClose }: Props) {
    const [form] = Form.useForm<FieldType>();
    const [isRoleDisabled, setIsRoleDisabled] = useState(false);
    const { reset } = useForm({});
    const handleUserTypeChange = (value: string) => {
        // Disable role if "Administrator" (value === '3')
        setIsRoleDisabled(value === '3');
        // Optional: clear role field if Administrator
        if (value === '3') {
            form.setFieldsValue({ role: undefined });
            form.validateFields(['role']);
        }
    };
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        router.post(
            '/save-user',
            {
                records: values
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

    };
    const [roleList, setRoleList] = useState<RoleList | null>(null);
    useEffect(() => {
        const fetchImage = async () => {
            try {
                const res = await fetch('/role-list/0');
                const data = await res.json();
                setRoleList(data || null);
            } catch (err) {
                console.error('Error fetching image:', err);
            } finally {
                //  setLoading(false);
            }
        };
        fetchImage();
    }, []);

    console.log(roleList);

    return (
        <>
            <Form layout="vertical" form={form} initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="fname"
                            label="First Name"
                            rules={[{ required: true, message: 'Please enter first name' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="lname"
                            label="Last Name"
                            rules={[{ required: true, message: 'Please enter last name' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[{ required: true, message: 'Please enter email address' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="user_type"
                            label="Type"
                            rules={[{ required: true, message: 'Please choose the type' }]}
                        >
                            <Select
                                onChange={handleUserTypeChange}
                                optionFilterProp="label"
                                options={[
                                    { value: '1', label: 'Membership' },
                                    { value: '2', label: 'Loan Section' },
                                    { value: '3', label: 'Administrator' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please enter password' }]}
                        >
                            <Input.Password
                                placeholder="input password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="role"
                            label="Role"
                            rules={
                                isRoleDisabled
                                    ? []
                                    : [{ required: true, message: 'Please choose at least one role' }]
                            }
                        >
                            <Select
                                mode="multiple"
                                disabled={isRoleDisabled}
                                placeholder="Select one or more roles"
                                options={
                                    roleList?.map((role: any) => ({
                                        value: String(role.id),
                                        label: role.role_name,
                                    })) ?? []
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <hr className='mt-4' />
                <div className='mt-4 float-right'>

                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </>
    )
}