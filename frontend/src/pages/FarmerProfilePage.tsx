import { useEffect, useState, type FormEvent } from 'react';
import { FarmLinkApiError } from '../api/client';
import { api } from '../lib/api';
import type { FarmerProfile } from '../types/extra';

const DEFAULT_PROFILE: FarmerProfile = {
  id: '',
  userId: '',
  farmName: '',
  region: '',
  district: '',
  town: '',
  village: null,
  latitude: 6.6885,
  longitude: -1.6244,
  primaryCrops: [],
  bio: null,
  onboardingComplete: false,
};

function mapProfile(raw: Record<string, unknown>): FarmerProfile {
  return {
    id: String(raw.id ?? ''),
    userId: String(raw.userId ?? ''),
    farmName: (raw.farmName as string | null) ?? '',
    region: String(raw.region ?? ''),
    district: String(raw.district ?? ''),
    town: (raw.town as string | null) ?? '',
    village: null,
    latitude: Number(raw.latitude ?? 6.6885),
    longitude: Number(raw.longitude ?? -1.6244),
    primaryCrops: Array.isArray(raw.primaryCrops) ? (raw.primaryCrops as string[]) : [],
    bio: (raw.description as string | null) ?? null,
    onboardingComplete: Boolean(raw.id),
  };
}

export function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.call<{ profile: Record<string, unknown> }>('GET', '/farmers/profile');
        setProfile(mapProfile(res.data.profile));
      } catch (err) {
        if (err instanceof FarmLinkApiError && err.status === 404) {
          setProfile({ ...DEFAULT_PROFILE });
          setIsNew(true);
        } else {
          setError(err instanceof FarmLinkApiError ? err.message : 'Could not load profile');
        }
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
      const payload = {
        farmName: profile.farmName || 'My Farm',
        description: profile.bio ?? undefined,
        region: profile.region,
        district: profile.district,
        town: profile.town || profile.region,
        latitude: profile.latitude ?? 6.6885,
        longitude: profile.longitude ?? -1.6244,
        primaryCrops: profile.primaryCrops,
      };
      const res = await api.call<{ profile: Record<string, unknown> }>(
        isNew ? 'POST' : 'PATCH',
        '/farmers/profile',
        payload,
      );
      setProfile(mapProfile(res.data.profile));
      setIsNew(false);
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
            required
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
          {saving ? 'Saving…' : isNew ? 'Create profile' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
