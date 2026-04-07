import type { AnalyticsSummary } from "./types";

type AnalyticsTabProps = {
  analytics: AnalyticsSummary;
};

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  const pageData = analytics.pageBreakdown.length
    ? analytics.pageBreakdown
    : [
        { page: "home", views: 0 },
        { page: "products", views: 0 },
        { page: "contact", views: 0 }
      ];

  const productData = analytics.productBreakdown;
  const maxPageViews = Math.max(...pageData.map((item) => item.views), 1);
  const maxProductViews = Math.max(...productData.map((item) => item.views), 1);

  return (
    <section className="analytics-layout">
      <div className="analytics-grid">
        <article className="panel metric">
          <h2>Purchases</h2>
          <p>{analytics.purchaseCount}</p>
        </article>
        <article className="panel metric">
          <h2>Total Page Views</h2>
          <p>{analytics.pageViews}</p>
        </article>
        <article className="panel metric">
          <h2>Total Product Views</h2>
          <p>{analytics.productViews}</p>
        </article>
      </div>

      <div className="analytics-chart-grid">
        <article className="panel analytics-chart-panel">
          <h2>Page Views</h2>
          <div className="analytics-bars">
            {pageData.map((item) => (
              <div key={item.page} className="analytics-bar-row">
                <div className="analytics-bar-meta">
                  <span className="analytics-label-cap">{item.page}</span>
                  <strong>{item.views}</strong>
                </div>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{
                      width: `${(item.views / maxPageViews) * 100}%`,
                      backgroundColor: "#1e4d46"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel analytics-chart-panel">
          <h2>Product Views</h2>
          {productData.length === 0 ? (
            <p className="analytics-note">No product view data yet.</p>
          ) : (
            <div className="product-axis-chart" role="img" aria-label="Product views chart with product names on x-axis and views on y-axis">
              <div className="y-axis-labels">
                <span>{maxProductViews}</span>
                <span>{Math.round(maxProductViews * 0.66)}</span>
                <span>{Math.round(maxProductViews * 0.33)}</span>
                <span>0</span>
              </div>
              <div className="axis-plot-area">
                {productData.map((item) => (
                  <div key={item.productId} className="axis-bar-column">
                    <div className="axis-bar-track">
                      <div
                        className="axis-bar-fill"
                        style={{ height: `${(item.views / maxProductViews) * 100}%` }}
                        title={`${item.productName}: ${item.views}`}
                      />
                    </div>
                    <small className="axis-bar-value">{item.views}</small>
                    <span className="axis-x-label" title={item.productName}>
                      {item.productName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
