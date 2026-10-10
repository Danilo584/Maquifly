import type { ReactNode, SVGProps } from "react";
import type { MachineIconName } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6 18 18M18 6 6 18" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export const IconStar = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.2 19 6v5.6c0 4.3-2.9 7.6-7 9.2-4.1-1.6-7-4.9-7-9.2V6Z" />
    <path d="m9 12 2.2 2.2L15.4 10" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.8 20c.8-3.6 3.7-5.6 7.2-5.6s6.4 2 7.2 5.6" />
  </Svg>
);

export const IconTruck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 7.5h11v9H2zM13 11h4l3 3.2v2.3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Svg>
);

export const IconOperator = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 10.5a6 6 0 0 1 12 0" />
    <path d="M4.5 10.5h15v3a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />
    <path d="M9 15.5v2.2a3 3 0 0 0 6 0v-2.2" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </Svg>
);

export const IconTag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4h7.2l8.3 8.3-7.2 7.2L4 11.2Z" />
    <circle cx="8.4" cy="8.4" r="1.4" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5 21 19.5H3Z" />
    <path d="M12 10v4M12 17h.01" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 21V4M6 4h11l-2 3.5L17 11H6" />
  </Svg>
);

export const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 8.5h3.2l1.5-2h7.6l1.5 2h3.2v10h-17z" />
    <circle cx="12" cy="13" r="3.2" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Svg>
);

export const IconAward = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="m8.5 14.2-1.5 7.3 5-3 5 3-1.5-7.3" />
  </Svg>
);

export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
    <path d="M15 9h4a1 1 0 0 1 1 1v11" />
    <path d="M3 21h18M8 8h3M8 12h3M8 16h3" />
  </Svg>
);

