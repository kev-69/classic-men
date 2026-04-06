export type Tab = "products" | "messages" | "analytics" | "home-content";

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
      <button className={tab === "home-content" ? "active" : ""} onClick={() => onTabChange("home-content")}>
        Home Content
      </button>
    </nav>
  );
}
