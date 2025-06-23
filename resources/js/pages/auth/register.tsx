import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react'
interface FormState {
    full_name: string;
    email: string;
    password: string;
}
type FormErrors = {
    [K in keyof FormState]?: string;
};
export default function Register() {
    const { errors: backendErrors } = usePage().props;
    const [frontendErrors, setFrontendErrors] = useState<FormErrors>({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',

    });
    const SubmitForm = () => {
        router.post('/register',
            formData, {
            forceFormData: true,
            onSuccess: () => {

            },
            onError: () => {

            },
        });
    };
    const showError = (field: keyof FormState) => frontendErrors[field] || backendErrors[field];
    return (
        <div className="bg-white max-w-4xl flex items-center mx-auto md:min-h-screen p-4">
            <div className="grid md:grid-cols-3 items-center shadow rounded-xl overflow-hidden">
                <div className="max-md:order-1 flex flex-col justify-center md:space-y-16 space-y-8 max-md:mt-16 min-h-full bg-gradient-to-r from-slate-900 to-slate-700 lg:px-8 px-4 py-4">
                    <div>
                        <h3 className="text-white text-lg">Create Your Account</h3>
                        <p className="text-[13px] text-slate-300 mt-3 leading-relaxed">
                            Welcome to <b>MAGROW MPC</b> registration page! Get started by creating your account.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white text-lg">Simple &amp; Secure Registration</h3>
                        <p className="text-[13px] text-slate-300 mt-3 leading-relaxed">
                            Our registration process is designed to be straightforward and secure. We prioritize your privacy and data security.
                        </p>
                    </div>
                </div>
                <form className="md:col-span-2 w-full py-6 px-6 sm:px-14 max-w-lg mx-auto">
                    <div className="mb-8">
                        <h1 className="text-slate-900 text-2xl font-bold">Register Now</h1>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-slate-900 text-sm font-medium mb-2 block">Name</label>
                            <div className="relative flex items-center">
                                <input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    name="name" type="text" required className="text-slate-900 bg-white border border-slate-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500" placeholder="Enter name" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4" viewBox="0 0 24 24">
                                    <circle cx="10" cy="7" r="6"></circle>
                                    <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"></path>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-900 text-sm font-medium mb-2 block">Email Address</label>
                            <div className="relative flex items-center">
                                <input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    name="email" type="email" required className="text-slate-900 bg-white border border-slate-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500" placeholder="Enter email" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4" viewBox="0 0 682.667 682.667">
                                    <defs>
                                        <clipPath id="a" clipPathUnits="userSpaceOnUse">
                                            <path d="M0 512h512V0H0Z"></path>
                                        </clipPath>
                                    </defs>
                                    <g transform="matrix(1.33 0 0 -1.33 0 682.667)">
                                        <path fill="none" d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"></path>
                                        <path d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z"></path>
                                    </g>
                                </svg>

                            </div>
                            {showError('email') && (
                                <div className="text-red-500 text-sm mt-1">{showError('email')}</div>
                            )}
                        </div>
                        <div>
                            <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                            <div className="relative flex items-center">
                                <input
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    name="password" type="password" required className="text-slate-900 bg-white border border-slate-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500" placeholder="Enter password" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4 cursor-pointer" viewBox="0 0 128 128">
                                    <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                value={1}
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={isTermsAccepted}
                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                className=" cursor-pointer h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />

                            <label htmlFor="remember-me" className=" cursor-pointer ml-3 block text-sm text-slate-600">
                                I accept the
                                <a href="javascript:void(0);" className="text-blue-600 font-medium hover:underline ml-1">Terms and Conditions</a>
                            </label>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={SubmitForm}
                            disabled={!isTermsAccepted}
                            className={`w-full py-2.5 px-4 tracking-wider text-sm rounded-md text-white ${isTermsAccepted ? 'bg-slate-800 hover:bg-slate-900 cursor-pointer' : 'bg-slate-400 cursor-not-allowed'} focus:outline-none`}>
                            Create an account
                        </button>
                    </div>
                    <p className="text-slate-600 text-sm mt-6 text-center">
                        Already have an account?
                        <a href="/login" className="text-blue-600 font-medium hover:underline ml-1">Login here</a>
                    </p>
                </form>
            </div>
        </div>

    )
}

//className='max-md:order-1 flex flex-col justify-center md:space-y-16 space-y-8 max-md:mt-16 min-h-full bg-gradient-to-r from-slate-900 to-slate-700 lg:px-8 px-4 py-4 '