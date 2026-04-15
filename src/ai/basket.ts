// ============================================================
// Basket Analysis — finds products frequently bought together
// Uses co-occurrence counting on bill_items data
// ============================================================
import { adminClient } from '@/lib/supabase/admin';

export interface BasketPair {
  productA: string;
  productB: string;
  nameA: string;
  nameB: string;
  coOccurrences: number;
  confidence: number; // how often A and B appear together vs A alone
}

export async function generateBasketAnalysis(): Promise<BasketPair[]> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: recentBills, error: billsError } = await adminClient
    .from('bills')
    .select('id')
    .gte('created_at', since);

  if (billsError) {
    console.error('generateBasketAnalysis (bills):', billsError.message);
    return [];
  }
  const billIds = (recentBills || []).map((b: { id: string }) => b.id);
  if (billIds.length === 0) return [];

  const { data: billItems, error } = await adminClient
    .from('bill_items')
    .select('bill_id, product_id, products(name)')
    .in('bill_id', billIds)
    .order('bill_id');

  if (error) {
    console.error('generateBasketAnalysis:', error.message);
    return [];
  }
  if (!billItems || billItems.length === 0) return [];

  // Group by bill_id
  const billsMap = new Map<string, { id: string; name: string }[]>();
  for (const item of billItems as any[]) {
    if (!billsMap.has(item.bill_id)) billsMap.set(item.bill_id, []);
    billsMap.get(item.bill_id)!.push({
      id: item.product_id,
      name: item.products?.name ?? item.product_id,
    });
  }

  // Count co-occurrences and individual product frequencies
  const pairCount = new Map<string, number>();
  const singleCount = new Map<string, number>();

  for (const items of billsMap.values()) {
    const unique = Array.from(new Map(items.map(i => [i.id, i])).values());
    for (const item of unique) {
      singleCount.set(item.id, (singleCount.get(item.id) ?? 0) + 1);
    }
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = [unique[i].id, unique[j].id].sort().join('||');
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
      }
    }
  }

  // Build result — only pairs appearing 2+ times
  const pairs: BasketPair[] = [];
  for (const [key, count] of pairCount.entries()) {
    if (count < 2) continue;
    const [idA, idB] = key.split('||');
    const itemA = (billItems as any[]).find(i => i.product_id === idA);
    const itemB = (billItems as any[]).find(i => i.product_id === idB);
    const nameA = itemA?.products?.name ?? idA;
    const nameB = itemB?.products?.name ?? idB;
    const freqA = singleCount.get(idA) ?? 1;
    pairs.push({
      productA: idA,
      productB: idB,
      nameA,
      nameB,
      coOccurrences: count,
      confidence: Math.round((count / freqA) * 100),
    });
  }

  return pairs.sort((a, b) => b.coOccurrences - a.coOccurrences).slice(0, 20);
}
