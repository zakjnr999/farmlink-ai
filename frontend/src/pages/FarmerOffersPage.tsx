import { useEffect, useState } from 'react';
import { FarmLinkApiError } from '../api/client';
import { api } from '../lib/api';
import type { FarmerOffer } from '../types/extra';

export function FarmerOffersPage() {
  const [offers, setOffers] = useState<FarmerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.call<{ offers: FarmerOffer[] }>('GET', '/farmers/offers');
      setOffers(res.data.offers);
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Could not load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const accept = async (offerId: string) => {
    setActionId(offerId);
    setMessage(null);
    setError(null);
    try {
      await api.acceptOffer(offerId);
      setMessage('Offer accepted — transaction created.');
      await load();
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Accept failed');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (offerId: string) => {
    setActionId(offerId);
    setMessage(null);
    setError(null);
    try {
      await api.call('POST', `/farmers/offers/${offerId}/reject`);
      setMessage('Offer rejected.');
      await load();
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Reject failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="page">
      <h1>Incoming offers</h1>
      <p className="muted">Review buyer offers on your listings.</p>
      {loading && <p className="muted">Loading…</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="stack">
        {offers.map((offer) => (
          <article key={offer.id} className="card stack">
            <div className="offer-header">
              <strong>{offer.status}</strong>
              <span className="muted">{new Date(offer.createdAt).toLocaleDateString()}</span>
            </div>
            <p>
              {offer.offeredQuantity} {offer.unit} @ GHS {offer.offeredPricePerUnit} — total GHS{' '}
              {offer.totalAmount}
            </p>
            {offer.message && <p className="muted">{offer.message}</p>}
            {offer.listing && <p>Listing: {offer.listing.title}</p>}
            {offer.status === 'PENDING' && (
              <div className="actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionId === offer.id}
                  onClick={() => void accept(offer.id)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={actionId === offer.id}
                  onClick={() => void reject(offer.id)}
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!loading && offers.length === 0 && (
        <p className="muted">No offers yet. Publish a listing to receive buyer offers.</p>
      )}
    </div>
  );
}
