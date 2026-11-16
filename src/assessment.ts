
export type Rule = {
  id: string
  insurer: string
  proposedRule: string
  rationale: string
  category: string
  dateSubmitted: string
}

export type Finding = {
  title: string
  explanation: string
  severity: 'High' | 'Medium' | 'Low'
  level: string
}

export type Assessment = {
  ruleId: string
  overallStatus: string
  riskLevel: 'High' | 'Medium' | 'Low'
  recommendation: string
  findings: Finding[]
  evidenceGaps: string[]
  nextSteps: string[]
  levels: {
    level1: string
    level2: string
    level3: string
    level4: string
  }
  principles: {
    name: string
    status: string
    explanation: string
  }[]
  humanReviewRequired: boolean
}

export const fairOutcomePrinciples = [
  'Accurate Pricing and Underwriting',
  'Absence of Unfair Discrimination, Bias, or Proxies',
  'Accessible Products and Coverages',
  'Cost Mitigation',
  'Balanced Profitability and Consumer Interests',
  'Clear Consumer Communications',
]

// These indicators identify matters requiring closer review.
// They do not establish that a rule is unlawful or discriminatory.
const sensitiveIndicators = [
  {
    pattern: /\b(age|under the age|over the age|younger than|older than)\b/i,
    title: 'Age-based eligibility criterion',
    explanation:
      'The rule uses age as an eligibility criterion. Review applicable human rights protections, actuarial justification and whether a more directly risk-related criterion is available.',
  },
  {
    pattern: /\b(born outside|nationality|citizenship|dual citizenship|newcomer|immigrant)\b/i,
    title: 'Nationality or immigration-related criterion',
    explanation:
      'The rule refers to place of birth, citizenship or newcomer status. Examine whether actual driving experience or another relevant risk factor can be assessed directly.',
  },
  {
    pattern: /\b(language|primary language|english or french)\b/i,
    title: 'Language-based criterion',
    explanation:
      'The rule uses language as an eligibility criterion. Assess accessibility, alternative communication arrangements and potential discriminatory effects.',
  },
  {
    pattern: /\b(disability|disabled|social assistance|disability benefits)\b/i,
    title: 'Disability or social assistance-related criterion',
    explanation:
      'The rule references disability or social assistance. Review potential human rights implications and whether the criterion is demonstrably related to insured risk.',
  },
  {
    pattern: /\b(medical condition|medical reasons|diagnosed|health condition)\b/i,
    title: 'Medical information criterion',
    explanation:
      'The rule uses medical information. Verify its relevance to driving risk, necessity, privacy safeguards and applicable human rights requirements.',
  },
  {
    pattern: /\b(political|advocated|advocacy)\b/i,
    title: 'Political expression criterion',
    explanation:
      'The rule considers political expression or advocacy. The submission does not establish a direct connection to insured driving risk.',
  },
  {
    pattern: /\b(ombudsman|complaint|litigation|lawsuit|defendant)\b/i,
    title: 'Complaint or legal action criterion',
    explanation:
      'The rule relies on complaints or legal proceedings. Examine whether this is a valid risk indicator or could penalise consumers for exercising their rights.',
  },
  {
    pattern: /\b(charged with but not convicted|without conviction|not convicted)\b/i,
    title: 'Unproven criminal allegation',
    explanation:
      'The rule considers charges without a conviction. This raises fairness and reliability concerns and requires careful legal review.',
  },
  {
    pattern: /\b(family member|household member|married to|lives with|cohabitation|residing in the household)\b/i,
    title: 'Association-based criterion',
    explanation:
      'The rule may attribute another person’s behaviour or characteristics to the applicant. Verify whether the association is directly relevant to insured risk.',
  },
  {
    pattern: /\b(social media|publicly advocated|social media presence)\b/i,
    title: 'Social media or expression criterion',
    explanation:
      'The rule relies on online activity or expression. Verify authenticity, relevance, privacy safeguards and the connection to actual driving risk.',
  },
  {
    pattern: /\b(name similar|surname matches|watchlist)\b/i,
    title: 'Identity matching and potential false positives',
    explanation:
      'Name-based matching can incorrectly identify applicants. Require reliable identity verification, a correction process and human review before adverse action.',
  },
  {
    pattern: /\b(child protective services|foster children)\b/i,
    title: 'Family or social circumstances criterion',
    explanation:
      'The rule considers family or social circumstances. Assess whether they are relevant to driving exposure and whether the criterion creates unfair treatment.',
  },
]

