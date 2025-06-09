import React, { useEffect, useState } from 'react'
import { Alert, Button, Collapse, CollapseProps, Modal, Drawer, Typography, Space, message } from "antd";
const { Title } = Typography;
import type { DrawerProps } from 'antd';
import Additionalrequirments from './additional-requirments';
import { usePage } from '@inertiajs/react';
import { loanTerms, loanTermModePayment } from '@/lib/helpers'
const withinsurance = {
  0: 'No',
  1: 'Yes'
};

const items: CollapseProps['items'] = [
  {
    key: '1',
    label: 'Interest Rates and Terms',
    children: <>
      <Title level={5}>Interest Rate:</Title>
      <span className='pl-4'>- 18% interest rate per annum diminishing balance.</span>

      <Title level={5}>Loanable Amount:</Title>
      <span className='pl-4'>- 90% of the total deposit (capital share + providential saving + time deposit).</span>

      <Title level={5}>Terms:</Title>
      <div className='pl-4'>
        - 4 Months. <br />
        - 6 Months. <br />
        - 12 Months. <br />
        - 24 Months. <br />
        - 36 Months. <br />
        - 48 Months. <br />
      </div>

      <Title level={5}>Payment Modes:</Title>
      <div className='pl-4'>
        - Weekly.<br />
        - Semi-monthly.<br />
        - Monthly.<br />
        - Quarterly.<br />
      </div>
    </>,
  },
  {
    key: '2',
    label: 'Deductions and Penalty Rates',
    children: <>
      <Title level={5}>Penalty:</Title>
      <span className='pl-4'>- No penalty.</span>

      <Title level={5}>Advance Interest:</Title>
      <span className='pl-4'>- No advance interest.</span>

      <Title level={5}>Service Charge:</Title>
      <div className='pl-4'>
        - Service fee of 2% of the loaned amount up to years term.<br />
        - Service fee of 2.5% of the loaned amount (above 2 years up to 3 years term).<br />
        - Service fee of the 3% of the loaned amount 4 years term.<br />
      </div>

      <Title level={5}>Capital Retention:</Title>
      <span className='pl-4'>- Capital retention or retirement savings - 2% of the loaned amount.</span>

      <Title level={5}>Notarial Fee:</Title>
      <span className='pl-4'>- No notarial fee.</span>
    </>,
  },
  {
    key: '3',
    label: 'Requirements',
    children: <>
      <div className='pl-4'>
        - Member share capital must be atleast 2,000.00 pesos only.<br />
        - Barrower Magrow ID.<br />
        - Barrowe Valid ID.<br />
      </div>
    </>,
  },
  {
    key: '4',
    label: 'Renewal Condition',
    children: <>
      <div className='pl-4'>- Upon 100 percent payment of previous loan.</div>
    </>,
  },
];
type Props = {
  gallery?: { image_name: string; image_path: string }[];
  userinfo?: {
    status: number;
    is_active: number;
    id: number;
  };
};

