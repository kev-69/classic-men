import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Product } from "../../lib/api";
import type { ProductDraft } from "./types";

type ProductsTabProps = {
  isLoading: boolean;
  editingId: number | null;
  draft: ProductDraft;
  mediaUrl: string;
  products: Product[];
  setDraft: Dispatch<SetStateAction<ProductDraft>>;
  setMediaUrl: Dispatch<SetStateAction<string>>;
  onSubmitProduct: (event: FormEvent) => void;
  onAddManualMedia: () => void;
  onUploadMedia: (file: File | null) => void;
  onRemoveMedia: (index: number) => void;
  onStartEdit: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onCancelEdit: () => void;
};

export function ProductsTab({
  isLoading,
  editingId,
  draft,
  products,
  setDraft,
  onSubmitProduct,
  onUploadMedia,
  onRemoveMedia,
  onStartEdit,
  onDeleteProduct,
  onCancelEdit
}: ProductsTabProps) {
  return (
    <section className="grid-two">
      <form className="panel" onSubmit={onSubmitProduct}>
        <h2>{editingId ? "Edit" : "Add New"}</h2>
        <label>
          Name
          <input
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            rows={5}
            required
          />
        </label>
        <div className="row">
          <label>
            Price
            <input
              type="number"
              min="1"
              step="0.01"
              value={draft.price}
              onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
          </label>
          <label>
            Currency
            <input
              value={draft.currency}
              onChange={(event) => setDraft((prev) => ({ ...prev, currency: event.target.value }))}
            />
          </label>
        </div>
        <label>
          Colors (comma separated)
          <input
            value={draft.colors}
            onChange={(event) => setDraft((prev) => ({ ...prev, colors: event.target.value }))}
          />
        </label>
        <label>
          Sizes (comma separated)
          <input
            value={draft.sizes}
            onChange={(event) => setDraft((prev) => ({ ...prev, sizes: event.target.value }))}
          />
        </label>
        <div className="row toggle-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) => setDraft((prev) => ({ ...prev, featured: event.target.checked }))}
            />
            Featured
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={draft.inStock}
              onChange={(event) => setDraft((prev) => ({ ...prev, inStock: event.target.checked }))}
            />
            In stock
          </label>
        </div>

        <div className="media-controls">
          <h3>Photos</h3>
          <label className="upload-field">
            Upload product pictures
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(event) => onUploadMedia(event.target.files?.[0] ?? null)}
            />
          </label>
          <ul className="media-list">
            {draft.media.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                <span>{item.type.toUpperCase()}</span>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open
                </a>
                <button type="button" className="ghost" onClick={() => onRemoveMedia(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="row">
          <button type="submit" disabled={isLoading}>
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="ghost" onClick={onCancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section className="panel">
        <h2>Inventory</h2>
        <ul className="list">
          {products.map((product) => (
            <li key={product.id}>
              <div>
                <p>{product.name}</p>
                <small>
                  {product.currency} {product.price.toFixed(2)} • {product.inStock ? "In stock" : "Out of stock"}
                </small>
              </div>
              <div className="actions">
                <button type="button" className="ghost" onClick={() => onStartEdit(product)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDeleteProduct(product.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