// Fairness indicators are deliberately separate from
// protected-characteristic indicators.
const fairnessIndicators = [
  {
    pattern: /\b(not-at-fault|not at fault)\b/i,
    title: 'Not-at-fault claims criterion',
    explanation:
      'The rule considers claims where the driver was not at fault. Require evidence demonstrating a legitimate relationship to future insured risk. Examine whether consumers are being penalised for incidents outside their control.',
    severity: 'Medium' as const,
    level: 'Level 2',
  },
]

function containsEvidenceReference(rationale: string) {
  return /\b(actuarial|statistical|claims data|historical data|loss ratio|frequency|severity|analysis|study|dataset|evidence)\b/i.test(
    rationale,
  )
}

function hasSpecificCriterion(rule: Rule) {
  const text = rule.proposedRule.toLowerCase()

  const hasNumericalThreshold =
    /\b\d+\b/.test(text) ||
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(text)

  const hasDefinedTimePeriod =
    /\b(preceding|previous|past|last)\s+\d+\s+years?\b/i.test(text) ||
    /\b(preceding|previous|past|last)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+years?\b/i.test(text)

  const hasPotentiallyVagueLanguage =
    /\b(suspicious|unacceptable|inappropriate|as appropriate|at the insurer's discretion|at our discretion)\b/i.test(
      text,
    )

  return {
    hasNumericalThreshold,
    hasDefinedTimePeriod,
    hasPotentiallyVagueLanguage,
  }
}

function assessPrinciples(rule: Rule) {
  const text = `${rule.proposedRule} ${rule.rationale}`.toLowerCase()
  const proposedRule = rule.proposedRule.toLowerCase()

  const evidenceMentioned = containsEvidenceReference(rule.rationale)

  const sensitiveMatches = sensitiveIndicators.filter((item) =>
    item.pattern.test(text),
  )

  const fairnessMatches = fairnessIndicators.filter((item) =>
    item.pattern.test(text),
  )

  return fairOutcomePrinciples.map((name, index) => {
    let status = 'Human review required'
    let explanation =
      'The available submission does not establish whether this principle is satisfied.'

    // 1. Accurate Pricing and Underwriting
    if (index === 0) {
      status = evidenceMentioned
        ? 'Evidence mentioned — verify'
        : 'Evidence missing'

      explanation = evidenceMentioned
        ? 'The rationale refers to data or analysis. Supporting actuarial documents must be examined; a reference in the rationale is not proof.'
        : 'The rationale does not identify supporting actuarial evidence demonstrating accurate risk pricing.'
    }

    // 2. Absence of Unfair Discrimination, Bias, or Proxies
    if (index === 1) {
      if (sensitiveMatches.length > 0) {
        status = 'Potential concern'
        explanation =
          'The rule references a characteristic or circumstance that warrants direct and indirect discrimination review. This is a screening concern, not a finding of unlawful discrimination.'
      } else if (fairnessMatches.length > 0) {
        status = 'Fairness review required'
        explanation =
          'The rule considers circumstances potentially outside the applicant’s control. Review its fairness and any disproportionate consumer effects. No protected-characteristic proxy has been established by the wording alone.'
      } else {
        status = 'Human review required'
        explanation =
          'Review potential direct and indirect discrimination, including possible proxy effects. The available wording does not establish a specific protected-characteristic concern.'
      }
    }

    // 3. Accessible Products and Coverages
    if (index === 2) {
      status = 'Human review required'
      explanation =
        'Consider whether the rule unnecessarily restricts access to mandatory auto insurance coverage and whether less restrictive alternatives are available.'

      if (/\blanguage|primary language\b/i.test(proposedRule)) {
        explanation =
          'Consider whether translation, interpretation or other communication alternatives could address the stated concern without declining mandatory auto insurance coverage.'
      }
    }

    // 4. Cost Mitigation
    if (index === 3) {
      status = evidenceMentioned
        ? 'Evidence mentioned — verify'
        : 'Evidence missing'

      explanation =
        'Verify whether the proposed restriction is proportionate to demonstrated claims costs and whether less restrictive alternatives exist.'
    }

    // 5. Balanced Profitability and Consumer Interests
    if (index === 4) {
      status = 'Human review required'
      explanation =
        'Balance the insurer’s legitimate risk-management interests against consumer access, proportionality and fair treatment.'
    }

    // 6. Clear Consumer Communications
    // IMPORTANT: evaluate the proposed rule, not the insurer's rationale.
    if (index === 5) {
      const wordingConcern =
        /\b(vague|as appropriate|suspicious|unacceptable|inappropriate|at discretion)\b/i.test(
          proposedRule,
        )

      status = wordingConcern
        ? 'Potential clarity concern'
        : 'Human review required'

      explanation = wordingConcern
        ? 'The eligibility wording may permit inconsistent interpretation. Require objective definitions and explain how applicants can challenge an error.'
        : 'Check whether consumers can understand the eligibility criterion, its meaning and how to challenge an error.'
    }

    return { name, status, explanation }
  })
}

