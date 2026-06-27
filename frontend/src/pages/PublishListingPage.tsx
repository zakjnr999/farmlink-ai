import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FarmLinkApiError } from '../api/client';
import type { MatchRecommendation, ProduceListing } from '../api/types';
import { useListingDraft } from '../context/ListingDraftContext';
import { api } from '../lib/api';

export function PublishListingPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { setDraft, resetDraft } = useListingDraft();
  const [listing, setListing] = useState<ProduceListing | null>(null);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    void (async () => {
      try {
        const res = await api.call<{ listing: ProduceListing }>('GET', `/listings/${listingId}`);
        setListing(res.data.listing);
      } catch {
        navigate('/farmer/extract', { replace: true });
      }
    })();
  }, [listingId, navigate]);

  const onPublish = async () => {
    if (!listingId) return;
    setPublishing(true);
    setError(null);
    try {
      const publishedListing = await api.publishListing(listingId);
      setListing(publishedListing);
      setPublished(true);
      setDraft({ publishedListing });
      const matchList = await api.getListingMatches(listingId);
      setMatches(matchList);
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (!listing) {
    return (
      <div className="page">
        <p className="muted">Loading listing…</p>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h1>{published ? 'Listing published' : 'Publish listing'}</h1>
      <div className="card stack">
        <h2>{listing.title}</h2>
        <p>
          {listing.quantity} {listing.unit} · {listing.town}, {listing.district}
        </p>
        <p className="muted">Status: {listing.status}</p>
        {!published ? (
          <>
            {error && <p className="error">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void onPublish()}
              disabled={publishing}
            >
              {publishing ? 'Publishing…' : 'Publish to marketplace'}
            </button>
          </>
        ) : (
          <>
            <p className="success">Your produce is now visible to buyers.</p>
            {matches.length > 0 ? (
              <div className="stack">
                <h3>Buyer matches ({matches.length})</h3>
                {matches.map((match) => (
                  <article key={match.id} className="match-card">
                    <strong>Score {Math.round(match.score)}</strong>
                    <p>{match.explanation}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No matches yet — buyers will see your listing in search.</p>
            )}
            <Link to="/farmer/offers" className="btn btn-primary">
              View incoming offers
            </Link>
            <button type="button" className="btn btn-ghost" onClick={resetDraft}>
              List another harvest
            </button>
          </>
        )}
      </div>
    </div>
  );
}
