type DashboardHeaderProps = {
  isLoading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

export function DashboardHeader({ isLoading, onRefresh, onLogout }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Classic-Men</p>
        <h1>Admin Control Center</h1>
        <p>Manage products, uploads, messages, and brand analytics.</p>
      </div>
      <div className="header-actions">
        <button onClick={onRefresh} disabled={isLoading}>
          Refresh
        </button>
        <button className="ghost" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
