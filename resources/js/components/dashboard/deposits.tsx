import React from 'react'
type Props = {
    account: any;
};

const Deposits = ({ account }: Props) => {
    return (
        <>
            {account.map((acc: any) => (
                <div key={acc.id} className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border mb-4">
                    <div className="p-4 md:p-4">
                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                            {acc.prefix}
                        </p>
                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            &#8369; {acc.balance}
                        </h4>
                        <div className="mt-4 flex items-end justify-between sm:mt-5">
                            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                               Account No.
                            </p>
                            <div className="flex items-center gap-1">

                                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                    {acc.account_no}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default Deposits;