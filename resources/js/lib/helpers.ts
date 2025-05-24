import { MenuProps } from "antd";

export const loanCodeMap: Record<number, string> = {
    1: 'Net Cash',
    2: 'Capital Share Loan (LAD)',
    3: 'Pre-Paid Cash Adnvace - Netcash.',
};

export const loanCode: Record<number, string> = {
    1: 'Net Cash',
    2: 'LAD',
    3: 'APL (CA)',
};

export const getLoanCodeFilters = () => {
    return Object.entries(loanCodeMap).map(([value, text]) => ({
        value: parseInt(value),
        text,
    }));
};

export const modeMap: Record<number, string> = {
    1: 'Weekly',
    2: 'Semi - monthly',
    3: 'Monthly',
    4: 'Quarterly',
};

export const loanTerms: Record<number, string> = {
    4: '4 Months',
    6: '6 Months',
    12: '12 Months',
    24: '24 Months',
    36: '36 Months',
    48: '48 Months',
};

export const AplmodePayment: Record<number, string> = {
    1: 'Weekly',
    2: 'Semi - monthly',
    3: 'Monthly'
};

export const AplLoanTerms: Record<number, string> = {
    1: '1 Month',
    2: '2 Months',
    3: '3 Months',
    4: '4 Months',
};
export const loanTermModePayment = {
    1: 'Weekly',
    2: 'Semi - monthly',
    3: 'Monthly',
    4: 'Quarterly',
};

// resources/js/lib/helpers.ts

export const getStatusTag = (status: number): { tagColor: string; statusText: string } => {
    switch (status) {
        case 0:
            return { tagColor: 'gold', statusText: 'Pending' };
        case 1:
            return { tagColor: 'green', statusText: 'Approved' };
        case 2:
            return { tagColor: 'red', statusText: 'Disapproved' };
        case 3:
            return { tagColor: 'green', statusText: 'Validated' };
        default:
            return { tagColor: 'default', statusText: 'Unknown' };
    }
};

export const tagLabels: { [key: number]: string } = {
    1: 'Borrower Magrow ID',
    2: 'Borrower Valid ID',
    3: 'Borrower Selfie',
    4: 'Signature',
    5: 'Payslip',
    6: 'Co-Maker Magrow ID',
    7: 'Co-maker Valid ID'
};

export const statusOptions: MenuProps['items'] = [
    {
        key: '0',
        label: 'Pending',
    },
    {
        key: '1',
        label: 'Approved',
    },
    {
        key: '2',
        label: 'Disapproved',
    },
    {
        key: '3',
        label: 'Validated',
    },
];

export const statusFilterOptions = [
    { text: 'Pending', value: 0 },
    { text: 'Approved', value: 1 },
    { text: 'Disapproved', value: 2 },
    { text: 'Validated', value: 3 },
];

export const userStatus: Record<number, { label: string; color: string }> = {
    0: { label: 'Inactive Account', color: 'default' },          // gray
    1: { label: 'Pending Verification', color: 'warning' },       // yellow
    2: { label: 'Disabled Account', color: 'error' },             // red
    3: { label: 'Active Account', color: 'success' },             // green
};

export const AdminuserStatus: Record<number, { label: string; color: string }> = {
    2: { label: 'Disabled Account', color: 'error' },             // red
    3: { label: 'Active Account', color: 'success' },             // green
};

export const formatDateTime = (value: string | Date): string => {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (value: string | Date): string => {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

export const isAdminCode: Record<number, string> = {
    0: 'User',
    1: 'Membership',
    2: 'Loan Section',
    3: 'Administrator',
    //	0 = user, 1 = membership, 2 = loansection, 3 = admin	
};
