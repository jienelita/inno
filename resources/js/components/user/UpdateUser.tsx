import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import { type BreadcrumbItem } from '@/types';
import { Avatar, Card, Col, Flex, message, Modal, Row, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import debounce from 'lodash.debounce';

interface Props {
    user_details: {
        first_name: string;
        last_name: string;
        middle_name: string;
        prefix_name: string;
        email: string;
        phone_number: string
        cid: number
        bithdate: string;
        birth_place: string;
        permanent_address: string;
        current_address: string;
        name: string;
        id: number
    };
    image_name: string;
}
interface FormState {
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    phone_number: string
    bithdate: string;
    birth_place: string;
    permanent_address: string;
    current_address: string;
    cid: number;
}
type FormErrors = {
    [K in keyof FormState]?: string;
};
export default function UpdateUser({ user_details, image_name }: Props) {
    const [loading, setLoading] = useState(false);
    const [frontendErrors, setFrontendErrors] = useState<FormErrors>({});
    const { errors: backendErrors } = usePage().props;
    const [formData, setFormData] = useState({
        current_address: user_details.current_address,
        permanent_address: user_details.permanent_address,
        user_id: user_details.id,
        cid: user_details.cid,
        first_name: user_details.first_name,
        last_name: user_details.last_name,
        email_address: user_details.email,
        phone_number: user_details.phone_number,
        bithdate: user_details.bithdate,
        birth_place: user_details.birth_place,
        middle_name: user_details.middle_name,
        prefix_name: user_details.prefix_name,
        photo: null as File | null,
        is_new_member: 0, // <-- Add this
    });

    const handleOk = () => {
        if (formData.is_new_member === 0 && (!formData.cid || formData.cid === 0)) {
            message.error("CID is required for existing members.");
            return;
        }
        setLoading(true);
        router.post('/update-user', formData, {
            forceFormData: true,
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
        });
    };
    const [cidAvailable, setCidAvailable] = useState<null | boolean>(null);
    const [checkingCid, setCheckingCid] = useState(false);

    const checkCID = async (value: string) => {
        if (value.length < 3) {
            setCidAvailable(null);
            return;
        }
        setCheckingCid(true);
        try {
            const res = await fetch(`/check-cid?CID=${value}`);
            const data = await res.json();
            setCidAvailable(data.available);
        } catch (err) {
            setCidAvailable(null);
        } finally {
            setCheckingCid(false);
        }
    };

    const debouncedCheckCID = useCallback(debounce(checkCID, 500), []);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validExtensions = ['image/jpeg', 'image/jpg'];
        if (!validExtensions.includes(file.type)) {
            alert("Only JPG or JPEG files are allowed.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            photo: file,
        }));

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const showError = (field: keyof FormState) => frontendErrors[field] || backendErrors[field];
    return (
        <>
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                <div className="p-4 md:p-4">
                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                        Profile
                    </h3>
                    <div className="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                                    <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }} src={`/images/${image_name}`} />
                                </div>
                                <div className="order-3 xl:order-2">
                                    <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                        {user_details.name}
                                    </h4>
                                    <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            <b>CID: {user_details.cid}</b><br />
                                            <b>ID: {user_details.id}</b>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <div className='p-5 border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min'>
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Personal Information
                                </h5>

                                <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">
                                    {/* Checkbox */}
                                    <div className="gap-4">
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                className="rounded h-5 w-5 border-gray-300 text-primary shadow-sm focus:ring-primary"
                                                checked={formData.is_new_member === 1}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        is_new_member: isChecked ? 1 : 0,
                                                    }));
                                                }}
                                            />
                                            New Member (No CID yet)
                                        </label>
                                    </div>

                                    {/* CID Input */}
                                    {formData.is_new_member === 0 && (
                                        <div className="col-span-2 lg:col-span-1">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                CID
                                            </label>
                                            <input
                                                value={formData.cid || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, cid: Number(value) });

                                                    if (value.length >= 3) {
                                                        debouncedCheckCID(value);
                                                    } else {
                                                        setCidAvailable(null);
                                                    }
                                                }}
                                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800"
                                            />
                                            {checkingCid && <p className="text-gray-500 text-sm mt-1">Checking CID...</p>}
                                            {cidAvailable === false && <p className="text-red-500 text-sm">CID is already taken.</p>}
                                            {cidAvailable === true && <p className="text-green-600 text-sm">CID is available!</p>}
                                        </div>
                                    )}

                                    {/* clear-end div */}
                                    <div className={`clear-end ${formData.is_new_member === 1 ? '' : 'hidden'}`} />

                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            First Name
                                        </label>
                                        <input
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, first_name: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('first_name') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('first_name')}</div>
                                        )}
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Middle Name
                                        </label>
                                        <input type="text"
                                            value={formData.middle_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, middle_name: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('middle_name') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('middle_name')}</div>
                                        )}
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Last Name
                                        </label>
                                        <input type="text"
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, last_name: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('last_name') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('last_name')}</div>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Prefix (<i className='font-normal'>Sr. Jr. II III</i>)
                                        </label>
                                        <input type="text"
                                            value={formData.prefix_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, prefix_name: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Email Address
                                        </label>
                                        <input type="text"
                                            readOnly disabled
                                            value={formData.email_address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email_address: e.target.value })
                                            } className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Phone
                                        </label>
                                        <input type="text"
                                            value={formData.phone_number}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Remove all non-numeric characters except +
                                                value = value.replace(/[^\d+]/g, '');

                                                // Convert starting 0 to +63
                                                if (value.startsWith('0')) {
                                                    value = '+63' + value.slice(1);
                                                }

                                                // If it starts with just "63", convert to "+63"
                                                if (value.startsWith('63') && !value.startsWith('+63')) {
                                                    value = '+63' + value.slice(2);
                                                }

                                                // Force prefix +63
                                                if (!value.startsWith('+63')) {
                                                    value = '+63';
                                                }

                                                // Remove anything after 13 characters (max for +63XXXXXXXXXX)
                                                const numeric = value.replace(/[^\d]/g, '').slice(0, 12); // +63 + 10 digits
                                                const formatted = `+63 ${numeric.slice(2, 5)
                                                    } ${numeric.slice(5, 8)
                                                    } ${numeric.slice(8, 12)
                                                    }`.trim().replace(/\s+/g, ' ');

                                                setFormData({ ...formData, phone_number: formatted });
                                            }}
                                            maxLength={16}
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('phone_number') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('phone_number')}</div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Birth Date
                                        </label>
                                        <input type="date"
                                            value={formData.bithdate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bithdate: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        <i>M/d/Y</i>
                                        {showError('bithdate') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('bithdate')}</div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className='p-5 border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min'>
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    More Information
                                </h5>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Birth Place
                                        </label>
                                        <input type="text"
                                            value={formData.birth_place}
                                            onChange={(e) =>
                                                setFormData({ ...formData, birth_place: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('birth_place') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('birth_place')}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Current Address
                                        </label>
                                        <input type="text"
                                            value={formData.current_address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, current_address: e.target.value })
                                            }
                                            className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('current_address') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('current_address')}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            City/State
                                        </label>
                                        <input type="text"
                                            value={formData.permanent_address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, permanent_address: e.target.value })
                                            } className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800" />
                                        {showError('permanent_address') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('permanent_address')}</div>
                                        )}
                                    </div>
                                    <div className="col-span-full">
                                        <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                                            Photo
                                        </label>
                                        <div className="mt-2 flex items-center gap-x-3">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <svg className="size-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                    <path d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                                </svg>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleButtonClick}
                                                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                                            >
                                                Change
                                            </button>
                                            <input
                                                type="file"
                                                accept=".jpg, .jpeg"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        <div className="DisplayImage mt-4">
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Uploaded" className="max-w-xs rounded border" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </Col>
                    </Row>
                    <button
                        type="button"
                        onClick={handleOk}
                        disabled={
                            loading || (formData.is_new_member === 0 && cidAvailable === false)
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded mt-5
    ${loading || (formData.is_new_member === 0 && cidAvailable === false)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
  `}
                    >
                        {loading && (
                            <svg
                                className="w-5 h-5 animate-spin text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                            </svg>
                        )}
                        {loading ? 'Updating...' : 'Update'}
                    </button>

                </div >
            </div >

        </>
    )
}