export function assessRule(rule: Rule): Assessment {
  const findings: Finding[] = []
  const evidenceGaps: string[] = []
  const nextSteps: string[] = []

  const text = `${rule.proposedRule} ${rule.rationale}`
  const proposedRule = rule.proposedRule || ''
  const rationale = rule.rationale || ''

  // 1. Potential protected-characteristic and proxy concerns.
  sensitiveIndicators.forEach((indicator) => {
    if (indicator.pattern.test(text)) {
      findings.push({
        title: indicator.title,
        explanation: indicator.explanation,
        severity: 'High',
        level: 'Level 2',
      })
    }
  })

  // 2. Fairness concerns that do not automatically imply discrimination.
  fairnessIndicators.forEach((indicator) => {
    if (indicator.pattern.test(text)) {
      findings.push({
        title: indicator.title,
        explanation: indicator.explanation,
        severity: indicator.severity,
        level: indicator.level,
      })
    }
  })

  // 3. Actuarial evidence.
  const evidenceMentioned = containsEvidenceReference(rationale)

  if (!evidenceMentioned) {
    findings.push({
      title: 'Supporting actuarial evidence not identified',
      explanation:
        'The rationale does not identify actuarial analysis or supporting claims evidence. The claimed relationship between the criterion and insured risk needs verification.',
      severity: 'High',
      level: 'Level 3',
    })
  }

  evidenceGaps.push(
    'Supporting actuarial analysis, including methodology, relevant data, assumptions and evidence of the relationship between the criterion and insured risk.',
  )

  if (evidenceMentioned) {
    evidenceGaps.push(
      'The actual supporting documents and underlying data must be reviewed. A reference to claims data or analysis in the rationale is not verification.',
    )
  }

  // 4. Precision and objective eligibility criteria.
  const criterion = hasSpecificCriterion(rule)

  if (criterion.hasPotentiallyVagueLanguage) {
    findings.push({
      title: 'Potentially subjective terminology',
      explanation:
        'The proposed eligibility wording contains terminology that may permit inconsistent interpretation. Require objective definitions, consistent application criteria and a process for challenging decisions.',
      severity: 'Medium',
      level: 'Level 3',
    })
  }

  if (
    !criterion.hasNumericalThreshold &&
    !criterion.hasPotentiallyVagueLanguage
  ) {
    evidenceGaps.push(
      'Confirm that any qualitative eligibility criterion is objectively defined, consistently applied and capable of being independently verified.',
    )
  }

  if (
    criterion.hasNumericalThreshold &&
    !criterion.hasDefinedTimePeriod &&
    /\b(preceding|previous|past|last)\b/i.test(proposedRule)
  ) {
    findings.push({
      title: 'Time-period definition requires verification',
      explanation:
        'The wording refers to a time period. Verify the precise start and end points, the relevant records and how the period is calculated.',
      severity: 'Low',
      level: 'Level 3',
    })
  }

  // 5. Do not flag "any" or "all" by themselves.
  if (
    /\b(regardless of circumstances|any reason whatsoever|at our sole discretion)\b/i.test(
      proposedRule,
    )
  ) {
    findings.push({
      title: 'Potentially unrestricted eligibility wording',
      explanation:
        'The wording may allow an excessively broad or discretionary application. Verify the exact scope, objective criteria and proportionality of the restriction.',
      severity: 'Medium',
      level: 'Level 2',
    })
  }

  if (!rationale.trim() || rationale.trim().length < 30) {
    evidenceGaps.push(
      'A complete and specific explanation of the insurer’s rationale.',
    )
  }

  // 6. Scope and public policy considerations.
  if (/\b(optional coverage|optional endorsement)\b/i.test(proposedRule)) {
    findings.push({
      title: 'Scope verification required',
      explanation:
        'The assignment concerns rules for declining an auto insurance policy, not merely optional coverage eligibility. Confirm that the submission falls within the assessment scope.',
      severity: 'High',
      level: 'Level 4',
    })
  }

  if (
    /\b(commercial|business use|delivery|racing|racetrack|police work)\b/i.test(
      proposedRule,
    )
  ) {
    findings.push({
      title: 'Vehicle use and policy scope',
      explanation:
        'Verify whether the proposed use falls within the personal auto policy scope and whether the restriction is supported by objective risk evidence.',
      severity: 'Medium',
      level: 'Level 4',
    })
  }

  // 7. Legal and regulatory checks are never automatically resolved.
  evidenceGaps.push(
    'Verified legal analysis against applicable Ontario legislation, regulations and guidance.',
  )

  evidenceGaps.push(
    'Review of relevant Human Rights Code and Canadian Charter considerations, including any applicable direct or indirect discrimination issues.',
  )

  evidenceGaps.push(
    'Confirmation that this is a policy decline rule rather than an optional coverage restriction.',
  )

  // 8. Recommended next steps.
  nextSteps.push(
    'Obtain and validate the insurer’s supporting actuarial evidence.',
  )

  nextSteps.push(
    'Review potential human rights, discrimination, proxy and fair consumer outcome implications.',
  )

  nextSteps.push(
    'Verify applicable legal provisions with qualified regulatory or legal reviewers.',
  )

  nextSteps.push(
    'Compare the proposed rule with existing examples and explain material similarities and differences.',
  )

  nextSteps.push(
    'Record a human reviewer’s recommendation and reasons before any final decision.',
  )

  // 9. Screening priority.
  // Priority is independent of the number of findings.
  const highCount = findings.filter(
    (finding) => finding.severity === 'High',
  ).length

  const mediumCount = findings.filter(
    (finding) => finding.severity === 'Medium',
  ).length

  const sensitiveConcern = sensitiveIndicators.some((item) =>
    item.pattern.test(text),
  )

  const fairnessConcern = fairnessIndicators.some((item) =>
    item.pattern.test(text),
  )

  const scopeConcern =
    /\b(optional coverage|optional endorsement)\b/i.test(proposedRule)

  const riskLevel: Assessment['riskLevel'] =
    highCount > 0 || sensitiveConcern || scopeConcern
      ? 'High'
      : mediumCount > 0 || fairnessConcern || evidenceMentioned
        ? 'Medium'
        : 'Low'

  const hasLevel2Finding = findings.some(
    (finding) => finding.level === 'Level 2',
  )

  const hasLevel3Finding = findings.some(
    (finding) => finding.level === 'Level 3',
  )

  return {
    ruleId: rule.id,
    overallStatus: 'Preliminary screening — human review required',
    riskLevel,
    recommendation:
      'Do not treat this rule as approved or rejected. Refer it for documented regulatory, actuarial and human rights review.',
    findings,
    evidenceGaps,
    nextSteps,
    levels: {
      level1: 'UNVERIFIED — legal review required',
      level2: hasLevel2Finding
        ? 'Potential consumer outcome concerns identified'
        : 'Human review required',
      level3: hasLevel3Finding
        ? 'Risk justification requires further examination'
        : evidenceMentioned
          ? 'Evidence referenced — supporting documents required'
          : 'Actuarial evidence not identified',
      level4: 'Public policy review required',
    },
    principles: assessPrinciples(rule),
    humanReviewRequired: true,
  }
}

