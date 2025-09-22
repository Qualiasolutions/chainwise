"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();

  // Pages that need special treatment
  const isHomePage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');
  const isDashboard = pathname.startsWith('/dashboard');
  const isCheckout = pathname.startsWith('/checkout');

  // Calculate padding based on page type
  const getPadding = () => {
    if (isHomePage) return "";
    if (isAuthPage) return "pt-0";
    if (isCheckout) return "pt-20";
    if (isDashboard) return "pt-20";
    return "pt-20 pb-8";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen ${getPadding()}`}
    >
      {/* Background Effects */}
      {!isHomePage && !isAuthPage && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Content */}
      <div className={!isHomePage && !isAuthPage ? "px-3 py-4 max-w-full" : ""}>
        {children}
      </div>
    </motion.div>
  );
}