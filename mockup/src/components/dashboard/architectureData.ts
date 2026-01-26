// Architecture Diagram Data for Argo Note
// Logic Tree Structure: Level 0 (Overview) → Level 1 (Layers) → Level 2 (Modules)

export type IssueLevel = "high" | "medium" | "low";
export type IssueCategory = "interface" | "responsibility" | "error-handling" | "data-flow" | "state" | "schema" | "security" | "performance";

export interface Issue {
  id: string;
  title: string;
  description: string;
  level: IssueLevel;
  category: IssueCategory;
  location?: string;
  solution?: string;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  level: 0 | 1 | 2;
  parentId?: string;
  children?: string[];
  diagram: DiagramData;
  issues: Issue[];
}

export interface DiagramNode {
  id: string;
  label: string;
  type: "user" | "service" | "database" | "external" | "process" | "storage" | "layer";
  position: { x: number; y: number };
  color?: string;
  icon?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed" | "dotted";
  animated?: boolean;
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: { id: string; label: string; nodeIds: string[]; color?: string }[];
}

// ============================================================================
// Level 0: System Overview
// ============================================================================

const systemOverviewDiagram: DiagramData = {
  nodes: [
    // Application Layer (top section)
    { id: "user", label: "User", type: "user", position: { x: 50, y: 150 } },
    { id: "dashboard", label: "Next.js Dashboard", type: "service", position: { x: 200, y: 150 }, color: "#3b82f6" },
    { id: "api", label: "Backend API", type: "service", position: { x: 380, y: 150 }, color: "#3b82f6" },
    { id: "supabase", label: "Supabase\n(PostgreSQL + Auth)", type: "database", position: { x: 290, y: 280 }, color: "#22c55e" },
    { id: "inngest", label: "Inngest Worker", type: "process", position: { x: 560, y: 150 }, color: "#a855f7" },
    // AI Logic Layer (right section)
    { id: "llm", label: "Gemini 3.0 Pro\n(LiteLLM)", type: "external", position: { x: 780, y: 80 }, color: "#f59e0b" },
    { id: "tavily", label: "Tavily API", type: "external", position: { x: 780, y: 200 }, color: "#f59e0b" },
    { id: "scraper", label: "Firecrawl/Jina", type: "external", position: { x: 780, y: 320 }, color: "#f59e0b" },
    // Infrastructure Layer (bottom section - separated by 150px gap)
    { id: "wp_multi", label: "WordPress Multisite", type: "service", position: { x: 500, y: 500 }, color: "#ef4444" },
    { id: "cloudflare", label: "Cloudflare\n(CDN/WAF/R2)", type: "external", position: { x: 300, y: 500 }, color: "#f97316" },
    { id: "readers", label: "Blog Readers", type: "user", position: { x: 100, y: 500 } },
  ],
  edges: [
    { from: "user", to: "dashboard", label: "Browser" },
    { from: "dashboard", to: "api", label: "API Call" },
    { from: "api", to: "supabase", label: "Query" },
    { from: "api", to: "inngest", label: "Job Queue" },
    { from: "inngest", to: "llm", label: "Generate", animated: true },
    { from: "inngest", to: "tavily", label: "Search" },
    { from: "inngest", to: "scraper", label: "Crawl" },
    { from: "inngest", to: "wp_multi", label: "Post Article" },
    { from: "wp_multi", to: "cloudflare", label: "CDN" },
    { from: "readers", to: "cloudflare", label: "Access" },
  ],
  groups: [
    { id: "app_layer", label: "Application Layer (Vercel)", nodeIds: ["dashboard", "api", "supabase", "inngest"], color: "#3b82f620" },
    { id: "ai_layer", label: "AI Logic Layer", nodeIds: ["llm", "tavily", "scraper"], color: "#f59e0b20" },
    { id: "infra_layer", label: "Infrastructure Layer (DigitalOcean)", nodeIds: ["wp_multi", "cloudflare"], color: "#ef444420" },
  ],
};

// ============================================================================
// Level 1: Frontend Architecture
// ============================================================================

const frontendDiagram: DiagramData = {
  nodes: [
    { id: "browser", label: "Browser", type: "user", position: { x: 50, y: 220 } },
    { id: "nextjs", label: "Next.js 14+\n(App Router)", type: "service", position: { x: 200, y: 220 }, color: "#000000" },
    { id: "react", label: "React 19\n(RSC)", type: "service", position: { x: 380, y: 80 }, color: "#61dafb" },
    { id: "tailwind", label: "Tailwind CSS", type: "service", position: { x: 380, y: 220 }, color: "#38bdf8" },
    { id: "shadcn", label: "Shadcn/UI\n(Radix)", type: "service", position: { x: 380, y: 360 }, color: "#ffffff" },
    { id: "framer", label: "Framer Motion", type: "service", position: { x: 560, y: 80 }, color: "#ff0055" },
    { id: "zustand", label: "Zustand\n(Global State)", type: "service", position: { x: 560, y: 220 }, color: "#764abc" },
    { id: "tanstack", label: "TanStack Query\n(Server State)", type: "service", position: { x: 560, y: 360 }, color: "#ff4154" },
    { id: "rhf", label: "React Hook Form\n+ Zod", type: "service", position: { x: 740, y: 220 }, color: "#ec5990" },
    { id: "supabase_auth", label: "Supabase Auth\n(Google OAuth)", type: "external", position: { x: 740, y: 400 }, color: "#3ecf8e" },
  ],
  edges: [
    { from: "browser", to: "nextjs", label: "Request" },
    { from: "nextjs", to: "react", label: "Render" },
    { from: "nextjs", to: "tailwind", label: "Styling" },
    { from: "nextjs", to: "shadcn", label: "Components" },
    { from: "react", to: "framer", label: "Animation" },
    { from: "react", to: "zustand", label: "UI State" },
    { from: "react", to: "tanstack", label: "Data Fetch" },
    { from: "tanstack", to: "rhf", label: "Form Data" },
    { from: "nextjs", to: "supabase_auth", label: "Auth", style: "dashed" },
  ],
};

// ============================================================================
// Level 1: Backend & Database Architecture
// ============================================================================

const backendDiagram: DiagramData = {
  nodes: [
    { id: "api_routes", label: "Next.js API Routes\n(Serverless)", type: "service", position: { x: 80, y: 220 }, color: "#000000" },
    { id: "prisma", label: "Prisma ORM", type: "service", position: { x: 260, y: 220 }, color: "#2d3748" },
    { id: "supabase_pg", label: "Supabase\nPostgreSQL 16+", type: "database", position: { x: 440, y: 160 }, color: "#3ecf8e" },
    { id: "mariadb", label: "MariaDB\n(WordPress)", type: "database", position: { x: 440, y: 340 }, color: "#c0765a" },
    { id: "inngest_worker", label: "Inngest\n(Job Queue)", type: "process", position: { x: 260, y: 400 }, color: "#a855f7" },
    { id: "stripe", label: "Stripe\n(Payment)", type: "external", position: { x: 80, y: 400 }, color: "#635bff" },
    { id: "users_table", label: "Users", type: "storage", position: { x: 620, y: 60 }, color: "#22c55e" },
    { id: "sites_table", label: "Sites", type: "storage", position: { x: 760, y: 60 }, color: "#22c55e" },
    { id: "articles_table", label: "Articles", type: "storage", position: { x: 620, y: 160 }, color: "#22c55e" },
    { id: "jobs_table", label: "Jobs", type: "storage", position: { x: 760, y: 160 }, color: "#22c55e" },
    { id: "schedules_table", label: "Schedules", type: "storage", position: { x: 690, y: 260 }, color: "#22c55e" },
  ],
  edges: [
    { from: "api_routes", to: "prisma", label: "Query" },
    { from: "prisma", to: "supabase_pg", label: "SQL" },
    { from: "prisma", to: "mariadb", label: "WP Data", style: "dashed" },
    { from: "api_routes", to: "inngest_worker", label: "Enqueue Job" },
    { from: "api_routes", to: "stripe", label: "Payment" },
    { from: "supabase_pg", to: "users_table" },
    { from: "supabase_pg", to: "sites_table" },
    { from: "supabase_pg", to: "articles_table" },
    { from: "supabase_pg", to: "jobs_table" },
    { from: "supabase_pg", to: "schedules_table" },
  ],
  groups: [
    { id: "tables", label: "Core Tables", nodeIds: ["users_table", "sites_table", "articles_table", "jobs_table", "schedules_table"], color: "#22c55e20" },
  ],
};

