import { Alert } from 'antd';
type Props = {
    data?: {
        is_active: number;
        status: number;
    };
    reason: string;
};
const UserStatus = ({ data, reason }: Props) => {
    if (!data) return <p>No user data found.</p>;
    return (
        <>
            {data.is_active !== 2 && (
                <>
                    {data.status === 0 ? (
                        <Alert
                            message="Pending Verification"
                            description="This account is awaiting approval or verification."
                            type="warning"
                            className='p-2'
                            closable={false}
                        />
                    ) : data.status === 2 ? (
                        <Alert
                            message="Disapproved"
                            description=
                            {
                                <>
                                    Sorry we are unable to approve your application. <br />
                                    <strong>Reason: {reason}</strong>
                                </>
                            }
                            type="error"
                            closable={false}
                        />
                    ) : (
                        <></>
                    )}
                </>
            )}
            {data.is_active === 0 ? (
                <Alert
                    message="Inactive Account"
                    description="This account was set to inactive account by our administrator. You can send message here."
                    type="warning"
                    className='p-2'
                    closable={false}
                />
            ) : data.is_active === 1 ? (
                 <Alert
                    message="Pending Verification"
                    description="This account was set to pending verification by our administrator. You can send message here."
                    type="info"
                    closable={false}
                />
            ) : data.is_active === 2 ? (
                <Alert
                    message="Disable Account"
                    description="Please contact Magrow MPC. Please read our term and policy here."
                    type="error"
                    closable={false}
                />
            ) : (
                <></>
            )}
        </>
    );
}

export default UserStatus;
