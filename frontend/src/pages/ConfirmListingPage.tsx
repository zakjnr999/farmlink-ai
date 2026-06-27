import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import type { ProduceCategory } from '../api/types';
import { useListingDraft } from '../context/ListingDraftContext';
import { api } from '../lib/api';

export function ConfirmListingPage() {
  const navigate = useNavigate();
  const { draft, setDraft } = useListingDraft();
  const [categories, setCategories] = useState<ProduceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft.extraction) {
      navigate('/farmer/extract', { replace: true });
      return;
    }
    void api.getCategories().then(setCategories).catch(() => undefined);
  }, [draft.extraction, navigate]);

  if (!draft.extraction) return null;

  const { extraction } = draft;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const listing = await api.createListing({
        categoryId: draft.categoryId,
        title: draft.title,
        description: draft.description || draft.title,
        quantity: draft.quantity,
        unit: draft.unit,
        harvestDate: draft.harvestDate,
        availableFrom: draft.availableFrom || draft.harvestDate,
        region: draft.region,
        district: draft.district,
        town: draft.town,
        latitude: draft.latitude,
        longitude: draft.longitude,
        pricePerUnit: draft.pricePerUnit,
        minimumOrderQuantity: draft.minimumOrderQuantity,
        sourceType: 'VOICE_TRANSCRIPTION',
      });
      setDraft({ publishedListing: listing });
      navigate(`/farmer/listings/${listing.id}/publish`);
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Could not create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Confirm listing</h1>
      <p className="muted">
        Review AI-extracted fields before publishing. Confidence:{' '}
        {Math.round(extraction.confidence * 100)}%
      </p>

      {extraction.clarificationQuestions.length > 0 && (
        <div className="card info">
          <strong>AI follow-up questions</strong>
          <ul>
            {extraction.clarificationQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {extraction.missingFields.length > 0 && (
        <div className="card warn">
          <strong>Missing fields</strong>
          <p>{extraction.missingFields.join(', ')}</p>
        </div>
      )}

      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft({ title: e.target.value })}
            required
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft({ description: e.target.value })}
          />
        </label>
        <label>
          Category
          <select
            value={draft.categoryId}
            onChange={(e) => setDraft({ categoryId: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid-2">
          <label>
            Quantity
            <input
              type="number"
              min={1}
              value={draft.quantity || ''}
              onChange={(e) => setDraft({ quantity: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Unit
            <input
              value={draft.unit}
              onChange={(e) => setDraft({ unit: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Harvest date
            <input
              type="date"
              value={draft.harvestDate?.slice(0, 10) ?? ''}
              onChange={(e) => setDraft({ harvestDate: e.target.value })}
              required
            />
          </label>
          <label>
            Available from
            <input
              type="date"
              value={draft.availableFrom?.slice(0, 10) ?? ''}
              onChange={(e) => setDraft({ availableFrom: e.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Region
          <input
            value={draft.region}
            onChange={(e) => setDraft({ region: e.target.value })}
            required
          />
        </label>
        <label>
          District
          <input
            value={draft.district}
            onChange={(e) => setDraft({ district: e.target.value })}
            required
          />
        </label>
        <label>
          Town
          <input value={draft.town} onChange={(e) => setDraft({ town: e.target.value })} required />
        </label>
        <label>
          Price per unit (optional)
          <input
            type="number"
            min={0}
            value={draft.pricePerUnit ?? ''}
            onChange={(e) =>
              setDraft({
                pricePerUnit: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving draft…' : 'Save & continue to publish'}
        </button>
        <Link to="/farmer/extract" className="btn btn-ghost center">
          Back to extraction
        </Link>
      </form>
    </div>
  );
}
