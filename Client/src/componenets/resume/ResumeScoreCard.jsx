import "./ResumeScoreCard.css";

function Gauge({ score, max, issues }) {
  // Calculate percent for arc
  const percent = score / max;
  const r = 45;
  const c = 2 * Math.PI * r;
  const arc = c * percent;
  return (
    <div className="resume-score-gauge">
      <svg viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#eee" strokeWidth="12" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke="url(#gaugeGradient)" strokeWidth="12"
          strokeDasharray={`${arc} ${c - arc}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e65cfa" />
            <stop offset="100%" stopColor="#6ad6fc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score">{score}/{max}</div>
      <div className="issues">{issues} issues</div>
    </div>
  );
}

export default function ResumeScoreCard({ tone, content, structure, skills }) {
  // Calculate total score and issues dynamically
  const scores = [tone, content, structure, skills];
  const total = Math.round((tone + content + structure + skills) / 4);
  const issues = 100 - total;

  // Helper for badge and value class
  const getBadge = (score) => {
    if (score >= 70) return { text: "Strong", className: "badge-good", valueClass: "good" };
    if (score >= 50) return { text: "Good Start", className: "badge-start", valueClass: "start" };
    return { text: "Needs work", className: "badge-work", valueClass: "bad" };
  };

  const rows = [
    { label: "Tone & Style", score: tone },
    { label: "Content", score: content },
    { label: "Structure", score: structure },
    { label: "Skills", score: skills },
  ];

  return (
    <div className="resume-score-card">
      <div className="resume-score-header">
        <Gauge score={total} max={100} issues={issues} />
        <div>
          <div className="resume-score-title">Your Resume Score</div>
          <div className="resume-score-desc">
            This score is calculated based on the variables listed below.
          </div>
        </div>
      </div>
      <div className="resume-score-list">
        {rows.map(({ label, score }) => {
          const { text, className, valueClass } = getBadge(score);
          return (
            <div className="resume-score-row" key={label}>
              <div className="resume-score-label">
                {label} <span className={`resume-score-badge ${className}`}>{text}</span>
              </div>
              <div className={`resume-score-value ${valueClass}`}>{score}/100</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
