import React from 'react';
import { Button, Form, Input, Space, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, ReloadOutlined } from '@ant-design/icons';

interface Props {
    userId: number | null;
    form: any; // Passed from parent
}

const generatePassword = (length = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let pass = '';
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};

export default function ChangePassword({ userId, form }: Props) {
    const handleGenerate = () => {
        const newPassword = generatePassword();
        form.setFieldsValue({ password: newPassword });
        message.success('Password generated!');
    };

    return (
        <Form
            form={form}
            layout="vertical"
        >
            <Form.Item
                label="New Password"
                name="password"
                rules={[
                    { required: true, message: 'Please enter a password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                ]}
            >
                <Input.Password
                    placeholder="Enter new password"
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="new-password"
                />
            </Form.Item>
            <Space>
                <Button icon={<ReloadOutlined />} onClick={handleGenerate}>
                    Generate Password
                </Button>
            </Space>
        </Form>
    );
}