// ============================================================================
// Level 1: Infrastructure & WordPress
// ============================================================================

const infrastructureDiagram: DiagramData = {
  nodes: [
    { id: "do_vps", label: "DigitalOcean VPS\n($24/mo)", type: "service", position: { x: 380, y: 80 }, color: "#0080ff" },
    { id: "nginx", label: "Nginx", type: "service", position: { x: 280, y: 200 }, color: "#009639" },
    { id: "php_fpm", label: "PHP-FPM 8.2", type: "service", position: { x: 420, y: 200 }, color: "#777bb4" },
    { id: "wp_core", label: "WordPress\nMultisite Core", type: "service", position: { x: 560, y: 200 }, color: "#21759b" },
    { id: "site_a", label: "Site A\n(Virtual)", type: "service", position: { x: 420, y: 340 }, color: "#21759b" },
    { id: "site_b", label: "Site B\n(Virtual)", type: "service", position: { x: 560, y: 340 }, color: "#21759b" },
    { id: "site_n", label: "Site N\n(100 sites max)", type: "service", position: { x: 700, y: 340 }, color: "#21759b" },
    { id: "mariadb_local", label: "MariaDB\n(Same VPS)", type: "database", position: { x: 720, y: 200 }, color: "#c0765a" },
    { id: "redis", label: "Redis\n(Object Cache)", type: "database", position: { x: 720, y: 80 }, color: "#dc382d" },
    { id: "cf_dns", label: "Cloudflare DNS", type: "external", position: { x: 80, y: 60 }, color: "#f38020" },
    { id: "cf_cdn", label: "Cloudflare CDN", type: "external", position: { x: 80, y: 160 }, color: "#f38020" },
    { id: "cf_waf", label: "Cloudflare WAF", type: "external", position: { x: 80, y: 260 }, color: "#f38020" },
    { id: "cf_r2", label: "Cloudflare R2\n(Media)", type: "storage", position: { x: 80, y: 360 }, color: "#f38020" },
    { id: "readers", label: "Blog Readers", type: "user", position: { x: 80, y: 480 } },
  ],
  edges: [
    { from: "readers", to: "cf_cdn", label: "HTTPS" },
    { from: "cf_cdn", to: "cf_waf", label: "Filter" },
    { from: "cf_waf", to: "nginx", label: "Proxy" },
    { from: "nginx", to: "php_fpm", label: "FastCGI" },
    { from: "php_fpm", to: "wp_core", label: "Execute" },
    { from: "wp_core", to: "site_a" },
    { from: "wp_core", to: "site_b" },
    { from: "wp_core", to: "site_n" },
    { from: "wp_core", to: "mariadb_local", label: "Query" },
    { from: "wp_core", to: "redis", label: "Cache", style: "dashed" },
    { from: "wp_core", to: "cf_r2", label: "Media", style: "dashed" },
    { from: "cf_dns", to: "do_vps", label: "Route" },
  ],
  groups: [
    { id: "cloudflare", label: "Cloudflare (Free Tier)", nodeIds: ["cf_dns", "cf_cdn", "cf_waf", "cf_r2"], color: "#f3802020" },
    { id: "vps_internal", label: "VPS Internal", nodeIds: ["nginx", "php_fpm", "wp_core", "mariadb_local", "redis"], color: "#0080ff20" },
  ],
};

// ============================================================================
// Level 1: AI Pipeline
// ============================================================================

const aiPipelineDiagram: DiagramData = {
  nodes: [
    { id: "phase_a", label: "Phase A\nProduct Understanding", type: "process", position: { x: 120, y: 80 }, color: "#3b82f6" },
    { id: "phase_b", label: "Phase B\nBuyer Thinking", type: "process", position: { x: 290, y: 80 }, color: "#8b5cf6" },
    { id: "phase_c", label: "Phase C\nKeyword Research", type: "process", position: { x: 460, y: 80 }, color: "#ec4899" },
    { id: "phase_d", label: "Phase D\nCompetitor Analysis", type: "process", position: { x: 630, y: 80 }, color: "#f97316" },
    { id: "phase_e", label: "Phase E\nCluster Design", type: "process", position: { x: 630, y: 260 }, color: "#eab308" },
    { id: "phase_f", label: "Phase F\nArticle Generation", type: "process", position: { x: 460, y: 260 }, color: "#22c55e" },
    { id: "phase_g", label: "Phase G\nPerformance Opt", type: "process", position: { x: 290, y: 260 }, color: "#06b6d4" },
    { id: "firecrawl", label: "Firecrawl", type: "external", position: { x: 120, y: 200 }, color: "#f59e0b" },
    { id: "jina", label: "Jina Reader", type: "external", position: { x: 120, y: 300 }, color: "#f59e0b" },
    { id: "gemini", label: "Gemini 3.0 Pro", type: "external", position: { x: 460, y: 380 }, color: "#4285f4" },
    { id: "tavily", label: "Tavily API", type: "external", position: { x: 630, y: 380 }, color: "#10b981" },
    { id: "keywords_api", label: "Keywords Everywhere\n/ DataForSEO", type: "external", position: { x: 630, y: -20 }, color: "#6366f1" },
    { id: "gsc", label: "Google Search\nConsole", type: "external", position: { x: 290, y: 380 }, color: "#ea4335" },
    { id: "inngest", label: "Inngest\n(Orchestrator)", type: "service", position: { x: 120, y: 400 }, color: "#a855f7" },
  ],
  edges: [
    { from: "phase_a", to: "phase_b", animated: true },
    { from: "phase_b", to: "phase_c", animated: true },
    { from: "phase_c", to: "phase_d", animated: true },
    { from: "phase_d", to: "phase_e", animated: true },
    { from: "phase_e", to: "phase_f", animated: true },
    { from: "phase_f", to: "phase_g", animated: true },
    { from: "phase_a", to: "firecrawl", label: "Crawl" },
    { from: "phase_a", to: "jina", label: "Fallback", style: "dashed" },
    { from: "phase_c", to: "keywords_api", label: "Volume" },
    { from: "phase_d", to: "tavily", label: "SERP" },
    { from: "phase_f", to: "gemini", label: "Generate" },
    { from: "phase_g", to: "gsc", label: "Metrics" },
    { from: "inngest", to: "phase_a", style: "dashed" },
    { from: "inngest", to: "phase_f", style: "dashed" },
  ],
  groups: [
    { id: "pipeline", label: "SEO Strategy Pipeline", nodeIds: ["phase_a", "phase_b", "phase_c", "phase_d", "phase_e", "phase_f", "phase_g"], color: "#3b82f620" },
  ],
};

// ============================================================================
// Level 2: Auth Flow
// ============================================================================

const authFlowDiagram: DiagramData = {
  nodes: [
    { id: "user", label: "User", type: "user", position: { x: 50, y: 180 } },
    { id: "login_page", label: "Login Page", type: "service", position: { x: 180, y: 180 }, color: "#3b82f6" },
    { id: "google_oauth", label: "Google OAuth", type: "external", position: { x: 340, y: 80 }, color: "#4285f4" },
    { id: "supabase_auth", label: "Supabase Auth", type: "service", position: { x: 340, y: 220 }, color: "#3ecf8e" },
    { id: "jwt", label: "JWT Token", type: "storage", position: { x: 500, y: 150 }, color: "#f59e0b" },
    { id: "session", label: "Session\nManagement", type: "service", position: { x: 500, y: 290 }, color: "#a855f7" },
    { id: "dashboard", label: "Dashboard", type: "service", position: { x: 680, y: 150 }, color: "#22c55e" },
    { id: "wp_sso", label: "WordPress SSO\n(Phase 9)", type: "service", position: { x: 680, y: 320 }, color: "#21759b" },
  ],
  edges: [
    { from: "user", to: "login_page", label: "Visit" },
    { from: "login_page", to: "google_oauth", label: "Redirect" },
    { from: "google_oauth", to: "supabase_auth", label: "Callback" },
    { from: "supabase_auth", to: "jwt", label: "Issue" },
    { from: "jwt", to: "session", label: "Store" },
    { from: "session", to: "dashboard", label: "Access" },
    { from: "session", to: "wp_sso", label: "SSO Token", style: "dashed" },
  ],
};

