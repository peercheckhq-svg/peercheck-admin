"use client";
import DynamicTable from "@/components/Tables/DynamicTable";
import styles from "./styles/styles.module.css";
import useFetch from "@/hooks/useFetch";
import { API_ROUTES } from "@/routes/apiRoutes";
import { useState, useEffect } from "react";
import Image from "next/image";
import Loader from "@/components/Loader/Loader";
import { ASSETS_BASE_URL } from "@/utils/constants";
import SearchInput from "@/components/Input/SearchInput";
function Companies() {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    include_stats: "true",
    min_rating: "0",
    sort_field: "average_overall_rating",
    sort_order: "desc",
    page: "1",
    per_page: "10",
    limit: "10",
    search: "",
  });
  const [searchValue, setSearchValue] = useState("");

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, search: searchValue, page: "1" }));
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    isError,
  } = useFetch<PaginatedApiSuccessResponse<Company[]>>(
    API_ROUTES.COMPANIES(queryParams),
    {
      parser: async (res) => res.json(),
      onError: (error) => {
        console.error("Dashboard overview error:", error);
      },
    },
  );

  const companies = companiesResponse?.data ?? [];
  const paginationMeta = companiesResponse?.meta;

  console.log("Fetched companies:", companies);

  const columns: TableColumn[] = [
    {
      key: "name",
      label: "Company Name",
      sortable: true,
      render: (company: Company) => (
        <div className={styles.companyCell}>
          {isCompaniesLoading ? (
            <div className={styles.logoContainer}>
              <Loader variant="skeleton" size="sm" />
            </div>
          ) : company.logo ? (
            <div className={styles.logoContainer}>
              <Image
                src={ASSETS_BASE_URL + company.logo}
                alt={`${company.name} logo`}
                className={styles.companyLogo}
                width={40}
                height={40}
              />
            </div>
          ) : (
            <div className={styles.initials}>{company.name.charAt(0)}</div>
          )}
          <span>
            {isCompaniesLoading ? (
              <Loader variant="skeleton" size="sm" />
            ) : (
              company.name
            )}
          </span>
        </div>
      ),
    },
    {
      key: "founded",
      label: "Founded",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : (
          company.founded || "N/A"
        ),
    },
    {
      key: "size",
      label: "Size",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : (
          company.size || "N/A"
        ),
    },
    {
      key: "averageOverallRating",
      label: "Avg. Rating",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : company.averageOverallRating ? (
          company.averageOverallRating.toFixed(1)
        ) : (
          "N/A"
        ),
    },
    {
      key: "salaryReviewsCount",
      label: "Salary Reviews",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : (
          company.salaryReviewsCount || "N/A"
        ),
    },
    {
      key: "interviewReviewsCount",
      label: "Interview Reviews",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : (
          company.interviewReviewsCount || "N/A"
        ),
    },
    {
      key: "totalReviewsCount",
      label: "Total Reviews",
      sortable: true,
      render: (company: Company) =>
        isCompaniesLoading ? (
          <Loader variant="skeleton" size="sm" />
        ) : (
          company.totalReviewsCount || "N/A"
        ),
    },
  ];

  // Skeleton rows for loading state (match per_page or default to 5)
  const perPageValue = Number(
    queryParams.per_page || queryParams.limit || "10",
  );
  const skeletonRows = Array.from({ length: Math.min(perPageValue, 10) }).map(
    (_, index) => ({
      id: `skeleton-${index}`,
      name: "",
      logo: null,
      founded: "",
      size: "",
      averageOverallRating: null,
      salaryReviewsCount: null,
      interviewReviewsCount: null,
      totalReviewsCount: null,
    }),
  );

  return (
    <div className={styles.companies}>
      <div className={styles.header}>
        <h3 className={styles.title}>Companies</h3>
        <div>
          <SearchInput onChange={(value) => setSearchValue(value)} />
        </div>
      </div>
      <DynamicTable
        columns={columns}
        data={isCompaniesLoading ? skeletonRows : (companies ?? [])}
        serverPagination
        currentPage={
          paginationMeta?.current_page || Number(queryParams.page || "1") || 1
        }
        perPage={
          paginationMeta?.per_page ||
          Number(queryParams.per_page || queryParams.limit || "10") ||
          10
        }
        totalPages={paginationMeta?.last_page || 1}
        totalItems={paginationMeta?.total}
        onPageChange={(nextPage) =>
          setQueryParams((prev) => ({ ...prev, page: String(nextPage) }))
        }
        onPerPageChange={(nextPerPage) =>
          setQueryParams((prev) => ({
            ...prev,
            page: "1",
            per_page: String(nextPerPage),
            limit: String(nextPerPage),
          }))
        }
        emptyMessage="No Companies found"
      />
    </div>
  );
}

export default Companies;
