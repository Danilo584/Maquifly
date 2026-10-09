import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function I({ size = 20, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const AIconHome = (p: P) => (
  <I {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </I>
);
export const AIconInbox = (p: P) => (
  <I {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1Z" />
  </I>
);
export const AIconUpload = (p: P) => (
  <I {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5" />
    <path d="M12 3v12" />
  </I>
);
export const AIconMachine = (p: P) => (
  <I {...p}>
    <path d="M3 17h13" />
    <rect x="6" y="10" width="9" height="6" rx="1.2" />
    <path d="M9 10V6h4l1.5 4" />
    <path d="M15 12l4-4 2 1-3 6" />
    <circle cx="7.5" cy="18.5" r="1.8" />
    <circle cx="13.5" cy="18.5" r="1.8" />
  </I>
);
export const AIconUsers = (p: P) => (
  <I {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
    <path d="M16 3.1a4 4 0 0 1 0 7.8" />
  </I>
);
export const AIconWallet = (p: P) => (
  <I {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M16 15h2" />
  </I>
);
export const AIconFlag = (p: P) => (
  <I {...p}>
    <path d="M4 22V4" />
    <path d="M4 4h12l-2 4 2 4H4" />
  </I>
);
export const AIconLogout = (p: P) => (
  <I {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </I>
);
export const AIconExternal = (p: P) => (
  <I {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </I>
);
export const AIconRefresh = (p: P) => (
  <I {...p}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
    <path d="M21 3v5h-5" />
  </I>
);
export const AIconBell = (p: P) => (
  <I {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
  </I>
);
export const AIconMenu = (p: P) => (
  <I {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </I>
);
export const AIconEye = (p: P) => (
  <I {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </I>
);
export const AIconChat = (p: P) => (
  <I {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.7-5.2A8.4 8.4 0 1 1 21 11.5Z" />
  </I>
);
