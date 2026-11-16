
import { useState } from 'react'
import './App.css'

type Rule = {
  id: string
  insurer: string
  description: string
  category: string
  status: string
  risk: string
}

const rules: Rule[] = [
  {
    id: 'DR-005',
    insurer: 'Northstar Insurance',
    description: 'Applicant must communicate in English or French',
    category: 'Accessibility',
    status: 'Flagged',
    risk: 'High',
  },
  {
    id: 'DR-007',
    insurer: 'Maple Shield',
    description: 'Applicants under 21 years of age',
    category: 'Age',
    status: 'Under review',
    risk: 'High',
  },
  {
    id: 'DR-031',
    insurer: 'Northern Mutual',
    description: 'Applicants with previous not-at-fault claims',
    category: 'Claims history',
    status: 'Flagged',
    risk: 'High',
  },
  {
    id: 'DR-042',
    insurer: 'Cedar Insurance',
    description: 'Applicants with criminal charges without conviction',
    category: 'Criminal history',
    status: 'Under review',
    risk: 'Medium',
  },
  {
    id: 'DR-053',
    insurer: 'Pioneer Assurance',
    description: 'Drivers with less than 24 months of Canadian licence history',
    category: 'Driving experience',
    status: 'Pending',
    risk: 'Medium',
  },
]

