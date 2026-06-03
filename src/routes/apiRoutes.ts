export const BACKEND_ROUTES = {
  LOGIN_ADMIN: "/admin/auth/login",
  DASHBOARD_OVERVIEW: "/admin/statistics/dashboard/overview",
  DASHBOARD_USER_ENGAGEMENT_CHART:
    "/admin/statistics/dashboard/user-engagement",
  ANALYTICS_COMPANY_INSIGHTS: "/admin/statistics/company-analytics",
  ANALYTICS_COMPANY_INSIGHTS_REVIEW_BY_INDUSTRY:
    "/admin/companies/insights/review-volume-by-industry",
  ANALYTICS_COMPANY_INSIGHTS_COVERAGE_DEPTH_BY_INDUSTRY:
    "/admin/companies/insights/company-coverage-depth",
  ANALYTICS_COMPANY_INSIGHTS_STATS: "/admin/companies/insights/overview",
  ANALYTICS_COMPANY_PROFILE_TRAFFIC:
    "/admin/companies/insights/profile-traffic",
  ANALYTICS_USERS_INSIGHTS: "/admin/statistics/user-analytics",
  ANALYTICS_EMERGENCY_CONCERN_SIGNALS:
    "/admin/insights/concern-signals/recents",
  DASHBOARD_RECENT_ACTIVITY: "/admin/logs/recent",
  DASHBOARD_ACTIVITY_TYPES: "/settings/activity-types",
  LOGOUT_ADMIN: "/admin/auth/logout",
  COMPANIES: "/admin/companies",
  UPDATE_SETTINGS: "/admin/api/settings/update",
} as const;

export const API_ROUTES = {
  LOGIN: "/api/login",
  DASHBOARD_OVERVIEW: (params: Record<string, string>) =>
    `/api/dashboard/overview?${new URLSearchParams(params).toString()}`,
  DASHBOARD_USER_ENGAGEMENT_CHART: "/api/dashboard/user-engagement-chart",
  DASHBOARD_RECENT_ACTIVITY: (queryParams: Record<string, string>) =>
    `/api/dashboard/recent-activity?${new URLSearchParams(queryParams).toString()}`,
  DASHBOARD_ACTIVITY_TYPES: "/api/dashboard/activity-types",
  ANALYTICS_COMPANY_INSIGHTS: "/api/analytics/company-insights",
  ANALYTICS_COMPANY_INSIGHTS_REVIEW_BY_INDUSTRY:
    "/api/analytics/company-insights/review-volume-by-industry",
  ANALYTICS_COMPANY_INSIGHTS_COVERAGE_DEPTH_BY_INDUSTRY:
    "/api/analytics/company-insights/coverage-depth-by-industry",
  ANALYTICS_COMPANY_INSIGHTS_STATS: "/api/analytics/company-insights/stats",
  ANALYTICS_COMPANY_PROFILE_TRAFFIC:
    "/api/analytics/company-insights/profile-traffic",
  ANALYTICS_USERS_INSIGHTS: "/api/analytics/user-insights",
  ANALYTICS_EMERGENCY_CONCERN_SIGNALS:
    "/api/analytics/company-insights/concern-signals",
  LOGOUT_ADMIN: "/api/logout",
  COMPANIES: (queryParams: Record<string, string>) =>
    `/api/companies?${new URLSearchParams(queryParams).toString()}`,
  SAMPLE_COMPANIES: "/api/companies",
  UPDATE_SETTINGS: "/api/settings/update",
} as const;
