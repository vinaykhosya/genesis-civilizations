import React from "react";

export default function CivilizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-void)",
      color: "var(--text-primary)"
    }}>
      {children}
    </div>
  );
}