export const IconWhatsApp = ({ size = 20, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.19-1.36a9.9 9.9 0 0 0 4.85 1.24h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.24 8.24 0 0 1-1.26-4.39c0-4.56 3.71-8.27 8.28-8.27 2.21 0 4.29.86 5.85 2.43a8.22 8.22 0 0 1 2.42 5.85c0 4.57-3.71 8.23-8.31 8.23Zm4.53-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

/* ---------------------------------------------------------------------------
   Iconografía de categorías: trazo lineal, sin relleno, legible a 24 px.
   --------------------------------------------------------------------------- */
const categoryPaths: Record<MachineIconName, ReactNode> = {
  "skid-steer": (
    <>
      <path d="M8 10.5h8v5H8z" />
      <path d="M10 10.5V8h4.5l.6 2.5" />
      <path d="M8 11.5 4.5 13.5H2.5v2h2.5L8 14" />
      <circle cx="9.5" cy="17.5" r="2" />
      <circle cx="15" cy="17.5" r="2" />
    </>
  ),
  excavator: (
    <>
      <path d="M7 10h7v5H7z" />
      <path d="M9 10V7.5h3.2L13 10" />
      <path d="m14 11 4-4 1.5 5" />
      <path d="M17.5 13.5h3.5l-.5 3h-3z" />
      <rect x="5" y="16" width="11" height="3" rx="1.5" />
    </>
  ),
  backhoe: (
    <>
      <path d="M7 9.5h7V14H7z" />
      <path d="M9 9.5V7h3.5l.6 2.5" />
      <path d="m14 10.5 3.5-2.5 2 4.5" />
      <path d="M7 12 3.5 14H2v2h2l3-1.5" />
      <circle cx="6" cy="16.5" r="1.8" />
      <circle cx="14.5" cy="15.5" r="3" />
    </>
  ),
  loader: (
    <>
      <path d="M8 9.5h9V15H8z" />
      <path d="M11.5 9.5V7H15l.7 2.5" />
      <path d="M8 11 3.5 14H1.5v2.2H4L8 14.5" />
      <circle cx="10" cy="17" r="2.4" />
      <circle cx="16" cy="17" r="2.4" />
    </>
  ),
  "dump-truck": (
    <>
      <path d="M10 9.5 21 8v6H10z" />
      <path d="M3 14V8.5h4L9 11v3z" />
      <path d="M2.5 14h19" />
      <circle cx="6" cy="16.6" r="1.9" />
      <circle cx="15" cy="16.6" r="1.9" />
      <circle cx="19" cy="16.6" r="1.9" />
    </>
  ),
  roller: (
    <>
      <path d="M9 7.5h7v5H9z" />
      <rect x="2.5" y="11" width="6.5" height="7" rx="3.2" />
      <path d="M4.8 11.5v6M6.8 11.5v6" />
      <circle cx="16.5" cy="15" r="3" />
      <path d="M9 13h3v2.5H9z" />
    </>
  ),
  grader: (
    <>
      <path d="M3 15h18" />
      <path d="M13 8h6v5h-6z" />
      <path d="m6 13 5 1.5" />
      <circle cx="4.5" cy="17" r="1.8" />
      <circle cx="15" cy="17" r="2" />
      <circle cx="19.5" cy="17" r="2" />
    </>
  ),
  tractor: (
    <>
      <path d="M5.5 11.5V18h11l.8-6.5z" />
      <path d="M8 11.5V8h4.5l.5 3.5" />
      <path d="M4 10v9H2v-9z" />
      <path d="M5.5 14H4" />
    </>
  ),
  crane: (
    <>
      <path d="m7 12 12-6" />
      <path d="M19 6v4" />
      <path d="M17.5 10h3" />
      <path d="M4 12h8v3H4z" />
      <path d="M2 15v-3.5h2" />
      <circle cx="6" cy="17" r="1.8" />
      <circle cx="12" cy="17" r="1.8" />
    </>
  ),
  lift: (
    <>
      <path d="M6 4h12v2H6z" />
      <path d="m8 6 8 6M16 6l-8 6M8 12l8 5M16 12l-8 5" />
      <path d="M5 17h14v2.5H5z" />
    </>
  ),
  telehandler: (
    <>
      <path d="m6 10 13-3" />
      <path d="M19 7v3M17.5 10h3.5" />
      <path d="M4 10.5h8V15H4z" />
      <circle cx="6.5" cy="17" r="2.2" />
      <circle cx="13" cy="17" r="2.2" />
    </>
  ),
  generator: (
    <>
      <rect x="3" y="6.5" width="18" height="11" rx="2" />
      <path d="M6 9.5h5M6 12h5M6 14.5h5" />
      <path d="M16.5 9 14 13h3l-2.5 4" />
    </>
  ),
  mixer: (
    <>
      <path d="m9 5 8 2-1.5 7-7-2z" />
      <path d="m10 8 5 1.2" />
      <path d="M6 18h12" />
      <path d="m8.5 12-1.5 6M15.5 14l2 4" />
    </>
  ),
  compactor: (
    <>
      <path d="m13 5 4-1" />
      <path d="m11 11 3-6" />
      <rect x="7" y="9" width="7" height="5" rx="1.5" />
      <path d="M5 15h11v2.5H5z" />
      <path d="M5 19.5h11" />
    </>
  ),
  tools: (
    <>
      <rect x="9" y="3" width="6" height="7" rx="1.5" />
      <path d="M7 5.5h2M15 5.5h2" />
      <path d="M10.5 10h3v5h-3z" />
      <path d="M12 15v4" />
      <path d="M8 20h8" />
    </>
  ),
  agri: (
    <>
      <path d="M7 10h6v4H7z" />
      <path d="M8.5 10V6.5h3L12 10" />
      <circle cx="5" cy="15.5" r="2.4" />
      <circle cx="15" cy="14.5" r="4.5" />
      <path d="M15 10v9M10.5 14.5h9" />
    </>
  ),
  other: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 6.5v2M12 15.5v2M6.5 12h2M15.5 12h2" />
    </>
  ),
};

export function CategoryIcon({
  name,
  size = 24,
  className,
}: {
  name: MachineIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Svg size={size} strokeWidth={1.6} className={className}>
      {categoryPaths[name] ?? categoryPaths.other}
    </Svg>
  );
}

export const IconFacebook = ({ size = 20, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
  </svg>
);
