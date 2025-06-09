import React, { useState } from 'react';
import { Alert, Button, Drawer, message } from "antd";
import '@ant-design/v5-patch-for-react-19';
import Input from 'antd/es/input/Input';
import axios from 'axios';
import { Link, router } from '@inertiajs/react';

const EmailVerification = ({
    title = '',
    children = '',
    showDetails = false
}) => {

    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isSending, setIsSending] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [hideBox, setHideBox] = useState(false);


    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    const handleResend = async () => {
        if (isSending) return; // prevent spam click

        setIsSending(true);
        try {
            const res = await axios.post('/resend-otp');
            message.success(res.data.message || 'OTP sent!');

        } catch (err) {
            message.error('Failed to resend OTP.');

        } finally {
            // Add a small timeout if you want smoother UI
            setTimeout(() => setIsSending(false), 1000);
        }
    };

    const handleVerify = async () => {
        if (!otpCode) return message.warning('Please enter the OTP');

        setIsVerifying(true);
        try {
            const res = await axios.post('/verify-otp', { code: otpCode });
            if (res.data.success) {
                message.success(res.data.message);
                setOpen(false);
                // setHideBox(true);
                router.reload();
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'OTP verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            {!hideBox && (
                <Alert message={
                    <>
                        {title} Please verify your email <a href="#" type="primary" onClick={showLoading}>here.</a> 
                    </>
                } type="error" />
            )}

            <Drawer
                closable
                destroyOnClose
                title={<p>OTP Verification</p>}
                placement="right"
                open={open}
                onClose={() => setOpen(false)}
            >
                <div className="space-y-4 rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-600/10 dark:bg-green-700/10">
                    <div className="relative space-y-0.5 text-green-600 dark:text-green-600">
                        <p className="font-normal mb-5 text-center">We sent a verification code to your email <br /> <b>(6 digit code)</b></p>
                        <Input
                            placeholder="Enter verification code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                        />
                        <div className='text-center' >
                            <p className='mt-4'>
                                Don't get code?{" "}
                                <span
                                    onClick={handleResend}
                                    className={`text-blue-600 font-semibold cursor-pointer ${isSending ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                >
                                    {isSending ? 'Sending OTP...' : 'Resend'}
                                </span>

                            </p>
                            <Button
                                type="primary"
                                className="mt-4"
                                loading={isVerifying}
                                onClick={handleVerify}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>

                </div>
            </Drawer>
        </>
    );
};

export default EmailVerification;
