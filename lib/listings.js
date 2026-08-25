// lib/listings.js
// All listing-related database operations
import { supabase } from './supabase'

const BANNED_KEYWORDS = ['weapon', 'alcohol', 'drug', 'illegal', 'hack']

// Check listing content against banned keywords
function isFlagged(title, description) {
  const content = `${title} ${description}`.toLowerCase()
  return BANNED_KEYWORDS.some(word => content.includes(word))
}

/**
 * Fetch all active listings, optionally filtered by category
 * @param {string | null} [category]
 */
export async function getListings(category = 'all') {
  let query = supabase
    .from('listings')
    .select(`*, profiles(name, dept, year, reg_no)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data, error }
}

// Post a new listing
export async function createListing({ title, category, description, type, price, postedBy }) {
  const status = isFlagged(title, description) ? 'under_review' : 'active'

  const { data, error } = await supabase.from('listings').insert({
    title,
    category,
    description,
    type,
    price: type === 'paid' ? parseFloat(price) : null,
    posted_by: postedBy,
    status,
  }).select().single()

  return { data, error, flagged: status === 'under_review' }
}

// Get listings by a specific user
export async function getUserListings(userId) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Delete a listing
export async function deleteListing(listingId) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)

  return { error }
}

// Save / unsave a listing
export async function toggleSaved(userId, listingId) {
  try {
    // Check if already saved using maybeSingle to avoid 0-row errors
    const { data: existing, error: selectError } = await supabase
      .from('saved')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking saved status:', selectError);
      return { saved: false, error: selectError };
    }

    if (existing) {
      const { error } = await supabase.from('saved').delete().eq('id', existing.id);
      if (error) console.error('Error deleting saved listing:', error);
      return { saved: false, error };
    } else {
      const { error } = await supabase.from('saved').insert({ user_id: userId, listing_id: listingId });
      if (error) console.error('Error inserting saved listing:', error);
      return { saved: true, error };
    }
  } catch (err) {
    console.error('Unexpected error in toggleSaved:', err);
    return { saved: false, error: err };
  }
}

// Get all saved listings for a user
export async function getSavedListings(userId) {
  const { data, error } = await supabase
    .from('saved')
    .select(`id, created_at, listing_id, listings(*, profiles(name, dept, year, reg_no))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}