// ============================================================================
// Level 2: Data Flow
// ============================================================================

const dataFlowDiagram: DiagramData = {
  nodes: [
    { id: "product_input", label: "Product URL\n/ Input", type: "user", position: { x: 50, y: 160 } },
    { id: "analysis", label: "Analysis\n(Phase A-E)", type: "process", position: { x: 200, y: 160 }, color: "#8b5cf6" },
    { id: "products_db", label: "products\n(analysis_result)", type: "database", position: { x: 200, y: 320 }, color: "#22c55e" },
    { id: "cluster_design", label: "Cluster\nDesign", type: "process", position: { x: 380, y: 160 }, color: "#ec4899" },
    { id: "clusters_db", label: "article_clusters", type: "database", position: { x: 380, y: 320 }, color: "#22c55e" },
    { id: "generation", label: "Article\nGeneration", type: "process", position: { x: 560, y: 160 }, color: "#f97316" },
    { id: "articles_db", label: "articles", type: "database", position: { x: 560, y: 320 }, color: "#22c55e" },
    { id: "wp_sync", label: "WordPress\nSync", type: "process", position: { x: 740, y: 160 }, color: "#21759b" },
    { id: "wp_posts", label: "wp_posts\n(MariaDB)", type: "database", position: { x: 740, y: 320 }, color: "#c0765a" },
  ],
  edges: [
    { from: "product_input", to: "analysis", animated: true },
    { from: "analysis", to: "products_db", label: "Store" },
    { from: "analysis", to: "cluster_design", animated: true },
    { from: "cluster_design", to: "clusters_db", label: "Store" },
    { from: "cluster_design", to: "generation", animated: true },
    { from: "generation", to: "articles_db", label: "Store" },
    { from: "generation", to: "wp_sync", animated: true },
    { from: "wp_sync", to: "wp_posts", label: "Sync" },
  ],
};

// ============================================================================
// Level 2: Scaling Strategy
// ============================================================================

const scalingDiagram: DiagramData = {
  nodes: [
    { id: "phase1_label", label: "Phase 1: MVP\n(0-100 Users)", type: "layer", position: { x: 100, y: 50 }, color: "#22c55e" },
    { id: "single_vps", label: "Single VPS\n$24/mo\n2vCPU/4GB", type: "service", position: { x: 100, y: 160 }, color: "#0080ff" },
    { id: "phase2_label", label: "Phase 2: Growth\n(100-500 Users)", type: "layer", position: { x: 340, y: 50 }, color: "#f59e0b" },
    { id: "scaled_vps", label: "Scaled VPS\n$48-96/mo\n4vCPU/8GB", type: "service", position: { x: 340, y: 160 }, color: "#0080ff" },
    { id: "redis_req", label: "Redis\n(Required)", type: "database", position: { x: 340, y: 290 }, color: "#dc382d" },
    { id: "phase3_label", label: "Phase 3: Scale\n(500+ Users)", type: "layer", position: { x: 600, y: 50 }, color: "#ef4444" },
    { id: "node_a", label: "Node A\n(500 users)", type: "service", position: { x: 540, y: 160 }, color: "#0080ff" },
    { id: "node_b", label: "Node B\n(New users)", type: "service", position: { x: 680, y: 160 }, color: "#0080ff" },
    { id: "cf_lb", label: "Cloudflare\nDNS Routing", type: "external", position: { x: 610, y: 290 }, color: "#f38020" },
  ],
  edges: [
    { from: "phase1_label", to: "single_vps" },
    { from: "phase2_label", to: "scaled_vps" },
    { from: "scaled_vps", to: "redis_req", label: "Cache" },
    { from: "phase3_label", to: "node_a" },
    { from: "phase3_label", to: "node_b" },
    { from: "cf_lb", to: "node_a", label: "Route" },
    { from: "cf_lb", to: "node_b", label: "Route" },
    { from: "single_vps", to: "scaled_vps", style: "dashed", label: "Upgrade" },
    { from: "scaled_vps", to: "node_a", style: "dashed", label: "Split" },
  ],
};

// ============================================================================
// Issues Data (From Integration Risk Report)
// ============================================================================

const systemOverviewIssues: Issue[] = [
  {
    id: "FP-011",
    title: "生存確率評価: 約20-30%",
    description: "現計画での成功確率は約20-30%と評価。AI記事品質未検証、「放置OK」と実装の矛盾、参入障壁の欠如、タイムライン達成率30-40%が主要リスク。",
    level: "high",
    category: "interface",
    solution: "MVP前にAI記事品質の実証実験を実施。「放置OK」の定義を明確化し、技術的に担保可能な範囲を限定。",
  },
  {
    id: "FP-010",
    title: "参入障壁が存在しない",
    description: "技術的障壁低（全てパブリックAPI）、資本障壁低（$100/月で開始可能）、ネットワーク効果なし、データ効果は将来的。",
    level: "high",
    category: "interface",
    solution: "Phase 15（Prompt Intelligence）を前倒し。ユーザーコミュニティ形成。独自データセット構築。",
  },
  {
    id: "CV-001",
    title: "「認知負荷軽減」と「7フェーズパイプライン」の矛盾",
    description: "ターゲットはSEO知識がない人だが、実装は7フェーズSEO戦略に基づく複雑なフロー。選択肢が多すぎてユーザーの介入が必要。",
    level: "high",
    category: "interface",
    solution: "MVP段階では7フェーズを簡易版に縮小。複雑なSEO戦略はPhase 7以降のアドバンスド機能として分離。",
  },
  {
    id: "CV-002",
    title: "「下書き保存」と「放置OK」の矛盾",
    description: "訴求は「放置OK」だがデフォルト動作は下書き保存でユーザー確認→公開が必須。「時間がない」というペインが解決できていない。",
    level: "high",
    category: "interface",
    solution: "Option A: 自動公開をデフォルトに変更。Option B: ターゲットを「コンテンツマネージャー」に変更し訴求を修正。",
  },
  {
    id: "CV-003",
    title: "予算$100/月とAPI費用の矛盾",
    description: "50ユーザー時点でTavily $50、Firecrawl $50-100、Keywords API等で合計$150-200/月となり予算超過の可能性。",
    level: "high",
    category: "performance",
    solution: "MVP段階では外部API依存を最小化。Tavily、Firecrawlは成長フェーズで追加。コスト試算を詳細化。",
  },
  {
    id: "CV-004",
    title: "MVP 1ヶ月完成と7フェーズ全装の時間的矛盾",
    description: "必要工数33-43日に対し30日しかない。Phase 2（AIコア）の複雑性が過大でテスト期間も確保されていない。",
    level: "high",
    category: "performance",
    solution: "MVP v1は最小限（Phase 1, 2簡易版, 3, 5）に絞り、v1.1（3ヶ月目）でスケジュール自動化等を追加。",
  },
  {
    id: "FP-001",
    title: "サービス価値の再確認",
    description: "サービスの核となる価値についてプロジェクトオーナーとの再確認が必要。",
    level: "medium",
    category: "interface",
    solution: "プロジェクトオーナーとの協議により価値定義を確定。",
  },
  {
    id: "CV-005",
    title: "「オールインワン」と「外部ツール依存」の矛盾",
    description: "一気通貫を謳うが7-8個の外部サービス（Firecrawl, Tavily, Gemini, DO, Cloudflare等）に依存。1つが障害で全体停止リスク。",
    level: "medium",
    category: "interface",
    solution: "MVP必須APIを最小化（Supabase, Gemini, DO, Cloudflare, Inngestのみ）。Tavily, Firecrawlは成長フェーズで追加。",
  },
  {
    id: "FP-008",
    title: "1ヶ月でMVP完成は物理的に不可能",
    description: "必要工数33-43日 vs 30日。達成可能は全体の30-40%程度。タイムラインの再設計が必須。",
    level: "high",
    category: "performance",
    solution: "スコープ削減（Phase B-E除外）、または期限延長（2ヶ月）を検討。",
  },
  {
    id: "FP-012",
    title: "市場規模が不明確",
    description: "「バイブコーダー」というニッチの規模が未検証。日本市場だけでは100ユーザーが上限の可能性。",
    level: "medium",
    category: "interface",
    solution: "ターゲット1000人へのサーベイでPMF確認。グローバル展開を前提とした設計。",
  },
];

