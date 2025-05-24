import React, { useState } from 'react'
import { Alert, Button, Collapse, Drawer, message, Modal, Typography } from "antd";
import type { CollapseProps, DrawerProps } from 'antd';
const { Title } = Typography;

import '@ant-design/v5-patch-for-react-19';
import Additionalrequirments from './additional-requirments';
import { loanTerms } from '@/lib/helpers';
type Props = {
  balance?: {
    id: number;
    net_cash: string;
  };
  gallery?: { image_name: string; image_path: string }[];
};
export default function NetCash({ balance, gallery }: Props) {
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [proceeds, setProceeds] = useState<number | null>(null);
  const [interest, setInterest] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState('1');
  const [results, setResults] = useState<any>(null);
  const handleCalculate = () => {
    const fee = loanAmount * 0.01; // 1% service fee
    const interestAmount = loanAmount * 0.01; // 1% interest for 15 days
    const NetcashBalance = parseFloat((balance?.net_cash || '0').replace(/,/g, ''));
    const totalDeduction = fee + interestAmount;
    const netProceeds = loanAmount - totalDeduction - NetcashBalance;
    if (loanAmount === 0) {
      message.warning("Please Input Loan Amount.");
      return;
    }
    setServiceFee(fee);
    setInterest(interestAmount);
    setProceeds(netProceeds);
    setResults({
      interestAmount,
      NetcashBalance,
      serviceFee,
      totalDeduction,
      netProceeds,
      fee
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const NetcashModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Interest Rates and Terms',
      children: <>
        <Title level={5}>Interest Rate:</Title>
        <span className='pl-4'>- 24% interest rate per annum diminishing balance.</span>

        <Title level={5}>Loanable Amount:</Title>
        <span className='pl-4'>- Net per payslip.</span>

        <Title level={5}>Terms:</Title>
        <span className='pl-4'>- 15 days.</span>

        <Title level={5}>Payment Modes:</Title>
        <span className='pl-4'>- Semi-monthly.</span>
      </>,
    },
    {
      key: '2',
      label: 'Deductions and Penalty Rates',
      children: <>
        <Title level={5}>Penalty:</Title>
        <span className='pl-4'>- No penalty.</span>

        <Title level={5}>Advance Interest:</Title>
        <span className='pl-4'>- Prepaid interest for the term of 15 days.</span>

        <Title level={5}>Service Charge:</Title>
        <span className='pl-4'>- Service fee of 1% of the loaned amount.</span>

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
        <div className='pl-4'>- For MSP workers only.<br />
          - Net per payslip must be the maximum loanable amount.<br />- Latest payslip.<br />- Borrower MAGROW ID.</div>
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
  console.log(balance);
  return (
    <>
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Net Cash
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Pre-paid cash advance - Netcash
          </p>
          {balance !== null && (
            <>
              {(balance?.net_cash !== '' || balance?.net_cash !== null) && (
                <div className='mt-3'>
                  <Alert message={`Active Balance: ₱ ${balance?.net_cash}`} type="error" showIcon />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end ">
          <div className="inline-flex w-fit items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <Button type="primary" onClick={NetcashModal} >Make Calculation Now</Button>
          </div>
        </div>
      </div>
      <Collapse items={items} defaultActiveKey={['1']} />

      <Modal title="Net Cash Calculator" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} style={{ top: 20 }} >
        <div className="max-w-md mx-auto">
          <div className="mb-4 mt-6">
            <label className="block mb-1 text-gray-600">Loan Amount:</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
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
            <select className="w-full p-2 border rounded" disabled>
              <option value="Semi-Monthly">Semi-Monthly</option>
            </select>
          </div>
          {proceeds !== null && (
            <div className="mt-4 mb-5">
              <label className="block mb-1 text-gray-600 font-semibold">Net Proceeds:</label>
              <div className='pl-4'>- <span className='font-medium'> ₱ {proceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>

              <label className="block mb-1 text-gray-600 font-semibold">Deductions:</label>
              <div className='pl-4'>
                - Prepaid interest for 15 days (₱{interest.toFixed(2)})<br />
                - Service Fee of 1% of loaned amount (₱{serviceFee.toFixed(2)})<br />
              </div>
              {balance?.net_cash !== '' && balance?.net_cash !== null && (
                <div className='pl-4 mb-3'>
                  - Previous balance: ₱{balance?.net_cash}
                </div>
              )}
              <label className="block mb-1 mt-4 text-gray-600 font-semibold">Amortization Schedule:</label>
              <div className='pl-4'>
                - Principal: Php {loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br />
                - Interest: Php 0.00<br />
                - Total: Php Php {loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          )}
          <div className="text-center">
            <Button type="primary" onClick={handleCalculate}>
              Calculate
            </Button>
            {proceeds !== null && (
              <>
                <Button type="primary" className='ml-3' onClick={showLargeDrawer}>
                  Apply now!
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal >

      {proceeds && (
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
              paymentMode: 2,
              insurance: 0,
              tabname: 1,
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
