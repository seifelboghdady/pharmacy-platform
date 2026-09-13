export function PharmaLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 8h24a4 4 0 014 4v16h16a4 4 0 014 4v16a4 4 0 01-4 4H56v16a4 4 0 01-4 4H28a4 4 0 01-4-4V56H8a4 4 0 01-4-4V36a4 4 0 014-4h16V12a4 4 0 014-4z"
        fill="url(#pharma-grad)"
      />
      <path d="M40 38c0 0 6-8 12-6-2 6-12 6-12 6z" fill="white" fillOpacity="0.55" />
      <path d="M40 38c0 0-4-8-10-7 1 6 10 7 10 7z" fill="white" fillOpacity="0.35" />
      <defs>
        <linearGradient id="pharma-grad" x1="4" y1="4" x2="76" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ACC1" />
          <stop offset="0.5" stopColor="#1565C0" />
          <stop offset="1" stopColor="#0D47A1" />
        </linearGradient>
      </defs>
    </svg>
  )
}
