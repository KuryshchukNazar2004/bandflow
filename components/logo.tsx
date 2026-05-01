export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const s = { sm: 24, md: 34, lg: 52 }[size];
  const t = { sm: 13, md: 18, lg: 28 }[size];

  return (
    <div className="flex items-center gap-2">
      <svg width={s} height={s} viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="9" fill="#2D1B69"/>
        <rect x="8"  y="15" width="3.5" height="10" rx="1.75" fill="white"/>
        <rect x="15" y="9"  width="3.5" height="22" rx="1.75" fill="white"/>
        <rect x="22" y="12" width="3.5" height="16" rx="1.75" fill="white"/>
        <rect x="29" y="17" width="3.5" height="6"  rx="1.75" fill="white"/>
        <circle cx="32" cy="8" r="2.5" fill="#7C3AED"/>
      </svg>
      <span style={{ fontFamily: "Georgia, serif", fontSize: t, color: "#2D1B69", fontStyle: "italic" }}>
        Band<span style={{ color: "#7C3AED", fontStyle: "normal", fontWeight: 500 }}>Flow</span>
      </span>
    </div>
  );
};