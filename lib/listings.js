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

function unwrapListing(row) {
  const nested = row?.listings ?? row?.listing
  if (Array.isArray(nested)) return nested[0] ?? null
  return nested ?? null
}

// Get all saved listings for a user.
// Uses a 2-step fetch so it works without a FK embed and without a created_at column.
export async function getSavedListings(userId) {
  const { data: rawSaved, error: rawError } = await supabase
    .from('saved')
    .select('id, listing_id')
    .eq('user_id', userId)

  if (rawError) return { data: null, error: rawError }
  if (!rawSaved || rawSaved.length === 0) return { data: [], error: null }

  const listingIds = [...new Set(rawSaved.map((r) => r.listing_id).filter(Boolean))]
  if (listingIds.length === 0) return { data: [], error: null }

  let listingsData = null
  let listingsError = null

  const joined = await supabase
    .from('listings')
    .select('*, profiles(name, dept, year, reg_no)')
    .in('id', listingIds)

  if (joined.error) {
    const plain = await supabase.from('listings').select('*').in('id', listingIds)
    listingsData = plain.data
    listingsError = plain.error
  } else {
    listingsData = joined.data
  }

  if (listingsError) return { data: null, error: listingsError }

  const listingsMap = new Map((listingsData || []).map((l) => [String(l.id), l]))
  const data = rawSaved
    .map((r) => {
      const listing = listingsMap.get(String(r.listing_id)) || unwrapListing(r)
      if (!listing) return null
      return {
        id: r.id,
        listing_id: r.listing_id,
        listings: listing,
      }
    })
    .filter(Boolean)

  return { data, error: null }
}