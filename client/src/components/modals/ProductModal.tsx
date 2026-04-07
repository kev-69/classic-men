import { useMemo, useState } from "react";
import type { Product } from "../../lib/api";

type ProductModalProps = {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  whatsappHref: string;
  onOrderNow: () => void;
  onClose: () => void;
  onSelectColor: (value: string) => void;
  onSelectSize: (value: string) => void;
};

export function ProductModal({
  product,
  selectedColor,
  selectedSize,
  whatsappHref,
  onOrderNow,
  onClose,
  onSelectColor,
  onSelectSize
}: ProductModalProps) {
  const media = useMemo(() => (product.media.length > 0 ? product.media : [{ type: "image" as const, url: "https://placehold.co/640x480?text=Classic-Men" }]), [product.media]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

//   useEffect(() => {
//     setActiveMediaIndex(0);
//   }, [product.id]);

  const activeMedia = media[activeMediaIndex] ?? media[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>
          Close
        </button>
        <div className="modal-layout">
          <div className="modal-media-zone">
            <div className="modal-main-media">
              {activeMedia.type === "video" ? (
                <video key={activeMedia.url} controls>
                  <source src={activeMedia.url} />
                </video>
              ) : (
                <img key={activeMedia.url} src={activeMedia.url} alt={product.name} />
              )}
            </div>
            {media.length > 1 && (
              <div className="modal-thumbs" role="list">
                {media.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.url}-${index}`}
                    className={`modal-thumb ${index === activeMediaIndex ? "active" : ""}`}
                    onClick={() => setActiveMediaIndex(index)}
                    aria-label={`Select media ${index + 1}`}
                  >
                    {item.type === "video" ? <span className="thumb-video-label">Video</span> : <img src={item.url} alt={`${product.name} thumbnail ${index + 1}`} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-content">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price-tag">
              {product.currency} {product.price.toFixed(2)}
            </p>

            <label>
              Color
              <select value={selectedColor} onChange={(event) => onSelectColor(event.target.value)}>
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Size
              <select value={selectedSize} onChange={(event) => onSelectSize(event.target.value)}>
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <a className="whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" onClick={onOrderNow}>
              Order Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
