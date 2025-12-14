import "../styles/index.css";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import UserLayout from "../layouts/UserLayout";

import { AuthProvider } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useAppLogic } from "../hooks/useAppLogic";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import Head from "next/head";
import useFirebaseNotification from "../hooks/useFirebaseNotification";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { showScrollTopButton, handleScrollToTop } = useAppLogic(router);

  // Firebase notification (foreground)
  useFirebaseNotification();

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

export default MyApp;
