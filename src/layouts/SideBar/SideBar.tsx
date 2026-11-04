"use client";

import { ROUTE_PATHS } from "@/routes/routePaths";
import DashboardIcon from "@/icons/DashboardIcon";
import SideBarSection from "./components/SideBarSection";
import AnalyticsIcon from "@/icons/AnalyticsIcon";
import CompaniesIcon from "@/icons/CompaniesIcon";
import InstitutionsIcon from "@/icons/InstitutionsIcon";
import ReviewsIcon from "@/icons/ReviewsIcon";
import TeamIcon from "@/icons/TeamIcon";
import BillingIcon from "@/icons/BillingIcon";
import SupportIcon from "@/icons/SupportIcon";
import SettingsIcon from "@/icons/SettingsIcon";
import Image from "next/image";
import styles from "./styles/SideBar.module.css";
import { useCustomNavigation } from "@/hooks/useCustomNavigation";

function SideBar() {
  const { open, toggleOpen, currentRoute } = useCustomNavigation();

  const navList: NavSection[] = [
    {
      sectionTitle: "Main",
      items: [
        {
          title: "Dashboard",
          icon: <DashboardIcon />,
          path: ROUTE_PATHS.ADMIN_DASHBOARD,
        },
        {
          title: "Analytics",
          icon: <AnalyticsIcon />,
          path: ROUTE_PATHS.ADMIN_ANALYTICS.USER_INSIGHTS,
          children: [
            {
              title: "User Insights",
              path: ROUTE_PATHS.ADMIN_ANALYTICS.USER_INSIGHTS,
            },
            {
              title: "Company Insights",
              path: ROUTE_PATHS.ADMIN_ANALYTICS.COMPANY_INSIGHTS,
            },
            {
              title: "Salary Insights",
              path: ROUTE_PATHS.ADMIN_ANALYTICS.SALARY_INSIGHTS,
            },
            {
              title: "Review Trends",
              path: ROUTE_PATHS.ADMIN_ANALYTICS.REVIEW_TRENDS,
            },
          ],
        },
        {
          title: "Companies",
          icon: <CompaniesIcon />,
          path: ROUTE_PATHS.ADMIN_COMPANIES,
        },
        {
          title: "Institutions",
          icon: <InstitutionsIcon />,
          path: ROUTE_PATHS.ADMIN_INSTITUTIONS,
        },
        {
          title: "Review Verification",
          icon: <ReviewsIcon />,
          path: ROUTE_PATHS.ADMIN_REVIEWS,
          children: [{ title: "Manage all reviews", path: `${ROUTE_PATHS.ADMIN_REVIEWS}/manage` }],
        },
        {
          title: "Team",
          icon: <TeamIcon />,
          path: ROUTE_PATHS.ADMIN_TEAM,
        },
        {
          title: "Billing",
          icon: <BillingIcon />,
          path: ROUTE_PATHS.ADMIN_BILLING,
        },
      ],
    },
    {
      sectionTitle: "Others",
      items: [
        {
          title: "Settings",
          icon: <SettingsIcon />,
          path: ROUTE_PATHS.ADMIN_SETTINGS,
        },
        {
          title: "Support",
          icon: <SupportIcon />,
          path: ROUTE_PATHS.ADMIN_SUPPORT,
        },
      ],
    },
  ];
  return open ? (
    <nav className={styles.side_bar} onClick={toggleOpen}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.logo_container}>
          <Image width={100} height={30} src="/logo.png" alt="PeerCheck Logo" />
        </div>
        {navList.map((section) => (
          <SideBarSection
            key={section.sectionTitle}
            sectionTitle={section.sectionTitle}
            items={section.items}
            currentPath={currentRoute}
          />
        ))}
      </div>
    </nav>
  ) : null;
}

export default SideBar;
