import React from "react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlist } from "@/lib/actions/watchlist.actions";
import { getQuote } from "@/lib/actions/finnhub.actions";
import WatchlistTable from "@/components/WatchlistTable";

export const metadata = {
    title: "My Watchlist | Stockify",
    description: "Track your favorite stocks.",
};

export default async function WatchlistPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const email = session.user?.email || "";
    const watchlist = await getWatchlist(email);

    // Fetch real-time quotes for each item
    const watchlistWithQuotes = await Promise.all(
        watchlist.map(async (item: any) => {
            const quote = await getQuote(item.symbol);
            return {
                ...item,
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
            };
        })
    );

    return (
        <div className="container md:mt-10 p-6">
            <div className="watchlist-container">
                <div className="watchlist">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="watchlist-title">My Watchlist</h1>
                    </div>
                    <p className="text-gray-400 mb-8 max-w-2xl">
                        Keep track of your favorite stocks and monitor their performance in one place.
                    </p>

                    <WatchlistTable initialWatchlist={watchlistWithQuotes} email={email} />
                </div>

                {/* Sidebar area - leaving empty or placeholder for now as per design patterns */}
                <div className="watchlist-alerts">
                    {/* Future: Alerts or News widget could go here */}
                </div>
            </div>
        </div>
    );
}
