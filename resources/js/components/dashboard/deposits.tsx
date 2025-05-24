import React from 'react'

export default function Deposits({ type = '' }) {
    return (
        <div className="p-4 md:p-4">
            <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                Savings
            </p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                &#8369; 120,369
            </h4>
            <div className="mt-4 flex items-end justify-between sm:mt-5">
                <p className="text-theme-sm text-gray-700 dark:text-gray-400">
                    Mutual Benefit Found
                </p>
                <div className="flex items-center gap-1">

                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                        154554-2544-154
                    </span>
                </div>
            </div>
        </div>
    )
}
