import ChevronRight from "@/icons/ChevronRight";
import Link from "next/link";
import styles from "../styles/SideBar.module.css";
import ChevronDown from "@/icons/ChevronDown";
import { useCustomNavigation } from "@/hooks/useCustomNavigation";
import { useWindow } from "@/hooks/useWindow";

function SideBarSection({
  sectionTitle,
  items,
  currentPath,
}: NavSection & { currentPath: string }) {
  const { toggleOpen } = useCustomNavigation();
  const { width } = useWindow();

  return (
    <section className={styles.side_bar_section}>
      <p className={styles.title}>{sectionTitle}</p>
      <ul>
        {items.map(({ title, path, icon, children }) => {
          const isActive = currentPath === path || (path === "/protected/reviews" && currentPath.startsWith(`${path}/`));
          const hasActiveChild = children?.some(
            (child) => currentPath === child.path,
          );
          const shouldShowChildren = isActive || hasActiveChild;
          return (
            <li key={path}>
              <Link
                href={path}
                aria-label={title}
                title={title}
                onClick={
                  shouldShowChildren && width <= 768 ? toggleOpen : undefined
                }
              >
                <div
                  style={
                    isActive || hasActiveChild
                      ? ({
                          "--active-color": "#708B2E",
                        } as React.CSSProperties)
                      : {}
                  }
                >
                  {icon}
                  <span
                    style={
                      isActive
                        ? ({
                            fontWeight: "500",
                          } as React.CSSProperties)
                        : {}
                    }
                  >
                    {title}
                  </span>
                </div>
                {shouldShowChildren && children ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </Link>
              {children && shouldShowChildren && (
                <ul className={styles.child_list}>
                  {children.map((child) => {
                    const childActive = currentPath === child.path;
                    return (
                      <li key={child.path}>
                        <Link
                          href={child.path}
                          className={`${styles.child} ${childActive ? styles.active : ""}`}
                          onClick={width <= 768 ? toggleOpen : undefined}
                        >
                          <span>{child.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default SideBarSection;
