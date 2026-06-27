import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import type { MatchRecommendation } from '../api/types';
import { api } from '../lib/api';

export function BuyerRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof FarmLinkApiError ? err.message : 'Could not load recommendations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <h1>Recommendations</h1>
      <p className="muted">Listings matched to your buyer profile and demands.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      <div className="listing-grid">
        {recommendations.map((rec) => (
          <article key={rec.id} className="listing-card">
            <strong>Match score {Math.round(rec.score)}</strong>
            <p>{rec.explanation}</p>
            {rec.listing && (
              <>
                <h2>{rec.listing.title}</h2>
                <p className="muted">
                  {rec.listing.town}, {rec.listing.region}
                </p>
                <Link to={`/buyer/offers/new/${rec.listingId}`} className="btn btn-primary">
                  Send offer
                </Link>
              </>
            )}
          </article>
        ))}
      </div>
      {!loading && recommendations.length === 0 && (
        <p className="muted">No recommendations yet. Browse the marketplace instead.</p>
      )}
    </div>
  );
}
