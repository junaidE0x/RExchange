'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export default function DebugSavePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log('[debug-save]', msg);
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    async function run() {
      addLog('Starting debug...');

      // 1. Check auth
      const { user, profile } = await getCurrentUser();
      if (!user) {
        addLog('❌ NOT LOGGED IN — No user session found. Save will never work without auth.');
        return;
      }
      addLog(`✅ Logged in as: ${user.email} (id: ${user.id})`);
      addLog(`   Profile: ${profile ? JSON.stringify(profile) : 'null'}`);

      // 2. Fetch some listings to get a valid listing ID
      const { data: listings, error: listErr } = await supabase
        .from('listings')
        .select('id, title')
        .eq('status', 'active')
        .limit(3);

      if (listErr) {
        addLog(`❌ Error fetching listings: ${JSON.stringify(listErr)}`);
        return;
      }
      if (!listings || listings.length === 0) {
        addLog('❌ No active listings found in the database. Cannot test save.');
        return;
      }
      addLog(`✅ Found ${listings.length} listings. Using first: "${listings[0].title}" (id: ${listings[0].id})`);

      const testListingId = listings[0].id;

      // 3. Check if already saved
      const { data: existing, error: checkErr } = await supabase
        .from('saved')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', testListingId)
        .maybeSingle();

      if (checkErr) {
        addLog(`❌ Error checking existing saved: ${JSON.stringify(checkErr)}`);
        addLog('   This suggests RLS SELECT policy is blocking. Check Supabase dashboard.');
        return;
      }

      if (existing) {
        addLog(`ℹ️ Listing already saved (saved row id: ${existing.id}). Deleting to re-test...`);
        const { error: delErr } = await supabase.from('saved').delete().eq('id', existing.id);
        if (delErr) {
          addLog(`❌ DELETE failed: ${JSON.stringify(delErr)}`);
          addLog('   RLS DELETE policy may be blocking.');
        } else {
          addLog('✅ Deleted existing saved row successfully.');
        }
      } else {
        addLog('ℹ️ Listing is not currently saved. Good — testing INSERT...');
      }

      // 4. Try INSERT
      addLog(`Attempting INSERT into "saved" table: user_id=${user.id}, listing_id=${testListingId}`);
      const { data: insertData, error: insertErr } = await supabase
        .from('saved')
        .insert({ user_id: user.id, listing_id: testListingId })
        .select()
        .single();

      if (insertErr) {
        addLog(`❌ INSERT FAILED: ${JSON.stringify(insertErr)}`);
        addLog('');
        addLog('=== DIAGNOSIS ===');
        if (insertErr.code === '42501' || insertErr.message?.includes('policy')) {
          addLog('🔒 ROW LEVEL SECURITY (RLS) is blocking the INSERT.');
          addLog('   FIX: Go to Supabase Dashboard → Table Editor → saved → RLS Policies');
          addLog('   Add an INSERT policy like:');
          addLog('   CREATE POLICY "Users can save listings" ON saved');
          addLog('     FOR INSERT WITH CHECK (auth.uid() = user_id);');
        } else if (insertErr.code === '23503') {
          addLog('🔗 FOREIGN KEY violation — user_id or listing_id does not reference a valid row.');
        } else if (insertErr.code === '23505') {
          addLog('🔁 UNIQUE constraint — this listing was already saved (race condition).');
        } else {
          addLog(`Unknown error code: ${insertErr.code}. Full error above.`);
        }
        return;
      }

      addLog(`✅ INSERT SUCCEEDED! Row created: ${JSON.stringify(insertData)}`);

      // 5. Verify it's readable
      const { data: readback, error: readErr } = await supabase
        .from('saved')
        .select('*, listings(title)')
        .eq('user_id', user.id)
        .eq('listing_id', testListingId)
        .maybeSingle();

      if (readErr) {
        addLog(`❌ Readback SELECT failed: ${JSON.stringify(readErr)}`);
      } else if (readback) {
        addLog(`✅ Readback confirmed: ${JSON.stringify(readback)}`);
      } else {
        addLog('⚠️ Readback returned null — row was inserted but cannot be read back. Check SELECT RLS.');
      }

      addLog('');
      addLog('=== DONE ===');
      addLog('If all steps show ✅, the save feature should work. Refresh your Saved Listings page.');
    }
    run();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono text-sm">
      <h1 className="text-xl font-bold text-white mb-4">Debug: Saved Listings</h1>
      <p className="text-gray-400 mb-6">
        This page tests whether inserting into the &quot;saved&quot; table works end-to-end.
      </p>
      <div className="space-y-1">
        {log.map((line, i) => (
          <pre key={i} className={line.includes('❌') ? 'text-red-400' : line.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
            {line}
          </pre>
        ))}
        {log.length === 0 && <p className="text-gray-500 animate-pulse">Running diagnostics...</p>}
      </div>
    </div>
  );
}