const frontendIssues: Issue[] = [
  {
    id: "IR-012",
    title: "フォーム状態管理の責務不明確",
    description: "React Hook Form + Zodの使用は明記されているが、サーバーアクション連携時の状態管理パターンが未定義。",
    level: "medium",
    category: "state",
    location: "01_Frontend_Architecture.md",
    solution: "Server Actionsとの連携パターンを定義。useFormStatusフックの活用方針を明確化。",
  },
  {
    id: "CV-006",
    title: "「PC版のみ」と「認知負荷最小化」の矛盾",
    description: "ターゲットが開発者でもモバイル確認ニーズは存在。レスポンシブ対応をPhase 7まで延期することの妥当性要検討。",
    level: "low",
    category: "interface",
    solution: "MVP期間中はPC版に集中し、基本的なモバイル表示崩れだけは防ぐ最低限のCSS対応を実施。",
  },
];

const backendIssues: Issue[] = [
  {
    id: "IR-001",
    title: "products.analysis_result (JSONB) のスキーマ未定義",
    description: "Phase A〜Eの各処理出力構造が不明確。フロントエンド開発者が型推測で実装しRuntimeエラーのリスク。単体テスト作成不可能。",
    level: "high",
    category: "schema",
    location: "02_Backend_Database.md:110",
    solution: "ProductAnalysisResult型を定義し、各フェーズの出力スキーマを明確化。Zodスキーマで実行時バリデーション。",
  },
  {
    id: "IR-002",
    title: "jobs.payload (JSONB) の型定義なし",
    description: "各job_typeに対応するpayload構造が未定義。APIとInngest Worker間でキー名不一致が発生するリスク。",
    level: "high",
    category: "schema",
    location: "02_Backend_Database.md:141-154",
    solution: "JobPayload discriminated unionを定義。各job_type用のPayload型を厳密に定義。",
  },
  {
    id: "IR-004",
    title: "API Route ↔ Inngest の同期/非同期判定基準なし",
    description: "どの処理を同期で行い、どこから非同期に委譲するか不明確。エンドポイントごとの責務分界が曖昧。",
    level: "high",
    category: "responsibility",
    location: "02_Backend_Database.md:9-12",
    solution: "同期/非同期判定表を作成。POST /api/productsはDB保存まで同期、分析は非同期等を明確化。",
  },
  {
    id: "IR-006",
    title: "Prisma - MariaDB接続の二重DB構成",
    description: "SupabaseとMariaDBの二重DB構成でトランザクション整合性が担保できない可能性。",
    level: "medium",
    category: "data-flow",
    solution: "クロスDB操作は必要最小限に。失敗時のリカバリフローを明文化。",
  },
  {
    id: "IR-008",
    title: "articles.content の形式未確定",
    description: "DB保存形式がHTML/Markdownのどちらか未確定。WordPress REST APIとの整合性が不明。",
    level: "medium",
    category: "schema",
    location: "02_Backend_Database.md:131",
    solution: "DB保存形式をHTMLに統一。生成時はMarkdown→HTML変換（marked.js使用）。",
  },
  {
    id: "IR-009",
    title: "jobs と article_generation_logs の責務重複",
    description: "ジョブ管理とAI生成ログの責務が重複。どちらに何を記録するか不明確。",
    level: "medium",
    category: "responsibility",
    solution: "jobs=実行状態管理、article_generation_logs=トレーサビリティ。job_idで関連付け。",
  },
  {
    id: "IR-023",
    title: "articles.status の値不足",
    description: "draft, published, archivedのみで、generating, review, failedが欠落。生成進捗を表示できない。",
    level: "high",
    category: "schema",
    solution: "status値を拡張: draft → generating → review → published → archived / failed",
  },
  {
    id: "IR-017",
    title: "Subscription状態の同期メカニズム未定義",
    description: "Stripe Webhookによるリアルタイム同期と日次整合性チェックの詳細が未定義。",
    level: "medium",
    category: "data-flow",
    solution: "Stripe Webhook（customer.subscription.updated等）で同期。日次でStripe APIとの差分チェック。",
  },
  {
    id: "IR-020",
    title: "ステータスカラム命名の不統一",
    description: "users.subscription_status（プレフィックス付き）とsites.status（なし）で命名規則が不統一。",
    level: "low",
    category: "schema",
    solution: "全て status に統一（users テーブルのみ例外として許容）。",
  },
  {
    id: "IR-021",
    title: "イベント/ジョブ名の不統一",
    description: "WRITE_ARTICLE、GENERATE_ARTICLE、generate-for-${user.id}と3種類の名称が混在。",
    level: "medium",
    category: "interface",
    solution: "job_type=SCREAMING_SNAKE、Inngest event=kebab-case、関数名=camelCaseで統一。",
  },
  {
    id: "IR-027",
    title: "products.site_id の ON DELETE 未指定",
    description: "サイト削除時の動作が不定。外部キー参照のカスケード動作が未定義。",
    level: "medium",
    category: "schema",
    solution: "ON DELETE SET NULL を追加。",
  },
];

const infrastructureIssues: Issue[] = [
  {
    id: "IR-003",
    title: "VPS管理用SSHキー管理方法が未定義",
    description: "wp site createをSSH経由で実行する際のキー管理・セキュリティ方針が未定義。",
    level: "high",
    category: "security",
    location: "03_Infrastructure_Ops.md:96-99",
    solution: "SSHキーの保管場所（Vercel環境変数 or Secrets Manager）を決定。IP制限の併用を検討。",
  },
  {
    id: "IR-005",
    title: "Provisionerの定義なし",
    description: "Provisionerが何か（サービス？関数？）未定義。SSH認証情報の管理責任が不明。",
    level: "high",
    category: "responsibility",
    solution: "Provisioner = Inngest Function。/src/inngest/functions/provision-blog.tsに実装。",
  },
  {
    id: "MA-003",
    title: "100サイト制限の根拠が不明確",
    description: "「100サイトまで単一VPS」の制限がどの指標に基づくか不明。実測データなし。",
    level: "medium",
    category: "performance",
    solution: "負荷テストを実施し、実際のサイト数制限を算出。監視閾値を設定。",
  },
  {
    id: "MA-013",
    title: "WordPress Multisite最大懸念リスク",
    description: "全サイトに影響する障害リスク、プラグイン競合、DB肥大化の対策は明記されているが監視体制が重要。",
    level: "high",
    category: "responsibility",
    solution: "監視閾値設定: DBテーブル4500超で警告、ディスク70%警告/80%緊急、レスポンス3秒超で警告。",
  },
  {
    id: "IR-038",
    title: "Redis Object Cache必須化タイミング不明",
    description: "Phase 1ではオプション、Phase 2で必須とされるが、トリガー条件（ユーザー数？レスポンス時間？）が未定義。",
    level: "medium",
    category: "performance",
    solution: "必須化条件: アクティブユーザー50以上、またはWP管理画面の平均レスポンス > 3秒。",
  },
  {
    id: "IR-039",
    title: "CDNキャッシュ戦略の未定義",
    description: "キャッシュ対象、TTL設定、キャッシュパージ方法が未定義。",
    level: "medium",
    category: "performance",
    solution: "静的ファイル: TTL 1年、HTML: キャッシュなし、パージ: Cloudflare API経由。",
  },
  {
    id: "FP-004",
    title: "WordPress Multisiteは最適解か",
    description: "Multisiteは運営者の都合でありユーザー価値ではない。障害リスク（全サイト影響）は「放置OK」訴求と根本矛盾。",
    level: "medium",
    category: "interface",
    solution: "有事の移管手順書を事前作成。Phase 7以降でHeadless CMS代替案を継続検討。",
  },
];