// Similarity is a text-based indicator, not semantic similarity
// or a legal equivalence assessment.

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3),
  )
}

function similarityScore(first: Rule, second: Rule) {
  const firstWords = tokenize(
    `${first.proposedRule} ${first.category}`,
  )

  const secondWords = tokenize(
    `${second.proposedRule} ${second.category}`,
  )

  const intersection = [...firstWords].filter((word) =>
    secondWords.has(word),
  ).length

  const union = new Set([...firstWords, ...secondWords]).size

  return union === 0 ? 0 : intersection / union
}

function identifyRiskConcept(rule: Rule) {
  const text = rule.proposedRule.toLowerCase()

  // Check specific concepts before more general concepts.
  if (/\bnot-at-fault|not at fault\b/.test(text)) {
    return 'Not-at-fault claims'
  }

  if (/\bat-fault|at fault\b/.test(text)) {
    return 'At-fault accidents'
  }

  if (/\bcriminal code|conviction|convicted\b/.test(text)) {
    return 'Criminal convictions'
  }

  if (/\bnon-payment|nonpayment|cancellations for non-payment\b/.test(text)) {
    return 'Payment history'
  }

  if (/\blicence suspended|license suspended|licence revoked\b/.test(text)) {
    return 'Licence status'
  }

  if (/\bcomprehensive claims|theft|vandalism|weather damage\b/.test(text)) {
    return 'Comprehensive claims'
  }

  if (/\bage|younger than|older than\b/.test(text)) {
    return 'Age-related criterion'
  }

  if (/\blanguage\b/.test(text)) {
    return 'Language-related criterion'
  }

  if (/\bborn outside|nationality|citizenship|newcomer|immigrant\b/.test(text)) {
    return 'Nationality or immigration-related criterion'
  }

  if (/\bcommercial|business use|delivery\b/.test(text)) {
    return 'Vehicle use'
  }

  if (/\bracing|racetrack|speed test\b/.test(text)) {
    return 'Racing or speed-related vehicle use'
  }

  if (/\bfraud\b/.test(text)) {
    return 'Insurance fraud'
  }

  if (/\bmedical|disability|health condition\b/.test(text)) {
    return 'Medical or disability-related criterion'
  }

  return 'Other or unclassified criterion'
}

