import "../styles/globals.css";
import "../styles/theme.css";
import "../styles/layout.module.css";
import "../styles/sidebar.module.css";
import "../styles/table.module.css"; // Table component styles
import "../styles/userManagement.module.css"; // User management page styles

import type { AppProps } from "next/app";
import MainLayout from "../components/layout/MainLayout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default MyApp;