const aiPipelineIssues: Issue[] = [
  {
    id: "IR-003",
    title: "Tavily API→LLM入力のマッピング未定義",
    description: "「生データをLLMで解釈」とだけ記述。具体的なJSON構造、プロンプトテンプレートへの渡し方が不明。",
    level: "high",
    category: "interface",
    location: "04_AI_Pipeline.md:100-112",
    solution: "TavilyToLLMInput型を定義。search_query, top_results, analysis_promptの構造を明確化。",
  },
  {
    id: "IR-014",
    title: "LLM設定の環境変数→DB移行戦略なし",
    description: "Phase 1-11は環境変数（LLM_MODEL）、Phase 12でDB管理へ移行だが、移行戦略が未定義。",
    level: "medium",
    category: "data-flow",
    solution: "Phase 12でusersテーブルにpreferred_llm_modelカラム追加。優先順位: user設定 > 環境変数。",
  },
  {
    id: "IR-015",
    title: "Promptテンプレート管理の移行戦略なし",
    description: "Phase 0-2はGit管理、Phase 3でDB導入、Phase 15で完全移行とあるが、移行手順が未定義。",
    level: "medium",
    category: "data-flow",
    solution: "Phase 3でprompt_templatesテーブル導入。初期データはYAMLからインポート。",
  },
  {
    id: "FP-001",
    title: "AI記事品質が未検証",
    description: "生成記事の品質（SEO効果、読者エンゲージメント）の実証データがない。ビジネスモデルの前提が未検証。",
    level: "high",
    category: "interface",
    solution: "MVP前に10-20記事を生成し、GSC連携なしでも手動でパフォーマンスを追跡。",
  },
  {
    id: "FP-005",
    title: "7フェーズSEOパイプラインの必要性",
    description: "MVPに必要なのはPhase A + F + Gのみ。Phase B-EはSEO効果保証しないと矛盾。",
    level: "high",
    category: "interface",
    solution: "MVP段階ではPhase B-Eを外部API依存を避けた簡易版で実装。成長期に拡張。",
  },
  {
    id: "IR-041",
    title: "外部APIレート制限の統一がない",
    description: "SSOトークン生成は1分間5回制限があるが、Tavily API、LLM APIのレート制限が未定義。",
    level: "high",
    category: "performance",
    solution: "グローバルAPI: 100リクエスト/分/ユーザー、記事生成: 10リクエスト/時/ユーザー。",
  },
  {
    id: "IR-042",
    title: "Inngestステップ上限との整合性",
    description: "Inngest無料枠25,000ステップ/月に対し、1記事あたりのステップ数と月間生成可能記事数が未定義。",
    level: "medium",
    category: "performance",
    solution: "1記事生成: 約10ステップ。25,000÷10=2,500記事/月。100ユーザー想定: 25記事/月/ユーザー。",
  },
];

const authFlowIssues: Issue[] = [
  {
    id: "IR-009",
    title: "SSOトークン有効期限の設計不明",
    description: "WordPress SSOトークンの有効期限、リフレッシュ方針が未定義。セキュリティリスク。",
    level: "medium",
    category: "security",
    location: "02_Backend_Database.md:243",
    solution: "トークン有効期限を5分に設定。ワンタイム使用とし、使用後は即時無効化。",
  },
  {
    id: "MA-023",
    title: "GSC/GA OAuth連携の定義不足",
    description: "独自ドメイン時のGSC/GA OAuth連携フローが未定義。ユーザーの成果トラッキングに影響。",
    level: "medium",
    category: "interface",
    solution: "OAuth 2.0のスコープ、トークン管理、リフレッシュフローを詳細設計。",
  },
];

const dataFlowIssues: Issue[] = [
  {
    id: "IR-010",
    title: "articles.contentの最大サイズ未定義",
    description: "TEXT型で最大サイズが不明。長文記事でパフォーマンス問題の可能性。",
    level: "medium",
    category: "schema",
    solution: "目標文字数（5000-10000字）を定義。超過時は分割または警告。",
  },
  {
    id: "IR-011",
    title: "wp_post_idとarticles.idの整合性管理",
    description: "Supabase側のarticlesとMariaDB側のwp_postsの整合性を保つ仕組みが未定義。",
    level: "medium",
    category: "data-flow",
    solution: "同期ジョブで定期的に整合性チェック。不整合時はアラート発報。",
  },
];

const scalingIssues: Issue[] = [
  {
    id: "MA-004",
    title: "スケールアウト時のユーザー割り当てロジック",
    description: "Node A/Bへのユーザー振り分けロジックが未定義。既存ユーザーの移行方針も不明。",
    level: "medium",
    category: "responsibility",
    solution: "新規ユーザーは空きNode、既存ユーザーは移行不要（作成時Node固定）のポリシーを採用。",
  },
  {
    id: "FP-007",
    title: "予算$100/月でのスケール限界",
    description: "VPS $24 + Supabase Free + 各種API費用で$100/月の予算制約。100ユーザー超でコスト増。",
    level: "medium",
    category: "performance",
    solution: "100ユーザー時点で収益性を評価。黒字化していれば予算増、そうでなければピボット検討。",
  },
];

// ============================================================================
// Level 2: Inngest Job Flow
// ============================================================================

const inngestJobDiagram: DiagramData = {
  nodes: [
    { id: "trigger", label: "Job Trigger\n(API/Schedule)", type: "user", position: { x: 50, y: 180 } },
    { id: "inngest_recv", label: "Inngest\nReceive", type: "process", position: { x: 200, y: 180 }, color: "#a855f7" },
    { id: "job_queue", label: "Job Queue\n(jobs table)", type: "database", position: { x: 200, y: 340 }, color: "#22c55e" },
    { id: "step_1", label: "Step 1\nAnalyze", type: "process", position: { x: 380, y: 80 }, color: "#3b82f6" },
    { id: "step_2", label: "Step 2\nGenerate", type: "process", position: { x: 380, y: 200 }, color: "#3b82f6" },
    { id: "step_3", label: "Step 3\nPublish", type: "process", position: { x: 380, y: 320 }, color: "#3b82f6" },
    { id: "retry", label: "Retry Logic\n(Exponential)", type: "process", position: { x: 540, y: 180 }, color: "#f59e0b" },
    { id: "success", label: "Success\nCallback", type: "service", position: { x: 700, y: 80 }, color: "#22c55e" },
    { id: "failure", label: "Failure\nNotification", type: "service", position: { x: 700, y: 280 }, color: "#ef4444" },
    { id: "email", label: "Email Alert", type: "external", position: { x: 840, y: 280 }, color: "#f97316" },
  ],
  edges: [
    { from: "trigger", to: "inngest_recv", label: "Enqueue" },
    { from: "inngest_recv", to: "job_queue", label: "Store" },
    { from: "inngest_recv", to: "step_1", animated: true },
    { from: "step_1", to: "step_2", animated: true },
    { from: "step_2", to: "step_3", animated: true },
    { from: "step_1", to: "retry", style: "dashed", label: "Error" },
    { from: "step_2", to: "retry", style: "dashed", label: "Error" },
    { from: "step_3", to: "retry", style: "dashed", label: "Error" },
    { from: "retry", to: "step_1", style: "dashed", label: "Retry" },
    { from: "step_3", to: "success", label: "Complete" },
    { from: "retry", to: "failure", label: "Max Retries" },
    { from: "failure", to: "email", label: "Alert" },
  ],
  groups: [
    { id: "steps", label: "Inngest Steps", nodeIds: ["step_1", "step_2", "step_3"], color: "#3b82f620" },
  ],
};

