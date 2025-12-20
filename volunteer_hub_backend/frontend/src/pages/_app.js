import "../styles/index.css";
import setupAxiosInterceptors from "../configs/axiosConfig";
import dynamic from "next/dynamic";

// Initialize Axios interceptors for logging
setupAxiosInterceptors();

// Dynamic imports for layouts - load only when needed
const MainLayout = dynamic(() => import("../layouts/MainLayout"), { ssr: true });
const AdminLayout = dynamic(() => import("../layouts/AdminLayout"), { ssr: false });
const ManagerLayout = dynamic(() => import("../layouts/ManagerLayout"), { ssr: false });
const UserLayout = dynamic(() => import("../layouts/UserLayout"), { ssr: true });

import { AuthProvider } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useAppLogic } from "../hooks/useAppLogic";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { showScrollTopButton, handleScrollToTop } = useAppLogic(router);
  
  // Lazy load Firebase notification hook
  useEffect(() => {
    import("../hooks/useFirebaseNotification").then((mod) => {
      // Hook is now loaded, but we don't call it here
      // Firebase notifications are handled inside the hook's useEffect
    });
  }, []);

  // Register service worker (for Firebase background notifications)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "ServiceWorker registered with scope:",
              registration.scope
            );
          })
          .catch((err) => {
            console.error("ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  // Route detection
  const isAdminPage = router.pathname.startsWith("/admin");
  const isAdminLoginPage = router.pathname === "/admin";

  const isManagerPage = router.pathname.startsWith("/manager");
  const isManagerLoginPage = router.pathname === "/manager";

  const isUserPage = router.pathname.startsWith("/user");

  return (
    <AuthProvider>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      {isAdminPage ? (
        isAdminLoginPage ? (
          <Component {...pageProps} />
        ) : (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        )
      ) : isManagerPage ? (
        isManagerLoginPage ? (
          <Component {...pageProps} />
        ) : (
          <ManagerLayout>
            <Component {...pageProps} />
          </ManagerLayout>
        )
      ) : isUserPage ? (
        <UserLayout>
          <Component {...pageProps} />
        </UserLayout>
      ) : (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}

      <Toaster />

      {showScrollTopButton && (
        <button
          onClick={handleScrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            backgroundColor: "#A9A8B6",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          ↑
        </button>
      )}
    </AuthProvider>
  );
}

export function reportWebVitals(metric) {
  // Log Core Web Vitals and custom metrics
  // console.log('[Web Vitals]', metric);
  
  // Log specific metrics like LCP, FID, CLS, TTFB
  if (metric.label === 'web-vital') {
    console.log(`%c[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`, 'color: orange; font-weight: bold;');
  } else {
    console.log(`%c[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`, 'color: orange;');
  }
}

export default MyApp;
