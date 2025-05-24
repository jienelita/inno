import { Button, Collapse, CollapseProps, Typography } from 'antd'
import React from 'react'
const { Title } = Typography;
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
      <div className='pl-4'>- For msp workers only.<br />
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
export default function ProductionLoan() {
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


        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end ">
          <div className="inline-flex w-fit items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <Button type="primary"  >Make Calculation Now</Button>
          </div>
        </div>
      </div>

      <Collapse items={items} defaultActiveKey={['2']} />
    </>
  )
}
