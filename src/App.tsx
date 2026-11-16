
import { useEffect, useMemo, useState } from 'react'
import { rules } from './rules'
import { assessRule, findSimilarRules, type Rule } from './assessment'
import './App.css'

type ReviewStatus =
  | 'Awaiting review'
  | 'In review'
  | 'Human recommendation recorded'

type HumanRecommendation =
  | 'Support'
  | 'Request further evidence'
  | 'Do not support'
  | ''

type ReviewRecord = {
  status: ReviewStatus
  recommendation: HumanRecommendation
  reviewer: string
  reason: string
  updatedAt: string
}

type AuditEvent = {
  id: string
  ruleId: string
  action: string
  details: string
  timestamp: string
}

const navigation = [
  'Overview',
  'Submissions & Rules',
  'Regulatory Assessment',
  'Similarity Analysis',
  'Decision Centre',
  'Audit Trail',
]

const principles = [
  'Accurate Pricing and Underwriting',
  'Absence of Unfair Discrimination, Bias, or Proxies',
  'Accessible Products and Coverages',
  'Cost Mitigation',
  'Balanced Profitability and Consumer Interests',
  'Clear Consumer Communications',
]

const initialReview: ReviewRecord = {
  status: 'Awaiting review',
  recommendation: '',
  reviewer: '',
  reason: '',
  updatedAt: '',
}

