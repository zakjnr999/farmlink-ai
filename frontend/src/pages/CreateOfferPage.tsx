import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import type { ProduceListing } from '../api/types';
import { api } from '../lib/api';

export function CreateOfferPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('crate');
  const [pricePerUnit, setPricePerUnit] = useState(80);
  const [pickupDate, setPickupDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    void (async () => {
      try {
        const res = await api.call<{ listing: ProduceListing }>('GET', `/listings/${listingId}`);
        setListing(res.data.listing);
        setUnit(res.data.listing.unit);
        setQuantity(Math.min(10, res.data.listing.availableQuantity));
        if (res.data.listing.pricePerUnit) setPricePerUnit(res.data.listing.pricePerUnit);
      } catch (err) {
        setError(err instanceof FarmLinkApiError ? err.message : 'Listing not found');
      }
    })();
  }, [listingId]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!listingId) return;
    setLoading(true);
    setError(null);
    try {
      await api.createOffer({
        listingId,
        offeredQuantity: quantity,
        unit,
        offeredPricePerUnit: pricePerUnit,
        proposedPickupDate: pickupDate,
        message: message || undefined,
      });
      navigate('/buyer/recommendations');
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Could not send offer');
    } finally {
      setLoading(false);
    }
  };

  if (!listing && !error) {
    return (
      <div className="page">
        <p className="muted">Loading listing…</p>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h1>Send offer</h1>
      {listing && (
        <p className="muted">
          For: {listing.title} · up to {listing.availableQuantity} {listing.unit}
        </p>
      )}
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Unit
          <input value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </label>
        <label>
          Price per unit (GHS)
          <input
            type="number"
            min={1}
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Proposed pickup date
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </label>
        <label>
          Message (optional)
          <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <p>
          Total: <strong>GHS {(quantity * pricePerUnit).toFixed(2)}</strong>
        </p>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending…' : 'Submit offer'}
        </button>
      </form>
    </div>
  );
}
