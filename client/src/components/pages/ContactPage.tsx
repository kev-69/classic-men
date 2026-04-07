import type { FormEvent } from "react";

type ContactPageProps = {
  contactName: string;
  contactMessage: string;
  whatsappNumber: string;
  onContactNameChange: (value: string) => void;
  onContactMessageChange: (value: string) => void;
  onSubmitContact: (event: FormEvent) => void;
};

export function ContactPage({
  contactName,
  contactMessage,
  whatsappNumber,
  onContactNameChange,
  onContactMessageChange,
  onSubmitContact
}: ContactPageProps) {
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello Classic-Men, I would like help with my order."
  )}`;

  return (
    <main className="page contact-page">
      <section className="contact-layout">
        <article className="contact-side">
          <article className="contact-card contact-info">
            <h3>Quick Contact</h3>
            <ul className="contact-list">
              <li>
                <strong>Response Time</strong>
                <span>Within 2-6 hours</span>
              </li>
              <li>
                <strong>Business Days</strong>
                <span>Monday - Saturday</span>
              </li>
              <li>
                <strong>Order Channel</strong>
                <span>WhatsApp + Contact Form</span>
              </li>
            </ul>
            <a className="whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </article>

          <article className="contact-card contact-info">
            <h3>How Ordering Works</h3>
            <ol className="contact-steps">
              <li>Browse products and open details.</li>
              <li>Pick color and size.</li>
              <li>Order via WhatsApp or leave a message here.</li>
              <li>We confirm availability and delivery options.</li>
            </ol>
          </article>
        </article>

        <article className="contact-card contact-main">
          <p className="eyebro">Let Us Help</p>
          <h2>Contact Classic-Men</h2>
          <p>Need help with sizes, stock, or delivery? Send us a quick message and we will respond quickly.</p>
          <form onSubmit={onSubmitContact}>
            <label>
              Name
              <input value={contactName} onChange={(event) => onContactNameChange(event.target.value)} required />
            </label>
            <label>
              Message
              <textarea rows={6} value={contactMessage} onChange={(event) => onContactMessageChange(event.target.value)} required />
            </label>
            <button type="submit">Send Message</button>
          </form>
        </article>
      </section>
    </main>
  );
}
