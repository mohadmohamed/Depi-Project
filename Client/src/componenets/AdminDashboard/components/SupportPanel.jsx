import React from 'react';
import styles from './SupportPanel.module.css';

const ticketsData = [
  { id: 1, title: 'Login issue', status: 'open' },
  { id: 2, title: 'Resume feedback', status: 'in-progress' },
  { id: 3, title: 'Payment failed', status: 'closed' },
];

const feedbackData = [
  { id: 1, user: 'Ali', note: 'CV looks good, tighten the summary.' },
  { id: 2, user: 'Mona', note: 'Interview tips were helpful.' },
];

export default function SupportSection() {
  return (
    <section className={styles.container} aria-labelledby="support-heading">
      <header className={styles.header}>
        <h2 id="support-heading">Support</h2>
        <p className={styles.sub}>Tickets, feedback and quick actions</p>
      </header>

      <div className={styles.grid}>
        {/* Tickets Section */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Tickets</h3>

          <div className={styles.tabs} role="tablist" aria-label="Ticket status tabs">
            <button className={`${styles.tab} ${styles.tabActive}`}>Open</button>
            <button className={styles.tab}>In-progress</button>
            <button className={styles.tab}>Closed</button>
          </div>

          <ul className={styles.ticketList}>
            {ticketsData.map((ticket) => (
              <li key={ticket.id} className={styles.ticketItem}>
                <div>
                  <strong>{ticket.title}</strong>
                  <div className={styles.meta}>#{ticket.id} • {ticket.status}</div>
                </div>
                <div className={styles.actions}>
                  <button className={styles.btnGhost}>Reply</button>
                  <button className={styles.btn}>Resolve</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback Section */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Feedback</h3>
          <ul className={styles.feedbackList}>
            {feedbackData.map((f) => (
              <li key={f.id} className={styles.feedbackItem}>
                <div>
                  <strong>{f.user}</strong>
                  <p className={styles.note}>{f.note}</p>
                </div>
                <div className={styles.actionsSmall}>
                  <button className={styles.btnGhost}>View</button>
                  <button className={styles.btnGhost}>Acknowledge</button>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.footerActions}>
            <button className={styles.btnOutline}>Escalate</button>
            <button className={styles.btn}>Mark all resolved</button>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={styles.cardWide}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionTile} aria-label="Reply to ticket">
              Reply to ticket
            </button>
            <button className={styles.actionTile} aria-label="Mark as resolved">
              Mark as resolved
            </button>
            <button className={styles.actionTile} aria-label="Escalate ticket">
              Escalate
            </button>
            <button className={styles.actionTile} aria-label="Open new ticket">
              Open new ticket
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}




