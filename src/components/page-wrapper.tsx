"use client";

import { usePathname } from "next/navigation";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();

  // Don't add padding for homepage since it has full-screen hero
  const shouldAddPadding = pathname !== '/';

  return (
    <div className={shouldAddPadding ? "pt-16" : ""}>
      {children}
    </div>
  );
}