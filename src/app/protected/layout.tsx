import SideBar from "@/layouts/SideBar/SideBar";
import React from "react";
import styles from "./styles/MainLayout.module.css";
import TopBar from "@/layouts/TopBar/TopBar";
import { generalSans, tanker } from "../fonts";
import "../globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className={`${generalSans.variable} ${tanker.variable}`}>
        <LanguageProvider>
          <main className={styles.admin_layout}>
            <div className={styles.side_nav_area}>
              <SideBar />
            </div>
            <div className={styles.main_content}>
              <TopBar />
              <div className={styles.content_area}>{children}</div>
            </div>
          </main>
        </LanguageProvider>
      </div>
  );
}

export default AdminLayout;
