const flags: Record<string, React.ReactNode> = {
  CL: (
    <>
      <rect width="30" height="20" fill="#d52b1e" />
      <rect width="30" height="10" fill="#fff" />
      <rect width="10" height="10" fill="#0039a6" />
      <polygon
        fill="#fff"
        points="5,1.7 6.1,4.6 9.2,4.6 6.7,6.4 7.6,9.3 5,7.6 2.4,9.3 3.3,6.4 0.8,4.6 3.9,4.6"
      />
    </>
  ),
  AR: (
    <>
      <rect width="30" height="20" fill="#74acdf" />
      <rect y="6.7" width="30" height="6.6" fill="#fff" />
      <circle cx="15" cy="10" r="2.1" fill="#f6b40e" />
    </>
  ),
  MX: (
    <>
      <rect width="10" height="20" fill="#006847" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ce1126" />
    </>
  ),
  ES: (
    <>
      <rect width="30" height="20" fill="#c60b1e" />
      <rect y="5" width="30" height="10" fill="#ffc400" />
    </>
  ),
  BR: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <polygon points="15,2.2 27.5,10 15,17.8 2.5,10" fill="#ffdf00" />
      <circle cx="15" cy="10" r="3.4" fill="#002776" />
    </>
  ),
  PE: (
    <>
      <rect width="10" height="20" fill="#d91023" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#d91023" />
    </>
  ),
  CO: (
    <>
      <rect width="30" height="10" fill="#fcd116" />
      <rect y="10" width="30" height="5" fill="#003893" />
      <rect y="15" width="30" height="5" fill="#ce1126" />
    </>
  ),
};

export function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden>
      {flags[code.toUpperCase()] ?? <rect width="30" height="20" className="fill-muted" />}
    </svg>
  );
}
