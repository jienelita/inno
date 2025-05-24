import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import type { FormProps } from 'antd';
import { router, useForm } from '@inertiajs/react';
type FieldType = {
    fname?: string;
    lname?: string;
    email?: string;
    password?: string;
    remember?: string;
};
interface Props {
  onClose: () => void;
}
export default function AdminForm({ onClose }: Props) {
      const [form] = Form.useForm<FieldType>();
    const { reset } = useForm({});
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

    return (
        <>
            <Form layout="vertical" initialValues={{ remember: true }}
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
                            name="User type"
                            label="Type"
                            rules={[{ required: true, message: 'Please choose the type' }]}
                        >
                            <Select
                                // defaultValue="Select"

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