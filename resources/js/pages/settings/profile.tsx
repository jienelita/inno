import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: any;
    prefix_name: any;
    bithdate: any;
    birth_place: any;
    current_address: any;
    permanent_address: any;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
        middle_name: auth.user.middle_name,
        prefix_name: auth.user.prefix_name,
        bithdate: auth.user.bithdate,
        birth_place: auth.user.birth_place,
        current_address: auth.user.current_address,
        permanent_address: auth.user.permanent_address
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                className="mt-1 block w-full"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                                autoComplete="First Name"
                                placeholder="First name"
                            />
                            <InputError className="mt-2" message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                className="mt-1 block w-full"
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                required
                                autoComplete="Middle Name"
                                placeholder="Middle name"
                            />
                            <InputError className="mt-2" message={errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                className="mt-1 block w-full"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                autoComplete="Last Name"
                                placeholder="Last name"
                            />
                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prefix_name">Prefix Name</Label>
                            <Input
                                id="prefix_name"
                                className="mt-1 block w-full"
                                value={data.prefix_name}
                                onChange={(e) => setData('prefix_name', e.target.value)}
                                required
                                autoComplete="Prefix Name"
                                placeholder="Prefix name"
                            />
                            <InputError className="mt-2" message={errors.prefix_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bithdate">Birth Date</Label>
                            <Input
                                id="bithdate"
                                className="mt-1 block w-full"
                                type='date'
                                value={data.bithdate}
                                onChange={(e) => setData('bithdate', e.target.value)}
                                required
                                autoComplete="Birth Date"
                                placeholder="Birth Date"
                            />
                            <InputError className="mt-2" message={errors.bithdate} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="birth_place">Birth Place</Label>
                            <Input
                                id="birth_place"
                                className="mt-1 block w-full"
                                value={data.birth_place}
                                onChange={(e) => setData('birth_place', e.target.value)}
                                required
                                autoComplete="Birth Place"
                                placeholder="Birth Place"
                            />
                            <InputError className="mt-2" message={errors.birth_place} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="current_address">Current Address</Label>
                            <Input
                                id="current_address"
                                className="mt-1 block w-full"
                                value={data.current_address}
                                onChange={(e) => setData('current_address', e.target.value)}
                                required
                                autoComplete="Current Address"
                                placeholder="Current Address"
                            />
                            <InputError className="mt-2" message={errors.current_address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="permanent_address">Permanent Address</Label>
                            <Input
                                id="permanent_address"
                                className="mt-1 block w-full"
                                value={data.permanent_address}
                                onChange={(e) => setData('permanent_address', e.target.value)}
                                required
                                autoComplete="Permanent Address"
                                placeholder="Permanent Address"
                            />
                            <InputError className="mt-2" message={errors.permanent_address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                readOnly
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
                <div className='hidden'>
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
