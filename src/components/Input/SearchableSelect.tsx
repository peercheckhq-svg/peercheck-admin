"use client";

import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import ChevronDown from "@/icons/ChevronDown";
import SearchIcon from "@/icons/SearchIcon";
import styles from "./styles/SearchableSelect.module.css";

type SearchableSelectValue = string | number | undefined;

const DEFAULT_SKELETON_COUNT = 5;

const buildOptionSearchText = (option: SearchableSelectOption) => {
  return `${option.label ?? ""} ${option.searchText ?? ""}`
    .trim()
    .toLowerCase();
};

const SearchableSelect = forwardRef<HTMLDivElement, SearchableSelectProps>(
  (
    {
      label,
      labelClassName,
      containerClassName,
      className,
      dropdownClassName,
      errorMessage,
      options = [],
      placeholder = "Select an option",
      searchPlaceholder = "Search...",
      value,
      defaultValue,
      onValueChange,
      onOpenChange,
      onSearchChange,
      searchValue,
      disabled = false,
      isLoading = false,
      canLoadMore = false,
      onLoadMore,
      loadMoreSkeletonCount = 3,
      loadMoreRootMargin = "0px 0px 120px 0px",
      allowCustomValue = false,
      name,
      id,
      style,
      onFocus,
      onBlur,
      prefixIcon,
      suffixIcon,
      onApplyCustomValue,
    },
    ref,
  ) => {
    const rootId = useId();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] =
      useState<SearchableSelectValue>(defaultValue);
    const [internalSearchQuery, setInternalSearchQuery] = useState("");
    const [cachedSelectedOption, setCachedSelectedOption] = useState<
      SearchableSelectOption | undefined
    >(undefined);

    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    const isSearchControlled = searchValue !== undefined;
    const searchQuery = isSearchControlled ? searchValue : internalSearchQuery;

    const selectedOption = useMemo(() => {
      const found = options.find((option) => option.value === selectedValue);

      if (found) {
        return found;
      }

      if (
        cachedSelectedOption &&
        cachedSelectedOption.value === selectedValue
      ) {
        return cachedSelectedOption;
      }

      if (
        allowCustomValue &&
        selectedValue !== undefined &&
        selectedValue !== ""
      ) {
        return {
          value: selectedValue,
          label: String(selectedValue),
        } satisfies SearchableSelectOption;
      }

      return undefined;
    }, [allowCustomValue, cachedSelectedOption, options, selectedValue]);

    useEffect(() => {
      if (selectedOption && selectedOption !== cachedSelectedOption) {
        setCachedSelectedOption(selectedOption);
      }
    }, [cachedSelectedOption, selectedOption]);

    const filteredOptions = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();

      if (isSearchControlled || query.length === 0) {
        return options;
      }

      return options.filter((option) =>
        buildOptionSearchText(option).includes(query),
      );
    }, [isSearchControlled, options, searchQuery]);

    useEffect(() => {
      if (!open) {
        return;
      }

      const handleClickOutside = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setOpen(false);
          if (!isSearchControlled) {
            setInternalSearchQuery("");
          }
          onSearchChange?.("");
          onOpenChange?.(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
          if (!isSearchControlled) {
            setInternalSearchQuery("");
          }
          onSearchChange?.("");
          onOpenChange?.(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isSearchControlled, onOpenChange, onSearchChange, open]);

    useEffect(() => {
      onOpenChange?.(open);
    }, [onOpenChange, open]);

    useEffect(() => {
      if (open) {
        searchInputRef.current?.focus();
      }
    }, [open]);

    useEffect(() => {
      if (!onLoadMore || !canLoadMore || isLoading || !open) {
        return;
      }

      const sentinel = sentinelRef.current;
      const root = dropdownRef.current;

      if (!sentinel || !root) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            onLoadMore();
          }
        },
        {
          root,
          rootMargin: loadMoreRootMargin,
          threshold: 0,
        },
      );

      observer.observe(sentinel);

      return () => observer.disconnect();
    }, [
      canLoadMore,
      isLoading,
      loadMoreRootMargin,
      onLoadMore,
      open,
      filteredOptions.length,
    ]);

    useEffect(() => {
      if (!open) {
        return;
      }

      const updateDropdownWidth = () => {
        if (triggerRef.current && dropdownRef.current) {
          dropdownRef.current.style.minWidth = `${triggerRef.current.getBoundingClientRect().width}px`;
        }
      };

      updateDropdownWidth();
      window.addEventListener("resize", updateDropdownWidth);
      return () => window.removeEventListener("resize", updateDropdownWidth);
    }, [open]);

    const closeDropdown = () => {
      setOpen(false);
      if (!isSearchControlled) {
        setInternalSearchQuery("");
      } else {
        onSearchChange?.("");
      }
      onOpenChange?.(false);
    };

    const openDropdown = () => {
      if (disabled) {
        return;
      }

      setOpen((prev) => !prev);
      onFocus?.();
    };

    const handleOptionSelect = (option: SearchableSelectOption) => {
      if (option.disabled) {
        return;
      }

      if (!isControlled) {
        setInternalValue(option.value);
      }

      onValueChange?.(option.value, option);
      closeDropdown();
      onBlur?.();
    };

    const handleSearchChange = (nextValue: string) => {
      if (isSearchControlled) {
        onSearchChange?.(nextValue);
      } else {
        setInternalSearchQuery(nextValue);
      }
    };

    const handleTriggerKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (disabled) {
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    const handleApplyCustomValue = () => {
      if (!allowCustomValue || !searchQuery.trim()) {
        return;
      }

      if (filteredOptions.length === 0) {
        const customValue = searchQuery.trim();
        if (!isControlled) {
          setInternalValue(customValue);
        }
        onValueChange?.(customValue, {
          value: customValue,
          label: customValue,
        });
        onApplyCustomValue?.();
        closeDropdown();
      }
    };

    const showCustomValueAction =
      allowCustomValue &&
      searchQuery.trim().length > 0 &&
      filteredOptions.length === 0;

    const suffixNode = suffixIcon ?? <ChevronDown />;

    const content = (
      <div
        ref={containerRef}
        className={`${styles.container} ${className ?? ""}`.trim()}
        style={style}
      >
        {name && (
          <input type="hidden" name={name} value={selectedValue ?? ""} />
        )}

        {label && (
          <label className={`${styles.label} ${labelClassName ?? ""}`.trim()}>
            {label}
          </label>
        )}

        <button
          ref={triggerRef}
          id={id ?? `${rootId}-trigger`}
          type="button"
          className={`${styles.trigger} ${disabled ? styles.disabled : ""}`.trim()}
          onClick={openDropdown}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${rootId}-dropdown`}
          disabled={disabled}
        >
          <span className={styles.triggerLeft}>
            {prefixIcon && (
              <span className={styles.prefixIcon}>{prefixIcon}</span>
            )}
            <span
              className={
                selectedOption ? styles.selectedValue : styles.placeholder
              }
            >
              {selectedOption?.label ?? placeholder}
            </span>
          </span>

          <span
            className={`${styles.suffixIcon} ${open ? styles.suffixIconOpen : ""}`.trim()}
          >
            {suffixNode}
          </span>
        </button>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        {open && (
          <div
            ref={dropdownRef}
            id={`${rootId}-dropdown`}
            className={`${styles.dropdown} ${dropdownClassName ?? ""}`.trim()}
            role="listbox"
            aria-labelledby={id ?? `${rootId}-trigger`}
          >
            <div className={styles.searchRow}>
              <span className={styles.searchIcon}>
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </div>

            <div className={styles.optionsList}>
              {isLoading && filteredOptions.length === 0 ? (
                Array.from({ length: DEFAULT_SKELETON_COUNT }).map(
                  (_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className={styles.skeletonRow}
                    >
                      <span className={styles.skeletonDot} />
                      <span className={styles.skeletonLine} />
                    </div>
                  ),
                )
              ) : filteredOptions.length === 0 ? (
                <div className={styles.emptyState}>No options found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${option.disabled ? styles.optionDisabled : ""}`.trim()}
                      onClick={() => handleOptionSelect(option)}
                      disabled={option.disabled}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className={styles.optionLeft}>
                        {option.icon && (
                          <span className={styles.optionIcon}>
                            {option.icon}
                          </span>
                        )}
                        <span className={styles.optionLabel}>
                          {option.label}
                        </span>
                      </span>
                      {isSelected && (
                        <span className={styles.optionCheck}>•</span>
                      )}
                    </button>
                  );
                })
              )}

              {isLoading &&
                filteredOptions.length > 0 &&
                Array.from({ length: loadMoreSkeletonCount }).map(
                  (_, index) => (
                    <div
                      key={`load-more-skeleton-${index}`}
                      className={styles.skeletonRow}
                    >
                      <span className={styles.skeletonDot} />
                      <span className={styles.skeletonLine} />
                    </div>
                  ),
                )}

              {canLoadMore && onLoadMore && !isLoading && (
                <>
                  <div ref={sentinelRef} className={styles.loadMoreSentinel} />
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={onLoadMore}
                  >
                    Load more
                  </button>
                </>
              )}
            </div>

            {showCustomValueAction && (
              <div className={styles.footerRow}>
                <button
                  type="button"
                  className={styles.applyCustomButton}
                  onClick={handleApplyCustomValue}
                >
                  Use “{searchQuery.trim()}”
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return content;
  },
);

SearchableSelect.displayName = "SearchableSelect";

export default SearchableSelect;