const navigation = [
  { name: 'Overview', icon: '◫' },
  { name: 'Submissions & Rules', icon: '▤' },
  { name: 'Regulatory Assessment', icon: '◎' },
  { name: 'Similarity Analysis', icon: '⌘' },
  { name: 'Decision Centre', icon: '☑' },
  { name: 'Audit Trail', icon: '◷' },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')

  const filteredRules = rules.filter((rule) =>
    `${rule.id} ${rule.insurer} ${rule.description} ${rule.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; background: #f5f7fa; font-family: 'DM Sans', sans-serif; color: #17233b; }
        button, input { font: inherit; }
        button { cursor: pointer; }

        .app-shell { display: flex; min-height: 100vh; background: #f5f7fa; }
        .sidebar { width: 250px; background: #101c32; color: #d5deed; padding: 27px 17px; display: flex; flex-direction: column; flex-shrink: 0; }
        .brand { display: flex; align-items: center; gap: 11px; padding: 0 9px 35px; }
        .brand-mark { width: 37px; height: 37px; border-radius: 11px; background: #dce8ff; color: #193d73; display: grid; place-items: center; font-size: 20px; font-weight: 800; }
        .brand-name { font-family: Manrope, sans-serif; font-weight: 800; font-size: 19px; color: white; letter-spacing: -.6px; }
        .brand-sub { color: #8999b2; font-size: 10px; margin-top: 2px; letter-spacing: 1.4px; }
        .nav-label { font-size: 10px; color: #8191aa; letter-spacing: 1.4px; font-weight: 700; padding: 0 11px; margin: 8px 0 12px; }
        .nav-list { display: grid; gap: 5px; }
        .nav-button { border: 0; background: transparent; color: #aebbd0; display: flex; align-items: center; gap: 12px; text-align: left; width: 100%; padding: 12px 11px; border-radius: 8px; font-size: 12px; transition: .2s; }
        .nav-button:hover { background: #1a2a45; color: white; }
        .nav-button.active { background: #253c60; color: white; font-weight: 700; }
        .nav-icon { width: 19px; text-align: center; font-size: 17px; }
        .sidebar-bottom { margin-top: auto; border-top: 1px solid #26344a; padding: 19px 9px 0; }
        .user-card { display: flex; gap: 10px; align-items: center; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: #dce6f5; color: #253c60; display: grid; place-items: center; font-size: 12px; font-weight: 800; }
        .user-name { font-size: 12px; color: white; font-weight: 600; }
        .user-role { font-size: 10px; color: #8fa0b9; margin-top: 3px; }
        .main { min-width: 0; flex: 1; }
        .topbar { height: 70px; background: white; border-bottom: 1px solid #e8ecf2; display: flex; align-items: center; justify-content: space-between; padding: 0 35px; }
        .breadcrumb { color: #8591a5; font-size: 12px; }
        .breadcrumb strong { color: #24334c; font-weight: 600; }
        .top-actions { display: flex; align-items: center; gap: 18px; }
        .top-icon { color: #718099; font-size: 17px; }
        .top-user { display: flex; align-items: center; gap: 9px; font-size: 11px; font-weight: 600; }
        .content { padding: 33px 36px 55px; max-width: 1500px; margin: auto; }
        .page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 26px; }
        h1 { font-family: Manrope, sans-serif; font-size: 25px; letter-spacing: -.8px; margin: 0; color: #17233b; }
        .subtitle { color: #8390a3; font-size: 12px; margin-top: 7px; }
        .primary-button { border: 0; border-radius: 7px; background: #1d3c68; color: white; padding: 11px 16px; font-size: 11px; font-weight: 700; }
        .primary-button:hover { background: #294f83; }
        .section-label { color: #77869b; font-size: 10px; letter-spacing: 1.2px; font-weight: 700; margin: 27px 0 13px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; }
        .stat-card { background: white; border: 1px solid #e9edf3; border-radius: 10px; padding: 19px; min-height: 125px; }
        .stat-top { display: flex; justify-content: space-between; align-items: center; color: #8190a4; font-size: 11px; }
        .stat-symbol { width: 29px; height: 29px; border-radius: 8px; display: grid; place-items: center; background: #edf3fc; color: #315782; font-size: 15px; }
        .stat-value { font-family: Manrope, sans-serif; font-size: 27px; font-weight: 800; margin-top: 13px; letter-spacing: -.8px; }
        .stat-note { color: #8a96a8; font-size: 10px; margin-top: 4px; }
        .workspace-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(240px, .8fr); gap: 17px; margin-top: 23px; }
        .panel { background: white; border: 1px solid #e9edf3; border-radius: 10px; padding: 20px; min-width: 0; }
        .panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 17px; }
        h2 { font-family: Manrope, sans-serif; font-size: 14px; margin: 0; color: #24334c; }
        .panel-description { color: #8b97a8; font-size: 10px; margin-top: 5px; }
        .text-link { color: #365d8e; border: 0; background: transparent; font-size: 10px; font-weight: 700; }
        .table-wrap { overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; min-width: 510px; text-align: left; }
        th { color: #8995a6; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; font-weight: 700; padding: 12px 9px; border-bottom: 1px solid #edf0f4; }
        td { padding: 13px 9px; border-bottom: 1px solid #f0f2f5; font-size: 10px; color: #526178; }
        tr:last-child td { border-bottom: 0; }
        .rule-id { font-weight: 700; color: #294b76; }
        .rule-description { color: #26364e; font-weight: 600; max-width: 240px; line-height: 1.5; }
        .pill { display: inline-block; padding: 5px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; white-space: nowrap; }
        .pill-red { background: #fff0ed; color: #bd5748; }
        .pill-amber { background: #fff6e6; color: #a77520; }
        .pill-grey { background: #f0f2f5; color: #65748a; }
        .pill-green { background: #eaf6ef; color: #39805a; }
        .priority-list { display: grid; gap: 17px; }
        .priority-item { display: flex; align-items: flex-start; gap: 11px; }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .priority-title { font-size: 11px; font-weight: 700; color: #30415b; line-height: 1.5; }
        .priority-text { font-size: 10px; color: #8a96a8; margin-top: 4px; line-height: 1.5; }
        .progress-track { height: 6px; border-radius: 20px; background: #edf0f5; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: #456c9c; border-radius: 20px; }
        .progress-row { margin-top: 19px; }
        .progress-meta { display: flex; justify-content: space-between; color: #68778d; font-size: 10px; }
        .notice { background: #f0f5fb; border: 1px solid #e1eaf5; border-radius: 8px; padding: 13px; color: #516783; font-size: 10px; line-height: 1.7; margin-top: 17px; }
        .search-input { border: 1px solid #e1e6ed; background: white; border-radius: 7px; padding: 10px 12px; width: 230px; font-size: 11px; outline: none; }
        .search-input:focus { border-color: #6c8db7; }
        .empty-page { background: white; border: 1px solid #e9edf3; border-radius: 10px; padding: 45px; text-align: center; color: #7f8ca0; }
        .empty-icon { font-size: 28px; color: #52739d; margin-bottom: 12px; }
        .empty-page h2 { margin-bottom: 8px; }
        .empty-page p { font-size: 11px; line-height: 1.7; max-width: 440px; margin: auto; }
        .footer-note { color: #98a2b1; font-size: 9px; margin-top: 23px; line-height: 1.7; }
        @media (max-width: 1000px) { .sidebar { width: 210px; } .content { padding: 25px 20px; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .workspace-grid { grid-template-columns: 1fr; } }
        @media (max-width: 650px) { .sidebar { width: 62px; padding: 20px 8px; } .brand { padding: 0 4px 30px; } .brand-name, .brand-sub, .nav-label, .nav-text, .sidebar-bottom .user-name, .sidebar-bottom .user-role { display: none; } .brand-mark { width: 38px; } .nav-button { justify-content: center; padding: 12px 5px; } .nav-icon { font-size: 19px; } .sidebar-bottom { padding: 15px 0 0; } .user-card { justify-content: center; } .topbar { padding: 0 15px; } .content { padding: 23px 13px; } .stats-grid { gap: 9px; } .stat-card { padding: 13px; } .page-heading { flex-direction: column; } .search-input { width: 100%; } }
      `}</style>

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
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-button ${activePage === item.name ? 'active' : ''}`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">RA</div>
            <div>
              <div className="user-name">Regulatory Analyst</div>
              <div className="user-role">Reviewer workspace</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace&nbsp; / &nbsp;<strong>{activePage}</strong>
          </div>
          <div className="top-actions">
            <span className="top-icon">♧</span>
            <span className="top-icon">⚙</span>
            <div className="top-user">
              <div className="avatar">RA</div>
              Analyst
            </div>
          </div>
        </header>

        <div className="content">
          {activePage === 'Overview' ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>Regulatory Overview</h1>
                  <p className="subtitle">
                    Monitor underwriting rule submissions, compliance reviews and decisions.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setActivePage('Submissions & Rules')}
                >
                  + Review submissions
                </button>
              </div>

              <div className="section-label">WORKSPACE SUMMARY</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    Rules in source dataset
                    <span className="stat-symbol">▤</span>
                  </div>
                  <div className="stat-value">100</div>
                  <div className="stat-note">Fictional underwriting rules provided</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    Assessment levels
                    <span className="stat-symbol">◎</span>
                  </div>
                  <div className="stat-value">04</div>
                  <div className="stat-note">Required framework assessment levels</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    Fair outcome principles
                    <span className="stat-symbol">◇</span>
                  </div>
                  <div className="stat-value">06</div>
                  <div className="stat-note">Consumer outcome principles</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    Human decision authority
                    <span className="stat-symbol">✓</span>
                  </div>
                  <div className="stat-value">100%</div>
                  <div className="stat-note">Final decisions remain with reviewers</div>
                </div>
              </div>

              <div className="workspace-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Rule review preview</h2>
                      <div className="panel-description">
                        Illustrative records from the fictional source dataset
                      </div>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => setActivePage('Submissions & Rules')}
                    >
                      View all rules →
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Rule ID</th>
                          <th>Proposed rule</th>
                          <th>Review status</th>
                          <th>Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.slice(0, 4).map((rule) => (
                          <tr key={rule.id}>
                            <td className="rule-id">{rule.id}</td>
                            <td>
                              <div className="rule-description">{rule.description}</div>
                              <div style={{ marginTop: 4, fontSize: 9, color: '#98a2b1' }}>
                                {rule.insurer}
                              </div>
                            </td>
                            <td>
                              <span className={`pill ${rule.status === 'Flagged' ? 'pill-red' : 'pill-amber'}`}>
                                {rule.status}
                              </span>
                            </td>
                            <td>
                              <span className={`pill ${rule.risk === 'High' ? 'pill-red' : 'pill-amber'}`}>
                                {rule.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Assessment framework</h2>
                      <div className="panel-description">
                        Required review structure
                      </div>
                    </div>
                  </div>

                  <div className="priority-list">
                    {[
                      ['01', 'Basic compliance', 'Legislation, regulations and legal protections'],
                      ['02', 'Principles & fair outcomes', 'Interpretation of regulatory principles'],
                      ['03', 'Risk justification', 'Evidence, actuarial basis and risk relevance'],
                      ['04', 'Public policy filter', 'Broader consumer and public interest'],
                    ].map(([number, title, description]) => (
                      <div className="priority-item" key={number}>
                        <div className="priority-dot" style={{ background: '#547aa7' }} />
                        <div>
                          <div className="priority-title">{number} · {title}</div>
                          <div className="priority-text">{description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="notice">
                    <strong>Human oversight required.</strong>
                    <br />
                    RegulaAI supports analysis. A qualified human reviewer validates evidence,
                    challenges recommendations and owns the final decision.
                  </div>
                </section>
              </div>

              <div className="footer-note">
                PROTOTYPE NOTICE · Academic demonstration using fictional underwriting rules.
                Not an official regulatory system or legal advice. All automated assessments
                require human validation.
              </div>
            </>
          ) : activePage === 'Submissions & Rules' ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>Submissions & Rules</h1>
                  <p className="subtitle">
                    Explore the fictional underwriting rule dataset.
                  </p>
                </div>
              </div>
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Rule register · Preview</h2>
                    <div className="panel-description">
                      {filteredRules.length} illustrative records displayed. Full dataset import is the next build step.
                    </div>
                  </div>
                  <input
                    className="search-input"
                    placeholder="Search rules or insurers..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Rule ID</th>
                        <th>Insurer</th>
                        <th>Proposed rule</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="rule-id">{rule.id}</td>
                          <td>{rule.insurer}</td>
                          <td><div className="rule-description">{rule.description}</div></td>
                          <td>{rule.category}</td>
                          <td><span className="pill pill-amber">{rule.status}</span></td>
                          <td>
                            <span className={`pill ${rule.risk === 'High' ? 'pill-red' : 'pill-amber'}`}>
                              {rule.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredRules.length === 0 && (
                        <tr><td colSpan={6}>No matching preview records.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="footer-note">
                This is a preview, not the complete 100-rule database. No final regulatory
                conclusions have been made.
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <h1>{activePage}</h1>
                  <p className="subtitle">
                    RegulaAI regulatory review workspace.
                  </p>
                </div>
              </div>
              <div className="empty-page">
                <div className="empty-icon">◇</div>
                <h2>{activePage} module</h2>
                <p>
                  This module is part of the RegulaAI build plan. We will connect it to the
                  rule database, assessment engine and human-review workflow in the next stages.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