function explainSimilarity(first: Rule, second: Rule) {
  const firstConcept = identifyRiskConcept(first)
  const secondConcept = identifyRiskConcept(second)

  const sameCategory = first.category === second.category
  const sameConcept = firstConcept === secondConcept

  let explanation: string

  if (sameConcept) {
    explanation =
      `Both rules concern ${firstConcept.toLowerCase()}. Review their thresholds, observation periods, supporting evidence and application before treating them as comparable.`
  } else {
    explanation =
      `The rules concern different underlying criteria (${firstConcept.toLowerCase()} versus ${secondConcept.toLowerCase()}). Similar wording does not establish equivalent risk justification.`
  }

  if (
    firstConcept === 'At-fault accidents' &&
    secondConcept === 'Not-at-fault claims'
  ) {
    explanation =
      'Material difference: one rule concerns at-fault accidents, while the other concerns claims where the applicant was not at fault. These should not be treated as equivalent without separate risk evidence.'
  }

  if (
    firstConcept === 'Not-at-fault claims' &&
    secondConcept === 'At-fault accidents'
  ) {
    explanation =
      'Material difference: one rule concerns claims where the applicant was not at fault, while the other concerns at-fault accidents. These should not be treated as equivalent without separate risk evidence.'
  }

  if (!sameCategory) {
    explanation +=
      ' The rules are also assigned to different dataset categories.'
  } else if (!sameConcept) {
    explanation +=
      ' Although the dataset categories match, the underlying criteria differ.'
  }

  return {
    firstConcept,
    secondConcept,
    sameConcept,
    explanation,
  }
}

export function findSimilarRules(
  selectedRule: Rule,
  allRules: Rule[],
  limit = 5,
) {
  return allRules
    .filter((rule) => rule.id !== selectedRule.id)
    .map((rule) => {
      const similarity = similarityScore(selectedRule, rule)
      const comparison = explainSimilarity(selectedRule, rule)

      return {
        rule,
        similarity,
        sameCategory: rule.category === selectedRule.category,
        sameConcept: comparison.sameConcept,
        firstConcept: comparison.firstConcept,
        secondConcept: comparison.secondConcept,
        explanation: comparison.explanation,
      }
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}
