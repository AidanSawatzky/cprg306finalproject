// Wishlist utility functions using localStorage with in-memory caching

// In-memory cache to avoid repeated localStorage reads
let wishlistCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 100; // Cache for 100ms to batch rapid operations

// Internal function to read from localStorage (bypasses cache)
const _readFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const wishlist = localStorage.getItem('gameWishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return [];
  }
};

// Internal function to write to localStorage and update cache
const _writeToStorage = (wishlist) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('gameWishlist', JSON.stringify(wishlist));
    wishlistCache = wishlist;
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Error writing wishlist:', error);
    // Invalidate cache on write error
    wishlistCache = null;
  }
};

// Get wishlist with caching
export const getWishlist = () => {
  if (typeof window === 'undefined') return [];
  
  const now = Date.now();
  // Use cache if it exists and is fresh
  if (wishlistCache !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return wishlistCache;
  }
  
  // Otherwise read from storage and update cache
  wishlistCache = _readFromStorage();
  cacheTimestamp = now;
  return wishlistCache;
};

// Force refresh from storage (useful after external changes)
export const refreshWishlist = () => {
  wishlistCache = null;
  return getWishlist();
};

export const addToWishlist = (game) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const exists = wishlist.some(item => item.id === game.id);
    if (!exists) {
      // Store the complete game object with all fields
      const updated = [...wishlist, game];
      _writeToStorage(updated);
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    wishlistCache = null; // Invalidate cache on error
  }
};

export const removeFromWishlist = (gameId) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(item => item.id !== gameId);
    _writeToStorage(filtered);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    wishlistCache = null; // Invalidate cache on error
  }
};

export const isInWishlist = (gameId) => {
  if (typeof window === 'undefined') return false;
  try {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === gameId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Optimized toggle: single read/write operation
export const toggleWishlist = (game) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const index = wishlist.findIndex(item => item.id === game.id);
    
    if (index >= 0) {
      // Remove if exists
      const filtered = wishlist.filter(item => item.id !== game.id);
      _writeToStorage(filtered);
    } else {
      // Add if doesn't exist
      const updated = [...wishlist, game];
      _writeToStorage(updated);
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    wishlistCache = null; // Invalidate cache on error
  }
};