const inngestJobIssues: Issue[] = [
  {
    id: "IR-013",
    title: "ステップ間の状態受け渡し方法が未定義",
    description: "Inngestのstep間でデータを渡す際の構造化方法が未定義。大きなデータの場合の対処法も不明。",
    level: "medium",
    category: "data-flow",
    solution: "step.runの戻り値で必要最小限のIDのみ渡し、詳細データはDBから取得するパターンを採用。",
  },
  {
    id: "IR-014",
    title: "リトライ時の冪等性が担保されていない",
    description: "同じジョブが複数回実行された場合の重複防止策が未定義。記事が重複投稿されるリスク。",
    level: "high",
    category: "error-handling",
    solution: "ジョブIDとステップ名でユニークキーを生成し、既に完了済みのステップはスキップ。",
  },
];

// ============================================================================
// Level 2: WordPress Sync Flow
// ============================================================================

const wpSyncDiagram: DiagramData = {
  nodes: [
    { id: "article", label: "Generated\nArticle", type: "storage", position: { x: 50, y: 180 }, color: "#22c55e" },
    { id: "sync_job", label: "SYNC_WP\nJob", type: "process", position: { x: 200, y: 180 }, color: "#a855f7" },
    { id: "wp_cli", label: "WP-CLI\n(SSH)", type: "service", position: { x: 380, y: 80 }, color: "#21759b" },
    { id: "wp_rest", label: "WP REST API\n(Backup)", type: "service", position: { x: 380, y: 220 }, color: "#21759b" },
    { id: "wp_db", label: "MariaDB\n(wp_posts)", type: "database", position: { x: 560, y: 150 }, color: "#c0765a" },
    { id: "media_upload", label: "Media\nUpload", type: "process", position: { x: 560, y: 320 }, color: "#3b82f6" },
    { id: "r2_storage", label: "Cloudflare R2", type: "storage", position: { x: 740, y: 320 }, color: "#f38020" },
    { id: "cf_purge", label: "Cache Purge", type: "external", position: { x: 740, y: 150 }, color: "#f38020" },
    { id: "update_status", label: "Update\narticles.status", type: "database", position: { x: 200, y: 360 }, color: "#22c55e" },
  ],
  edges: [
    { from: "article", to: "sync_job", label: "Trigger" },
    { from: "sync_job", to: "wp_cli", label: "Primary", animated: true },
    { from: "sync_job", to: "wp_rest", label: "Fallback", style: "dashed" },
    { from: "wp_cli", to: "wp_db", label: "Insert" },
    { from: "wp_rest", to: "wp_db", label: "Insert" },
    { from: "sync_job", to: "media_upload", label: "Images" },
    { from: "media_upload", to: "r2_storage", label: "Store" },
    { from: "wp_db", to: "cf_purge", label: "Trigger" },
    { from: "sync_job", to: "update_status", label: "Complete" },
  ],
};

const wpSyncIssues: Issue[] = [
  {
    id: "IR-015",
    title: "WP-CLIとREST APIの切り替え条件が不明",
    description: "SSH接続失敗時にREST APIへフォールバックする条件やタイムアウト値が未定義。",
    level: "medium",
    category: "error-handling",
    solution: "SSH接続タイムアウト10秒、3回リトライ後にREST APIへ切り替え。",
  },
  {
    id: "IR-016",
    title: "メディアファイルのURL整合性",
    description: "R2に保存した画像のURLがWordPress側で正しく参照できるか未検証。",
    level: "medium",
    category: "data-flow",
    solution: "R2のpublic URLをWordPressのwp-config.phpで定数定義し、一貫性を担保。",
  },
];

// ============================================================================
// Level 2: Article Generation Sequence
// ============================================================================

const articleGenSequenceDiagram: DiagramData = {
  nodes: [
    { id: "user_req", label: "User Request", type: "user", position: { x: 50, y: 180 } },
    { id: "api_recv", label: "API\nReceive", type: "service", position: { x: 180, y: 180 }, color: "#3b82f6" },
    { id: "validate", label: "Validate\nInput", type: "process", position: { x: 310, y: 180 }, color: "#8b5cf6" },
    { id: "enqueue", label: "Enqueue\nJob", type: "process", position: { x: 440, y: 180 }, color: "#a855f7" },
    { id: "planner", label: "Planner\n(Structure)", type: "process", position: { x: 570, y: 60 }, color: "#ec4899" },
    { id: "tavily_call", label: "Tavily\nSearch", type: "external", position: { x: 720, y: 60 }, color: "#10b981" },
    { id: "writer", label: "Writer\n(Content)", type: "process", position: { x: 570, y: 180 }, color: "#f97316" },
    { id: "gemini_call", label: "Gemini\nGenerate", type: "external", position: { x: 720, y: 180 }, color: "#4285f4" },
    { id: "editor", label: "Editor\n(Polish)", type: "process", position: { x: 570, y: 300 }, color: "#06b6d4" },
    { id: "save_db", label: "Save to\narticles", type: "database", position: { x: 440, y: 300 }, color: "#22c55e" },
    { id: "response", label: "Response\nto User", type: "service", position: { x: 180, y: 300 }, color: "#3b82f6" },
  ],
  edges: [
    { from: "user_req", to: "api_recv", label: "POST" },
    { from: "api_recv", to: "validate", animated: true },
    { from: "validate", to: "enqueue", animated: true },
    { from: "enqueue", to: "planner", animated: true },
    { from: "planner", to: "tavily_call", label: "SERP" },
    { from: "planner", to: "writer", animated: true },
    { from: "writer", to: "gemini_call", label: "LLM" },
    { from: "writer", to: "editor", animated: true },
    { from: "editor", to: "save_db", label: "Store" },
    { from: "save_db", to: "response", label: "ID" },
    { from: "response", to: "user_req", style: "dashed", label: "202 Accepted" },
  ],
  groups: [
    { id: "generation", label: "Generation Pipeline", nodeIds: ["planner", "writer", "editor"], color: "#f59e0b20" },
  ],
};

const articleGenIssues: Issue[] = [
  {
    id: "IR-017",
    title: "生成中のキャンセル処理が未定義",
    description: "ユーザーが記事生成をキャンセルした場合の中間状態のクリーンアップ方法が未定義。",
    level: "medium",
    category: "state",
    solution: "Inngestのcancel機能を使用。キャンセル時は中間データを削除せず、status=cancelledでマーク。",
  },
  {
    id: "FP-003",
    title: "生成時間のSLA未定義",
    description: "1記事あたりの生成時間目標が未設定。ユーザー期待値とのギャップが発生する可能性。",
    level: "medium",
    category: "performance",
    solution: "目標: 3-5分/記事。UIに推定時間を表示し、期待値を管理。",
  },
];

// ============================================================================
// Level 2: Error Handling Flow
// ============================================================================

