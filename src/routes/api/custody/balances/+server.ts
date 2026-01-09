import { json, type RequestEvent } from '@sveltejs/kit';
import { fetchBalances } from '$lib/custody/balances';

export async function GET({ url }: RequestEvent) {
  const address = url.searchParams.get('wallet');

  if (!address) {
    return json({ error: 'wallet is required' }, { status: 400 });
  }

  const balances = await fetchBalances(address as `0x${string}`);

  return json(balances);
}
