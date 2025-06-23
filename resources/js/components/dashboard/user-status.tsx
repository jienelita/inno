import { Alert, GetProps, Image, Input, Modal, Typography } from 'antd';
import { Text } from 'lucide-react';
import { useState } from 'react';
const { Title } = Typography;
type Props = {
    data?: {
        is_active: number;
        status: number;
        phone_number: string
    };
    reason: string;
};
type OTPProps = GetProps<typeof Input.OTP>;
const UserStatus = ({ data, reason }: Props) => {
    const onChange: OTPProps['onChange'] = (text) => {
        console.log('onChange:', text);
    };

    const onInput: OTPProps['onInput'] = (value) => {
        console.log('onInput:', value);
    };

    const sharedProps: OTPProps = {
        onChange,
        onInput,
    };
    const [isOTPModalOpen, setOTPModalOpen] = useState(false);

    const showModal = () => {
        setOTPModalOpen(true);
    };

    const handleOk = () => {
        setOTPModalOpen(false);
    };

    const handleCancel = () => {
        setOTPModalOpen(false);
    };
    if (!data) return <p>No user data found.</p>;
    return (
        <>
            {data.is_active !== 1 && data.is_active !== 2 && (
                <>
                    {data.status === 0 ? (
                        <div className='pb-3'>
                            <Alert message={
                                <>
                                    <b>Pending Verification.</b> This account is awaiting approval or verification.
                                </>
                            }
                                type="warning" />
                        </div>
                    ) : data.status === 2 ? (
                        <div className='pb-3'>
                            <Alert
                                message=
                                {
                                    <>
                                        Sorry we are unable to approve your application. <br />
                                        <strong>Reason: {reason}</strong>
                                    </>
                                }
                                type="error"
                                closable={false}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                </>
            )}

            {data.is_active === 0 ? (
                <div className='pb-3'>
                    <Alert
                        message="Inactive Account. This account was set to inactive account by our administrator. You can send message here."
                        // description=""
                        type="warning"
                        className='p-2'
                        closable={false}
                    />
                </div>
            ) : data.is_active === 1 ? (
                <div className='pb-1'>
                    <Alert
                        message={<>Looks like your account isn’t fully set up yet. Just fill in the missing details to get started!</>}
                        type="info"
                        className='p-2'
                        closable={false}
                    />
                </div>
            ) : data.is_active === 2 ? (
                <div className='pb-3'>
                    <Alert
                        //message="Phone number not verify."
                        description={<>
                            <b>We’ll also need to verify your phone number.</b><br />
                            <p className='mb-2 mt-2 ms-2'>So you can hit the ground running and start using our Magrow MPC services.</p>
                            <p className='mb-2 ms-2'>To activate your account</p>
                            <p className='mb-2 ms-2'>To verify you during log in through two-factor authentication (2FA).</p>
                            <p className='mb-2 ms-2'>To help us mitigate fraud and abuse.</p>
                            <p className='mb-2 ms-2'><a href='#' onClick={showModal}>Verify your phone number here!</a></p></>}
                        type="error"
                        className='p-2'
                        closable={false}
                    />
                </div>
            ) : (
                <></>
            )}
            <Modal
                title=""
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOTPModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Verify"
            >
                <div className='text-center mb-15'>
                    <Image src="images/icon/otp.png" preview={false} width={150} className='mb-8' />
                    <div className='clear-both'></div>
                    <Input.OTP formatter={(str) => str.toUpperCase()} {...sharedProps} />
                    <Title level={4} className='mt-8'>Check your phone for verification code</Title>
                    <p className='mt-4'>Magrow MPC has sent the code to your mobile number: {data.phone_number}</p>
                    <a href="#" type="primary">Resend code via SMS</a>
                </div>
            </Modal>
        </>
    );
}

export default UserStatus;
