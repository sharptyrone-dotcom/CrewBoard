'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * useOfflineDocuments — Cache API helpers for offline document access.
 *
 * Stores document blobs (PDFs, images) in a dedicated Cache API bucket
 * so they remain available when the device is offline. Each cached entry
 * is keyed by the document's stable path (not the signed URL, which
 * rotates) so lookups survive across sessions.
 *
 * Usage:
 *   const { cacheDocument, isCached, getCachedUrl, clearCached,
 *           cachedIds, cacheSize } = useOfflineDocuments(userId);
 */

const CACHE_NAME = 'crewnotice-offline-docs';

// Stable key for a document — uses the doc id so it survives signed-URL
// rotation. The actual blob is fetched from the signed URL at cache time.
function docKey(docId) {
  return `/offline-doc/${docId}`;
}

export default function useOfflineDocuments(userId) {
  const [cachedIds, setCachedIds] = useState(new Set());
  const [cacheSize, setCacheSize] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Scan the cache on mount to learn which docs are already stored ──
  const refreshCacheIndex = useCallback(async () => {
    if (typeof caches === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const ids = new Set();
      let totalSize = 0;

      for (const req of keys) {
        // Extract doc id from the key path.
        const match = new URL(req.url).pathname.match(/\/offline-doc\/(.+)/);
        if (match) ids.add(match[1]);
        // Estimate size from the cached response.
        const res = await cache.match(req);
        if (res) {
          const blob = await res.clone().blob();
          totalSize += blob.size;
        }
      }

      setCachedIds(ids);
      setCacheSize(totalSize);
    } catch (err) {
      console.error('[offline-docs] cache scan failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCacheIndex();
  }, [refreshCacheIndex]);

  // ── Cache a document for offline access ──
  const cacheDocument = useCallback(async (docId, signedUrl, title) => {
    if (typeof caches === 'undefined') return false;
    try {
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      const blob = await response.blob();
      const cache = await caches.open(CACHE_NAME);
      const key = docKey(docId);

      // Store with metadata headers so we can read them back.
      const headers = new Headers({
        'Content-Type': blob.type || 'application/pdf',
        'X-Doc-Title': title || '',
        'X-Doc-Id': docId,
        'X-Cached-At': new Date().toISOString(),
      });

      await cache.put(
        new Request(key),
        new Response(blob, { headers }),
      );

      // Update index.
      setCachedIds((prev) => new Set([...prev, docId]));
      await refreshCacheIndex();
      return true;
    } catch (err) {
      console.error('[offline-docs] cache failed', err);
      return false;
    }
  }, [refreshCacheIndex]);

  // ── Check if a document is cached ──
  const isCached = useCallback((docId) => {
    return cachedIds.has(docId);
  }, [cachedIds]);

  // ── Get an object URL for a cached document ──
  const getCachedUrl = useCallback(async (docId) => {
    if (typeof caches === 'undefined') return null;
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(docKey(docId));
      if (!response) return null;

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('[offline-docs] get cached failed', err);
      return null;
    }
  }, []);

  // ── Remove a single cached document ──
  const clearCached = useCallback(async (docId) => {
    if (typeof caches === 'undefined') return;
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(docKey(docId));
      setCachedIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      await refreshCacheIndex();
    } catch (err) {
      console.error('[offline-docs] clear failed', err);
    }
  }, [refreshCacheIndex]);

  // ── Clear all cached documents ──
  const clearAll = useCallback(async () => {
    if (typeof caches === 'undefined') return;
    try {
      await caches.delete(CACHE_NAME);
      setCachedIds(new Set());
      setCacheSize(0);
    } catch (err) {
      console.error('[offline-docs] clear all failed', err);
    }
  }, []);

  // ── Format cache size for display ──
  const formattedSize = cacheSize < 1024
    ? `${cacheSize} B`
    : cacheSize < 1024 * 1024
      ? `${(cacheSize / 1024).toFixed(1)} KB`
      : `${(cacheSize / (1024 * 1024)).toFixed(1)} MB`;

  return {
    cacheDocument,
    isCached,
    getCachedUrl,
    clearCached,
    clearAll,
    cachedIds,
    cacheSize,
    formattedSize,
    loading,
  };
}
