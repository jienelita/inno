import React, { useState, useEffect, useCallback } from 'react';
import { router, usePage, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Cog, Check } from 'lucide-react';
import debounce from 'lodash.debounce';
import { message } from 'antd';
type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};
interface FormState {
    cid: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    bithdate: string;
    phone_number: string;
    email: string;
    birth_place: string;
    current_address: string;
    permanent_address: string;
    password: string;
    password_confirmation: string;
    file: File | null;
}
type FormErrors = {
    [K in keyof FormState]?: string;
};
const Create = () => {
    const { errors: backendErrors } = usePage().props;
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormState>({
        cid: '',
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        bithdate: '',
        phone_number: '',
        birth_place: '',
        current_address: '',
        permanent_address: '',
        password: '',
        password_confirmation: '',
        file: null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    //const [frontendErrors, setFrontendErrors] = useState({});
    const [isNewMember, setIsNewMember] = useState(false);
    const [frontendErrors, setFrontendErrors] = useState<FormErrors>({});
    const steps = ['Personal Details', 'Additional Info', 'Last Page'];
    const icons = [<User size={30} />, <Cog size={30} />, <Check size={30} />];
    const [loading, setLoading] = useState(false);
    const [cidAvailable, setCidAvailable] = useState<null | boolean>(null);
    const [checkingCid, setCheckingCid] = useState(false);

    // useEffect(() => {
    //     const savedForm = localStorage.getItem('multiStepForm');
    //     const savedStep = localStorage.getItem('multiStepStep');
    //     if (savedForm) setForm(JSON.parse(savedForm));
    //     if (savedStep) setStep(Number(savedStep));
    // }, []);

    // useEffect(() => {
    //     localStorage.setItem('multiStepForm', JSON.stringify(form));
    //     localStorage.setItem('multiStepStep', step.toString());
    // }, [form, step]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'cid' && !isNewMember) {
            debouncedCheckCID(value);
        }
    };

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

    const validateStep = () => {
        const newErrors: FormErrors = {};
        if (step === 1) {
            if (!isNewMember && !form.cid) newErrors.cid = 'CID is required.';
            if (!form.first_name) newErrors.first_name = 'First name is required.';
            if (!form.last_name) newErrors.last_name = 'Last name is required.';
            if (!form.bithdate) newErrors.bithdate = 'Birth date name is required.';
            if (!form.phone_number) newErrors.phone_number = 'Phone number is required.';
        }
        if (step === 2) {
            if (!form.birth_place) newErrors.birth_place = 'Birth Place is required.';
            if (!form.current_address) newErrors.current_address = 'Current Address is required.';
            if (!form.permanent_address) newErrors.permanent_address = 'Permanent Address is required.';
        }
        if (step === 3) {
            if (!form.email) newErrors.email = 'Email is required.';
            if (!form.password) newErrors.password = 'Password is required.';
            if (!form.password_confirmation) newErrors.password_confirmation = 'Confirm password is required.';
            if (form.password !== form.password_confirmation) {
                newErrors.password_confirmation = 'Passwords do not match.';
            }
            if (!form.file) newErrors.file = 'The identification card field is required.';
        }
        setFrontendErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = async () => {
        // Ensure CID is not taken before moving on
        if (form.cid && cidAvailable === false) {
            message.error('CID is already taken.');
            return;
        }

        // Optional: recheck CID if user hasn't typed anything recently
        if (form.cid && cidAvailable === null && !checkingCid) {
            await checkCID(form.cid);
            if (cidAvailable === false) {
                message.error('CID is already taken.');
                return;
            }
        }

        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm({ ...form, file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setForm({ ...form, file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = () => {
        if (validateStep()) {
            setLoading(true);
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) payload.append(key, value);
            });
            router.post('/register', payload, {
                forceFormData: true,
                onSuccess: () => {
                    setLoading(false);
                    localStorage.removeItem('multiStepForm');
                    localStorage.removeItem('multiStepStep');
                },
                onError: () => {
                    setLoading(false);
                }
            });

            localStorage.removeItem('multiStepForm');
            localStorage.removeItem('multiStepStep');
        }
    };
    const showError = (field: keyof FormState) => frontendErrors[field] || backendErrors[field];
    return (
        <div className="relative min-h-screen mb-20">
            {/* Horizontal Split Background */}
            <div className="fixed inset-0 z-0">
                <div className="h-1/2 bg-green-500" />
                <div className="h-1/2 bg-white" />
            </div>

            {/* Foreground Form */}
            <div className="relative z-10 ">
                <div className="max-w-2xl mx-auto p-12 bg-white rounded  mt-10 shadow-lg border ">
                    {/* Stepper with Icons */}
                    <p className="text-2xl text-center antialiased uppercase font-semibold">Magrow MPC</p>
                    <p className='text-center mb-6 antialiased font-bold'>Be a Member!</p>
                    <hr className='mb-10' />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                        {steps.map((label, index) => {
                            const stepNum = index + 1;
                            const isActive = step >= stepNum;
                            return (
                                <div key={label} className="relative flex items-center sm:flex-col gap-2 sm:gap-0">
                                    <div
                                        className={`rounded-full w-14 h-14 flex items-center justify-center text-white ${isActive ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        {icons[index]}
                                    </div>
                                    <div className="text-sm">{label}</div>

                                    {/* Connector line */}
                                    {stepNum < steps.length && (
                                        <div className="">
                                            <div
                                                className={`h-full ${step > stepNum ? 'bg-blue-600' : ''}`}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Content with Animation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <>
                                    {/* <div className="mb-2">
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={isNewMember}
                                                onChange={(e) => setIsNewMember(e.target.checked)}
                                                className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                                            />
                                            New Member (No CID yet)
                                        </label>
                                    </div> */}
                                    <div className="flex flex-row gap-4">
                                        <div className="basis-1/2">
                                            <div className="mb-4">
                                                <label className="block mb-1 font-medium text-gray-600 uppercase">CID <span className="text-red-600">*</span></label>
                                                <input
                                                    name="cid"
                                                    value={form.cid}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded"
                                                     disabled={isNewMember}
                                                />
                                                {showError('cid') && (
                                                    <div className="text-red-500 text-sm mt-1">{showError('cid')}</div>
                                                )}
                                                {checkingCid && <p className="text-gray-500 text-sm">Checking...</p>}
                                                {cidAvailable === false && (
                                                    <p className="text-red-500 text-sm">CID is already taken.</p>
                                                )}
                                                {cidAvailable === true && (
                                                    <p className="text-green-600 text-sm">CID is available!</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="basis-1/2">
                                            <div className="mb-4">
                                                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={isNewMember}
                                                        onChange={(e) => setIsNewMember(e.target.checked)}
                                                        className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                                                    />
                                                    New Member (No CID yet)
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-4">
                                        <div className="basis-1/2">

                                            <div className="mb-4">
                                                <label className="block mb-1  font-medium text-gray-600">First Name <span className="text-red-600">*</span></label>
                                                <input
                                                    name="first_name"
                                                    value={form.first_name}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {showError('first_name') && (
                                                    <div className="text-red-500 text-sm mt-1">{showError('first_name')}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="basis-1/2">
                                            <div className="mb-4">
                                                <label className="block mb-1  font-medium text-gray-600">Middle Name</label>
                                                <input
                                                    name="middle_name"
                                                    value={form.middle_name}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1  font-medium text-gray-600">Last Name <span className="text-red-600">*</span></label>
                                        <input
                                            name="last_name"
                                            value={form.last_name}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('last_name') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('last_name')}</div>
                                        )}
                                    </div>
                                    <div className="flex flex-row gap-4">
                                        <div className="basis-1/2">

                                            <div className="mb-4">
                                                <label className="block mb-1  font-medium text-gray-600">Date of Birth <span className="text-red-600">*</span></label>
                                                <input
                                                    name="bithdate"
                                                    type="date"
                                                    value={form.bithdate}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                                {showError('bithdate') && (
                                                    <div className="text-red-500 text-sm mt-1">{showError('bithdate')}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="basis-1/2">
                                            <div className="mb-4">
                                                <div className="flex flex-col">
                                                    <label htmlFor="date" className="block mb-1  font-medium text-gray-600">Phone Number <span className="text-red-600">*</span></label>
                                                    <div className="bg-gray-100 flex items-center border rounded-s overflow-hidden">
                                                        <span className=" text-gray-600 text-sm whitespace-nowrap px-2">
                                                            +63
                                                        </span>
                                                        <input
                                                            name="phone_number"
                                                            type="number"
                                                            id="number"
                                                            value={form.phone_number}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border rounded bg-white"
                                                        />
                                                    </div>
                                                    {showError('phone_number') && (
                                                        <div className="text-red-500 text-sm ">{showError('phone_number')}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="mb-4">
                                        <label className="block mb-1  font-medium text-gray-600">Birth Place <span className="text-red-600">*</span></label>
                                        <textarea
                                            name="birth_place"
                                            value={form.birth_place}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('birth_place') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('birth_place')}</div>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1  font-medium text-gray-600">Current Address <span className="text-red-600">*</span></label>
                                        <textarea
                                            name="current_address"
                                            value={form.current_address}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('current_address') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('current_address')}</div>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1  font-medium text-gray-600">Permanent Place <span className="text-red-600">*</span></label>
                                        <textarea
                                            name="permanent_address"
                                            value={form.permanent_address}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('permanent_address') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('permanent_address')}</div>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="mb-4">
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            className="mb-4 p-4 border-2 border-dashed rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <label htmlFor="file-upload" className="block text-center text-gray-700">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-contain" />
                                                ) : (
                                                    <>
                                                        <div className="text-gray-500">Drag & drop an Selfie here</div>
                                                        <div className="text-sm text-blue-600 mt-2 underline">Add selfie make sure the image is clear.</div>
                                                    </>
                                                )}
                                            </label>
                                            <input
                                                id="file-upload"
                                                name="file"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />

                                        </div>
                                        {showError('file') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('file')}</div>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1 font-medium text-gray-600">Email <span className="text-red-600">*</span></label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('email') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('email')}</div>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-1 font-medium text-gray-600">Password <span className="text-red-600">*</span></label>
                                        <input
                                            name="password"
                                            type="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('password') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('password')}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1 font-medium text-gray-600">Confirm Password <span className="text-red-600">*</span></label>
                                        <input
                                            name="password_confirmation"
                                            type="password"
                                            value={form.password_confirmation}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                        {showError('password_confirmation') && (
                                            <div className="text-red-500 text-sm mt-1">{showError('password_confirmation')}</div>
                                        )}
                                    </div>

                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        {step > 1 ? (
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                onClick={prevStep}
                            >
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                onClick={nextStep} disabled={checkingCid}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Create;
