"use client";

import { RadarChart } from "./components/RadarChart";
import { SparkLine } from "./components/SparkLine";
import { XpTirePie, buildPieData, PIE_COLORS } from "./components/XpTirePie";
import { formatXp, getInitials } from "./profileUtils";
import { useProfileData } from "./useProfileData";

export default function ProfilePage() {
  const {
    profileData,
    loading,
    error,
    handleLogout,
    handleRefresh,
    isInitialLoad,
    isSyncing,
  } = useProfileData();

  const summary = profileData?.summary ?? {
    totalXp: 0,
    auditRatio: 0,
    auditsGiven: 0,
    auditsReceived: 0,
    level: 0,
  };

  const xpTimeline = profileData?.xpTimeline ?? [];
  const xpByProject = profileData?.xpByProject ?? [];
  const skillRadar = profileData?.skillRadar ?? {
    technical: [],
    technologies: [],
  };
  const technicalSkills = skillRadar.technical ?? [];
  const technologySkills = skillRadar.technologies ?? [];
  const userCard = profileData?.profile;
  const level = profileData?.summary?.level;
  const levelDisplay = Number.isFinite(level) ? level : "--";
  const projectCount = xpByProject.length;
  const pieItems = buildPieData(xpByProject);
  const pieTotal = pieItems.reduce(
    (sum, item) => sum + (Number(item?.value) || 0),
    0
  );

  const displayName = userCard?.name || userCard?.login || "Driver";
  const login = userCard?.login || "unknown";
  const userInitials = getInitials(displayName) || "DR";

  if (isInitialLoad) {
    return (
      <main className="profile-shell profile-shell--centered">
        <div className="profile-panel">
          <div className="profile-spinner" />
          <p className="profile-label">Starting telemetry feed...</p>
        </div>
      </main>
    );
  }

  if (error && !profileData) {
    return (
      <main className="profile-shell profile-shell--centered">
        <div className="profile-panel profile-panel--error">
          <h2>Telemetry offline</h2>
          <p>{error}</p>
          <div className="profile-error-actions">
            <button className="profile-button ghost" onClick={handleRefresh}>
              Try again
            </button>
            <button className="profile-button" onClick={handleLogout}>
              Back to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <main className="profile-shell">
      <div
        className="profile-overlay profile-overlay--grid"
        aria-hidden="true"
      />
      <div
        className="profile-overlay profile-overlay--glow"
        aria-hidden="true"
      />

      {error && (
        <div className="profile-banner profile-banner--error">
          <span>{error}</span>
          <button className="profile-button ghost" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar">{userInitials}</div>
          <div>
            <p className="profile-label">Driver</p>
            <h1>{displayName}</h1>
            <div className="profile-meta">
              <span>Login: {login}</span>
              {userCard?.id && <span>ID #{userCard.id}</span>}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </section>

      {isSyncing && (
        <div className="profile-sync-pill">Updating statistics...</div>
      )}

      <section className="stats-bar">
        <article className="stat-bar-card">
          <span
            className="stat-bar-icon stat-bar-icon--level"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path
                d="M6 3v18M6 4h10l-2.5 3L16 10H6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="stat-bar-meta">
            <p className="stat-bar-label">Current Level</p>
            <p className="stat-bar-value">{levelDisplay}</p>
          </div>
        </article>

        <article className="stat-bar-card">
          <span className="stat-bar-icon stat-bar-icon--xp" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M4 16l5-5 4 4 7-7M14 8h6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="stat-bar-meta">
            <p className="stat-bar-label">Total XP</p>
            <p className="stat-bar-value">{formatXp(summary.totalXp)}</p>
          </div>
        </article>

        <article className="stat-bar-card">
          <span
            className="stat-bar-icon stat-bar-icon--audit"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <div className="stat-bar-meta">
            <p className="stat-bar-label">Audit Ratio</p>
            <p className="stat-bar-value">
              {summary.auditRatio ? summary.auditRatio.toFixed(1) : "0.0"}
            </p>
          </div>
        </article>

        <article className="stat-bar-card">
          <span
            className="stat-bar-icon stat-bar-icon--projects"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <rect
                x="4"
                y="4"
                width="9"
                height="9"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="11"
                y="11"
                width="9"
                height="9"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <div className="stat-bar-meta">
            <p className="stat-bar-label">Projects</p>
            <p className="stat-bar-value">{projectCount}</p>
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card--xp">
          <p className="profile-label">PROJECT XP</p>
          {xpByProject.length === 0 ? (
            <h3>Awaiting data</h3>
          ) : (
            <div className="xp-tire">
              <div className="xp-tire-chart">
                <XpTirePie items={pieItems} total={pieTotal} />
                <div className="xp-tire-center">
                  <span className="xp-tire-total">{formatXp(pieTotal)}</span>
                  <span className="xp-tire-caption">Total XP</span>
                </div>
              </div>
              <ul className="xp-tire-legend">
                {pieItems.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="xp-tire-item">
                    <span
                      className="xp-legend-dot"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className="xp-legend-label" title={item.label}>
                      {item.label}
                    </span>
                    <span className="xp-legend-value">
                      {formatXp(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
        <article className="graph-card">
          <p className="profile-label">Journey graphs</p>
          <header>
            <h3>XP progression</h3>
            <span className="stat-hint">
              Cumulative XP: {formatXp(summary.totalXp)}
            </span>
          </header>
          <SparkLine data={xpTimeline} />
        </article>
      </section>

      <section className="graphs-section graphs-section--skills">
        <div className="graphs-header">
          <div>
            <p className="profile-label">Highest skills</p>
            <h2>Skill radar</h2>
          </div>
        </div>

        <div className="graphs-grid graphs-grid--radar">
          <article className="graph-card graph-card--radar">
            <RadarChart data={technicalSkills} title="Technical skills radar" />
            <p className="radar-caption">Technical Skills</p>
          </article>
          <article className="graph-card graph-card--radar">
            <RadarChart
              data={technologySkills}
              title="Technology skills radar"
            />
            <p className="radar-caption">Technologies</p>
          </article>
        </div>
      </section>
    </main>
  );
}
