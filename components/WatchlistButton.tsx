"use client";
import React, { useMemo, useState } from "react";

// Minimal WatchlistButton implementation to satisfy page requirements.
// This component focuses on UI contract only. It toggles local state and
// calls onWatchlistChange if provided. Styling hooks match globals.css.

import { toggleWatchlist } from "@/lib/actions/watchlist.actions";

interface WatchlistButtonProps {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  email?: string; // made optional to not break other usages immediately, but logic depends on it
  showTrashIcon?: boolean;
  type?: "button" | "icon";
  onWatchlistChange?: (symbol: string, newStatus: boolean) => void;
}

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  email,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [loading, setLoading] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setAdded(!!isInWatchlist);
  }, [isInWatchlist]);

  const label = useMemo(() => {
    if (type === "icon") return added ? "" : "";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, type]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email) {
      // If no email, maybe redirect to login or show toast (not implemented here)
      console.warn("User not logged in");
      // For now preventing action if no email
      return;
    }

    setLoading(true);
    // Optimistic update
    const previousState = added;
    const newState = !added;
    setAdded(newState);
    if (onWatchlistChange) onWatchlistChange(symbol, newState);

    const result = await toggleWatchlist(symbol, company, email);

    setLoading(false);

    if (!result.success) {
      // Revert on failure
      setAdded(previousState);
      if (onWatchlistChange) onWatchlistChange(symbol, previousState);
      console.error("Failed to toggle watchlist:", result.error);
    }
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleClick}
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "#FACC15" : "none"}
          stroke={added ? "#FACC15" : "currentColor"}
          strokeWidth="1.5"
          className="watchlist-star"
          // Override size for icon button
          style={{ width: "24px", height: "24px", marginBottom: 0, color: added ? "#FACC15" : "currentColor" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`watchlist-btn ${added ? "watchlist-remove" : ""} ${loading ? "opacity-70 cursor-wait" : ""}`}
      onClick={handleClick}
      disabled={loading || !email}
    >
      {showTrashIcon && added ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
        </svg>
      ) : null}
      <span>{loading ? "Processing..." : label}</span>
    </button>
  );
};

export default WatchlistButton;
