import { Alert, Avatar, Col, Row } from "antd";
import { useEffect, useState } from 'react';
interface Props {
  user: {
    user_id: number;
    cid: number;
    first_name: string;
    last_name: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    created_at: string;
    bithdate: string;
    phone_number: string;
    is_active: number;
    email: string;
    email_verified_at: string;
    status: number;
  };
}
interface UserMoreInfo {
  image_name: string;
  reason: string;
  disable_by: string;
  disaproved_by: string;
  disaproved_res: string;
}
export default function UserInformation({ user }: Props) {
  const [moreIfo, setMoreInfo] = useState<UserMoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`/user-manager/profile-image/${user.user_id}`);
        const data = await res.json();
        setMoreInfo(data || null);
      } catch (err) {
        console.error('Error fetching image:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [user.user_id]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`/members-loan/${user.user_id}`);
        const data = await res.json();
        //setMoreInfo(data || null);
      } catch (err) {
        console.error('Error fetching image:', err);
      } finally {
        //setLoading(false);
      }
    };
    fetchImage();
  }, [user.user_id]);

  if (loading) return <div>Loading image...</div>;
  return (
    <>
      <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
        <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
          <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src={`/images/${moreIfo?.image_name}`} />
        </div>
        <div className="order-3 xl:order-2">
          <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
            {user.first_name} {user.last_name}
          </h4>
          <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <b>CID: {user.cid}</b>
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <b>Account ID: {user.user_id}</b>
            </p>
          </div>
        </div>
      </div>
      {user?.email_verified_at === null && (
        <div  className='mt-2'>
          <Alert
            message="Remarks: Email address not verify"
            // description=""
            type="error"
           
            closable={false}
          />
        </div>
      )}
      {user.is_active === 2 && (
        <>
          {moreIfo?.reason !== '' && (
            <>
              <div className={`mt-3 transition-opacity duration-500 opacity-100 space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10`}>
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                  <div>
                    <span className="font-medium">Disabled by:</span> {moreIfo?.disable_by}<br />
                    <span className="font-medium">Reason:</span> {moreIfo?.reason}<br />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {user.status === 2 && (
        <>
          {moreIfo?.disaproved_res !== '' && (
            <>
              <div className={`mt-3 transition-opacity duration-500 opacity-100 space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10`}>
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                  <div>
                    <span className="font-medium">Disaproved by:</span> {moreIfo?.disaproved_by}<br />
                    <span className="font-medium">Reason:</span> {moreIfo?.disaproved_res}<br />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-3 ">Personal Information</h4>
        <Row className='mt-0'>
          <Col span={12} className='mt-0'>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>
          </Col>
          <Col span={12} className='mt-0'>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Birth Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.bithdate}
              </p>
            </div>
          </Col>
          <Col span={12} className='mt-3'>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phone_number}
              </p>
            </div>
          </Col>
          <Col span={12} className='mt-3'>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Birth Place
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.birth_place}
              </p>
            </div>
          </Col>
        </Row>
      </div>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-2">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-3 ">Address</h4>
        <Row className='mt-1'>
          <Col span={12}>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Current Address
              </p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {user.current_address}
              </p>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <p className="mb-2 leading-normal text-gray-500 dark:text-gray-400">
                Permanent Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.permanent_address}
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}