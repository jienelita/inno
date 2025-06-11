import React from 'react'
type Props = {
    account: any;
};
const style: React.CSSProperties = { background: 'orange' };
    const style2: React.CSSProperties = { background: '#9FC7FF' };
    
const Deposits = ({ account }: Props) => {
    return (
        <>
            {account.map((acc: any) => (
                <div key={acc.id} style={acc.is_balance === 1 ? style : style2}  className="border-sidebar-border/70 dark:border-sidebar-border relative  overflow-hidden rounded-xl border mb-4">
                    <div className="p-4 md:p-4">
                        <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                            {acc.prefix} <b>{Number(acc.chd) === 1 && Number(acc.accid) === 51 && ( <><br />(Co-maker) </> )}</b>
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