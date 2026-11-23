const FONT = { fontFamily: "var(--font-cond)", fontWeight: 900 } as const;

const ShowCover = ({ cover }: { cover: string }) => (
  <svg className="ld-radio__cover" viewBox="0 0 108 108" aria-hidden="true">
    {cover === "a" && (
      <>
        <rect width="108" height="108" fill="#efe6d2" />
        <path
          d="M16 18h76a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H48L30 92V74H16a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"
          fill="#1b1a20"
        />
        <text x="54" y="58" textAnchor="middle" fontSize="34" fill="#f2c33e" style={FONT}>
          LT
        </text>
        <text x="100" y="100" textAnchor="end" fontSize="11" fill="#1b1a20" style={FONT}>
          LEONIDA TALK
        </text>
      </>
    )}
    {cover === "b" && (
      <>
        <rect width="108" height="108" fill="#101a33" />
        <circle cx="56" cy="46" r="26" fill="#e9e4da" />
        <circle cx="68" cy="38" r="24" fill="#101a33" />
        <path d="M80 18l2.4 5 5.4.6-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.6z" fill="#e9e4da" />
        <text x="10" y="98" fontSize="18" fill="#e9e4da" style={FONT}>
          NIGHT DESK
        </text>
      </>
    )}
    {cover === "c" && (
      <>
        <rect width="108" height="108" fill="#1fa3a0" />
        <clipPath id="ld-sun">
          <rect x="14" y="14" width="80" height="44" />
        </clipPath>
        <circle cx="54" cy="58" r="40" fill="#ffb347" clipPath="url(#ld-sun)" />
        {[30, 38, 46, 54].map(y => (
          <rect key={y} x="14" y={y} width="80" height="3" fill="#1fa3a0" />
        ))}
        <text x="54" y="88" textAnchor="middle" fontSize="26" fill="#fff6e6" style={FONT}>
          KEYS HOUR
        </text>
      </>
    )}
    {cover === "d" && (
      <>
        <rect width="108" height="108" fill="#c2283a" />
        <circle cx="54" cy="50" r="34" fill="none" stroke="#f6efe2" strokeWidth="5" />
        <text x="54" y="68" textAnchor="middle" fontSize="54" fill="#f6efe2" style={FONT}>
          W
        </text>
        <text x="54" y="101" textAnchor="middle" fontSize="12" letterSpacing="2" fill="#f6efe2" style={FONT}>
          THE WEEKLY
        </text>
      </>
    )}
    {cover === "e" && (
      <>
        <rect width="108" height="108" fill="#16131c" />
        <text x="10" y="44" fontSize="40" fill="#f976b0" style={FONT}>
          VICE
        </text>
        <text x="10" y="78" fontSize="40" fill="#f2c33e" style={FONT}>
          CITY
        </text>
        <rect x="10" y="86" width="88" height="12" fill="#f976b0" />
        <text x="54" y="96" textAnchor="middle" fontSize="10" letterSpacing="3" fill="#16131c" style={FONT}>
          TONIGHT
        </text>
      </>
    )}
  </svg>
);

export { ShowCover };
