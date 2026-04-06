import type { ContactMessage } from "../../lib/api";

type MessagesTabProps = {
  sortedMessages: ContactMessage[];
  onUpdateMessageStatus: (id: number, status: "new" | "read") => void;
};

export function MessagesTab({ sortedMessages, onUpdateMessageStatus }: MessagesTabProps) {
  return (
    <section className="panel">
      <h2>Contact messages</h2>
      <ul className="list messages">
        {sortedMessages.map((message) => (
          <li key={message.id}>
            <div>
              <p>
                {message.name} • {new Date(message.createdAt).toLocaleString()}
              </p>
              <small>{message.message}</small>
            </div>
            <div className="actions">
              <button
                type="button"
                className="ghost"
                onClick={() => onUpdateMessageStatus(message.id, message.status === "new" ? "read" : "new")}
              >
                Mark as {message.status === "new" ? "read" : "new"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
