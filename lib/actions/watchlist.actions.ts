'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function checkIsWatchlisted(symbol: string, email: string) {
  if (!email || !symbol) return false;
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return false;

    const userId = (user.id as string) || String(user._id || '');
    const count = await Watchlist.countDocuments({ userId, symbol });
    return count > 0;
  } catch (error) {
    console.error("checkIsWatchlisted error:", error);
    return false;
  }
}

export async function toggleWatchlist(symbol: string, company: string, email: string) {
  if (!email || !symbol) return { success: false, error: "Invalid data" };

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return { success: false, error: "User not found" };

    const userId = (user.id as string) || String(user._id || '');

    const existing = await Watchlist.findOne({ userId, symbol });

    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      return { success: true, added: false };
    } else {
      await Watchlist.create({ userId, symbol, company });
      return { success: true, added: true };
    }
  } catch (error) {
    console.error("toggleWatchlist error:", error);
    return { success: false, error: "Failed to update watchlist" };
  }
}

export async function getWatchlist(email: string) {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');

    // Return plain objects
    const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error("getWatchlist error:", error);
    return [];
  }
}
