interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  shrink?: boolean;
  overrideStyles?: React.CSSProperties;
}

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface DropdownInputProps {
  options: DropdownOption[];
  selectedOption?: DropdownOption;
  onSelect?: (option: DropdownOption) => void;
  type: "primary" | "secondary";
  position?:
    | "left"
    | "right"
    | "center"
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
}

interface SearchableSelectOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  searchText?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  className?: string;
  dropdownClassName?: string;
  errorMessage?: string;
  options?: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (
    value: string | number | undefined,
    option?: SearchableSelectOption,
  ) => void;
  onOpenChange?: (open: boolean) => void;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  disabled?: boolean;
  isLoading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  loadMoreSkeletonCount?: number;
  loadMoreRootMargin?: string;
  allowCustomValue?: boolean;
  name?: string;
  id?: string;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  onApplyCustomValue?: () => void;
}
interface ActionDropdownProps {
  options: DropdownOption[];
  clickedChild?: DropdownOption;
  onChildClick?: (option?: DropdownOption) => void;
  type: "primary" | "secondary";
  position?:
    | "left"
    | "right"
    | "center"
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  customIcon?: React.ReactNode;
}

interface TextInputProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  type?: "text" | "password" | "email" | "number";
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  error?: string;
  warning?: string;
  label?: string;
  helperText?: string;
}

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  error?: string;
  helperText?: string;
}
