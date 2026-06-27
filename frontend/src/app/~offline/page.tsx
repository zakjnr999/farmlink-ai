export default function OfflinePage() {
  return (
    <main className="field-rows flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-farm-green">
          FarmLink Farmer
        </p>
        <h1 className="font-heading text-2xl font-bold text-field-ink">
          You are offline
        </h1>
        <p className="text-base text-muted-text">
          Your draft is safe on this device. Connect to the internet to extract
          details, publish listings, or review new offers.
        </p>
        <a
          href="/farmer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-farm-green px-6 text-base font-semibold text-white"
        >
          Return to field journal
        </a>
      </div>
    </main>
  );
}
