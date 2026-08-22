"use client";
import SearchIcon from "@/icons/SearchIcon";
import styles from "./styles/Input.module.css";

function SearchInput({
  placeholder,
  onChange,
  shrink,
  overrideStyles,
}: SearchInputProps) {
  return (
    <div
      className={`${styles.search_input} ${shrink ? styles.shrink : ""}`}
      style={overrideStyles}
    >
      <SearchIcon />
      <input
        type="search"
        placeholder={placeholder || "Search..."}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;
