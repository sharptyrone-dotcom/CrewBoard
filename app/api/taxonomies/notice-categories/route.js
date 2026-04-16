import { supabaseAdmin as supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// /api/taxonomies/notice-categories
//
// GET    — List custom notice categories for a vessel
// POST   — Create a new custom notice category (admin only)
// DELETE — Remove a custom notice category (admin only)
// ---------------------------------------------------------------------------

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vesselId = searchParams.get('vessel_id');
    if (!vesselId) {
      return NextResponse.json({ error: 'Missing vessel_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_notice_categories')
      .select('id, label, color, created_at')
      .eq('vessel_id', vesselId)
      .order('label');

    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (err) {
    console.error('[taxonomies/notice-categories] GET failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { vessel_id, crew_member_id, label, color } = body;

    if (!vessel_id || !crew_member_id || !label?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: vessel_id, crew_member_id, label' },
        { status: 400 },
      );
    }

    const trimmed = label.trim();
    if (trimmed.length > 50) {
      return NextResponse.json({ error: 'Label must be 50 characters or fewer' }, { status: 400 });
    }

    // Check admin status
    const { data: caller } = await supabase
      .from('crew_members')
      .select('role')
      .eq('id', crew_member_id)
      .eq('vessel_id', vessel_id)
      .maybeSingle();

    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Case-insensitive duplicate check against built-in + custom
    const BUILTIN = ['Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental'];
    if (BUILTIN.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      return NextResponse.json({ error: 'This category already exists as a built-in option' }, { status: 409 });
    }

    const { data: existing } = await supabase
      .from('custom_notice_categories')
      .select('id')
      .eq('vessel_id', vessel_id)
      .ilike('label', trimmed);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'A custom category with this name already exists' }, { status: 409 });
    }

    // Validate color if provided
    const validColor = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#64748b';

    const { data, error } = await supabase
      .from('custom_notice_categories')
      .insert({ vessel_id, label: trimmed, color: validColor, created_by: crew_member_id })
      .select('id, label, color, created_at')
      .single();

    if (error) throw error;

    // Activity log (non-fatal)
    try {
      await supabase.from('activity_log').insert({
        vessel_id,
        crew_member_id,
        action: 'taxonomy_created',
        target_type: 'custom_notice_category',
        target_id: data.id,
        metadata: { label: trimmed, color: validColor, taxonomy_kind: 'notice_category' },
      });
    } catch (_) { /* non-fatal */ }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error('[taxonomies/notice-categories] POST failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vesselId = searchParams.get('vessel_id');
    const crewMemberId = searchParams.get('crew_member_id');
    const id = searchParams.get('id');

    if (!vesselId || !crewMemberId || !id) {
      return NextResponse.json({ error: 'Missing required params: vessel_id, crew_member_id, id' }, { status: 400 });
    }

    const { data: caller } = await supabase
      .from('crew_members')
      .select('role')
      .eq('id', crewMemberId)
      .eq('vessel_id', vesselId)
      .maybeSingle();

    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from('custom_notice_categories')
      .select('label')
      .eq('id', id)
      .eq('vessel_id', vesselId)
      .maybeSingle();

    const { error } = await supabase
      .from('custom_notice_categories')
      .delete()
      .eq('id', id)
      .eq('vessel_id', vesselId);

    if (error) throw error;

    try {
      await supabase.from('activity_log').insert({
        vessel_id: vesselId,
        crew_member_id: crewMemberId,
        action: 'taxonomy_deleted',
        target_type: 'custom_notice_category',
        target_id: id,
        metadata: { label: existing?.label || '', taxonomy_kind: 'notice_category' },
      });
    } catch (_) { /* non-fatal */ }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[taxonomies/notice-categories] DELETE failed', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
