// Wishlist utility functions using localStorage

export const getWishlist = () => {
  if (typeof window === 'undefined') return [];
  try {
    const wishlist = localStorage.getItem('gameWishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return [];
  }
};

export const addToWishlist = (game) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const exists = wishlist.some(item => item.id === game.id);
    if (!exists) {
      wishlist.push(game);
      localStorage.setItem('gameWishlist', JSON.stringify(wishlist));
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
};

export const removeFromWishlist = (gameId) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(item => item.id !== gameId);
    localStorage.setItem('gameWishlist', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
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

export const toggleWishlist = (game) => {
  if (typeof window === 'undefined') return;
  try {
    const wishlist = getWishlist();
    const index = wishlist.findIndex(item => item.id === game.id);
    
    if (index >= 0) {
      // Remove if exists
      const filtered = wishlist.filter(item => item.id !== game.id);
      localStorage.setItem('gameWishlist', JSON.stringify(filtered));
    } else {
      // Add if doesn't exist
      wishlist.push(game);
      localStorage.setItem('gameWishlist', JSON.stringify(wishlist));
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
  }
};

