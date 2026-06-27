import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import { useListingDraft } from '../context/ListingDraftContext';
import { api } from '../lib/api';

const EXAMPLE =
  'I have 60 crates of tomatoes ready next Monday at Agogo in Ashanti Region.';

export function ExtractListingPage() {
  const navigate = useNavigate();
  const { applyExtraction } = useListingDraft();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const extraction = await api.extractProduce(
        text.trim(),
        new Date().toISOString().split('T')[0],
      );
      applyExtraction(extraction);
      navigate('/farmer/listings/confirm');
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>AI produce extraction</h1>
      <p className="muted">
        Describe your harvest in plain language — quantity, crop, location, and timing.
      </p>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          What do you have available?
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={EXAMPLE}
            required
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setText(EXAMPLE)}
        >
          Use example
        </button>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Extracting…' : 'Extract details'}
        </button>
      </form>
    </div>
  );
}
