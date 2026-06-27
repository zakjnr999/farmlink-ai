import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import type { ProduceListing } from '../api/types';
import { api } from '../lib/api';

export function BuyerMarketplacePage() {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchMarketplace({
        search: search || undefined,
        region: region || undefined,
        page: 1,
        limit: 20,
      });
      setListings(res.data.listings);
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Could not load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="page">
      <h1>Marketplace</h1>
      <p className="muted">Discover published farmer listings.</p>
      <div className="card filters">
        <input
          placeholder="Search produce…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Region filter"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          Search
        </button>
      </div>
      {loading && <p className="muted">Loading listings…</p>}
      {error && <p className="error">{error}</p>}
      <div className="listing-grid">
        {listings.map((listing) => (
          <article key={listing.id} className="listing-card">
            <h2>{listing.title}</h2>
            <p>
              {listing.availableQuantity} {listing.unit} available
            </p>
            <p className="muted">
              {listing.town}, {listing.district} · {listing.region}
            </p>
            {listing.pricePerUnit != null && (
              <p>
                GHS {listing.pricePerUnit}/{listing.unit}
              </p>
            )}
            <Link to={`/buyer/offers/new/${listing.id}`} className="btn btn-primary">
              Send offer
            </Link>
          </article>
        ))}
      </div>
      {!loading && listings.length === 0 && (
        <p className="muted">No listings found. Try adjusting filters.</p>
      )}
    </div>
  );
}
