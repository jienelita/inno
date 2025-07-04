import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { statusColor, AccountingstatusOptions, accpermissionMap, AccstatusOptions, getStatusTag, loanCodeMap, loanTerms, modeMap, permissionMap, statusOptions, tagLabels } from '@/lib/helpers';
import { Alert, Avatar, Button, ConfigProviderProps, Divider, Drawer, Dropdown, Image, message, Modal, Space, Table, Tag, Timeline } from 'antd';
import { DownloadOutlined, DownOutlined, ProfileFilled, ProfileTwoTone, UserOutlined } from '@ant-design/icons';
import ImageFreeCropModal from '@/lib/ImageFreeCropModal';
import ImageEasyCropModal from '@/lib/ImageEasyCropModal';
import '@ant-design/v5-patch-for-react-19';
import { Crop, Pencil, Printer, User2 } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver'; // optional for nicer file download
import TextArea from 'antd/es/input/TextArea';
import UserInformation from '@/components/user/userInformation';
import { usePermission } from '@/hooks/usePermission';
import axios from 'axios';

const breadcrumbs = [
    { title: 'Loans', href: '/loan-manager' },
    { title: 'View Loan', href: '/loan-manager' },
];

type Document = {
    id: number;
    user_id: number;
    image_name: string;
    image_tag: number;
    loan_id: number;
    image_mapping: number;
    reason: string;
    reason_deny: string;
    current_address: string;
};
type LogFile =
    {
        log_message: string;
        status: number
        id: number;
    }
interface Doc {
    id: number;
    image_name: string;
    image_mapping: number;
}