export default function Lad({ gallery, userinfo }: Props) {

  const [isLadModalOpen, setIsLadModalOpen] = useState(false);

  const LadModal = () => {
    setIsLadModalOpen(true);
  };

  const handleLadOk = () => {
    setIsLadModalOpen(false);
  };

  const LadhandleCancel = () => {
    setIsLadModalOpen(false);
  };

  const [loanAmount, setLoanAmount] = useState(0);
  const [tabname, settabname] = useState<any>(null);
  const [loanTerm, setLoanTerm] = useState('6');  // string type

  const [results, setResults] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState(2); // default to Semi-Monthly (numeric)
  const [insurance, setInsurance] = useState(0); // 0 = No, 1 = Yes
  const [membersLadBalance, setmembersLadBalance] = useState<any>(null);

  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const res = await fetch(`/members-balance/${userinfo?.id}/79`);
        const data = await res.json();
        setmembersLadBalance(data);
      } catch (err) {
        console.error('Error fetching image:', err);
      } finally {

      }
    };
    fetchAllRoles();
  }, []);

  const calculate = () => {
    const amount = parseFloat(loanAmount.toString());
    const termMonths = parseInt(loanTerm);
    const mode = parseInt(paymentMode.toString());
    if (amount === 0) {
      message.warning("Please Input Loan Amount.");
      return;
    }
    let paymentsPerMonth = 1;
    switch (mode) {
      case 1: // Weekly
        paymentsPerMonth = 4;
        break;
      case 2: // Semi-Monthly
        paymentsPerMonth = 2;
        break;
      case 3: // Monthly
        paymentsPerMonth = 1;
        break;
      case 4: // Quarterly
        paymentsPerMonth = 1 / 3;
        break;
      default:
        paymentsPerMonth = 1;
    }
    // Service Fee Logic
    let serviceFeeRate = 0.02;
    let insurancefee = 0.0066;
    if (termMonths >= 24 && termMonths < 36) {
      serviceFeeRate = 0.025;

    } else if (termMonths >= 36) {
      serviceFeeRate = 0.03;
      insurancefee = 0.0132;
    }

    const totalPayments = termMonths * paymentsPerMonth;
    // Deductions
    const insuranceFee = insurance === 1 ? amount * insurancefee : 0;
    const capitalRetention = amount * 0.02;
    const serviceFee = amount * serviceFeeRate;
    const laCapitalShare = parseFloat((membersLadBalance?.balance || '0').replace(/,/g, ''));
    const netProceeds = amount - capitalRetention - serviceFee - insuranceFee - laCapitalShare;

    // Interest
    const annualInterest = amount * 0.18;
    const monthlyInterest = annualInterest / 12;
    const totalInterest = monthlyInterest * termMonths;
    const interestPerPayment = totalInterest / totalPayments;

    // Amortization
    const principalPerPayment = amount / totalPayments;
    const totalPerPayment = principalPerPayment + interestPerPayment;

    setResults({
      capitalRetention,
      serviceFee,
      insuranceFee,
      netProceeds,
      totalInterest,
      interestPerPayment,
      principalPerPayment,
      totalPerPayment,
      totalPayments,
      serviceFeeRate,
      paymentsPerMonth
    });
  };

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps['size']>();

  const showLargeDrawer = () => {
    setSize('large');
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  console.log(membersLadBalance);
  return (
    <>
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Capital Share Loan (LAD)
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Loans Against Deposit
          </p>
          {membersLadBalance !== null && Object.keys(membersLadBalance).length > 0 && (
            <>
              {membersLadBalance?.balance !== '' && membersLadBalance?.balance !== null && (
                <div className='mt-3'>
                  <Alert message={`Active Balance: ₱ ${membersLadBalance?.balance}`} type="error" showIcon />
                </div>
              )}
            </>
          )}

        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end ">
          <div className="inline-flex w-fit items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {(userinfo?.status === 1 && userinfo?.is_active === 3) && (
              <Button type="primary" onClick={LadModal} >Make Calculation Now</Button>
            )}
          </div>
        </div>
      </div>

      <Collapse items={items} defaultActiveKey={['1']} />

      <Modal title="LAD (Capital Share Loan) Calculator"
        open={isLadModalOpen}
        onOk={handleLadOk}
        onCancel={LadhandleCancel}
        footer={null}
        style={{ top: 20 }}>

        <input type="hidden" value="lad" name='tabname' />

        <div className="max-w-md mx-auto">
          <div className="mb-4 mt-6">
            <label className="block mb-1 text-gray-600">Loan Amount:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-600">Loan Term:</label>
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => setLoanTerm(e.target.value)}
            >
              {Object.entries(loanTerms).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-600">Mode Of Payment:</label>
            <select
              className="w-full p-2 border rounded"
              onChange={(e) => setPaymentMode(Number(e.target.value))}
            >
              {Object.entries(loanTermModePayment).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-600">With Insurance:</label>
            <select className="w-full p-2 border rounded"
              onChange={(e) => setInsurance(Number(e.target.value))}
            >
              {Object.entries(withinsurance).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {results && (
            <div className="mt-4 mb-5">
              <label className="block mb-1 font-semibold text-gray-600">Deductions:</label>
              <div className='pl-4 mb-3'>
                - Capital Retention or Retirement Savings - 2% of the loaned <br />amount: ₱{results.capitalRetention.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className='pl-4 mb-3'>- Service Fee of {results.serviceFeeRate * 100} % of the loaned amount up to 2 years <br /> term: ₱{results.serviceFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>

              {results.insuranceFee > 0 && (
                <div className='pl-4 mb-3'>- Insurance Fee - 1.32% per year (max of 2 years) ₱{results.insuranceFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              )}

              <div className='pl-4 mb-3'>- Total Interest: ₱{results.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>

              {membersLadBalance?.balance !== '' && membersLadBalance?.balance !== null && (
                <div className='pl-4 mb-3 text-red-400'>
                  - Previous balance: ₱{membersLadBalance?.balance}
                </div>
              )}

              <label className="block mb-1 font-semibold text-gray-600">Net Proceeds:</label>
              <div className='pl-4'>Net Proceeds:<span className={`font-semibold  pl-1 ${results.netProceeds < 0 ? 'text-red-400' : ''}`}>₱{results.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>

              <label className="block mb-1 mt-4 font-semibold text-gray-600">Amortization Schedule:</label>
              <div className='pl-4'>Principal: ₱{results.principalPerPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className='pl-4'>Interest: ₱{results.interestPerPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className='pl-4 font-semibold'>Total: ₱{results.totalPerPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          )}
          <div className="text-center">
            <Button type="primary" onClick={calculate}>
              Calculate
            </Button>
            {results && (
              <>
                  {membersLadBalance?.balance !== undefined &&
                  membersLadBalance?.balance !== null &&
                  membersLadBalance?.balance !== '' ? (
                  <>
                    <Button type="primary" danger className="ml-3" >
                      Unable to apply, Please check your account.
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="primary" className="ml-3" onClick={showLargeDrawer} >
                      Apply now!
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Modal >

      {results && (
        <Drawer
          title="Capital Share Application"
          placement="right"
          size={size}
          onClose={onClose}
          open={open}
        >
          <Additionalrequirments
            loanData={{
              loanAmount,
              term: parseInt(loanTerm),
              paymentMode,
              insurance,
              tabname: 2,
              results,
            }}
            gallery={gallery}
            onClose={onClose}
          />
        </Drawer>
      )}

    </>
  )
}
