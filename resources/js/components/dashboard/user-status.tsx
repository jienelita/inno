import React from 'react'
import { CloseSquareOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
type Props = {
    data?: {
        is_active: number;
    };
};
const onClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e, 'I was closed.');
};
const UserStatus = ({ data }: Props) => {
    if (!data) return <p>No user data found.</p>;
        return (
            <>
                {data.is_active === 0 ? (
                    <Alert
                        message="Inactive Account"
                        description="This user account is currently inactive and please verify your email."
                        type="warning"
                        className='p-2'
                        closable={false}
                        onClose={onClose}
                    />
                ) : data.is_active === 1 ? (
                    <Alert
                        message="Pending Verification"
                        description="This account is awaiting approval or verification."
                        type="info"
                        closable={false}
                        onClose={onClose}
                    />
                ) : data.is_active === 2 ? (
                    <Alert
                        message="Disable Account"
                        description="Please contact Magrow MPC. Please read our term and policy here."
                        type="error"
                        closable={false}
                        onClose={onClose}
                    />
                ) : (
                    <></>
                )}
            </>
        );
   

    // if (data.is_active !== 3) {
    //     if (data.is_active === 0) {
    //         return <div className="ant-alert ant-alert-error css-var-«r8o»">
    //             <div className="ant-alert-content"><div className="ant-alert-message">Inactive Account, Please verify your email.</div></div>
    //         </div>;
    //     } else if (data.is_active === 1) {
    //         return <p className="text-yellow-600">Pending Approval</p>;
    //     } else if (data.is_active === 2) {
    //         return <p className="text-yellow-600">Disable Account, Please contact Magrow MPC. Please read our term and policy here.</p>;
    //     } else {
    //         return <></>;
    //     }
    // }
}

export default UserStatus;