const styles = `
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #f5f7fa;
  font-family: 'DM Sans', Arial, sans-serif;
  color: #17233b;
}
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
.app-shell { display:flex; min-height:100vh; background:#f5f7fa; }
.sidebar {
  width:245px; background:#101c32; color:#d5deed;
  padding:27px 17px; display:flex; flex-direction:column; flex-shrink:0;
}
.brand { display:flex; align-items:center; gap:11px; padding:0 9px 35px; }
.brand-mark {
  width:38px; height:38px; border-radius:11px; background:#dce8ff;
  color:#193d73; display:grid; place-items:center; font-size:20px; font-weight:800;
}
.brand-name { font-weight:800; font-size:19px; color:white; }
.brand-sub { color:#8999b2; font-size:10px; margin-top:4px; letter-spacing:1.4px; }
.nav-label {
  font-size:10px; color:#8191aa; letter-spacing:1.4px; font-weight:700;
  padding:0 11px; margin:8px 0 12px;
}
.nav-list { display:grid; gap:5px; }
.nav-button {
  border:0; background:transparent; color:#aebbd0; display:flex;
  align-items:center; text-align:left; width:100%; padding:13px 11px;
  border-radius:8px; font-size:12px;
}
.nav-button:hover, .nav-button.active { background:#253c60; color:white; }
.nav-button.active { font-weight:700; }
.sidebar-bottom {
  margin-top:auto; border-top:1px solid #26344a; padding:19px 9px 0;
  font-size:12px; color:white;
}
.sidebar-bottom small { display:block; color:#8fa0b9; margin-top:5px; }
.main { min-width:0; flex:1; }
.topbar {
  min-height:65px; background:white; border-bottom:1px solid #e8ecf2;
  display:flex; align-items:center; justify-content:space-between; padding:0 30px;
}
.breadcrumb { color:#8591a5; font-size:12px; }
.breadcrumb strong { color:#24334c; }
.top-user { font-size:11px; font-weight:700; }
.content { padding:32px; max-width:1550px; margin:auto; }
.page-heading {
  display:flex; align-items:flex-start; justify-content:space-between;
  gap:15px; margin-bottom:25px;
}
h1 { font-size:26px; margin:0; color:#17233b; }
h2 { font-size:15px; margin:0; color:#24334c; }
h3 { font-size:13px; color:#24334c; margin:18px 0 8px; }
p { line-height:1.65; }
.subtitle { color:#8390a3; font-size:12px; margin-top:8px; }
.primary-button {
  border:0; border-radius:7px; background:#1d3c68; color:white;
  padding:12px 17px; font-size:11px; font-weight:700;
}
.primary-button:hover { background:#294f83; }
.secondary-button {
  border:1px solid #dce3ed; border-radius:7px; background:white;
  color:#365d8e; padding:10px 13px; font-size:11px; font-weight:700;
}
.danger-button {
  border:1px solid #efd6d6; border-radius:7px; background:#fff8f8;
  color:#9d4545; padding:10px 13px; font-size:11px; font-weight:700;
}
.section-label {
  color:#77869b; font-size:10px; letter-spacing:1.2px;
  font-weight:700; margin:25px 0 13px;
}
.stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
.stat-card, .panel {
  background:white; border:1px solid #e9edf3; border-radius:10px; padding:19px;
}
.stat-card { min-height:120px; }
.stat-label { color:#8190a4; font-size:11px; }
.stat-value { font-size:28px; font-weight:800; margin-top:12px; }
.stat-note { color:#8a96a8; font-size:10px; margin-top:5px; }
.workspace-grid {
  display:grid; grid-template-columns:minmax(0,1.7fr) minmax(230px,.8fr);
  gap:17px; margin-top:22px;
}
.panel { min-width:0; }
.panel + .panel { margin-top:17px; }
.panel-heading {
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; margin-bottom:16px; flex-wrap:wrap;
}
.panel-description { color:#8b97a8; font-size:10px; margin-top:6px; }
.text-link {
  color:#365d8e; border:0; background:transparent;
  font-size:10px; font-weight:700;
}
.table-wrap { overflow-x:auto; }
table { border-collapse:collapse; width:100%; min-width:650px; text-align:left; }
th {
  color:#8995a6; font-size:9px; text-transform:uppercase; letter-spacing:.7px;
  padding:12px 9px; border-bottom:1px solid #edf0f4;
}
td {
  padding:13px 9px; border-bottom:1px solid #f0f2f5;
  font-size:10px; color:#526178; vertical-align:top;
}
.rule-id { font-weight:700; color:#294b76; white-space:nowrap; }
.rule-description { color:#26364e; font-weight:600; line-height:1.5; max-width:450px; }
.muted { color:#8a96a8; font-size:10px; margin-top:5px; }
.search-input, .select-input, .text-input, .text-area {
  border:1px solid #e1e6ed; background:white; border-radius:7px;
  padding:10px 12px; font-size:11px; outline:none; color:#26364e;
}
.search-input { width:260px; }
.text-input, .select-input { width:100%; }
.text-area { width:100%; min-height:105px; resize:vertical; }
.search-input:focus, .select-input:focus, .text-input:focus, .text-area:focus {
  border-color:#6c8db7;
}
.framework-list { display:grid; gap:15px; }
.framework-item { font-size:11px; color:#30415b; line-height:1.5; }
.framework-item small { display:block; color:#8a96a8; margin-top:4px; }
.notice {
  background:#f0f5fb; border:1px solid #e1eaf5; border-radius:8px;
  padding:13px; color:#516783; font-size:10px; line-height:1.7; margin-top:18px;
}
.warning {
  background:#fff8ed; border:1px solid #f2e4c8; border-radius:8px;
  padding:13px; color:#785c2d; font-size:10px; line-height:1.7; margin-top:14px;
}
.footer-note { color:#98a2b1; font-size:9px; margin-top:23px; line-height:1.7; }
.detail-card {
  background:#f8fafc; border:1px solid #e6ebf2; border-radius:8px;
  padding:18px; margin-top:15px;
}
.detail-card p { color:#526178; font-size:12px; line-height:1.7; }
.back-button {
  background:white; border:1px solid #dce3ed; border-radius:6px;
  padding:8px 12px; color:#365d8e; font-size:11px;
}
.pill {
  display:inline-block; padding:5px 8px; border-radius:20px;
  font-size:9px; font-weight:700; background:#edf1f6; color:#526178;
}
.pill.high { background:#fceaea; color:#a33f3f; }
.pill.medium { background:#fff2dc; color:#91651d; }
.pill.low { background:#e8f3ed; color:#397451; }
.pill.done { background:#e8f3ed; color:#397451; }
.pill.progress { background:#eaf0fb; color:#3d6090; }
.pill.pending { background:#f0f1f4; color:#687487; }
.finding {
  border:1px solid #e8edf3; border-radius:8px; padding:13px; margin-top:10px;
}
.finding-title { font-size:11px; font-weight:700; color:#2d3d55; }
.finding p { font-size:11px; color:#66748a; margin:7px 0 0; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
.field-label { display:block; font-size:10px; font-weight:700; color:#596a81; margin-bottom:6px; }
.action-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
.empty-state { padding:28px; text-align:center; color:#8995a6; font-size:12px; }
.similarity-bar { height:6px; background:#edf0f4; border-radius:10px; overflow:hidden; margin-top:8px; }
.similarity-fill { height:100%; background:#6686b2; border-radius:10px; }
.audit-item { border-left:2px solid #cbd8e8; padding:3px 0 14px 14px; margin-left:5px; }
.audit-item strong { font-size:11px; color:#30415b; }
.audit-item p { font-size:10px; color:#7b8799; margin:4px 0; }
@media (max-width:950px) {
  .sidebar { width:190px; }
  .content { padding:22px; }
  .stats-grid { grid-template-columns:repeat(2,1fr); }
  .workspace-grid { grid-template-columns:1fr; }
}
@media (max-width:650px) {
  .sidebar { width:65px; padding:18px 7px; }
  .brand-name, .brand-sub, .nav-label, .nav-text, .sidebar-bottom small { display:none; }
  .brand { padding:0 5px 25px; }
  .nav-button { justify-content:center; padding:12px 4px; }
  .sidebar-bottom { padding:15px 0 0; }
  .content { padding:18px 12px; }
  .topbar { padding:0 14px; }
  .page-heading { flex-direction:column; }
  .search-input { width:100%; }
  .stats-grid { gap:8px; }
  .stat-card { padding:12px; }
  .form-grid { grid-template-columns:1fr; }
}
`

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [similarityRuleId, setSimilarityRuleId] = useState(rules[0]?.id ?? '')
  const [decisionFilter, setDecisionFilter] = useState('All statuses')
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>(() =>
    readStored('regulaai-reviews-v1', {}),
  )
  const [audit, setAudit] = useState<AuditEvent[]>(() =>
    readStored('regulaai-audit-v1', []),
  )
  const [reviewer, setReviewer] = useState('')
  const [recommendation, setRecommendation] = useState<HumanRecommendation>('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    localStorage.setItem('regulaai-reviews-v1', JSON.stringify(reviews))
  }, [reviews])

  useEffect(() => {
    localStorage.setItem('regulaai-audit-v1', JSON.stringify(audit))
  }, [audit])

  const assessments = useMemo(
    () => rules.map((rule) => ({ rule, assessment: assessRule(rule) })),
    [],
  )

  const counts = useMemo(
    () => ({
      High: assessments.filter((item) => item.assessment.riskLevel === 'High').length,
      Medium: assessments.filter((item) => item.assessment.riskLevel === 'Medium').length,
      Low: assessments.filter((item) => item.assessment.riskLevel === 'Low').length,
    }),
    [assessments],
  )

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase()
    return assessments.filter(({ rule, assessment }) => {
      const matchesSearch =
        !term ||
        [rule.id, rule.insurer, rule.proposedRule, rule.category, rule.rationale]
          .join(' ')
          .toLowerCase()
          .includes(term)

      const matchesPriority =
        priorityFilter === 'All priorities' ||
        assessment.riskLevel === priorityFilter

      return matchesSearch && matchesPriority
    })
  }, [assessments, search, priorityFilter])

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null
  const selectedAssessment = selectedRule ? assessRule(selectedRule) : null

  const similarityRule =
    rules.find((rule) => rule.id === similarityRuleId) ?? rules[0]

  const similarRules = useMemo(
    () => (similarityRule ? findSimilarRules(similarityRule, rules, 5) : []),
    [similarityRule],
  )

  const decisionQueue = useMemo(() => {
    return assessments.filter(({ rule }) => {
      const status = reviews[rule.id]?.status ?? 'Awaiting review'
      return decisionFilter === 'All statuses' || status === decisionFilter
    })
  }, [assessments, reviews, decisionFilter])

  const openRuleAssessment = (id: string) => {
    setSelectedRuleId(id)
    setActivePage('Regulatory Assessment')
  }

  const addAuditEvent = (ruleId: string, action: string, details: string) => {
    setAudit((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ruleId,
        action,
        details,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ])
  }

  const updateReview = (ruleId: string, changes: Partial<ReviewRecord>, action: string) => {
    const previous = reviews[ruleId] ?? { ...initialReview }
    const updated = {
      ...previous,
      ...changes,
      updatedAt: new Date().toISOString(),
    }
    setReviews((current) => ({ ...current, [ruleId]: updated }))
    addAuditEvent(ruleId, action, changes.reason || changes.status || changes.recommendation || '')
  }

  const loadReviewForm = (ruleId: string) => {
    const record = reviews[ruleId] ?? initialReview
    setReviewer(record.reviewer)
    setRecommendation(record.recommendation)
    setReason(record.reason)
  }

  const beginReview = (ruleId: string) => {
    updateReview(
      ruleId,
      { status: 'In review' },
      'Human review started',
    )
  }

  const saveRecommendation = (ruleId: string) => {
    if (!reviewer.trim() || !recommendation || !reason.trim()) {
      window.alert('Please enter the reviewer name, recommendation and reasons.')
      return
    }

    updateReview(
      ruleId,
      {
        status: 'Human recommendation recorded',
        reviewer: reviewer.trim(),
        recommendation,
        reason: reason.trim(),
      },
      `Human recommendation recorded: ${recommendation}`,
    )
  }

  const openRules = () => {
    setActivePage('Submissions & Rules')
    setSelectedRuleId(null)
  }

  const statusClass = (status: ReviewStatus) => {
    if (status === 'Human recommendation recorded') return 'done'
    if (status === 'In review') return 'progress'
    return 'pending'
  }

  const priorityClass = (level: string) => level.toLowerCase()

  const renderRuleTable = (items: typeof assessments, showPriority = true) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rule ID</th>
            <th>Insurer</th>
            <th>Proposed rule</th>
            <th>Category</th>
            {showPriority && <th>Priority</th>}
            <th>Human review</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ rule, assessment }) => {
            const status = reviews[rule.id]?.status ?? 'Awaiting review'
            return (
              <tr key={rule.id}>
                <td className="rule-id">{rule.id}</td>
                <td>{rule.insurer}</td>
                <td><div className="rule-description">{rule.proposedRule}</div></td>
                <td>{rule.category}</td>
                {showPriority && (
                  <td>
                    <span className={`pill ${priorityClass(assessment.riskLevel)}`}>
                      {assessment.riskLevel}
                    </span>
                  </td>
                )}
                <td><span className={`pill ${statusClass(status)}`}>{status}</span></td>
                <td>
                  <button className="text-link" onClick={() => openRuleAssessment(rule.id)}>
                    Inspect →
                  </button>
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr><td colSpan={showPriority ? 7 : 6}>No matching rules found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const renderAssessment = (rule: Rule) => {
    const assessment = assessRule(rule)
    const review = reviews[rule.id] ?? initialReview

    return (
      <>
        <div className="page-heading">
          <div>
            <h1>{rule.id} · Regulatory Assessment</h1>
            <p className="subtitle">{rule.insurer} · {rule.category}</p>
          </div>
          <button className="secondary-button" onClick={openRules}>Back to rule register</button>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h2>Proposed underwriting rule</h2>
            <span className={`pill ${priorityClass(assessment.riskLevel)}`}>
              {assessment.riskLevel} screening priority
            </span>
          </div>
          <p className="rule-description">{rule.proposedRule}</p>
          <h3>Insurer's stated rationale</h3>
          <p className="subtitle">{rule.rationale}</p>
          <div className="notice">
            <strong>Preliminary screening only.</strong> {assessment.recommendation}
            No automated approval or rejection is made.
          </div>
        </section>

        <section className="panel">
          <h2>Four assessment levels</h2>
          <div className="framework-list" style={{ marginTop: 15 }}>
            {[
              ['Level 1 · Basic compliance', assessment.levels.level1],
              ['Level 2 · Principles and fair outcomes', assessment.levels.level2],
              ['Level 3 · Risk justification', assessment.levels.level3],
              ['Level 4 · Public policy filter', assessment.levels.level4],
            ].map(([title, description]) => (
              <div className="detail-card" key={title}>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Six fair consumer outcome principles</h2>
          <div className="framework-list" style={{ marginTop: 15 }}>
            {assessment.principles.map((item, index) => (
              <div className="finding" key={`${item.name}-${index}`}>
                <div className="finding-title">{index + 1}. {item.name}</div>
                <p><strong>{item.status}</strong></p>
                <p>{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Automated screening findings</h2>
            <span className="pill">{assessment.findings.length} identified</span>
          </div>
          {assessment.findings.length === 0 ? (
            <div className="notice">
              No automated screening indicators were triggered. This does not establish compliance.
            </div>
          ) : (
            assessment.findings.map((finding, index) => (
              <div className="finding" key={`${finding.title}-${index}`}>
                <div className="panel-heading">
                  <div className="finding-title">{finding.title}</div>
                  <span className={`pill ${priorityClass(finding.severity)}`}>
                    {finding.severity} · {finding.level}
                  </span>
                </div>
                <p>{finding.explanation}</p>
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2>Evidence gaps requiring verification</h2>
          {assessment.evidenceGaps.length === 0 ? (
            <p className="subtitle">No evidence gaps were returned by the automated screening. Human verification is still required.</p>
          ) : (
            assessment.evidenceGaps.map((gap, index) => (
              <div className="finding" key={`${gap}-${index}`}>
                <div className="finding-title">Evidence required {index + 1}</div>
                <p>{gap}</p>
              </div>
            ))
          )}
          <div className="warning">
            Evidence references in an insurer's rationale are not proof. No actuarial documents or legal analysis are verified by this prototype.
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Human review record</h2>
            <span className={`pill ${statusClass(review.status)}`}>{review.status}</span>
          </div>
          <p className="subtitle">
            A human recommendation is a review record, not an official regulatory decision.
          </p>
          <div className="form-grid">
            <div>
              <label className="field-label">Reviewer name</label>
              <input
                className="text-input"
                value={reviewer}
                onChange={(event) => setReviewer(event.target.value)}
                placeholder="Enter reviewer name"
              />
            </div>
            <div>
              <label className="field-label">Human recommendation</label>
              <select
                className="select-input"
                value={recommendation}
                onChange={(event) => setRecommendation(event.target.value as HumanRecommendation)}
              >
                <option value="">Select recommendation</option>
                <option value="Support">Support</option>
                <option value="Request further evidence">Request further evidence</option>
                <option value="Do not support">Do not support</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 13 }}>
            <label className="field-label">Reviewer reasoning and conditions</label>
            <textarea
              className="text-area"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Document the evidence reviewed, reasoning, unresolved issues and any conditions..."
            />
          </div>
          <div className="action-row">
            <button className="secondary-button" onClick={() => beginReview(rule.id)}>
              Mark as in review
            </button>
            <button className="primary-button" onClick={() => saveRecommendation(rule.id)}>
              Save human recommendation
            </button>
          </div>
          {review.updatedAt && (
            <p className="muted">Last updated: {new Date(review.updatedAt).toLocaleString()}</p>
          )}
          {review.recommendation && (
            <div className="notice">
              <strong>Recorded recommendation: {review.recommendation}</strong>
              <p>Reviewer: {review.reviewer}</p>
              <p>{review.reason}</p>
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <div className="app-shell">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <div className="brand-name">RegulaAI</div>
            <div className="brand-sub">REGULATORY INTELLIGENCE</div>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {navigation.map((item, index) => (
            <button
              key={item}
              className={`nav-button ${activePage === item ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item)
                if (item !== 'Regulatory Assessment') setSelectedRuleId(null)
              }}
            >
              <span style={{ width: 25 }}>{['◫', '▤', '◎', '⌘', '☑', '◷'][index]}</span>
              <span className="nav-text">{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          Regulatory Analyst
          <small>Human reviewer workspace</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Workspace / <strong>{activePage}</strong></div>
          <div className="top-user">RA &nbsp; Analyst</div>
        </header>

        <div className="content">
          {activePage === 'Overview' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Regulatory Overview</h1>
                  <p className="subtitle">Monitor preliminary screening, submissions and human reviews.</p>
                </div>
                <button className="primary-button" onClick={openRules}>Review submissions</button>
              </div>

              <div className="section-label">SCREENING SUMMARY · ALL {rules.length} RULES</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total rules</div>
                  <div className="stat-value">{rules.length}</div>
                  <div className="stat-note">Fictional source dataset</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">High screening priority</div>
                  <div className="stat-value">{counts.High}</div>
                  <div className="stat-note">Requires careful human review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Medium screening priority</div>
                  <div className="stat-value">{counts.Medium}</div>
                  <div className="stat-note">Further examination required</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Low screening priority</div>
                  <div className="stat-value">{counts.Low}</div>
                  <div className="stat-note">No equivalent to approval</div>
                </div>
              </div>

              <div className="section-label">HUMAN REVIEW WORKFLOW</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Awaiting review</div>
                  <div className="stat-value">
                    {rules.filter((rule) => (reviews[rule.id]?.status ?? 'Awaiting review') === 'Awaiting review').length}
                  </div>
                  <div className="stat-note">Not yet marked in review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">In review</div>
                  <div className="stat-value">
                    {rules.filter((rule) => reviews[rule.id]?.status === 'In review').length}
                  </div>
                  <div className="stat-note">Human review started</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Recommendation recorded</div>
                  <div className="stat-value">
                    {rules.filter((rule) => reviews[rule.id]?.status === 'Human recommendation recorded').length}
                  </div>
                  <div className="stat-note">Human recommendation saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Assessment framework</div>
                  <div className="stat-value">4 + 6</div>
                  <div className="stat-note">Four levels and six principles</div>
                </div>
              </div>

              <div className="workspace-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Priority review queue</h2>
                      <div className="panel-description">Highest screening priority records</div>
                    </div>
                    <button className="text-link" onClick={openRules}>View register →</button>
                  </div>
                  {renderRuleTable(
                    assessments.filter(({ assessment }) => assessment.riskLevel === 'High').slice(0, 5),
                  )}
                </section>

                <section className="panel">
                  <h2>Assessment framework</h2>
                  <div className="framework-list" style={{ marginTop: 18 }}>
                    {[
                      ['01 · Basic compliance', 'Legislation, regulations and legal protections'],
                      ['02 · Principles and fair outcomes', 'Consumer protection and fair treatment'],
                      ['03 · Risk justification', 'Evidence, actuarial basis and risk relevance'],
                      ['04 · Public policy filter', 'Broader consumer and public interest'],
                    ].map(([title, description]) => (
                      <div className="framework-item" key={title}>
                        <strong>{title}</strong><small>{description}</small>
                      </div>
                    ))}
                  </div>
                  <div className="notice">
                    <strong>Human oversight required.</strong> Automated screening supports analysis. Qualified reviewers validate evidence and own the final decision.
                  </div>
                </section>
              </div>
            </>
          )}

          {activePage === 'Submissions & Rules' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Submissions & Rules</h1>
                  <p className="subtitle">Search, filter and inspect all records in the fictional dataset.</p>
                </div>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Complete rule register</h2>
                    <div className="panel-description">Showing {filteredRules.length} of {rules.length} rules</div>
                  </div>
                  <div className="action-row" style={{ marginTop: 0 }}>
                    <input
                      className="search-input"
                      placeholder="Search ID, insurer, rule or category..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    <select
                      className="select-input"
                      style={{ width: 155 }}
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                      <option>All priorities</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                {renderRuleTable(filteredRules)}
              </section>
            </>
          )}

          {activePage === 'Regulatory Assessment' && (
            selectedRule ? renderAssessment(selectedRule) : (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Regulatory Assessment</h1>
                    <p className="subtitle">Select a fictional rule to run its preliminary screening.</p>
                  </div>
                </div>
                <section className="panel">
                  <label className="field-label">Select an underwriting rule</label>
                  <select
                    className="select-input"
                    value=""
                    onChange={(event) => setSelectedRuleId(event.target.value)}
                  >
                    <option value="">Choose a rule...</option>
                    {rules.map((rule) => (
                      <option key={rule.id} value={rule.id}>{rule.id} — {rule.insurer}</option>
                    ))}
                  </select>
                  <div className="notice">
                    Automated screening is preliminary. It does not determine legal compliance or approve or reject a rule.
                  </div>
                </section>
              </>
            )
          )}

          {activePage === 'Similarity Analysis' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Similarity Analysis</h1>
                  <p className="subtitle">Compare a selected rule with the closest text-based matches in the dataset.</p>
                </div>
              </div>
              <section className="panel">
                <label className="field-label">Choose a rule to compare</label>
                <select
                  className="select-input"
                  value={similarityRuleId}
                  onChange={(event) => setSimilarityRuleId(event.target.value)}
                >
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>{rule.id} — {rule.insurer}</option>
                  ))}
                </select>
                {similarityRule && (
                  <div className="detail-card">
                    <strong>{similarityRule.id} · Selected rule</strong>
                    <p>{similarityRule.proposedRule}</p>
                    <div className="muted">Category: {similarityRule.category}</div>
                  </div>
                )}
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <h2>Closest matching rules</h2>
                  <span className="pill">{similarRules.length} comparisons</span>
                </div>
                <div className="warning">
                  Similarity percentages are text-based indicators. They do not establish legal equivalence, identical risk, regulatory approval or a precedent.
                </div>
                {similarRules.map((match, index) => (
                  <div className="finding" key={match.rule.id}>
                    <div className="panel-heading">
                      <div>
                        <div className="finding-title">
                          {index + 1}. {match.rule.id} — {match.rule.insurer}
                        </div>
                        <div className="muted">{match.rule.category}</div>
                      </div>
                      <span className="pill">{Number(match.similarity).toFixed(1)}% similarity</span>
                    </div>
                    <p>{match.rule.proposedRule}</p>
                    <div className="similarity-bar">
                      <div
                        className="similarity-fill"
                        style={{ width: `${Math.max(0, Math.min(100, Number(match.similarity)))}%` }}
                      />
                    </div>
                    <div className="framework-list" style={{ marginTop: 12 }}>
                      <div className="framework-item">
                        <strong>Category match</strong>
                        <small>{match.sameCategory ? 'Yes — same category' : 'No — different categories'}</small>
                      </div>
                      <div className="framework-item">
                        <strong>Concept comparison</strong>
                        <small>
                          {match.sameConcept
                            ? `Both rules are classified under: ${match.firstConcept}.`
                            : `Selected rule: ${match.firstConcept}. Matching rule: ${match.secondConcept}.`}
                        </small>
                      </div>
                      <div className="framework-item">
                        <strong>Similarity explanation</strong>
                        <small>{match.explanation}</small>
                      </div>
                    </div>
                    <div className="action-row">
                      <button
                        className="secondary-button"
                        onClick={() => openRuleAssessment(match.rule.id)}
                      >
                        Assess matching rule
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}

          {activePage === 'Decision Centre' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Decision Centre</h1>
                  <p className="subtitle">Manage human review progress and record non-binding reviewer recommendations.</p>
                </div>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Human review queue</h2>
                    <div className="panel-description">{decisionQueue.length} records match this status filter</div>
                  </div>
                  <select
                    className="select-input"
                    style={{ width: 220 }}
                    value={decisionFilter}
                    onChange={(event) => setDecisionFilter(event.target.value)}
                  >
                    <option>All statuses</option>
                    <option>Awaiting review</option>
                    <option>In review</option>
                    <option>Human recommendation recorded</option>
                  </select>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Rule</th>
                        <th>Insurer</th>
                        <th>Priority</th>
                        <th>Review status</th>
                        <th>Recommendation</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisionQueue.map(({ rule, assessment }) => {
                        const record = reviews[rule.id] ?? initialReview
                        return (
                          <tr key={rule.id}>
                            <td className="rule-id">{rule.id}</td>
                            <td>{rule.insurer}</td>
                            <td><span className={`pill ${priorityClass(assessment.riskLevel)}`}>{assessment.riskLevel}</span></td>
                            <td><span className={`pill ${statusClass(record.status)}`}>{record.status}</span></td>
                            <td>{record.recommendation || 'Not recorded'}</td>
                            <td>
                              <button
                                className="text-link"
                                onClick={() => {
                                  setSelectedRuleId(rule.id)
                                  loadReviewForm(rule.id)
                                  setActivePage('Regulatory Assessment')
                                }}
                              >
                                Open review →
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {decisionQueue.length === 0 && (
                        <tr><td colSpan={6}>No rules match this filter.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="warning">
                The options Support, Request further evidence and Do not support are human reviewer recommendations only. They are not official regulatory decisions.
              </div>
            </>
          )}

          {activePage === 'Audit Trail' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Audit Trail</h1>
                  <p className="subtitle">Review recorded changes made in this browser's RegulaAI prototype.</p>
                </div>
                <button
                  className="danger-button"
                  onClick={() => {
                    if (window.confirm('Clear the locally stored audit history? This cannot be undone.')) {
                      setAudit([])
                    }
                  }}
                >
                  Clear audit history
                </button>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Review activity history</h2>
                  <span className="pill">{audit.length} events</span>
                </div>
                {audit.length === 0 ? (
                  <div className="empty-state">
                    No review activity has been recorded yet. Start a review or save a human recommendation in Regulatory Assessment.
                  </div>
                ) : (
                  audit.map((event) => (
                    <div className="audit-item" key={event.id}>
                      <strong>{event.ruleId} · {event.action}</strong>
                      <p>{event.details || 'No additional details recorded.'}</p>
                      <p>{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </section>
              <div className="notice">
                Audit entries and review records are stored in this browser using localStorage. They are not a secure, centralized or tamper-proof regulatory audit system. Clearing browser data may remove them.
              </div>
            </>
          )}

          <div className="footer-note">
            PROTOTYPE NOTICE · Academic demonstration using fictional underwriting rules and a supplied assessment framework. Not an official regulatory system or legal advice. Automated screening does not verify legislation, actuarial evidence or legal compliance. Human validation is mandatory. Final decisions remain with qualified human reviewers.
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
