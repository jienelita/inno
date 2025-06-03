import { AplLoanTerms, AplmodePayment, loanTerms } from '@/lib/helpers';
import { Alert, Button, Collapse, CollapseProps, Drawer, DrawerProps, Modal, Typography } from 'antd'
import React, { useState } from 'react'
import Additionalrequirments from './additional-requirments';
const { Title } = Typography;
type Props = {
  balance?: {
    id: number;
    apl_ca: string;
  };
  gallery?: { image_name: string; image_path: string }[];
  userinfo?: {
    status: number;
    is_active: number;
  }
};

const items: CollapseProps['items'] = [
  {
    key: '1',
    label: 'Interest Rates and Terms',
    children: <>
      <Title level={5}>Interest Rate:</Title>
      <span className='pl-4'>- 36% Interest rate per annum diminishing balance.</span>

      <Title level={5}>Loanable Amount:</Title>
      <div className='pl-4'>
        - Maximum of 4,000.00 pesos.<br />
        - Maximum of 1,000.00 pesos.<br />
      </div>

      <Title level={5}>Terms:</Title>
      <div className='pl-4'>
        - 1 Month. <br />
        - 2 Months. <br />
        - 3 Months. <br />
        - 4 Months. <br />
      </div>

      <Title level={5}>Payment Modes:</Title>
      <div className='pl-4'>
        - Weekly.<br />
        - Semi-Monthly.<br />
        - Monthly.<br />
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
      <span className='pl-4'>- No Advance Interest.</span>

      <Title level={5}>Service Charge:</Title>
      <span className='pl-4'>- Service fee of 50.00 + 0.5% of the loaned amount.</span>

      <Title level={5}>Capital Retention:</Title>
      <span className='pl-4'>- No capital retention.</span>

      <Title level={5}>Notarial Fee:</Title>
      <span className='pl-4'>- No notarial fee.</span>
    </>,
  },
  {
    key: '3',
    label: 'Requirements',
    children: <>
      <div className='pl-4'>
        - For MSP workers only.<br />
        - Member share capital must be atleast 2000.00 pesos.<br />
        - Latest payslip.<br />
        - Borrower MAGROW ID.<br />
        - Co-maker Magrow ID.
        - Co-maker Valid ID.
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
export default function Apl({ balance, gallery, userinfo }: Props) {
  const [isAplModalOpen, setIsAplModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps['size']>();
  const [results, setResult] = useState<{
    totalInterest: number;
    serviceFee: number;
    netProceeds: number;
    interestPerPayment: number;
    totalPayments: number;
    capitalRetention: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentFrequencyMap: Record<number, number> = {
    1: 4, // Weekly
    2: 2, // Semi-monthly
    3: 1, // Monthly
  };

  const handleCalculate = () => {
    setError(null); // Reset error
    setResult(null); // Clear previous result

    if (loanAmount < 1000 || loanAmount > 4000) {
      setError('Loan amount must be between ₱1,000 and ₱4,000.');
      return;
    }

    if (!loanTerm || !paymentMode) {
      setError('Please select loan term and payment mode.');
      return;
    }
    const annualInterestRate = 0.36;
    const monthlyInterestRate = annualInterestRate / 12;
    const totalMonths = loanTerm;
    const periods = paymentFrequencyMap[paymentMode] * totalMonths;
    const totalInterest = loanAmount * monthlyInterestRate * totalMonths;
    const serviceFee = 50 + loanAmount * 0.005;
    const totalPayable = loanAmount + totalInterest;
    const interestPerPayment = totalPayable / periods;
    const netProceeds = loanAmount - serviceFee;

    setResult({
      totalInterest,
      serviceFee,
      netProceeds,
      interestPerPayment,
      totalPayments: periods,
      capitalRetention: 0
    });
  };
  const showLargeDrawer = () => {
    setSize('large');
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Purpose Loan
          </h3>
          {balance !== null && (
            <>
              {balance?.apl_ca !== '' && balance?.apl_ca !== null && (
                <div className='mt-3'>
                  <Alert message={`Active Balance: ₱ ${balance?.apl_ca}`} type="error" showIcon />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end ">
          <div className="inline-flex w-fit items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {(userinfo?.status === 1 && userinfo?.is_active === 3) && (
              <Button type="primary" onClick={() => setIsAplModalOpen(true)}>Make Calculation Now</Button>
            )}
          </div>
        </div>
      </div>

      <Collapse items={items} defaultActiveKey={['2']} />

      <Modal
        title="All Purpose Loan Calculator"
        open={isAplModalOpen}
        onOk={() => setIsAplModalOpen(false)}
        onCancel={() => setIsAplModalOpen(false)}
        footer={null}
        style={{ top: 20 }}
      >
        <div className="max-w-md mx-auto">
          <div className="mb-4 mt-6">
            <label className="block mb-1 text-gray-600">Loan Amount:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
              placeholder="1000 - 4000"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-600">Loan Term:</label>
            <select
              className="w-full p-2 border rounded"
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseInt(e.target.value))}
            >
              {Object.entries(AplLoanTerms).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-600">Mode Of Payment:</label>
            <select
              className="w-full p-2 border rounded"
              value={paymentMode}
              onChange={(e) => setPaymentMode(parseInt(e.target.value))}
            >
              {Object.entries(AplmodePayment).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4">
              <Alert message={error} type="error" showIcon />
            </div>
          )}

          {results && (
            <div className="mt-6 space-y-2 text-sm text-gray-800">
              <p>- Total Interest: ₱{results.totalInterest.toFixed(2)}</p>
              <p>- Service Fee: ₱{results.serviceFee.toFixed(2)}</p>
              <p>- Net Cash: ₱{results.netProceeds.toFixed(2)}</p>
              <p>
                - Installment Amount (x{results.totalPayments}): ₱
                {results.interestPerPayment.toFixed(2)}
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Button type="primary" onClick={handleCalculate}>
              Calculate
            </Button>

            {results && (
              <Button type="primary" className="ml-3" onClick={showLargeDrawer} >
                Apply now!
              </Button>
            )}
          </div>
        </div>
      </Modal>

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
              term: loanTerm,
              paymentMode,
              insurance: 0,
              tabname: 3,
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