const errorHandlingDiagram: DiagramData = {
  nodes: [
    { id: "error_source", label: "Error Source\n(LLM/API/WP)", type: "process", position: { x: 50, y: 180 }, color: "#ef4444" },
    { id: "inngest_catch", label: "Inngest\nError Catch", type: "process", position: { x: 200, y: 180 }, color: "#a855f7" },
    { id: "error_type", label: "Error Type\nClassification", type: "process", position: { x: 380, y: 180 }, color: "#3b82f6" },
    { id: "retry_logic", label: "Retry Logic\n(Exponential)", type: "process", position: { x: 380, y: 60 }, color: "#f59e0b" },
    { id: "user_notify", label: "User\nNotification", type: "service", position: { x: 560, y: 100 }, color: "#22c55e" },
    { id: "admin_alert", label: "Admin Alert\n(Sentry/Slack)", type: "external", position: { x: 560, y: 240 }, color: "#ef4444" },
    { id: "dashboard_ui", label: "Dashboard\nError Display", type: "service", position: { x: 740, y: 100 }, color: "#3b82f6" },
    { id: "email_notify", label: "Email\nNotification", type: "external", position: { x: 740, y: 240 }, color: "#f97316" },
    { id: "jobs_update", label: "Update\njobs.status", type: "database", position: { x: 200, y: 340 }, color: "#22c55e" },
  ],
  edges: [
    { from: "error_source", to: "inngest_catch", label: "Throw" },
    { from: "inngest_catch", to: "error_type", label: "Classify" },
    { from: "inngest_catch", to: "jobs_update", label: "Log" },
    { from: "error_type", to: "retry_logic", label: "Retryable", style: "dashed" },
    { from: "error_type", to: "user_notify", label: "User Error" },
    { from: "error_type", to: "admin_alert", label: "System Error" },
    { from: "retry_logic", to: "error_source", label: "Retry", style: "dashed" },
    { from: "user_notify", to: "dashboard_ui" },
    { from: "user_notify", to: "email_notify" },
  ],
  groups: [
    { id: "notification", label: "Notification Layer", nodeIds: ["user_notify", "admin_alert", "dashboard_ui", "email_notify"], color: "#22c55e20" },
  ],
};

const errorHandlingIssues: Issue[] = [
  {
    id: "IR-006",
    title: "エラー発生時のUI/通知フロー未定義",
    description: "MVP〜Phase 11の間、エラー時のUIが存在しない。Inngest内エラー→API→フロントエンドへの伝播経路が未定義。",
    level: "high",
    category: "error-handling",
    location: "02_Backend_Database.md:378-384",
    solution: "エラー種別ごとのHTTP Status、ユーザー表示、対応アクションを定義。ダッシュボードにジョブ状況一覧を表示。",
  },
  {
    id: "IR-007",
    title: "WordPress API エラー時の処理未定義",
    description: "wp_api_token無効化時の検知・通知メカニズム、HTTP 403/500時のリトライ vs ユーザー通知の判断基準が未定義。",
    level: "high",
    category: "error-handling",
    location: "05_Sequence_Diagrams.md:150",
    solution: "401/403はユーザー通知、500/502はリトライ後に通知。sites.statusをauth_required等に更新。",
  },
  {
    id: "IR-018",
    title: "リトライ間隔の矛盾",
    description: "通常は1分→5分→15分だがWordPress投稿失敗時のみ最終間隔が30分。どの間隔を採用すべきか不明確。",
    level: "medium",
    category: "error-handling",
    solution: "リトライ間隔を統一（1分→5分→15分）。",
  },
  {
    id: "IR-019",
    title: "タイムアウト値の矛盾",
    description: "LLMタイムアウト30秒 vs 記事生成全体10分の関係が不明。1記事生成で何回LLM呼び出しが発生するか未定義。",
    level: "medium",
    category: "performance",
    solution: "LLM単一呼び出し30秒、記事生成全体10分（最大20回のLLM呼び出しを想定）と明確化。",
  },
];

// ============================================================================
// Level 2: Payment & Billing Flow
// ============================================================================

const paymentFlowDiagram: DiagramData = {
  nodes: [
    { id: "user", label: "User", type: "user", position: { x: 50, y: 180 } },
    { id: "pricing_page", label: "Pricing Page", type: "service", position: { x: 180, y: 180 }, color: "#3b82f6" },
    { id: "stripe_checkout", label: "Stripe\nCheckout", type: "external", position: { x: 340, y: 180 }, color: "#635bff" },
    { id: "webhook_recv", label: "Webhook\nReceiver", type: "service", position: { x: 500, y: 180 }, color: "#3b82f6" },
    { id: "users_update", label: "Update\nusers.subscription", type: "database", position: { x: 660, y: 80 }, color: "#22c55e" },
    { id: "billing_log", label: "billing_history\nInsert", type: "database", position: { x: 660, y: 220 }, color: "#22c55e" },
    { id: "provision_trigger", label: "Trigger\nProvisioning", type: "process", position: { x: 820, y: 150 }, color: "#a855f7" },
    { id: "email_confirm", label: "Confirmation\nEmail", type: "external", position: { x: 820, y: 290 }, color: "#f97316" },
  ],
  edges: [
    { from: "user", to: "pricing_page", label: "Select Plan" },
    { from: "pricing_page", to: "stripe_checkout", label: "Redirect", animated: true },
    { from: "stripe_checkout", to: "webhook_recv", label: "Event" },
    { from: "webhook_recv", to: "users_update", label: "Sync" },
    { from: "webhook_recv", to: "billing_log", label: "Log" },
    { from: "users_update", to: "provision_trigger", label: "New User" },
    { from: "webhook_recv", to: "email_confirm", label: "Notify" },
  ],
};

const paymentFlowIssues: Issue[] = [
  {
    id: "IR-032",
    title: "billing_history.amount の型",
    description: "現在INTEGERで定義だが、Stripeはセント単位で金額を扱う。データ型の不一致リスク。",
    level: "medium",
    category: "schema",
    solution: "amount_cents INTEGERに変更。currency VARCHAR(3) DEFAULT 'jpy'を追加。",
  },
  {
    id: "IR-045",
    title: "Stripe Webhook のログ記録不足",
    description: "webhook_signature検証のログ、重複処理検知ログ（idempotency key）が未定義。",
    level: "medium",
    category: "security",
    solution: "stripe_webhook_logsテーブルを作成。event_id UNIQUE制約で重複検知。",
  },
  {
    id: "FP-006",
    title: "$20/月は持続可能か",
    description: "50ユーザー時の収入$1,000に対し、APIコスト$135-300で損益分岐。スケール時のコスト試算がない。",
    level: "high",
    category: "performance",
    solution: "詳細なAPIコスト試算を実施。価格帯を$30-50/月に見直し、または外部API依存を最小化。",
  },
];

// ============================================================================
// Level 2: Security & Token Management
// ============================================================================

const securityFlowDiagram: DiagramData = {
  nodes: [
    { id: "wp_token", label: "WP API Token\n(AES-256-GCM)", type: "storage", position: { x: 80, y: 60 }, color: "#ef4444" },
    { id: "api_keys", label: "External API Keys\n(Env Vars)", type: "storage", position: { x: 80, y: 200 }, color: "#ef4444" },
    { id: "sso_token", label: "SSO Token\n(5min expiry)", type: "storage", position: { x: 80, y: 340 }, color: "#f59e0b" },
    { id: "vercel_secrets", label: "Vercel Secrets", type: "external", position: { x: 300, y: 130 }, color: "#000000" },
    { id: "supabase_vault", label: "Supabase\n(Encrypted)", type: "database", position: { x: 300, y: 270 }, color: "#3ecf8e" },
    { id: "runtime", label: "Runtime\n(Memory Only)", type: "process", position: { x: 520, y: 200 }, color: "#3b82f6" },
    { id: "key_rotation", label: "Key Rotation\n(90 days)", type: "process", position: { x: 520, y: 60 }, color: "#a855f7" },
    { id: "audit_log", label: "Audit Log", type: "database", position: { x: 520, y: 340 }, color: "#22c55e" },
  ],
  edges: [
    { from: "wp_token", to: "supabase_vault", label: "Encrypt" },
    { from: "api_keys", to: "vercel_secrets", label: "Store" },
    { from: "sso_token", to: "supabase_vault", label: "Store" },
    { from: "vercel_secrets", to: "runtime", label: "Load" },
    { from: "supabase_vault", to: "runtime", label: "Decrypt" },
    { from: "runtime", to: "audit_log", label: "Access Log" },
    { from: "key_rotation", to: "wp_token", label: "Rotate", style: "dashed" },
  ],
};

