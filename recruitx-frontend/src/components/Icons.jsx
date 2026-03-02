/* Shared SVG icon library — all icons are 24×24 viewBox, stroke-based */
const I = ({ d, size = 20, color = "currentColor", fill = "none", strokeWidth = 1.75, ...rest }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
        {typeof d === "string" ? <path d={d} /> : d}
    </svg>
);

export const IconBriefcase = (p) => <I {...p} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />;

export const IconGrid = (p) => <I {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} />;

export const IconUsers = (p) => <I {...p} d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5M20 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />;

export const IconCheck = (p) => <I {...p} d="M20 6 9 17l-5-5" />;

export const IconCheckCircle = (p) => <I {...p} d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />;

export const IconClock = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />;

export const IconPlus = (p) => <I {...p} d="M12 5v14M5 12h14" />;

export const IconArrowRight = (p) => <I {...p} d="M5 12h14M12 5l7 7-7 7" />;

export const IconArrowLeft = (p) => <I {...p} d="M19 12H5M12 19l-7-7 7-7" />;

export const IconBuilding = (p) => <I {...p} d="M3 21h18M9 21V7l6-4v18M9 12h6M9 16h.01M15 12h.01M15 16h.01" />;

export const IconBarChart = (p) => <I {...p} d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />;

export const IconStar = (p) => <I {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;

export const IconSearch = (p) => <I {...p} d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />;

export const IconFilter = (p) => <I {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;

export const IconEdit = (p) => <I {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;

export const IconExternalLink = (p) => <I {...p} d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />;

export const IconUpload = (p) => <I {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />;

export const IconUser = (p) => <I {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;

export const IconPhone = (p) => <I {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;

export const IconMail = (p) => <I {...p} d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>} />;

export const IconSun = (p) => <I {...p} d={<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>} />;

export const IconMoon = (p) => <I {...p} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;

export const IconLogout = (p) => <I {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;

export const IconAward = (p) => <I {...p} d={<><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>} />;

export const IconTrendingUp = (p) => <I {...p} d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />;

export const IconLayers = (p) => <I {...p} d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2zM12 22v-6.5M22 8.5l-10 7-10-7" />;

export const IconTarget = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>} />;

export const IconZap = (p) => <I {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;

export const IconShield = (p) => <I {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

export const IconRocket = (p) => <I {...p} d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />;

export const IconClipboard = (p) => <I {...p} d={<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>} />;

export const IconEye = (p) => <I {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />;

export const IconEyeOff = (p) => <I {...p} d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />;

export const IconChevronRight = (p) => <I {...p} d="m9 18 6-6-6-6" />;
export const IconChevronLeft = (p) => <I {...p} d="m15 18-6-6 6-6" />;
export const IconX = (p) => <I {...p} d="M18 6 6 18M6 6l12 12" />;
export const IconDownload = (p) => <I {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />;
export const IconGlobe = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>} />;
export const IconBell = (p) => <I {...p} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
export const IconRefreshCw = (p) => <I {...p} d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
export const IconFileText = (p) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>} />;
export const IconXCircle = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>} />;
