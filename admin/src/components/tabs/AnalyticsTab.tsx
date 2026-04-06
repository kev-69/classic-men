import type { AnalyticsSummary } from "./types";

type AnalyticsTabProps = {
  analytics: AnalyticsSummary;
};

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <section className="analytics-grid">
      <article className="panel metric">
        <h2>Products</h2>
        <p>{analytics.productCount}</p>
      </article>
      <article className="panel metric">
        <h2>Page Views</h2>
        <p>{analytics.pageViews}</p>
      </article>
      <article className="panel metric">
        <h2>Product Views</h2>
        <p>{analytics.productViews}</p>
      </article>
    </section>
  );
}