const securityFlowIssues: Issue[] = [
  {
    id: "IR-029",
    title: "WordPress API トークン暗号化の詳細不足",
    description: "暗号化キー管理方法（KMS vs 環境変数）、キーローテーション方針、トークン有効期限管理が未定義。",
    level: "high",
    category: "security",
    solution: "暗号化キーはVercel Environment Variables、キーローテーション90日ごと、有効期限は無期限（Application Password）。",
  },
  {
    id: "IR-030",
    title: "Tavily API キーの管理方法が未定義",
    description: "Tavily API キーの保存位置、暗号化方法、レート制限時の処理、漏洩時の対応が未定義。",
    level: "medium",
    category: "security",
    solution: "Vercel Environment Variables（TAVILY_API_KEY）で管理。429エラー時は指数バックオフでリトライ。",
  },
  {
    id: "IR-031",
    title: "SSO トークン有効期限の未定義",
    description: "WordPress SSOトークンのデフォルト有効期限、リフレッシュ方針が未定義。セキュリティリスク。",
    level: "medium",
    category: "security",
    solution: "デフォルト有効期限5分。トークン再利用禁止（used=trueで無効化）。IP制限オプション。",
  },
  {
    id: "IR-043",
    title: "ユーザー操作ログテーブル欠落",
    description: "ダッシュボードでのアクション（記事削除、スケジュール変更など）のログテーブルが未定義。",
    level: "medium",
    category: "security",
    solution: "user_activity_logsテーブルを作成。action, target_type, target_id, ip_address等を記録。",
  },
];

// ============================================================================
// Architecture Nodes Definition
// ============================================================================

export const architectureNodes: ArchitectureNode[] = [
  // Level 0: System Overview
  {
    id: "system-overview",
    name: "System Overview",
    nameJa: "システム全体概要",
    description: "Argo Noteの全体アーキテクチャ。Application Layer、AI Logic Layer、Infrastructure Layerの3層構成。",
    level: 0,
    children: ["frontend", "backend", "infrastructure", "ai-pipeline"],
    diagram: systemOverviewDiagram,
    issues: systemOverviewIssues,
  },

  // Level 1: Layers
  {
    id: "frontend",
    name: "Frontend Architecture",
    nameJa: "フロントエンド",
    description: "Next.js 14+ App Router、React 19、Tailwind CSS、Shadcn/UI、Framer Motionによるモダンなフロントエンド構成。",
    level: 1,
    parentId: "system-overview",
    children: ["auth-flow", "error-handling"],
    diagram: frontendDiagram,
    issues: frontendIssues,
  },
  {
    id: "backend",
    name: "Backend & Database",
    nameJa: "バックエンド・DB",
    description: "Next.js API Routes、Prisma ORM、Supabase PostgreSQL、Inngest Worker、Stripe連携のバックエンド構成。",
    level: 1,
    parentId: "system-overview",
    children: ["data-flow", "inngest-job", "wp-sync", "payment-flow", "security-flow"],
    diagram: backendDiagram,
    issues: backendIssues,
  },
  {
    id: "infrastructure",
    name: "Infrastructure & WordPress",
    nameJa: "インフラ・WordPress",
    description: "DigitalOcean VPS上のWordPress Multisite、Cloudflare（CDN/WAF/R2）、Nginx + PHP-FPMの実行基盤。",
    level: 1,
    parentId: "system-overview",
    children: ["scaling"],
    diagram: infrastructureDiagram,
    issues: infrastructureIssues,
  },
  {
    id: "ai-pipeline",
    name: "AI Pipeline",
    nameJa: "AIパイプライン",
    description: "SEO戦略駆動型7フェーズパイプライン。Phase A（理解）→ B（推論）→ C（調査）→ D（分析）→ E（設計）→ F（生成）→ G（最適化）。",
    level: 1,
    parentId: "system-overview",
    children: ["article-gen-sequence"],
    diagram: aiPipelineDiagram,
    issues: aiPipelineIssues,
  },

  // Level 2: Modules
  {
    id: "auth-flow",
    name: "Authentication Flow",
    nameJa: "認証フロー",
    description: "Google OAuth → Supabase Auth → JWT → Session管理 → WordPress SSO（Phase 9）の認証フロー。",
    level: 2,
    parentId: "frontend",
    diagram: authFlowDiagram,
    issues: authFlowIssues,
  },
  {
    id: "data-flow",
    name: "Data Flow",
    nameJa: "データフロー",
    description: "Product入力 → Analysis → Cluster設計 → Article生成 → WordPress同期のデータフロー。",
    level: 2,
    parentId: "backend",
    diagram: dataFlowDiagram,
    issues: dataFlowIssues,
  },
  {
    id: "scaling",
    name: "Scaling Strategy",
    nameJa: "スケーリング戦略",
    description: "Phase 1（MVP: 0-100ユーザー）→ Phase 2（Growth: 100-500）→ Phase 3（Scale: 500+）のスケーリングロードマップ。",
    level: 2,
    parentId: "infrastructure",
    diagram: scalingDiagram,
    issues: scalingIssues,
  },
  {
    id: "inngest-job",
    name: "Inngest Job Flow",
    nameJa: "Inngestジョブフロー",
    description: "ジョブトリガー → キュー → ステップ実行 → リトライ/成功/失敗の非同期処理フロー。",
    level: 2,
    parentId: "backend",
    diagram: inngestJobDiagram,
    issues: inngestJobIssues,
  },
  {
    id: "wp-sync",
    name: "WordPress Sync Flow",
    nameJa: "WordPress同期フロー",
    description: "記事データ → WP-CLI/REST API → MariaDB → メディアアップロード → キャッシュパージの同期フロー。",
    level: 2,
    parentId: "backend",
    diagram: wpSyncDiagram,
    issues: wpSyncIssues,
  },
  {
    id: "article-gen-sequence",
    name: "Article Generation Sequence",
    nameJa: "記事生成シーケンス",
    description: "リクエスト受信 → バリデーション → ジョブ投入 → Planner → Writer → Editor → 保存のシーケンス。",
    level: 2,
    parentId: "ai-pipeline",
    diagram: articleGenSequenceDiagram,
    issues: articleGenIssues,
  },
  {
    id: "error-handling",
    name: "Error Handling Flow",
    nameJa: "エラーハンドリング",
    description: "エラー発生 → 分類 → リトライ/通知 → UI表示/メール通知のエラーハンドリングフロー。",
    level: 2,
    parentId: "frontend",
    diagram: errorHandlingDiagram,
    issues: errorHandlingIssues,
  },
  {
    id: "payment-flow",
    name: "Payment & Billing Flow",
    nameJa: "決済・課金フロー",
    description: "料金プラン選択 → Stripe Checkout → Webhook → Subscription更新 → プロビジョニングの課金フロー。",
    level: 2,
    parentId: "backend",
    diagram: paymentFlowDiagram,
    issues: paymentFlowIssues,
  },
  {
    id: "security-flow",
    name: "Security & Token Management",
    nameJa: "セキュリティ・トークン管理",
    description: "APIキー管理 → 暗号化 → Vault保存 → ランタイム復号 → 監査ログのセキュリティフロー。",
    level: 2,
    parentId: "backend",
    diagram: securityFlowDiagram,
    issues: securityFlowIssues,
  },
];

// Helper functions
export function getNodeById(id: string): ArchitectureNode | undefined {
  return architectureNodes.find((node) => node.id === id);
}

export function getChildNodes(parentId: string): ArchitectureNode[] {
  return architectureNodes.filter((node) => node.parentId === parentId);
}

export function getRootNode(): ArchitectureNode {
  return architectureNodes.find((node) => node.level === 0)!;
}

export function getNodePath(nodeId: string): ArchitectureNode[] {
  const path: ArchitectureNode[] = [];
  let current = getNodeById(nodeId);

  while (current) {
    path.unshift(current);
    current = current.parentId ? getNodeById(current.parentId) : undefined;
  }

  return path;
}

export function getAllIssues(): Issue[] {
  return architectureNodes.flatMap((node) => node.issues);
}

export function getIssuesByLevel(level: IssueLevel): Issue[] {
  return getAllIssues().filter((issue) => issue.level === level);
}
