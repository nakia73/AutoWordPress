// Argo Note - Product Type Definitions
// Based on: docs/architecture/08_Integration_Risk_Report.md IR-001

// Product Analysis Result (JSONB schema) - IR-001
export type ProductAnalysisResult = {
  phaseA: PhaseAResult;
  phaseB: PhaseBResult;
  phaseC: PhaseCResult;
  phaseD: PhaseDResult;
  phaseE: PhaseEResult;
};

// Phase A: Product Analysis
export type PhaseAResult = {
  product_summary: string;
  target_audience: string;
  value_proposition: string;
};

// Phase B: Purchase Funnel Analysis
export type PhaseBResult = {
  purchase_funnel: {
    awareness: string[];
    interest: string[];
    consideration: string[];
    decision: string[];
  };
};

// Phase C: Keyword Research
export type KeywordIntent = 'informational' | 'transactional' | 'navigational';

export type KeywordData = {
  keyword: string;
  search_volume: number;
  difficulty: number;
  intent: KeywordIntent;
};

export type PhaseCResult = {
  keywords: KeywordData[];
};

// Phase D: Competitor Analysis
export type CompetitorData = {
  url: string;
  title: string;
  strengths: string[];
  gaps: string[];
};

export type PhaseDResult = {
  competitors: CompetitorData[];
};

// Phase E: Cluster Generation
export type ClusterArticle = {
  title: string;
  target_keyword: string;
  priority: number;
};

export type ArticleClusterPlan = {
  pillar_topic: string;
  articles: ClusterArticle[];
};

export type PhaseEResult = {
  clusters: ArticleClusterPlan[];
};

// Product Input Modes
export type ProductInputMode = 'url' | 'interactive' | 'research';

// Product Status
export const PRODUCT_STATUS = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// Persona Generation (A-1)
export type Persona = {
  name: string;
  demographics: {
    age_range: string;
    occupation: string;
    location: string;
  };
  pain_points: string[];
  goals: string[];
  product_fit: string;
};

export type PersonaResult = {
  personas: Persona[];
};

// Keyword Candidate Generation (A-1)
export type KeywordCategory = 'problem' | 'solution' | 'product' | 'comparison' | 'how-to';

export type KeywordCandidate = {
  keyword: string;
  category: KeywordCategory;
  search_intent: KeywordIntent;
  priority: number;
  rationale: string;
};

export type KeywordCandidateResult = {
  keyword_candidates: KeywordCandidate[];
};
