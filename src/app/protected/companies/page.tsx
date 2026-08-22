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
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import SearchableSelect from "@/components/Input/SearchableSelect";
import usePost from "@/hooks/usePost";
import { useWindow } from "@/hooks/useWindow";
import MobileTable from "@/components/Tables/MobileTable";
function Companies() {
  const { width } = useWindow();
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceCompany, setSelectedSourceCompany] = useState<
    string | null
  >(null);
  const [selectedTargetCompany, setSelectedTargetCompany] = useState<
    string | null
  >(null);

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, search: searchValue, page: "1" }));
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  useEffect(() => {
    if (
      selectedSourceCompany &&
      selectedTargetCompany &&
      selectedSourceCompany === selectedTargetCompany
    ) {
      setSelectedTargetCompany(null);
    }
  }, [selectedSourceCompany, selectedTargetCompany]);

  const {
    data: companiesResponse,
    isLoading: isCompaniesLoading,
    isError,
    refetch: refetchCompanies,
  } = useFetch<PaginatedApiSuccessResponse<Company[]>>(
    API_ROUTES.COMPANIES(queryParams),
    {
      parser: async (res) => res.json(),
      onError: (error) => {
        console.error("Dashboard overview error:", error);
      },
    },
  );

  const {
    isLoading: isMerging,
    error: mergeError,
    mutate: mergeCompanies,
  } = usePost<ApiSuccessResponse<unknown>, { targetCompanyId: string }>(
    selectedSourceCompany
      ? API_ROUTES.MERGE_COMPANIES(selectedSourceCompany)
      : "",
    {
      onSuccess: async () => {
        setIsModalOpen(false);
        setSelectedSourceCompany(null);
        setSelectedTargetCompany(null);
        await refetchCompanies();
      },
      onError: (error) => {
        console.error("Company merge error:", error);
      },
    },
  );

  const companies = companiesResponse?.data ?? [];
  const paginationMeta = companiesResponse?.meta;

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

  const availableTargetCompanies = companies.filter(
    (company) => String(company.id) !== selectedSourceCompany,
  );

  const canMergeCompanies =
    Boolean(selectedSourceCompany) &&
    Boolean(selectedTargetCompany) &&
    selectedSourceCompany !== selectedTargetCompany;

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSourceCompany(null);
    setSelectedTargetCompany(null);
  };

  const handleMergeCompanies = async () => {
    if (!selectedSourceCompany || !selectedTargetCompany) {
      return;
    }

    await mergeCompanies({
      targetCompanyId: selectedTargetCompany,
    });
  };

  return (
    <div className={styles.companies}>
      <div className={styles.header}>
        <h3 className={styles.title}>Companies</h3>
        <div className={styles.actions}>
          <SearchInput
            onChange={(value) => setSearchValue(value)}
            overrideStyles={width < 600 ? { width: "100%" } : undefined}
          />
          <Button
            variant="tertiary"
            onClick={() => setIsModalOpen(true)}
            overrideStyles={{ height: "2.7rem" }}
          >
            Merge Companies
          </Button>
        </div>
      </div>
      {width <= 768 ? (
        <MobileTable
          headerTitle="Company"
          showCheckbox={false}
          emptyTitle="No Companies found"
          emptyMessage="Companies will appear here once added."
          itemsPerPage={
            paginationMeta?.per_page ||
            Number(queryParams.per_page || queryParams.limit || "10") ||
            10
          }
          data={companies.map((company) => ({
            id: company.id,
            content: (
              <div className={styles.mobileRow}>
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
                    <div className={styles.initials}>
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <span>
                    {isCompaniesLoading ? (
                      <Loader variant="skeleton" size="sm" />
                    ) : (
                      company.name
                    )}
                  </span>
                </div>
                {isCompaniesLoading ? (
                  <Loader variant="skeleton" size="sm" />
                ) : (
                  <div className={styles.mobileDetailsContainer}>
                    <div className={styles.mobileDetails}>
                      <p>Founded: </p>
                      <strong>{company.founded || "N/A"}</strong>
                    </div>
                    <div className={styles.mobileDetails}>
                      <p>Av. Rating: </p>
                      <strong>
                        {company.averageOverallRating?.toFixed(1) || "N/A"}
                      </strong>
                    </div>
                    <div className={styles.mobileDetails}>
                      <p>Size: </p>
                      <strong>{company.size || "N/A"}</strong>
                    </div>
                    {/* <div className={styles.mobileDetails}>
                      <p>Salary Reviews: </p>
                      <strong>{company.salaryReviewsCount || "N/A"}</strong>
                    </div> */}
                    {/* <div className={styles.mobileDetails}>
                      <p>Interview Reviews: </p>
                      <strong>{company.interviewReviewsCount || "N/A"}</strong>
                    </div> */}
                    <div className={styles.mobileDetails}>
                      <p>Total Reviews: </p>
                      <strong>{company.totalReviewsCount || "N/A"}</strong>
                    </div>
                  </div>
                )}
              </div>
            ),
          }))}
        />
      ) : (
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        header={<h2>Merge Companies</h2>}
        className={styles.mergeModal}
        contentClassName={styles.mergeModalContent}
        footer={
          <>
            <Button variant="tertiary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMergeCompanies}
              disabled={!canMergeCompanies || isMerging}
              overrideStyles={{
                width: "5rem",
              }}
            >
              {isMerging ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className={styles.modalContent}>
          <SearchableSelect
            label="Source Company"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id,
            }))}
            value={selectedSourceCompany ?? undefined}
            onValueChange={(value) => setSelectedSourceCompany(String(value))}
          />

          <SearchableSelect
            label="Target Company"
            options={availableTargetCompanies.map((company) => ({
              label: company.name,
              value: company.id,
            }))}
            value={selectedTargetCompany ?? undefined}
            onValueChange={(value) => setSelectedTargetCompany(String(value))}
          />

          {mergeError && (
            <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>
              {mergeError.message}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Companies;
