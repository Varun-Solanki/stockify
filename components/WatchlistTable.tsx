"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WatchlistButton from "./WatchlistButton";

// Define the interface for the watchlist item as returned by getWatchlist
interface WatchlistItem {
    _id: string;
    symbol: string;
    company: string;
    addedAt: string;
    price?: number;
    change?: number;
    changePercent?: number;
}

interface WatchlistTableProps {
    initialWatchlist: WatchlistItem[];
    email: string;
}

const WatchlistTable = ({ initialWatchlist, email }: WatchlistTableProps) => {
    const [watchlist, setWatchlist] = useState(initialWatchlist);
    const router = useRouter();

    const handleWatchlistChange = (symbol: string, newStatus: boolean) => {
        if (!newStatus) {
            // Remove from list immediately
            setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const formatChange = (value: number, percent: number) => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${value.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
    };

    if (watchlist.length === 0) {
        return (
            <div className="watchlist-empty-container">
                <div className="watchlist-empty">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="watchlist-star"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <h3 className="empty-title">Your watchlist is empty</h3>
                    <p className="empty-description">
                        Start tracking company stocks by adding them to your watchlist.
                    </p>
                    <Link href="/">
                        <button className="search-btn">Browse Stocks</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="watchlist-table">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="table-header-row">
                        <th className="p-4 table-header">Symbol</th>
                        <th className="p-4 table-header hidden md:table-cell">Company</th>
                        <th className="p-4 table-header">Price</th>
                        <th className="p-4 table-header hidden sm:table-cell">Change</th>
                        <th className="p-4 table-header text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {watchlist.map((item) => {
                        const isPositive = (item.change || 0) >= 0;
                        const changeColor = isPositive ? "text-green-500" : "text-red-500";

                        return (
                            <tr
                                key={item.symbol}
                                className="table-row"
                                onClick={() => router.push(`/stocks/${item.symbol}`)}
                            >
                                <td className="p-4 table-cell font-bold text-yellow-500">
                                    {item.symbol}
                                </td>
                                <td className="p-4 table-cell hidden md:table-cell text-gray-300">
                                    {item.company}
                                </td>
                                <td className="p-4 table-cell font-medium text-gray-100">
                                    {item.price ? formatCurrency(item.price) : "N/A"}
                                </td>
                                <td className={`p-4 table-cell hidden sm:table-cell ${changeColor}`}>
                                    {item.change !== undefined && item.changePercent !== undefined
                                        ? formatChange(item.change, item.changePercent)
                                        : "N/A"}
                                </td>
                                <td className="p-4 table-cell text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end">
                                        <WatchlistButton
                                            symbol={item.symbol}
                                            company={item.company}
                                            isInWatchlist={true}
                                            email={email}
                                            type="icon"
                                            onWatchlistChange={handleWatchlistChange}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default WatchlistTable;
