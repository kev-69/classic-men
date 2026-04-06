export type Tab = "products" | "messages" | "analytics";

type TabNavigationProps = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function TabNavigation({ tab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="tab-nav">
      <button className={tab === "analytics" ? "active" : ""} onClick={() => onTabChange("analytics")}>
        Analytics
      </button>
      <button className={tab === "products" ? "active" : ""} onClick={() => onTabChange("products")}>
        Products
      </button>
      <button className={tab === "messages" ? "active" : ""} onClick={() => onTabChange("messages")}>
        Messages
      </button>
    </nav>
  );
}