interface Props {
    details: {
        id: number;
        cid: number;
        loan_code: number;
        term: number;
        payment_mode: string;
        status: number;
        loan_details: string;
        [key: string]: any;
        updated_at: string;
        first_name: string;
        last_name: string;
        bithdate: string;
        phone_number: string;
        created_at: string;
        birth_place: string;
        current_address: string;
        permanent_address: string;
        is_active: number;
        email: string;
        name: string;
        email_verified_at: string;
        user_id: number;
        acc_status: number;
        check_by: number;
        reason_deny: string;
        approve_by: number;
    };
    documents: Document[];
    logfile: LogFile[];
    img_data: string;
    approve_by: {
        name: string;
        approve_by: number
    }
    checkby: {
        name: string;
        check_by: number
    }
}
type SizeType = ConfigProviderProps['componentSize'];
type User = {
    id: number;
    name: string;
    email: string;
    is_admin: number;
};
type PageProps = {
    auth: {
        user: User;
    };
};
interface UserType {
    user_id: number;
    cid: number;
    first_name: string;
    last_name: string;
    bithdate: string;
    phone_number: string;
    created_at: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    is_active: number;
    email: string;
    name: string;
    email_verified_at: string;
    status: number
}
interface PaymentRecord {
    cid: number,
    recid: number,
    acc_no: number,
    chd: number,
    trn: number,
    trn_desc: string,
    trn_mode: string,
    trn_amount: string,
    balance_amount: string,
    trn_date: string,
}
export default function ViewDetails({ details, documents, img_data, approve_by, checkby, logfile }: Props) {

    const { data, post, setData, reset } = useForm({
        reason: '',
        reason_deny: '',
    });
    const loandetails = JSON.parse(details.loan_details);
    const [easyCropVisible, setEasyCropVisible] = useState(false);
    const [freeCropVisible, setFreeCropVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const handleOpenCrop = (doc: Doc) => {
        setSelectedImage(`/images/${doc.image_name}`);
        setSelectedDocId(doc.id);
        setFreeCropVisible(true);
    };
    const handleOpenEasyCrop = (doc: Doc) => {
        setSelectedImage(`/images/${doc.image_name}`);
        setSelectedDocId(doc.id);
        setEasyCropVisible(true);
    };
    const handleSaveCroppedImage = (blob: Blob) => {
        const formData = new FormData();
        const renamedFile = new File([blob], `doc_${selectedDocId}.jpg`, {
            type: 'image/jpeg',
        });
        formData.append('image', renamedFile);
        formData.append('id', selectedDocId!.toString());
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch('/update-id-image', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': token || '',
            },
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                setSaving(false);
                if (data.status === 1) {
                    message.success(`${data.message}`);
                } else {
                    message.error(`${data.message}`);
                }
                reset(); // clear form
            });
    };

    const handleDownloadPDF = async () => {
        const pdfDoc = await PDFDocument.create();
        const pageWidth = 595;  // A4 width
        const pageHeight = 842; // A4 height
        const margin = 20;
        const columnSpacing = 10;
        const rowSpacing = 20;
        const columnWidth = (pageWidth - margin * 2 - columnSpacing) / 2;
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yOffset = pageHeight - margin;
        let colIndex = 0; // 0 = left, 1 = right
        const filteredDocs = documents.filter(doc =>
            [1, 2, 3, 6, 7].includes(doc.image_mapping)
        );
        for (const doc of filteredDocs) {
            const imageUrl = `/images/${doc.image_name}`;
            const res = await fetch(imageUrl);
            const contentType = res.headers.get('Content-Type') || '';
            const imageBytes = await res.arrayBuffer();
            try {
                const image = contentType.includes('png')
                    ? await pdfDoc.embedPng(imageBytes)
                    : await pdfDoc.embedJpg(imageBytes);
                // Scale image to fit column width
                const scale = columnWidth / image.width;
                const scaledWidth = columnWidth;
                const scaledHeight = image.height * scale;
                // If there's not enough height left for a new row → add a new page
                if (yOffset - scaledHeight - rowSpacing < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    yOffset = pageHeight - margin;
                    colIndex = 0;
                }
                const x = margin + (colIndex * (columnWidth + columnSpacing));
                const y = yOffset - scaledHeight;
                // Optional label
                page.drawText(tagLabels[doc.image_mapping] ?? 'Document', {
                    x,
                    y: y + scaledHeight + 4,
                    size: 10,
                    color: rgb(0, 0, 0),
                });
                page.drawImage(image, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight,
                });
                // Switch columns or move to next row
                if (colIndex === 0) {
                    colIndex = 1; // move to right column
                } else {
                    colIndex = 0;             // back to left
                    yOffset = y - rowSpacing; // move down a row
                }
            } catch (err) {
                console.error(`Failed to process image: ${doc.image_name}`, err);
                continue;
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `${details.name}documents.pdf`);
    };

    const [size, setSize] = useState<SizeType>('middle'); // default is 'middle'

    const [isDisapproveModalOpen, setIsDisapproveModalOpen] = useState(false);
    //const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<{ loanId: number; status: number } | null>(null);
    const [disapproveReason, setDisapproveReason] = useState('');
    const { tagColor, statusText } = getStatusTag(details.status);

    const isDanger = tagColor === 'red';    // Disapproved
    const isWarning = tagColor === 'gold';

    const handleMenuClick = (loanId: number) => (e: any) => {
        const newStatus = parseInt(e.key);
        if (newStatus === 2 || newStatus === 4) {
            // setSelectedLoanId(loanId);
            setSelectedLoan({ loanId, status: newStatus });
            setIsDisapproveModalOpen(true);
        } else {
            post(`/loan-update-status/${newStatus}/${loanId}`, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: (page) => {
                    const res = page.props as any;

                    if (res.status > 1) {
                        message.error(`${res.message}`);
                    } else {
                        message.success(`${res.message}`);
                    }
                },
            });
        }
    };

    const [selectedStatusKey, setSelectedStatusKey] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { colorTagging, statusAccText } = AccountingstatusOptions(details.acc_status);

    const isPreApprove = colorTagging === 'green';
    const isDeny = colorTagging === 'red';

    const saveUpdateAcc = (selectedStatusKey: number, newStatus: number) => {
        post(`/update-accounting/${selectedStatusKey}/${newStatus}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: (page) => {
                const res = page.props as any;
                if (res.status > 1) {
                    message.error(res.message);
                } else {
                    message.success(res.message);
                }
                setIsModalOpen(false)
                reset(); // clear form
            }
        })
    }

    const handleAccountingClick = (loanId: number) => (e: any) => {
        const newStatus = parseInt(e.key);
        if (newStatus === 2) {
            setSelectedStatusKey(loanId);
            setIsModalOpen(true);
        } else {
            saveUpdateAcc(loanId, newStatus);
        }
    };

    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const option = getStatusTag(details.status);
    const accOption = AccountingstatusOptions(details.acc_status);
    const date = new Date(details.updated_at);
    const formattedDate = date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Set to false if you prefer 24-hour time
    });
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [open, setOpen] = useState(false);

    const showDrawer = (user: UserType) => {
        setSelectedUser(user);
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
        setSelectedUser(null);
    };
    const { hasPermission } = usePermission();

    const filteredStatusOptions = statusOptions?.filter((item) => {
        if (!item || typeof item.key === 'undefined' || item.key === null) return false;
        const perm = permissionMap[String(item.key)];
        if (perm) {
            return hasPermission(perm[0], perm[1]);
        }
        return true;
    });

    const accStatusOptions = AccstatusOptions?.filter((item) => {
        if (!item || typeof item.key === 'undefined' || item.key === null) return false;
        const perm = accpermissionMap[String(item.key)];
        if (perm) {
            return hasPermission(perm[0], perm[1]);
        }
        return true;
    });

    const canShowDropdown =
        (hasPermission('loan-manager', 'approved') &&
            hasPermission('loan-manager', 'disapproved')) ||
        user.is_admin === 3 ||
        details.status !== 2;

    const shouldShowDropdown =
        user.is_admin === 3 || // ✅ force show dropdown for admin
        (details.status > 0 && details.acc_status > 0) ||
        (!hasPermission('loan-manager', 'approved') &&
            !hasPermission('loan-manager', 'disapproved'));

    const showSuccessTagInstead =
        details.status === 1 &&
        !hasPermission('loan-manager', 'approved') &&
        user.is_admin !== 3; // ✅ don't show success tag for admin

    // level two drawer start
    const [isLevelTwoOpen, setIsLevelTwoOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [accountDetails, setAccountDetails] = useState<PaymentRecord[] | null>(null);
    const openLevelTwo = async (accountNo: string, cid: number) => {
        setSelectedAccount(accountNo);
        setIsLevelTwoOpen(true);

        try {
            const res = await axios.get(`/account-history/${accountNo}/${cid}`);
            setAccountDetails(res.data);
        } catch (error) {
            console.error('Failed to fetch account:', error);
            setAccountDetails(null);
        }
    };
    const columns = [
        {
            title: 'Balance Amount',
            dataIndex: 'balance_amount',
            key: 'balance_amount',
        },
        {
            title: 'Transaction Amount',
            dataIndex: 'trn_amount',
            key: 'trn_amount',
            // render: (balance_amount: number) => `₱${balance_amount.toFixed(2)}`,
        },
        {
            title: 'Description',
            dataIndex: 'trn_desc',
            key: 'trn_desc',
        },
        {
            title: 'Transaction Date',
            dataIndex: 'trn_date',
            key: 'trn_date',
            render: (date: string) => {
                const options: Intl.DateTimeFormatOptions = {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                };
                return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
            },
        },
    ];
    // level two drawer end

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Details" />
            <div className="px-4 pt-4">
                <div className="p-2 rounded-xl border flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        {img_data === '' ? (
                            <Avatar size={64} icon={<UserOutlined />} />
                        ) : (
                            <Avatar src={`/images/${img_data}`} size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} />
                        )}
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                {details.name}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <b>CID: {details.cid}</b>
                                </p>
                            </div>
                        </div>
                        <div className="hidden flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                            <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" fill=""></path>
                                </svg>
                            </button>

                            <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" fill=""></path>
                                </svg>
                            </button>

                            <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" fill=""></path>
                                </svg>
                            </button>

                            <button className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z" fill=""></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <>
                        {hasPermission('members-section', 'edit') && (
                            <Link href={`/member/${details.user_id}`}>
                                <Button type="dashed" icon={<Pencil size='14px' />}>
                                    Edit
                                </Button>

                            </Link>
                        )}
                        {user.is_admin !== 0 && (
                            <Button onClick={() => showDrawer(details)} type="dashed" icon={<User2 size='14px' />}>
                                View Profile
                            </Button>
                        )}
                    </>
                </div>
            </div>
            {user.is_admin > 0 && (
                <div className="px-4 pt-4">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                            {(filteredStatusOptions?.length ?? 0) > 0 && (
                                <>
                                    {canShowDropdown ? (
                                        showSuccessTagInstead ? (
                                            <Tag color="success">{statusText}</Tag>
                                        ) : shouldShowDropdown ? (
                                            <Dropdown
                                                menu={{ items: filteredStatusOptions, onClick: handleMenuClick(details.id) }}
                                                trigger={['click']}
                                            >
                                                <Button
                                                    size={size}
                                                    type={!isWarning && !isDanger ? 'primary' : 'default'}
                                                    danger={isDanger}
                                                    className={isWarning ? 'bg-yellow-400 text-black border-none hover:bg-yellow-500' : ''}
                                                >
                                                    {statusText} <DownOutlined />
                                                </Button>
                                            </Dropdown>
                                        ) : (
                                            <Alert
                                                type="error"
                                                message={
                                                    details.status === 0
                                                        ? 'Pending, please wait for validation'
                                                        : 'Validated but not yet confirmed from accounting'
                                                }
                                            />
                                        )
                                    ) : (
                                        <Tag color={tagColor}>{statusText}</Tag>
                                    )}
                                </>
                            )}

                            {details.status === 3 && (
                                <>
                                    {(hasPermission('loan-manager', 'pre-approved') || hasPermission('loan-manager', 'deny')) && (
                                        <Dropdown
                                            menu={{
                                                items: accStatusOptions,
                                                onClick: handleAccountingClick(details.id),
                                            }}
                                            trigger={['click']}
                                        >
                                            <Button
                                                size={size}
                                                type={!isDeny && !isPreApprove ? 'primary' : 'default'}
                                                danger={isDeny}
                                                className={isDeny ? 'bg-yellow-400 text-black border-none hover:bg-yellow-500' : ''}
                                            >
                                                {statusAccText} <DownOutlined />
                                            </Button>
                                        </Dropdown>
                                    )}
                                </>
                            )}

                            <Button href={`/promisory-note/${details.id}`} className='ms-1' type="default" icon={<Printer />} >
                                Promisory Note
                            </Button>
                            <Button className='ms-1' type="primary" icon={<DownloadOutlined />} size={size} onClick={handleDownloadPDF} >
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex gap-4 rounded-xl p-4">

                <div className="w-1/3 border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Loan Details</h2>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Loan ID
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                {details.id}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Loan Application
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                {loanCodeMap[details.loan_code]}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Loan Amount
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                ₱ {parseFloat(loandetails.loan_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Net Proceeds
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                ₱ {parseFloat(loandetails.netProceeds).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {details.loan_code !== 1 && (
                            <>
                                <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                                    <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                        Loan Term
                                    </span>
                                    <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                        {loanTerms[loandetails.term]}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Mode Of Payment
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                {modeMap[loandetails.payment_mode]}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Loan Status
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                <Tag color={tagColor}>{statusText}</Tag>
                            </span>
                        </div>
                        {(details.status === 2 || details.status === 4) && (
                            <>
                                <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                                    <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                        Reason:
                                    </span>
                                    <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                        {details.reason}
                                    </span>
                                </div>
                            </>
                        )}
                        {(details.status > 0) && (
                            <>
                                <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                                    <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                        {option.statusText} By:
                                    </span>
                                    <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                        {details.approve_by > 0 && (
                                            <>
                                                {approve_by.name}
                                            </>
                                        )}
                                    </span>
                                </div>


                            </>
                        )}

                        {(details.status !== 4 && details.check_by > 0) && (
                            <>
                                {details.acc_status > 0 && (
                                    <>
                                        <Divider>Accounting</Divider>
                                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                                Accounting Status:
                                            </span>
                                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                                <Tag color={colorTagging}>{accOption.statusAccText}</Tag>
                                            </span>
                                        </div>
                                        {details.acc_status === 2 && (
                                            <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                                                <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                                    Deny Reason:
                                                </span>
                                                <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                                    {details.reason_deny}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800 mb-8">
                                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                                Process by:
                                            </span>
                                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                                {details.check_by > 0 && (
                                                    <>
                                                        {checkby?.name}
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                    </>
                                )}
                            </>
                        )}
                        <Divider>Date Updated</Divider>
                        <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                Updated At:
                            </span>
                            <span className="text-right text-theme-sm text-gray-500 dark:text-gray-400">
                                {formattedDate}
                            </span>
                        </div>
                        {user.is_admin > 0 && (
                            <>
                                <div className='mt-8 mb-8'>
                                    <Divider>Log File</Divider>
                                </div>

                                <Timeline
                                    items={logfile.map((log) => ({
                                        children: <div dangerouslySetInnerHTML={{ __html: log.log_message }} />,
                                        color: statusColor(log.status),
                                    }))}
                                />
                            </>
                        )}

                    </div>
                </div>
                <div className="w-2/3 border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border">
                    <div className="p-4">
                        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Documents Uploaded
                                </h3>
                            </div>

                            <div className="inline-flex items-center gap-0.5 ">

                            </div>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6"></h2>
                        <div className="pl-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="relative mb-4">
                                    <h3 className="font-semibold text-gray-700 dark:text-white/90 lg:mb-2">
                                        {tagLabels[doc.image_mapping] ?? 'Other Document'}
                                    </h3>
                                    <Image width={400} src={`/images/${doc.image_name}`} alt={tagLabels[doc.image_mapping]} />
                                    {/* This section will crop image */}
                                    {hasPermission('loan-manager', 'crop') && (
                                        <>
                                            {doc.image_mapping === 3 ? (
                                                <Button size="large"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => handleOpenEasyCrop(doc)} type="primary" shape="circle" icon={<Crop />} />
                                            ) : (
                                                <>
                                                    {doc.image_mapping !== 4 && (
                                                        <Button size="large"
                                                            className="absolute top-0 right-5"
                                                            onClick={() => handleOpenCrop(doc)} type="primary" shape="circle" icon={<Crop />} />
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                </div>
                            ))}
                            {/* This section will open modal for crop image */}
                            {user.is_admin > 0 && (
                                <>
                                    <ImageFreeCropModal
                                        visible={freeCropVisible}
                                        imageSrc={selectedImage}
                                        onClose={() => setFreeCropVisible(false)}
                                        onSave={handleSaveCroppedImage}
                                    />
                                    <ImageEasyCropModal
                                        visible={easyCropVisible}
                                        imageSrc={selectedImage}
                                        onClose={() => setEasyCropVisible(false)}
                                        onSave={handleSaveCroppedImage}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                </div >
            </div >
            <Drawer
                title="Member Profile"
                width={'60%'}
                onClose={onClose}
                open={open}
                styles={{ body: { paddingBottom: 80 } }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                    </Space>
                }
            >
                {selectedUser && (
                    <>
                        <UserInformation user={selectedUser} openLevelTwo={openLevelTwo} />
                        <Drawer
                            title={`Account Details for ${selectedAccount}`}
                            width={700}
                            open={isLevelTwoOpen}
                            onClose={() => {
                                setIsLevelTwoOpen(false);
                                setAccountDetails(null); // optional
                            }}
                        >
                            {accountDetails ? (
                                <Table
                                    dataSource={accountDetails}
                                    columns={columns}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            ) : (
                                <p>Loading or no data...</p>
                            )}
                        </Drawer>
                    </>
                )}
            </Drawer>
            <Modal
                open={isModalOpen}
                title="Application Denied"
                onOk={() => {
                    if (!selectedStatusKey) return;
                    saveUpdateAcc(selectedStatusKey, 2);
                }}
                onCancel={() => {
                    setIsModalOpen(false)
                }}
                okText="Submit"
                cancelText="Cancel"
            >
                <TextArea
                    rows={4}
                    value={data.reason_deny}
                    onChange={(e) => setData('reason_deny', e.target.value)}
                    placeholder="Please provide a reason for application deny..."
                />
            </Modal>
            <Modal
                title={
                    selectedLoan?.status === 2
                        ? 'Reason for Disapproval'
                        : 'Reason for Reject.'
                }
                open={isDisapproveModalOpen}
                onOk={() => {
                    if (!selectedLoan?.loanId) return;
                    post(`/loan-update-reason/${selectedLoan?.loanId}/${selectedLoan?.status}`, {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        onSuccess: (page) => {
                            const res = page.props as any;
                            if (res.status > 1) {
                                message.error(res.message);
                            } else {
                                message.success(res.message);
                            }
                            setIsDisapproveModalOpen(false);
                            reset(); // clear form
                        },
                    });
                }}
                onCancel={() => {
                    setIsDisapproveModalOpen(false);
                    setDisapproveReason('');
                }}
                okText="Submit"
                cancelText="Cancel">
                <TextArea
                    rows={4}
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Please provide a reason for disapproval..."
                />
            </Modal>
        </AppLayout >
    );
}
