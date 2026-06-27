import { useEffect, useState, type FormEvent } from 'react';
import { FarmLinkApiError } from '../api/client';
import { api } from '../lib/api';
import type { FarmerProfile } from '../types/extra';

export function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.call<{ profile: FarmerProfile }>('GET', '/farmers/profile');
        setProfile(res.data.profile);
      } catch (err) {
        setError(err instanceof FarmLinkApiError ? err.message : 'Could not load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.call<{ profile: FarmerProfile }>('PUT', '/farmers/profile', {
        farmName: profile.farmName,
        region: profile.region,
        district: profile.district,
        town: profile.town,
        village: profile.village,
        latitude: profile.latitude,
        longitude: profile.longitude,
        primaryCrops: profile.primaryCrops,
        bio: profile.bio,
      });
      setProfile(res.data.profile);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err instanceof FarmLinkApiError ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading profile…</p></div>;
  if (!profile) return <div className="page"><p className="error">{error ?? 'Profile not found'}</p></div>;

  return (
    <div className="page narrow">
      <h1>Farm profile</h1>
      <p className="muted">Your location and crops help buyers find your listings.</p>
      <form className="card stack" onSubmit={onSubmit}>
        <label>
          Farm name
          <input
            value={profile.farmName ?? ''}
            onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
          />
        </label>
        <label>
          Region
          <input
            value={profile.region}
            onChange={(e) => setProfile({ ...profile, region: e.target.value })}
            required
          />
        </label>
        <label>
          District
          <input
            value={profile.district}
            onChange={(e) => setProfile({ ...profile, district: e.target.value })}
            required
          />
        </label>
        <label>
          Town
          <input
            value={profile.town ?? ''}
            onChange={(e) => setProfile({ ...profile, town: e.target.value })}
          />
        </label>
        <label>
          Primary crops (comma-separated)
          <input
            value={profile.primaryCrops.join(', ')}
            onChange={(e) =>
              setProfile({
                ...profile,
                primaryCrops: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </label>
        <label>
          Bio
          <textarea
            rows={3}
            value={profile.bio ?? ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </label>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
