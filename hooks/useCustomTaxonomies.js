import { useState, useEffect, useCallback } from 'react';
import { DEPARTMENTS, DOC_TYPES, CATEGORIES } from '@/components/shared/theme';
import { CURRENT_VESSEL_ID } from '@/lib/constants';

// Built-in values (without 'All') — used for dedup and merge.
const BUILTIN_DEPARTMENTS = DEPARTMENTS.filter(d => d !== 'All');
const BUILTIN_DOC_TYPES = DOC_TYPES.filter(d => d !== 'All');
const BUILTIN_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

/**
 * Fetches custom taxonomies from the API and merges them with built-in
 * values. Returns { departments, docTypes, categories } where each is an
 * array of labels (no 'All'), plus helper loaders & creators.
 *
 * Usage:
 *   const tax = useCustomTaxonomies(currentUser);
 *   // tax.departments  → ['Bridge', 'Deck', ..., 'Medical'] (merged)
 *   // tax.addDepartment('Medical') → creates via API then refreshes
 */
export default function useCustomTaxonomies(currentUser) {
  const [customDepts, setCustomDepts] = useState([]);
  const [customDocTypes, setCustomDocTypes] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const vesselId = CURRENT_VESSEL_ID;
  const crewMemberId = currentUser?.id;

  // ── Fetch all three in parallel ────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const [dRes, tRes, cRes] = await Promise.all([
        fetch(`/api/taxonomies/departments?vessel_id=${vesselId}`),
        fetch(`/api/taxonomies/document-types?vessel_id=${vesselId}`),
        fetch(`/api/taxonomies/notice-categories?vessel_id=${vesselId}`),
      ]);
      const [dJson, tJson, cJson] = await Promise.all([dRes.json(), tRes.json(), cRes.json()]);
      setCustomDepts(dJson.items || []);
      setCustomDocTypes(tJson.items || []);
      setCustomCategories(cJson.items || []);
      setLoaded(true);
    } catch (err) {
      console.error('[useCustomTaxonomies] fetch failed', err);
      setLoaded(true); // still mark loaded so the UI doesn't hang
    }
  }, [vesselId]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Merged lists (built-in + custom labels) ────────────────────────
  const departments = [...BUILTIN_DEPARTMENTS, ...customDepts.map(d => d.label)];
  const docTypes = [...BUILTIN_DOC_TYPES, ...customDocTypes.map(d => d.label)];
  const categories = [...BUILTIN_CATEGORIES, ...customCategories.map(c => c.label)];

  // For filter chips: includes 'All' at the front
  const departmentsWithAll = ['All', ...departments];
  const docTypesWithAll = ['All', ...docTypes];
  const categoriesWithAll = ['All', ...categories];

  // ── Creators (return the new item or throw) ────────────────────────
  const addDepartment = useCallback(async (label) => {
    const res = await fetch('/api/taxonomies/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vessel_id: vesselId, crew_member_id: crewMemberId, label }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create department');
    setCustomDepts(prev => [...prev, json.item]);
    return json.item;
  }, [vesselId, crewMemberId]);

  const addDocType = useCallback(async (label) => {
    const res = await fetch('/api/taxonomies/document-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vessel_id: vesselId, crew_member_id: crewMemberId, label }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create document type');
    setCustomDocTypes(prev => [...prev, json.item]);
    return json.item;
  }, [vesselId, crewMemberId]);

  const addCategory = useCallback(async (label, color) => {
    const res = await fetch('/api/taxonomies/notice-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vessel_id: vesselId, crew_member_id: crewMemberId, label, color }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create category');
    setCustomCategories(prev => [...prev, json.item]);
    return json.item;
  }, [vesselId, crewMemberId]);

  // ── Deleters ───────────────────────────────────────────────────────
  const deleteDepartment = useCallback(async (id) => {
    const res = await fetch(`/api/taxonomies/departments?vessel_id=${vesselId}&crew_member_id=${crewMemberId}&id=${id}`, { method: 'DELETE' });
    if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed'); }
    setCustomDepts(prev => prev.filter(d => d.id !== id));
  }, [vesselId, crewMemberId]);

  const deleteDocType = useCallback(async (id) => {
    const res = await fetch(`/api/taxonomies/document-types?vessel_id=${vesselId}&crew_member_id=${crewMemberId}&id=${id}`, { method: 'DELETE' });
    if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed'); }
    setCustomDocTypes(prev => prev.filter(d => d.id !== id));
  }, [vesselId, crewMemberId]);

  const deleteCategory = useCallback(async (id) => {
    const res = await fetch(`/api/taxonomies/notice-categories?vessel_id=${vesselId}&crew_member_id=${crewMemberId}&id=${id}`, { method: 'DELETE' });
    if (!res.ok) { const json = await res.json(); throw new Error(json.error || 'Failed'); }
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  }, [vesselId, crewMemberId]);

  return {
    loaded,
    refresh,
    // Merged label arrays (no 'All')
    departments,
    docTypes,
    categories,
    // Merged with 'All' for filter chips
    departmentsWithAll,
    docTypesWithAll,
    categoriesWithAll,
    // Raw custom items (with id, label, created_at, and color for categories)
    customDepts,
    customDocTypes,
    customCategories,
    // Mutators
    addDepartment,
    addDocType,
    addCategory,
    deleteDepartment,
    deleteDocType,
    deleteCategory,
  };
}
