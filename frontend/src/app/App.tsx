import { useState } from "react";
import {
  LayoutDashboard, Columns3, Building2, Settings, Plus, X, TrendingUp,
  CheckCircle2, Clock, XCircle, Calendar, ChevronRight, Sparkles,
  Search, Bell, Briefcase, User, FileText, Download, Pencil, Trash2,
  Github, Linkedin, Globe, Upload, Check, Copy, ChevronDown, Star, Zap,
  Target, ExternalLink, UserPlus, Link2, Layers, Users, Edit3, ChevronUp,
  Wifi, WifiOff, AlertCircle, HelpCircle, Radio, RefreshCw, MapPin,
  ArrowRight, Lightbulb, TrendingDown, SlidersHorizontal,
  MessageCircle, Mail, BookOpen, Users2, Flame, Trophy, Hash, Code, Send, List,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Applied" | "HR Screen" | "Tech Interview" | "Offer" | "Rejected";
type View = "dashboard" | "pipeline" | "applications" | "profile" | "intel" | "radar" | "outreach" | "vault";
type OutreachStatus = "To Contact" | "Connection Sent" | "In Discussion" | "Coffee Chat" | "Ghosted" | "Replied";
type Tier = "tier1" | "tier2" | "archived";
type HiringStatus = "Actively Hiring" | "Selective" | "Hiring Freeze" | "Unknown";

interface Application {
  id: string; company: string; role: string; dateApplied: string;
  resumeVersion: string; status: Status; initial: string; color: string;
}
interface TechStackData { frontend: string[]; backend: string[]; infra: string[]; }
interface Connection { id: string; name: string; role: string; linkedin: string; }
interface TargetCompany {
  id: string; name: string; initial: string; color: string; industry: string;
  tier: Tier; hiringStatus: HiringStatus; techStack: TechStackData;
  techIcons: string[]; connections: Connection[]; notes: string;
  careersUrl: string; linkedinUrl: string; glassdoorUrl: string;
}
interface ResumeFile {
  id: string; title: string; subtitle: string; tags: string[];
  updatedAt: string; isPrimary: boolean; accentColor: string;
}
interface CoverSnippet { id: string; title: string; body: string; }
interface Opportunity {
  id: string; company: string; initial: string; companyColor: string;
  role: string; location: string; salary: string; postedAgo: string;
  matchScore: number; matchedSkills: string[]; missingSkills: string[];
  source: string; isRemote: boolean;
  addedToPipeline?: boolean; dismissed?: boolean;
}
interface Contact {
  id: string; name: string; title: string; company: string;
  companyColor: string; avatarInitial: string; avatarColor: string;
  status: OutreachStatus; nextActionDate: string; notes: string;
  linkedin: string; email: string;
  linkedApp?: { company: string; role: string };
}
interface VaultQuestion {
  id: string; question: string; answer: string; hasCode: boolean;
  codeSnippet?: string; tags: string[];
  companies: { name: string; initial: string; color: string }[];
  date: string; frequency: number;
}

// ─── Pipeline Constants ───────────────────────────────────────────────────────

const COLUMNS: { key: Status }[] = [
  { key: "Applied" }, { key: "HR Screen" }, { key: "Tech Interview" }, { key: "Offer" }, { key: "Rejected" },
];
const STATUS_BADGE: Record<Status, string> = {
  Applied: "bg-blue-50 text-blue-700 border border-blue-200",
  "HR Screen": "bg-amber-50 text-amber-700 border border-amber-200",
  "Tech Interview": "bg-violet-50 text-violet-700 border border-violet-200",
  Offer: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Rejected: "bg-red-50 text-red-600 border border-red-200",
};
const COLUMN_DOT: Record<Status, string> = {
  Applied: "bg-blue-500", "HR Screen": "bg-amber-500", "Tech Interview": "bg-violet-500",
  Offer: "bg-emerald-500", Rejected: "bg-red-400",
};
const PROGRESS_BAR: Record<Status, string> = {
  Applied: "bg-blue-400", "HR Screen": "bg-amber-400", "Tech Interview": "bg-violet-500",
  Offer: "bg-emerald-500", Rejected: "bg-red-400",
};

// ─── Intel Constants ──────────────────────────────────────────────────────────

const TECH_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  "React":        { label: "Re", bg: "#61DAFB", fg: "#0369A1" },
  "Next.js":      { label: "Nx", bg: "#171717", fg: "#FFFFFF" },
  "TypeScript":   { label: "TS", bg: "#3178C6", fg: "#FFFFFF" },
  "JavaScript":   { label: "JS", bg: "#F7DF1E", fg: "#111827" },
  "Electron":     { label: "El", bg: "#47848F", fg: "#FFFFFF" },
  "WebAssembly":  { label: "WA", bg: "#624DE8", fg: "#FFFFFF" },
  "Relay":        { label: "Ry", bg: "#F26B00", fg: "#FFFFFF" },
  "Java":         { label: "Jv", bg: "#E07000", fg: "#FFFFFF" },
  "Spring Boot":  { label: "Sp", bg: "#6DB33F", fg: "#FFFFFF" },
  "Go":           { label: "Go", bg: "#00ADD8", fg: "#FFFFFF" },
  "Rust":         { label: "Rs", bg: "#CE422B", fg: "#FFFFFF" },
  "Python":       { label: "Py", bg: "#3776AB", fg: "#FFFFFF" },
  "PyTorch":      { label: "PT", bg: "#EE4C2C", fg: "#FFFFFF" },
  "FastAPI":      { label: "FA", bg: "#009688", fg: "#FFFFFF" },
  "Node.js":      { label: "No", bg: "#339933", fg: "#FFFFFF" },
  "C++":          { label: "C+", bg: "#00599C", fg: "#FFFFFF" },
  "Ruby":         { label: "Rb", bg: "#CC342D", fg: "#FFFFFF" },
  "GraphQL":      { label: "GQ", bg: "#E10098", fg: "#FFFFFF" },
  "Edge Runtime": { label: "Er", bg: "#111827", fg: "#FFFFFF" },
  "Hack/PHP":     { label: "Ph", bg: "#777BB4", fg: "#FFFFFF" },
  "Scala":        { label: "Sc", bg: "#DC322F", fg: "#FFFFFF" },
  "gRPC":         { label: "gR", bg: "#244C5A", fg: "#FFFFFF" },
  "AWS":          { label: "AW", bg: "#FF9900", fg: "#111827" },
  "GCP":          { label: "GC", bg: "#4285F4", fg: "#FFFFFF" },
  "Azure":        { label: "Az", bg: "#0078D4", fg: "#FFFFFF" },
  "Kubernetes":   { label: "K8", bg: "#326CE5", fg: "#FFFFFF" },
  "K8s":          { label: "K8", bg: "#326CE5", fg: "#FFFFFF" },
  "Docker":       { label: "Do", bg: "#2496ED", fg: "#FFFFFF" },
  "PostgreSQL":   { label: "PG", bg: "#336791", fg: "#FFFFFF" },
  "Redis":        { label: "Rd", bg: "#DC382D", fg: "#FFFFFF" },
  "Kafka":        { label: "Kf", bg: "#231142", fg: "#FFFFFF" },
  "MongoDB":      { label: "Mg", bg: "#47A248", fg: "#FFFFFF" },
  "Cassandra":    { label: "Cs", bg: "#1287B1", fg: "#FFFFFF" },
  "NGINX":        { label: "Ng", bg: "#009900", fg: "#FFFFFF" },
  "Cloudflare":   { label: "Cf", bg: "#F6821F", fg: "#FFFFFF" },
  "Terraform":    { label: "Tf", bg: "#5C4EE5", fg: "#FFFFFF" },
  "Prometheus":   { label: "Pr", bg: "#E6522C", fg: "#FFFFFF" },
  "MySQL":        { label: "My", bg: "#4479A1", fg: "#FFFFFF" },
};
const HIRING_STATUS_BADGE: Record<HiringStatus, { style: string; icon: React.ElementType }> = {
  "Actively Hiring": { style: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: Wifi },
  "Selective":       { style: "bg-amber-50 text-amber-700 border border-amber-200",       icon: AlertCircle },
  "Hiring Freeze":   { style: "bg-red-50 text-red-600 border border-red-200",             icon: WifiOff },
  "Unknown":         { style: "bg-slate-100 text-slate-500 border border-slate-200",      icon: HelpCircle },
};

// ─── Radar Constants ──────────────────────────────────────────────────────────

const SOURCE_STYLE: Record<string, string> = {
  "LinkedIn":     "bg-blue-50 text-blue-700",
  "Company Site": "bg-slate-100 text-slate-600",
  "HN Hiring":    "bg-orange-50 text-orange-700",
  "Greenhouse":   "bg-emerald-50 text-emerald-700",
  "AngelList":    "bg-pink-50 text-pink-700",
  "Lever":        "bg-purple-50 text-purple-700",
};

const RADAR_OPPORTUNITIES: Opportunity[] = [
  { id: "op1", company: "Plaid", initial: "P", companyColor: "#000000", role: "Senior Backend Engineer — Payments Core", location: "Remote", salary: "$180k – $220k", postedAgo: "2h ago", matchScore: 94, matchedSkills: ["Java", "Spring Boot", "PostgreSQL", "REST APIs", "AWS"], missingSkills: ["gRPC"], source: "LinkedIn", isRemote: true },
  { id: "op2", company: "Datadog", initial: "D", companyColor: "#632CA6", role: "Backend Software Engineer — Observability", location: "New York / Remote", salary: "$160k – $200k", postedAgo: "4h ago", matchScore: 88, matchedSkills: ["Java", "Kafka", "PostgreSQL", "Docker", "Kubernetes"], missingSkills: ["Go", "Prometheus"], source: "Company Site", isRemote: true },
  { id: "op3", company: "Confluent", initial: "C", companyColor: "#CC0000", role: "Senior Software Engineer — Kafka Core", location: "Mountain View / Remote", salary: "$155k – $195k", postedAgo: "5h ago", matchScore: 91, matchedSkills: ["Java", "Kafka", "Spring Boot", "Docker", "Kubernetes"], missingSkills: ["Scala"], source: "LinkedIn", isRemote: true },
  { id: "op4", company: "Temporal", initial: "T", companyColor: "#141414", role: "Senior Software Engineer — Workflow Engine", location: "San Francisco / Remote", salary: "$165k – $205k", postedAgo: "8h ago", matchScore: 85, matchedSkills: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "System Design"], missingSkills: ["Go"], source: "AngelList", isRemote: true },
  { id: "op5", company: "Shopify", initial: "S", companyColor: "#96BF48", role: "Staff Engineer — Commerce Platform", location: "Remote", salary: "$190k – $240k", postedAgo: "1d ago", matchScore: 82, matchedSkills: ["Java", "PostgreSQL", "Redis", "Kafka", "System Design"], missingSkills: ["GraphQL", "Rust"], source: "Greenhouse", isRemote: true },
  { id: "op6", company: "PlanetScale", initial: "P", companyColor: "#2D2D2D", role: "Backend Engineer — Database Infrastructure", location: "Remote", salary: "$140k – $180k", postedAgo: "1d ago", matchScore: 76, matchedSkills: ["Java", "PostgreSQL", "System Design", "AWS", "Docker"], missingSkills: ["Go", "MySQL"], source: "Company Site", isRemote: true },
  { id: "op7", company: "HashiCorp", initial: "H", companyColor: "#1563FF", role: "Senior Backend Engineer — Vault", location: "Remote", salary: "$150k – $190k", postedAgo: "2d ago", matchScore: 71, matchedSkills: ["Java", "Docker", "Kubernetes", "REST APIs", "AWS"], missingSkills: ["Go", "Terraform"], source: "HN Hiring", isRemote: true },
  { id: "op8", company: "Warp", initial: "W", companyColor: "#01A4E9", role: "Backend Infrastructure Engineer", location: "San Francisco, CA", salary: "$145k – $185k", postedAgo: "2d ago", matchScore: 79, matchedSkills: ["Java", "AWS", "Docker", "Kubernetes", "Redis"], missingSkills: ["Rust"], source: "Company Site", isRemote: false },
  { id: "op9", company: "Neon", initial: "N", companyColor: "#00B899", role: "Backend Engineer — Serverless Postgres", location: "Remote", salary: "$130k – $165k", postedAgo: "3d ago", matchScore: 63, matchedSkills: ["PostgreSQL", "Docker", "Kubernetes", "AWS"], missingSkills: ["Rust", "Go"], source: "HN Hiring", isRemote: true },
];

const AI_INSIGHTS_DATA = [
  { icon: Zap,         text: "Adding Go to your skills would unlock 67 more backend engineering roles in your match feed.", impact: "+67 roles",  impactColor: "text-primary bg-accent" },
  { icon: TrendingUp,  text: "Your Java + Spring Boot combo places you in the top 8% of backend candidates on LinkedIn.", impact: "Top 8%",    impactColor: "text-emerald-700 bg-emerald-50" },
  { icon: AlertCircle, text: "3 of your Tier 1 targets posted new roles in the last 24h — act before they close.", impact: "3 new", impactColor: "text-amber-700 bg-amber-50" },
  { icon: Target,      text: "Confluent's open role is a 91% match. Applying in the first 24h improves callback rates 3×.", impact: "91% match", impactColor: "text-blue-700 bg-blue-50" },
];

const FEED_SOURCES = [
  { name: "LinkedIn",   count: 423, color: "#0A66C2" },
  { name: "Indeed",     count: 312, color: "#003A9B" },
  { name: "Greenhouse", count: 287, color: "#3BB273" },
  { name: "HN Hiring",  count: 148, color: "#FF6600" },
  { name: "AngelList",  count:  77, color: "#E91E8C" },
];

const SKILL_CATEGORIES = [
  { label: "Backend",        pct: 89, color: "bg-blue-500" },
  { label: "Infrastructure", pct: 71, color: "bg-violet-500" },
  { label: "Frontend",       pct: 64, color: "bg-amber-500" },
  { label: "ML / AI",        pct: 28, color: "bg-pink-500" },
];

const USER_SKILLS_ALL = ["Java", "Spring Boot", "PostgreSQL", "React", "TypeScript", "Docker", "Kubernetes", "Redis", "System Design", "REST APIs", "Kafka", "AWS"];

// ─── Outreach Constants ───────────────────────────────────────────────────────

const OUTREACH_STATUS_STYLE: Record<OutreachStatus, { badge: string; dot: string }> = {
  "To Contact":      { badge: "bg-slate-100 text-slate-600 border border-slate-200",      dot: "bg-slate-400" },
  "Connection Sent": { badge: "bg-blue-50 text-blue-700 border border-blue-200",          dot: "bg-blue-500" },
  "In Discussion":   { badge: "bg-violet-50 text-violet-700 border border-violet-200",    dot: "bg-violet-500" },
  "Coffee Chat":     { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "Ghosted":         { badge: "bg-red-50 text-red-600 border border-red-200",             dot: "bg-red-400" },
  "Replied":         { badge: "bg-teal-50 text-teal-700 border border-teal-200",          dot: "bg-teal-500" },
};

const INITIAL_CONTACTS: Contact[] = [
  { id: "ct1", name: "Sarah Chen", title: "Senior Recruiter", company: "Anthropic", companyColor: "#CC785C", avatarInitial: "SC", avatarColor: "#8B5CF6", status: "In Discussion", nextActionDate: "2026-06-25", notes: "Met at PyCon 2026. Very enthusiastic about the ML role. Safety team is expanding rapidly. Technical screening scheduled for next week — she mentioned two system design rounds.\n\nAction: Send prep materials + confirm time slot.", linkedin: "linkedin.com/in/sarah-chen-anthropic", email: "sarah.chen@anthropic.com", linkedApp: { company: "Anthropic", role: "ML Engineer" } },
  { id: "ct2", name: "James Park", title: "Backend Engineer", company: "Stripe", companyColor: "#635BFF", avatarInitial: "JP", avatarColor: "#0EA5E9", status: "Coffee Chat", nextActionDate: "2026-06-28", notes: "University alumni! Offered to do a mock interview prep session. We connected over distributed payment systems and idempotency design patterns.\n\nScheduled: Virtual coffee chat Sat 10am. Bring questions about eng culture + interview process.", linkedin: "linkedin.com/in/james-park-stripe", email: "jpark@stripe.com", linkedApp: { company: "Stripe", role: "Backend Engineer" } },
  { id: "ct3", name: "Amira Hassan", title: "Technical Recruiter", company: "Cloudflare", companyColor: "#F6821F", avatarInitial: "AH", avatarColor: "#F59E0B", status: "Connection Sent", nextActionDate: "2026-06-27", notes: "Sent cold outreach with personalized message about Workers platform and edge computing. Used the AIDA framework.\n\nMessage sent 2 days ago. Follow up if no reply by today.", linkedin: "linkedin.com/in/amira-hassan-cf", email: "ahassan@cloudflare.com", linkedApp: { company: "Cloudflare", role: "Systems Engineer" } },
  { id: "ct4", name: "David Kim", title: "Engineering Manager", company: "Notion", companyColor: "#202020", avatarInitial: "DK", avatarColor: "#10B981", status: "To Contact", nextActionDate: "2026-06-30", notes: "Found via LinkedIn. Former Google L6, manages the document sync team — perfect angle for a CRDT / real-time collab conversation.\n\nPlan: Reference his recent blog post on operational transforms, mention shared interest in real-time collaboration research.", linkedin: "linkedin.com/in/david-kim-notion", email: "", linkedApp: undefined },
  { id: "ct5", name: "Priya Mehta", title: "Principal Engineer", company: "Linear", companyColor: "#5E6AD2", avatarInitial: "PM", avatarColor: "#EC4899", status: "Ghosted", nextActionDate: "2026-06-22", notes: "Sent connection + personalized note 3 weeks ago. No response. Profile viewed but no action.\n\nStrategy: Wait one more week then try a different approach via mutual connection (James Park knows her from a conference).", linkedin: "linkedin.com/in/priya-mehta-linear", email: "", linkedApp: { company: "Linear", role: "Product Engineer" } },
  { id: "ct6", name: "Marcus Johnson", title: "Staff Engineer", company: "Vercel", companyColor: "#171717", avatarInitial: "MJ", avatarColor: "#7C3AED", status: "Replied", nextActionDate: "2026-07-02", notes: "Replied within 48 hours — very enthusiastic! Suggested contributing to Next.js issue tracker before formal application.\n\nAction: Open a meaningful PR this week. Marcus said the team specifically looks for OSS contributions as a signal.", linkedin: "linkedin.com/in/marcus-j-vercel", email: "mjohnson@vercel.com", linkedApp: { company: "Vercel", role: "Staff Engineer" } },
];

// ─── Vault Constants ──────────────────────────────────────────────────────────

const INITIAL_QUESTIONS: VaultQuestion[] = [
  { id: "vq1", question: "Explain Dependency Injection in Spring Framework. When should you prefer constructor injection over @Autowired field injection?", answer: "DI is a design pattern where dependencies are provided externally rather than created inside the class. Spring supports three types:\n\n1. Constructor injection — preferred: makes dependencies explicit, enables immutability (final fields), easier to unit-test without container\n2. Setter injection — optional dependencies only\n3. Field injection (@Autowired) — convenient but hides dependencies, can't use final, harder to test\n\nAlways prefer constructor injection for mandatory dependencies. Spring auto-detects single-constructor classes without needing @Autowired.", hasCode: true, codeSnippet: "@Service\npublic class UserService {\n  private final UserRepository repo;\n  private final EmailService email;\n\n  // Spring injects automatically — no @Autowired needed\n  public UserService(UserRepository repo, EmailService email) {\n    this.repo  = repo;\n    this.email = email;\n  }\n}", tags: ["Spring Boot", "Java", "Design Patterns"], companies: [{ name: "Stripe", initial: "S", color: "#635BFF" }, { name: "Cloudflare", initial: "C", color: "#F6821F" }, { name: "Anthropic", initial: "A", color: "#CC785C" }], date: "2026-06-20", frequency: 3 },
  { id: "vq2", question: "Design a distributed rate limiter. What algorithms would you use and how does Redis help?", answer: "Common algorithms:\n• Token Bucket — allows controlled bursts, refills at fixed rate. Best general-purpose choice.\n• Sliding Window Log — perfectly accurate, but memory-intensive (stores every request timestamp)\n• Fixed Window Counter — simple, but allows 2× burst at window boundaries\n• Sliding Window Counter — hybrid, approximates sliding log with much less memory\n\nRedis advantages: atomic operations via Lua scripts prevent race conditions, TTL for automatic key expiry, Cluster mode for horizontal scale, sub-millisecond latency.", hasCode: true, codeSnippet: "-- Atomic Lua script (Token Bucket in Redis)\nlocal key    = KEYS[1]\nlocal limit  = tonumber(ARGV[1])\nlocal window = tonumber(ARGV[2])\nlocal current = redis.call('INCR', key)\nif current == 1 then\n  redis.call('EXPIRE', key, window)\nend\nreturn current <= limit", tags: ["System Design", "Redis", "Backend", "Distributed Systems"], companies: [{ name: "Anthropic", initial: "A", color: "#CC785C" }, { name: "Notion", initial: "N", color: "#202020" }], date: "2026-06-18", frequency: 5 },
  { id: "vq3", question: "What is the N+1 problem in JPA/Hibernate and how do you resolve it?", answer: "N+1 occurs when fetching N entities triggers N additional queries for each entity's lazy-loaded association.\n\nExample: fetching 100 Users then accessing user.getOrders() fires 100 extra SELECT queries = 101 total.\n\nSolutions (in order of preference):\n1. JPQL FETCH JOIN — eagerly loads in a single query\n2. @EntityGraph — declarative, avoids modifying query\n3. @BatchSize — Hibernate fetches in batches (e.g., 25 at a time)\n4. DTO projections — select only needed columns, bypasses entity graph entirely", hasCode: true, codeSnippet: "// ❌ N+1 problem\nList<User> users = userRepo.findAll();\nusers.forEach(u -> log(u.getOrders().size())); // 100 extra queries!\n\n// ✅ Fix 1: FETCH JOIN\n@Query(\"SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.active = true\")\nList<User> findAllWithOrders();\n\n// ✅ Fix 2: Entity Graph\n@EntityGraph(attributePaths = {\"orders\", \"orders.items\"})\nList<User> findByActiveTrue();", tags: ["Java", "Spring Boot", "SQL", "PostgreSQL"], companies: [{ name: "Linear", initial: "L", color: "#5E6AD2" }], date: "2026-06-15", frequency: 2 },
  { id: "vq4", question: "Tell me about a time you had to make a critical production decision under pressure. Walk me through your process.", answer: "STAR Answer:\n\nSituation: During Black Friday our payment service started returning 503s at 10:30 PM. Transaction volume was 10× normal.\n\nTask: As on-call engineer I had 15 minutes before SLA breach and major revenue impact.\n\nAction:\n1. Checked dashboards immediately — found DB connection pool exhaustion\n2. Rolled back the last deployment (connection pool config change)\n3. Increased pool size as immediate mitigation\n4. Opened incident channel, drafted status page update\n5. Led 30-min post-mortem next morning\n\nResult: Service restored in 8 minutes. Zero lost transactions. Implemented connection pool alerting going forward.", hasCode: false, tags: ["Behavioral", "Leadership", "Production"], companies: [{ name: "Stripe", initial: "S", color: "#635BFF" }, { name: "Vercel", initial: "V", color: "#171717" }], date: "2026-06-12", frequency: 4 },
  { id: "vq5", question: "Explain optimistic vs pessimistic locking in databases. When would you choose each?", answer: "Pessimistic Locking:\n• Acquires a lock when reading (SELECT FOR UPDATE)\n• Other transactions block until lock is released\n• Use when: high contention, short transactions, data integrity is critical\n• Risk: deadlocks, lower throughput\n\nOptimistic Locking:\n• No lock on read — uses a @Version column\n• On UPDATE: checks if version changed; throws OptimisticLockException if so\n• Use when: low contention, read-heavy workloads, distributed systems\n• Risk: retry logic required on conflict\n\nIn Spring Data JPA: @Version annotation handles optimistic locking automatically.", hasCode: true, codeSnippet: "@Entity\npublic class BankAccount {\n  @Id\n  private Long id;\n\n  @Version          // Optimistic locking\n  private Long version;\n\n  private BigDecimal balance;\n\n  // Pessimistic: use in repository\n  // @Lock(LockModeType.PESSIMISTIC_WRITE)\n  // Optional<BankAccount> findById(Long id);\n}", tags: ["PostgreSQL", "Spring Boot", "Java", "Databases"], companies: [{ name: "Confluent", initial: "C", color: "#CC0000" }, { name: "Anthropic", initial: "A", color: "#CC785C" }], date: "2026-06-10", frequency: 2 },
  { id: "vq6", question: "How does Kafka guarantee message ordering, and what are the tradeoffs?", answer: "Kafka guarantees ordering ONLY within a single partition.\n\nKey design points:\n• Messages with the same key always route to the same partition (consistent hashing)\n• A partition is consumed by exactly one consumer in a group at a time\n• Global ordering across partitions is NOT guaranteed\n\nTradeoffs:\n• More partitions → more parallelism, higher throughput, but no cross-partition order\n• Fewer partitions → stronger ordering guarantees, but becomes a throughput bottleneck\n• Key-based partitioning (e.g., user_id) ensures per-entity ordering is maintained\n\nFor strict global ordering: use a single partition — but this limits throughput to one consumer.", hasCode: true, codeSnippet: "// Entity-level ordering via message key\nproducer.send(\n  new ProducerRecord<>(\n    \"order-events\",\n    orderId.toString(),   // ← same key = same partition = ordered\n    orderCreatedEvent\n  )\n);\n\n// Consumer — each partition processed sequentially\n@KafkaListener(topics = \"order-events\", groupId = \"order-service\")\npublic void handle(OrderEvent event) { ... }", tags: ["Kafka", "System Design", "Distributed Systems", "Backend"], companies: [{ name: "Datadog", initial: "D", color: "#632CA6" }, { name: "Confluent", initial: "C", color: "#CC0000" }], date: "2026-06-08", frequency: 3 },
];

// ─── Streak Data ──────────────────────────────────────────────────────────────

const HEATMAP_CELLS: number[] = (() => {
  const arr = new Array(364).fill(0);
  // Current 12-day streak (most recent days)
  [5, 3, 7, 4, 2, 6, 3, 5, 4, 8, 3, 5].forEach((v, i) => { arr[363 - i] = v; });
  // Longest streak: 18 days, ending ~70 days ago
  for (let i = 70; i <= 87; i++) arr[363 - i] = 2 + (i % 5);
  // Fill remaining with pseudo-random historical data
  for (let i = 0; i < 364; i++) {
    if (arr[i] === 0) {
      const s = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453);
      const v = s - Math.floor(s);
      arr[i] = v < 0.42 ? 0 : v < 0.62 ? 1 : v < 0.78 ? 3 : v < 0.92 ? 5 : 7;
    }
  }
  return arr;
})();

const TODAY_ACTIVITIES = [
  { icon: Briefcase,      color: "#635BFF", text: "Applied to Plaid — Senior Backend Engineer",           time: "10:23 AM" },
  { icon: MessageCircle,  color: "#0D9488", text: "Sent follow-up to James Park at Stripe",               time: "11:45 AM" },
  { icon: Code,           color: "#7C3AED", text: "Solved 2 LeetCode mediums (Rate Limiter, LRU Cache)",  time: "2:30 PM"  },
  { icon: FileText,       color: "#E07000", text: "Updated Backend Focus resume — added Kafka section",   time: "4:15 PM"  },
];

// ─── App Data ─────────────────────────────────────────────────────────────────

const INITIAL_APPS: Application[] = [
  { id: "1", company: "Stripe", role: "Backend Engineer", dateApplied: "2026-06-20", resumeVersion: "v3", status: "Applied", initial: "S", color: "#635BFF" },
  { id: "2", company: "Vercel", role: "Staff Engineer", dateApplied: "2026-06-19", resumeVersion: "v3", status: "Applied", initial: "V", color: "#171717" },
  { id: "3", company: "Figma", role: "Frontend Engineer", dateApplied: "2026-06-18", resumeVersion: "v2", status: "Applied", initial: "F", color: "#F24E1E" },
  { id: "4", company: "Anthropic", role: "ML Engineer", dateApplied: "2026-06-15", resumeVersion: "v2", status: "HR Screen", initial: "A", color: "#CC785C" },
  { id: "5", company: "Linear", role: "Product Engineer", dateApplied: "2026-06-12", resumeVersion: "v2", status: "HR Screen", initial: "L", color: "#5E6AD2" },
  { id: "6", company: "Cloudflare", role: "Systems Engineer", dateApplied: "2026-06-10", resumeVersion: "v1", status: "Tech Interview", initial: "C", color: "#F6821F" },
  { id: "7", company: "Notion", role: "Full Stack Engineer", dateApplied: "2026-06-08", resumeVersion: "v2", status: "Tech Interview", initial: "N", color: "#202020" },
  { id: "8", company: "Google", role: "Software Engineer L4", dateApplied: "2026-05-30", resumeVersion: "v1", status: "Offer", initial: "G", color: "#4285F4" },
  { id: "9", company: "Meta", role: "Software Engineer E4", dateApplied: "2026-05-28", resumeVersion: "v1", status: "Rejected", initial: "M", color: "#0866FF" },
  { id: "10", company: "Amazon", role: "SDE II", dateApplied: "2026-05-25", resumeVersion: "v1", status: "Rejected", initial: "A", color: "#FF9900" },
];

const INITIAL_COMPANIES: TargetCompany[] = [
  { id: "c1", name: "Anthropic", initial: "A", color: "#CC785C", industry: "AI Safety", tier: "tier1", hiringStatus: "Actively Hiring", techStack: { frontend: ["React","TypeScript","Next.js"], backend: ["Python","PyTorch","FastAPI"], infra: ["AWS","Docker","Kubernetes"] }, techIcons: ["Python","PyTorch","React","AWS","Kubernetes"], connections: [{ id: "cn1", name: "Sarah Chen", role: "Senior Recruiter", linkedin: "linkedin.com/in/sarah-chen-anthropic" }], notes: "Known for strong safety culture. Constitutional AI team expanding. Prep: RL fundamentals, transformer architecture, scaling laws.", careersUrl: "https://anthropic.com/careers", linkedinUrl: "https://linkedin.com/company/anthropic", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Anthropic" },
  { id: "c2", name: "Linear", initial: "L", color: "#5E6AD2", industry: "Productivity SaaS", tier: "tier1", hiringStatus: "Selective", techStack: { frontend: ["React","TypeScript","Electron"], backend: ["Node.js","PostgreSQL","GraphQL"], infra: ["AWS","Docker"] }, techIcons: ["React","TypeScript","Node.js","PostgreSQL","GraphQL"], connections: [], notes: "Extremely selective — hire for craft. Read the entire engineering blog. Portfolio of polished side projects is the differentiator.", careersUrl: "https://linear.app/careers", linkedinUrl: "https://linkedin.com/company/linear-app", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Linear" },
  { id: "c3", name: "Stripe", initial: "S", color: "#635BFF", industry: "FinTech", tier: "tier1", hiringStatus: "Actively Hiring", techStack: { frontend: ["React","TypeScript"], backend: ["Java","Ruby","Go"], infra: ["AWS","Kafka","PostgreSQL"] }, techIcons: ["Java","Go","React","AWS","Kafka"], connections: [{ id: "cn2", name: "James Park", role: "Backend Engineer (Alumni)", linkedin: "linkedin.com/in/james-park-stripe" }, { id: "cn3", name: "Priya Mehta", role: "Engineering Manager", linkedin: "linkedin.com/in/priya-mehta-stripe" }], notes: "World-class documentation culture. Process: recruiter screen → phone → 4 panel (2× coding, system design, culture). Focus: distributed systems, idempotency.", careersUrl: "https://stripe.com/jobs", linkedinUrl: "https://linkedin.com/company/stripe", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Stripe" },
  { id: "c4", name: "Vercel", initial: "V", color: "#171717", industry: "Developer Tools", tier: "tier2", hiringStatus: "Selective", techStack: { frontend: ["React","Next.js","TypeScript"], backend: ["Node.js","Edge Runtime","Go"], infra: ["AWS","Cloudflare","Docker"] }, techIcons: ["Next.js","TypeScript","Go","Cloudflare","Docker"], connections: [], notes: "Fully remote, async-first. Next.js expertise essentially mandatory. Contribute to OSS repos for visibility.", careersUrl: "https://vercel.com/careers", linkedinUrl: "https://linkedin.com/company/vercel", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Vercel" },
  { id: "c5", name: "Cloudflare", initial: "C", color: "#F6821F", industry: "Infrastructure", tier: "tier2", hiringStatus: "Actively Hiring", techStack: { frontend: ["React","TypeScript"], backend: ["Rust","Go","C++"], infra: ["Kubernetes","NGINX","Docker"] }, techIcons: ["Rust","Go","Kubernetes","TypeScript","C++"], connections: [{ id: "cn4", name: "Amira Hassan", role: "Technical Recruiter", linkedin: "linkedin.com/in/amira-hassan-cf" }], notes: "Systems engineering at its finest. Rust expertise highly valued. Prep: TCP/IP stack, DNS, TLS handshake, edge-scale systems design.", careersUrl: "https://cloudflare.com/careers", linkedinUrl: "https://linkedin.com/company/cloudflare", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Cloudflare" },
  { id: "c6", name: "Notion", initial: "N", color: "#202020", industry: "Productivity SaaS", tier: "tier2", hiringStatus: "Selective", techStack: { frontend: ["React","TypeScript","Electron"], backend: ["Node.js","Go","PostgreSQL"], infra: ["AWS","Docker","Redis"] }, techIcons: ["React","TypeScript","Go","PostgreSQL","Redis"], connections: [], notes: "Product-focused culture. Technical screens: data structures + full-stack system design (CRDT fundamentals for collaborative editing).", careersUrl: "https://notion.so/careers", linkedinUrl: "https://linkedin.com/company/notion-hq", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Notion" },
  { id: "c7", name: "Figma", initial: "F", color: "#F24E1E", industry: "Design Tools", tier: "tier2", hiringStatus: "Hiring Freeze", techStack: { frontend: ["TypeScript","WebAssembly","React"], backend: ["C++","Node.js","Ruby"], infra: ["AWS","Kubernetes","PostgreSQL"] }, techIcons: ["TypeScript","C++","WebAssembly","AWS","Kubernetes"], connections: [], notes: "Post-Adobe acquisition freeze. Monitor for Q3 2026 updates. Interesting: WebAssembly + C++ for performance-critical rendering.", careersUrl: "https://figma.com/careers", linkedinUrl: "https://linkedin.com/company/figma", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Figma" },
  { id: "c8", name: "Amazon", initial: "A", color: "#FF9900", industry: "Cloud / E-Commerce", tier: "archived", hiringStatus: "Hiring Freeze", techStack: { frontend: ["React","TypeScript"], backend: ["Java","Python","Go"], infra: ["AWS","Docker","Kubernetes"] }, techIcons: ["Java","Python","AWS","Kubernetes"], connections: [], notes: "Failed loop — system design + LP prep insufficient. Revisit in 6–9 months. Prep: saga pattern, eventual consistency, 5–6 strong LP stories.", careersUrl: "https://amazon.jobs", linkedinUrl: "https://linkedin.com/company/amazon", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Amazon" },
  { id: "c9", name: "Meta", initial: "M", color: "#0866FF", industry: "Social Media / AI", tier: "archived", hiringStatus: "Unknown", techStack: { frontend: ["React","TypeScript","Relay"], backend: ["Hack/PHP","Python","C++"], infra: ["Kubernetes","Kafka","Cassandra"] }, techIcons: ["React","Python","Kafka","Kubernetes","Cassandra"], connections: [], notes: "Rejected after virtual onsite. Weak behavioral answers. E4 bar very high. Consider E3 next cycle. Quantify every impact metric.", careersUrl: "https://metacareers.com", linkedinUrl: "https://linkedin.com/company/meta", glassdoorUrl: "https://glassdoor.com/Overview/Working-at-Meta" },
];

const INITIAL_RESUMES: ResumeFile[] = [
  { id: "r1", title: "Backend Focus", subtitle: "Java & Spring Boot specialist", tags: ["Backend","Java","Spring Boot"], updatedAt: "2026-06-22", isPrimary: true, accentColor: "#4F46E5" },
  { id: "r2", title: "Full-Stack Focus", subtitle: "React + Node.js generalist", tags: ["Full-Stack","React","Node.js"], updatedAt: "2026-06-18", isPrimary: false, accentColor: "#0D9488" },
  { id: "r3", title: "Management Track", subtitle: "Tech lead & team manager", tags: ["Management","Senior","Leadership"], updatedAt: "2026-06-10", isPrimary: false, accentColor: "#7C3AED" },
  { id: "r4", title: "ML Engineer", subtitle: "Python & AI/ML frameworks", tags: ["Backend","Python","ML/AI"], updatedAt: "2026-06-05", isPrimary: false, accentColor: "#DB2777" },
];
const INITIAL_SKILLS = ["Java","Spring Boot","PostgreSQL","React","TypeScript","Docker","Kubernetes","Redis","System Design","REST APIs","Kafka","AWS"];
const INITIAL_SNIPPETS: CoverSnippet[] = [
  { id: "s1", title: "Opening — Passion Intro", body: "I have spent the last 4 years building distributed backend systems at scale, and I am consistently drawn to teams that treat engineering as a craft, not just a function." },
  { id: "s2", title: "Why [Company]", body: "What excites me most about [Company] is the intersection of developer tooling and end-user empathy. Your recent work on [Product Feature] demonstrates exactly the kind of thoughtful engineering I want to be part of." },
  { id: "s3", title: "Closing — CTA", body: "I would welcome the opportunity to discuss how my experience with high-throughput APIs and cross-functional collaboration could contribute to your team." },
];
const WEEKLY_DATA = [
  { week: "May 5", count: 2 }, { week: "May 12", count: 3 }, { week: "May 19", count: 4 },
  { week: "May 26", count: 3 }, { week: "Jun 2", count: 5 }, { week: "Jun 9", count: 6 },
  { week: "Jun 16", count: 8 }, { week: "Jun 23", count: 5 },
];
const UPCOMING_INTERVIEWS = [
  { company: "Cloudflare", role: "Systems Engineer", round: "Technical Interview", date: "Jun 28, 2026", color: "#F6821F", initial: "C" },
  { company: "Notion", role: "Full Stack Engineer", round: "System Design", date: "Jun 30, 2026", color: "#202020", initial: "N" },
  { company: "Linear", role: "Product Engineer", round: "HR Call", date: "Jul 2, 2026", color: "#5E6AD2", initial: "L" },
];
const LOGO_COLORS = ["#635BFF","#171717","#F24E1E","#CC785C","#5E6AD2","#F6821F","#202020","#4285F4","#0866FF","#059669","#8B5CF6"];
const TODAY = new Date("2026-06-27");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): string {
  const diff = Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today"; if (diff === 1) return "1 day ago"; return `${diff} days ago`;
}
function getSkillColor(skill: string): string {
  const s = skill.toLowerCase();
  if (["java","spring","python","node","postgresql","mysql","redis","kafka","rest","api","sql","backend","go","rust","ruby"].some(k=>s.includes(k))) return "bg-blue-50 text-blue-700 border border-blue-200";
  if (["react","vue","angular","typescript","javascript","css","tailwind","html","next","frontend","ui","electron"].some(k=>s.includes(k))) return "bg-amber-50 text-amber-700 border border-amber-200";
  if (["docker","kubernetes","aws","gcp","azure","terraform","devops","linux","nginx","k8s","ci/cd","cloud"].some(k=>s.includes(k))) return "bg-orange-50 text-orange-700 border border-orange-200";
  if (["ml","ai","pytorch","tensorflow","pandas","numpy","scikit","llm","nlp","machine"].some(k=>s.includes(k))) return "bg-pink-50 text-pink-700 border border-pink-200";
  return "bg-violet-50 text-violet-700 border border-violet-200";
}
function getTagColor(tag: string): string {
  const s = tag.toLowerCase();
  if (["backend","java","python","spring","node","rest"].some(k=>s.includes(k))) return "bg-blue-50 text-blue-700";
  if (["frontend","react","vue","ui","next"].some(k=>s.includes(k))) return "bg-amber-50 text-amber-700";
  if (["full","stack"].some(k=>s.includes(k))) return "bg-violet-50 text-violet-700";
  if (["ml","ai","machine"].some(k=>s.includes(k))) return "bg-pink-50 text-pink-700";
  if (["manage","lead","senior","director"].some(k=>s.includes(k))) return "bg-teal-50 text-teal-700";
  return "bg-slate-100 text-slate-600";
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const navItems = [
    { id: "dashboard" as View, icon: LayoutDashboard, label: "Dash" },
    { id: "pipeline" as View, icon: Columns3, label: "Board" },
    { id: "applications" as View, icon: List, label: "Jobs" },
    { id: "intel" as View, icon: Target, label: "Intel" },
    { id: "radar" as View, icon: Radio, label: "Radar" },
    { id: "outreach" as View, icon: Users2, label: "CRM" },
    { id: "vault" as View, icon: BookOpen, label: "Vault" },
    { id: "profile" as View, icon: User, label: "Me" },
  ];
  return (
    <aside className="w-[68px] h-full bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-5 shrink-0">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-white font-bold text-sm">M</span>
      </div>
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setView(id)} title={id.charAt(0).toUpperCase() + id.slice(1)}
            className={`w-full h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${view === id ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon size={16} strokeWidth={view === id ? 2.5 : 1.75} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[8.5px] font-medium leading-none">{label}</span>
          </button>
        ))}
      </nav>
      <div className="px-2 w-full">
        <button title="Settings" className="w-full h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Settings size={16} strokeWidth={1.75} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[8.5px] font-medium leading-none">Set</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ view, onAdd }: { view: View; onAdd: () => void }) {
  const meta: Record<View, { title: string; crumb: string }> = {
    dashboard: { title: "Dashboard", crumb: "Analytics Overview" },
    pipeline:  { title: "Pipeline",  crumb: "Kanban Board" },
    applications: { title: "Applications", crumb: "All Applications" },
    intel:     { title: "Intel",     crumb: "Company Target Board" },
    radar:     { title: "Radar",     crumb: "AI Opportunity Feed" },
    outreach:  { title: "Outreach",  crumb: "Cold Outreach CRM" },
    vault:     { title: "Vault",     crumb: "Interview Brain Dump" },
    profile:   { title: "Profile",   crumb: "Asset Hub" },
  };
  return (
    <header className="h-[52px] border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{meta[view].title}</span>
        <ChevronRight size={13} className="text-border" />
        <span className="text-sm text-muted-foreground">{meta[view].crumb}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Search size={15} /></button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        {(view === "pipeline" || view === "dashboard" || view === "applications") && (
          <button onClick={onAdd} className="h-8 pl-2.5 pr-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
            <Plus size={14} strokeWidth={2.5} />Add Application
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function AppCard({ app, onDragStart }: { app: Application; onDragStart: (id: string) => void }) {
  return (
    <div draggable onDragStart={() => onDragStart(app.id)} className="bg-card border border-border rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:border-primary/25 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-all select-none">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: app.color }}>{app.initial}</div>
        <div className="flex-1 min-w-0"><p className="font-semibold text-foreground text-sm leading-tight">{app.company}</p><p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{app.role}</p></div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-muted-foreground">{daysSince(app.dateApplied)}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{app.resumeVersion}</span>
      </div>
    </div>
  );
}
function KanbanColumn({ status, apps, onDragStart, onDrop }: { status: Status; apps: Application[]; onDragStart: (id: string) => void; onDrop: (s: Status) => void }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="flex flex-col w-[256px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <div className={`w-2 h-2 rounded-full ${COLUMN_DOT[status]}`} />
        <span className="text-sm font-semibold text-foreground flex-1">{status}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{apps.length}</span>
      </div>
      <div className={`flex-1 flex flex-col gap-2.5 rounded-xl p-2 min-h-[160px] transition-all ${dragOver ? "bg-accent/70 border border-primary/30 border-dashed" : "bg-muted/50 border border-transparent"}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={() => { setDragOver(false); onDrop(status); }}>
        {apps.map(app => <AppCard key={app.id} app={app} onDragStart={onDragStart} />)}
        {apps.length === 0 && <div className="flex-1 flex items-center justify-center py-8"><p className="text-xs text-muted-foreground/60">Drop here</p></div>}
      </div>
    </div>
  );
}
function PipelineView({ apps, setApps }: { apps: Application[]; setApps: React.Dispatch<React.SetStateAction<Application[]>> }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const handleDrop = (status: Status) => { if (!dragId) return; setApps(prev => prev.map(a => a.id === dragId ? { ...a, status } : a)); setDragId(null); };
  return (
    <div className="h-full overflow-x-auto p-5"><div className="flex gap-3.5 h-full min-w-max pb-4">
      {COLUMNS.map(({ key }) => <KanbanColumn key={key} status={key} apps={apps.filter(a => a.status === key)} onDragStart={setDragId} onDrop={handleDrop} />)}
    </div></div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconClass, sub }: { label: string; value: string | number; icon: React.ElementType; iconClass: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</p><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}><Icon size={15} /></div></div>
      <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm"><p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-muted-foreground mb-0.5">{label}</p><p className="text-sm font-bold text-foreground">{payload[0].value} apps</p></div>;
}
function DashboardView({ apps }: { apps: Application[] }) {
  const total = apps.length; const active = apps.filter(a => ["Applied","HR Screen","Tech Interview"].includes(a.status)).length;
  const offers = apps.filter(a => a.status === "Offer").length; const rejected = apps.filter(a => a.status === "Rejected").length;
  const rejRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  return (
    <div className="h-full overflow-y-auto p-5"><div className="max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={total} icon={Briefcase} iconClass="bg-blue-50 text-blue-600" sub="All time" />
        <StatCard label="Active Processes" value={active} icon={Clock} iconClass="bg-amber-50 text-amber-600" sub="In progress" />
        <StatCard label="Offers Received" value={offers} icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" sub="Congratulations!" />
        <StatCard label="Rejection Rate" value={`${rejRate}%`} icon={XCircle} iconClass="bg-red-50 text-red-500" sub={`${rejected} declined`} />
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5"><div><h3 className="font-semibold text-foreground">Applications per Week</h3><p className="text-xs text-muted-foreground mt-0.5">Last 8 weeks</p></div><div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp size={13} /><span>+24% vs last month</span></div></div>
          <ResponsiveContainer width="100%" height={176}><BarChart data={WEEKLY_DATA} barSize={22} margin={{ top:0, right:4, left:-12, bottom:0 }}><CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" /><XAxis dataKey="week" tick={{ fontSize:10, fill:"#94A3B8", fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize:10, fill:"#94A3B8", fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(79,70,229,0.05)", radius:4 }} /><Bar dataKey="count" fill="#4F46E5" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">Upcoming</h3><Calendar size={14} className="text-muted-foreground" /></div>
          <div className="space-y-2.5 flex-1">{UPCOMING_INTERVIEWS.map((item,i) => (<div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"><div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ backgroundColor: item.color }}>{item.initial}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{item.company}</p><p className="text-xs text-muted-foreground">{item.round}</p><p style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-[10px] text-muted-foreground mt-1">{item.date}</p></div></div>))}</div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground">Pipeline Overview</h3><span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs text-muted-foreground">{total} total</span></div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4 bg-muted">{COLUMNS.map(({ key }) => { const count = apps.filter(a => a.status === key).length; const pct = total > 0 ? (count/total)*100 : 0; if (pct===0) return null; return <div key={key} className={`h-full ${PROGRESS_BAR[key]}`} style={{ width:`${pct}%` }} />; })}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">{COLUMNS.map(({ key }) => (<div key={key} className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${COLUMN_DOT[key]}`} /><span className="text-xs text-muted-foreground">{key}</span><span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs font-semibold text-foreground">{apps.filter(a=>a.status===key).length}</span></div>))}</div>
      </div>
        <StreakSection />
    </div></div>
  );
}

// ─── Applications ─────────────────────────────────────────────────────────────

function ApplicationsView({ apps }: { apps: Application[] }) {
  const sorted = [...apps].sort((a,b) => new Date(b.dateApplied).getTime()-new Date(a.dateApplied).getTime());
  return (
    <div className="h-full overflow-y-auto p-5"><div className="max-w-4xl mx-auto bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">All Applications</p><span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs text-muted-foreground">{apps.length} total</span></div>
      <table className="w-full"><thead><tr className="border-b border-border">{["Company","Role","Status","Applied","Resume"].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{sorted.map(app=>(<tr key={app.id} className="hover:bg-muted/30 transition-colors"><td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor:app.color }}>{app.initial}</div><span className="font-semibold text-sm text-foreground">{app.company}</span></div></td><td className="px-5 py-3.5 text-sm text-muted-foreground">{app.role}</td><td className="px-5 py-3.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[app.status]}`}>{app.status}</span></td><td className="px-5 py-3.5"><span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs text-muted-foreground">{daysSince(app.dateApplied)}</span></td><td className="px-5 py-3.5"><span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{app.resumeVersion}</span></td></tr>))}</tbody>
      </table>
    </div></div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function LeetCodeIcon({ color }: { color: string }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill={color}><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" /></svg>;
}
function SkillTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getSkillColor(label)}`}>{label}<button onClick={onRemove} className="hover:opacity-70 ml-0.5"><X size={10} strokeWidth={2.5} /></button></span>;
}
function SnippetCard({ snippet }: { snippet: CoverSnippet }) {
  const [expanded, setExpanded] = useState(false); const [copied, setCopied] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-muted/40" onClick={() => setExpanded(e=>!e)}><div className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 shrink-0"><FileText size={11} className="text-primary" /></div><p className="flex-1 text-sm font-semibold text-foreground text-left">{snippet.title}</p><ChevronDown size={14} className={`text-muted-foreground transition-transform ${expanded?"rotate-180":""}`} /></div>
      {expanded && <div className="px-3.5 pb-3.5 border-t border-border"><p className="text-xs text-muted-foreground leading-relaxed mt-3">{snippet.body}</p><button onClick={() => { navigator.clipboard.writeText(snippet.body).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1800); }} className={`mt-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${copied?"bg-emerald-50 text-emerald-700":"bg-muted text-muted-foreground"}`}>{copied?<Check size={12}/>:<Copy size={12}/>}{copied?"Copied!":"Copy snippet"}</button></div>}
    </div>
  );
}
function FootprintField({ label, placeholder, value, onChange, icon: Icon, iconColor }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; icon: React.ElementType; iconColor: string }) {
  const connected = value.trim().length > 0;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor:`${iconColor}15` }}><Icon size={16} style={{ color:iconColor }} /></div>
      <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p><input type="text" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} className="w-full text-sm text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none" /></div>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${connected?"bg-emerald-100":"bg-muted"}`}>{connected?<Check size={11} className="text-emerald-600" strokeWidth={2.5}/>:<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}</div>
    </div>
  );
}
function ResumeCard({ resume, onDelete, onSetPrimary }: { resume: ResumeFile; onDelete: (id: string) => void; onSetPrimary: (id: string) => void }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)} className={`relative bg-card border rounded-xl overflow-hidden transition-all ${resume.isPrimary?"border-primary/40 shadow-[0_0_0_3px_rgba(79,70,229,0.08)]":"border-border hover:shadow-md"}`}>
      <div className="relative h-32 flex items-center justify-center" style={{ background:`linear-gradient(135deg, ${resume.accentColor}18 0%, ${resume.accentColor}08 100%)` }}>
        <div className="absolute inset-x-6 top-5 space-y-1.5 opacity-20">{[100,75,90,60,80].map((w,i)=><div key={i} className="h-1 rounded-full" style={{ width:`${w}%`,backgroundColor:resume.accentColor }} />)}</div>
        <FileText size={36} style={{ color:resume.accentColor }} strokeWidth={1.5} className="relative z-10" />
        {resume.isPrimary && <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full"><Star size={9} fill="currentColor" />Primary</div>}
        <div className={`absolute inset-0 bg-foreground/60 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity ${hovering?"opacity-100":"opacity-0"}`}>
          <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center"><Download size={14} /></button>
          <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center"><Pencil size={14} /></button>
          {!resume.isPrimary && <button onClick={()=>onSetPrimary(resume.id)} className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center"><Star size={14} /></button>}
          <button onClick={()=>onDelete(resume.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="p-4"><h4 className="font-semibold text-foreground text-sm">{resume.title}</h4><p className="text-xs text-muted-foreground mt-0.5 mb-3">{resume.subtitle}</p><div className="flex flex-wrap gap-1 mb-3">{resume.tags.map(tag=><span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>)}</div><p style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-[11px] text-muted-foreground">Updated {daysSince(resume.updatedAt)}</p></div>
    </div>
  );
}
function ProfileView() {
  const [resumes, setResumes] = useState<ResumeFile[]>(INITIAL_RESUMES);
  const [links, setLinks] = useState({ portfolio:"moeen.dev", github:"moeen-rashid", linkedin:"in/moeen-al-rashid", leetcode:"" });
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState(""); const [workModel, setWorkModel] = useState("Remote"); const [salary, setSalary] = useState("$140,000 – $160,000");
  const [snippets] = useState<CoverSnippet[]>(INITIAL_SNIPPETS);
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key==="Enter"||e.key===","){e.preventDefault();const s=newSkill.trim().replace(/,$/,"");if(s&&!skills.includes(s))setSkills(p=>[...p,s]);setNewSkill("");}if(e.key==="Backspace"&&newSkill===""&&skills.length>0)setSkills(p=>p.slice(0,-1)); };
  const blankResume = () => ({ id:`r${Date.now()}`, title:"New Resume", subtitle:"Click to edit", tags:["General"], updatedAt:"2026-06-27", isPrimary:false, accentColor:"#64748B" });
  return (
    <div className="h-full overflow-y-auto p-5"><div className="max-w-6xl mx-auto"><div className="grid grid-cols-[1fr_320px] gap-5 items-start">
      <div className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5"><div><h2 className="font-semibold text-foreground">Resume Vault</h2><p className="text-xs text-muted-foreground mt-0.5"><span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{resumes.length}</span> versions</p></div><button onClick={()=>setResumes(p=>[...p,blankResume()])} className="h-8 pl-2.5 pr-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90"><Upload size={13} />Upload Resume</button></div>
          <div className="grid grid-cols-2 gap-4">{resumes.map(r=><ResumeCard key={r.id} resume={r} onDelete={id=>setResumes(p=>p.filter(x=>x.id!==id))} onSetPrimary={id=>setResumes(p=>p.map(x=>({...x,isPrimary:x.id===id})))} />)}<button onClick={()=>setResumes(p=>[...p,blankResume()])} className="min-h-[220px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-muted/40 transition-all"><div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><Upload size={18} className="text-muted-foreground" /></div><div className="text-center"><p className="text-sm font-semibold text-foreground">Upload New Resume</p><p className="text-xs text-muted-foreground mt-0.5">PDF or DOCX</p></div></button></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1"><h2 className="font-semibold text-foreground">Skills & Match Engine</h2><span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-accent px-2 py-0.5 rounded-full"><Zap size={9} fill="currentColor" />AI-Ready</span></div>
          <p className="text-xs text-muted-foreground mb-4">Used to compute match scores against job descriptions</p>
          <div className="mb-5"><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Core Technical Skills</label><div className="min-h-[72px] w-full border border-border rounded-xl p-3 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-primary/20 bg-background/50">{skills.map(s=><SkillTag key={s} label={s} onRemove={()=>setSkills(p=>p.filter(x=>x!==s))} />)}<input type="text" value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder={skills.length===0?"Type a skill and press Enter…":"Add skill…"} className="flex-1 min-w-[100px] text-sm bg-transparent focus:outline-none" /></div></div>
          <div className="grid grid-cols-2 gap-4">{[{label:"Work Model",value:workModel,onChange:setWorkModel,opts:["Remote","Hybrid","On-site","Flexible"]},{label:"Target Salary (USD)",value:salary,onChange:setSalary,opts:["$100,000 – $120,000","$120,000 – $140,000","$140,000 – $160,000","$160,000 – $180,000","$180,000+"]}].map(({label,value,onChange,opts})=>(<div key={label}><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</label><div className="relative"><select value={value} onChange={e=>onChange(e.target.value)} className="w-full h-9 pl-3 pr-8 border border-border rounded-lg text-sm bg-background focus:outline-none appearance-none">{opts.map(o=><option key={o} value={o}>{o}</option>)}</select><ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" /></div></div>))}</div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-5"><div className="flex items-center gap-3 mb-4 pb-4 border-b border-border"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-lg">M</span></div><div><p className="font-semibold text-foreground">Moeen Al-Rashid</p><p className="text-xs text-muted-foreground">Senior Backend Engineer</p><div className="flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[11px] text-emerald-600 font-medium">Open to offers</span></div></div></div><div className="grid grid-cols-2 gap-2 text-center">{[{label:"Applied",value:"10"},{label:"Interviews",value:"5"},{label:"Offers",value:"1"},{label:"Resumes",value:String(resumes.length)}].map(({label,value})=>(<div key={label} className="bg-muted/50 rounded-lg p-2.5"><p style={{fontFamily:"'JetBrains Mono',monospace"}} className="text-lg font-bold text-foreground leading-none">{value}</p><p className="text-[11px] text-muted-foreground mt-0.5">{label}</p></div>))}</div></div>
        <div className="bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-foreground mb-1">Digital Footprint</h2><p className="text-xs text-muted-foreground mb-4">Your online presence</p><FootprintField label="Portfolio" placeholder="yoursite.dev" value={links.portfolio} onChange={v=>setLinks(l=>({...l,portfolio:v}))} icon={Globe} iconColor="#0EA5E9" /><FootprintField label="GitHub" placeholder="github.com/username" value={links.github} onChange={v=>setLinks(l=>({...l,github:v}))} icon={Github} iconColor="#171717" /><FootprintField label="LinkedIn" placeholder="linkedin.com/in/handle" value={links.linkedin} onChange={v=>setLinks(l=>({...l,linkedin:v}))} icon={Linkedin} iconColor="#0A66C2" /><div className="flex items-center gap-3 py-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{backgroundColor:"#FFA11615"}}><LeetCodeIcon color="#FFA116" /></div><div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">LeetCode</p><input type="text" placeholder="leetcode.com/username" value={links.leetcode} onChange={e=>setLinks(l=>({...l,leetcode:e.target.value}))} className="w-full text-sm bg-transparent focus:outline-none" /></div><div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${links.leetcode.trim()?"bg-emerald-100":"bg-muted"}`}>{links.leetcode.trim()?<Check size={11} className="text-emerald-600" strokeWidth={2.5}/>:<div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}</div></div><div className="mt-3 pt-3 border-t border-border"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Profile completeness</p><span style={{fontFamily:"'JetBrains Mono',monospace"}} className="text-xs font-bold">{[links.portfolio,links.github,links.linkedin,links.leetcode].filter(Boolean).length*25}%</span></div><div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{width:`${[links.portfolio,links.github,links.linkedin,links.leetcode].filter(Boolean).length*25}%`}} /></div></div></div>
        <div className="bg-card border border-border rounded-xl p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold text-foreground">Cover Letter Snippets</h2><p className="text-xs text-muted-foreground mt-0.5">Reusable blocks</p></div><span style={{fontFamily:"'JetBrains Mono',monospace"}} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{snippets.length}</span></div><div className="space-y-2">{snippets.map(s=><SnippetCard key={s.id} snippet={s} />)}<button className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary/40"><Plus size={13} />Add snippet</button></div></div>
      </div>
    </div></div></div>
  );
}

// ─── Intel ────────────────────────────────────────────────────────────────────

function TechBadge({ tech, size="sm" }: { tech: string; size?: "sm" | "md" }) {
  const cfg = TECH_CONFIG[tech] ?? { label:tech.slice(0,2).toUpperCase(), bg:"#64748B", fg:"#FFFFFF" };
  const dim = size==="sm" ? "w-6 h-6 text-[9px]" : "w-7 h-7 text-[10px]";
  return <div className={`${dim} rounded-md flex items-center justify-center font-bold leading-none shrink-0`} style={{ backgroundColor:cfg.bg+"22", color:cfg.fg==="#FFFFFF"?cfg.bg:cfg.fg }} title={tech}>{cfg.label}</div>;
}
function TechGroupRow({ label, techs, color }: { label: string; techs: string[]; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shrink-0 mt-0.5 ${color}`}>{label}</span>
      <div className="flex flex-wrap gap-1.5">{techs.map(tech=>{const cfg=TECH_CONFIG[tech]??{label:tech.slice(0,2).toUpperCase(),bg:"#64748B",fg:"#FFFFFF"};return<span key={tech} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border" style={{backgroundColor:cfg.bg+"15",color:cfg.bg,borderColor:cfg.bg+"30"}}><span className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold" style={{backgroundColor:cfg.bg,color:cfg.fg}}>{cfg.label}</span>{tech}</span>;})}</div>
    </div>
  );
}
function IntelPanelSection({ title, icon: Icon, children, defaultOpen=true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center gap-2 px-5 py-3.5 hover:bg-muted/30 transition-colors"><Icon size={14} className="text-muted-foreground shrink-0" /><span className="flex-1 text-sm font-semibold text-foreground text-left">{title}</span>{open?<ChevronUp size={14} className="text-muted-foreground"/>:<ChevronDown size={14} className="text-muted-foreground"/>}</button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
function CompanyCard({ company, selected, onClick }: { company: TargetCompany; selected: boolean; onClick: () => void }) {
  const { style:badgeStyle, icon:StatusIcon } = HIRING_STATUS_BADGE[company.hiringStatus];
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border p-4 transition-all ${selected?"border-primary bg-accent/40 shadow-[0_0_0_2px_rgba(79,70,229,0.15)]":company.tier==="tier1"?"border-primary/25 bg-card hover:border-primary/50 hover:shadow-md":"border-border bg-card hover:border-primary/20 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between gap-2 mb-3"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor:company.color }}>{company.initial}</div><div><p className="font-semibold text-foreground text-sm">{company.name}</p><p className="text-[11px] text-muted-foreground mt-0.5">{company.industry}</p></div></div>{company.tier==="tier1"&&!selected&&<Star size={13} className="text-primary shrink-0 mt-0.5" fill="currentColor" />}</div>
      <div className="flex items-center gap-1.5 mb-3"><StatusIcon size={10} style={{ color:company.hiringStatus==="Actively Hiring"?"#047857":company.hiringStatus==="Hiring Freeze"?"#B91C1C":company.hiringStatus==="Selective"?"#B45309":"#94A3B8" }} /><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}>{company.hiringStatus}</span></div>
      <div className="flex items-center gap-1.5 flex-wrap">{company.techIcons.slice(0,5).map(t=><TechBadge key={t} tech={t} size="sm" />)}{company.connections.length>0&&<div className="ml-auto flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold"><Users size={10} /><span>{company.connections.length}</span></div>}</div>
    </button>
  );
}
function IntelPanel({ company, apps, onUpdate }: { company: TargetCompany; apps: Application[]; onUpdate: (c: TargetCompany) => void }) {
  const [notes, setNotes] = useState(company.notes); const [editingNotes, setEditingNotes] = useState(false);
  const [addingConn, setAddingConn] = useState(false); const [newConn, setNewConn] = useState({name:"",role:"",linkedin:""});
  const { style:badgeStyle } = HIRING_STATUS_BADGE[company.hiringStatus];
  const handleAddConn = () => { if(!newConn.name.trim())return; onUpdate({...company,connections:[...company.connections,{id:`cn${Date.now()}`,...newConn}]}); setNewConn({name:"",role:"",linkedin:""}); setAddingConn(false); };
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor:company.color }}>{company.initial}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h2 className="font-semibold text-foreground text-base">{company.name}</h2>{company.tier==="tier1"&&<Star size={12} className="text-primary shrink-0" fill="currentColor" />}</div><p className="text-xs text-muted-foreground">{company.industry}</p></div><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeStyle}`}>{company.hiringStatus}</span></div>
        <div className="flex gap-2">{[{label:"Careers",url:company.careersUrl},{label:"LinkedIn",url:company.linkedinUrl},{label:"Glassdoor",url:company.glassdoorUrl}].map(({label,url})=>(<a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-accent/40 transition-all"><ExternalLink size={11} />{label}</a>))}</div>
      </div>
      <div className="flex-1 overflow-y-auto bg-background">
        <IntelPanelSection title="Tech Stack Radar" icon={Layers}><div className="space-y-3 pt-1"><TechGroupRow label="FE" techs={company.techStack.frontend} color="bg-amber-50 text-amber-700" /><TechGroupRow label="BE" techs={company.techStack.backend} color="bg-blue-50 text-blue-700" /><TechGroupRow label="OPS" techs={company.techStack.infra} color="bg-violet-50 text-violet-700" /></div></IntelPanelSection>
        <IntelPanelSection title={`Inside Connections${company.connections.length?` · ${company.connections.length}`:""}`} icon={Users}><div className="space-y-2 mb-3">{company.connections.length===0&&!addingConn&&<p className="text-xs text-muted-foreground italic py-1">No connections yet</p>}{company.connections.map(conn=>(<div key={conn.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50 group"><div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">{conn.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{conn.name}</p><p className="text-xs text-muted-foreground">{conn.role}</p>{conn.linkedin&&<a href={`https://${conn.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-primary hover:underline"><Link2 size={10}/>{conn.linkedin}</a>}</div><button onClick={()=>onUpdate({...company,connections:company.connections.filter(c=>c.id!==conn.id)})} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500"><X size={12}/></button></div>))}</div>{addingConn?(<div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">{[{key:"name",placeholder:"Full name"},{key:"role",placeholder:"e.g. Recruiter"},{key:"linkedin",placeholder:"linkedin.com/in/handle"}].map(({key,placeholder})=>(<input key={key} type="text" placeholder={placeholder} value={newConn[key as keyof typeof newConn]} onChange={e=>setNewConn(p=>({...p,[key]:e.target.value}))} className="w-full h-8 px-2.5 text-xs border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />))}<div className="flex gap-2 pt-1"><button onClick={()=>setAddingConn(false)} className="flex-1 h-7 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted">Cancel</button><button onClick={handleAddConn} className="flex-1 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add</button></div></div>):(<button onClick={()=>setAddingConn(true)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"><UserPlus size={13}/>Add connection</button>)}</IntelPanelSection>
        <IntelPanelSection title="My Notes" icon={Edit3}>{editingNotes?(<div className="space-y-2"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={7} className="w-full text-sm text-foreground bg-background border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed" autoFocus /><div className="flex gap-2"><button onClick={()=>{setNotes(company.notes);setEditingNotes(false);}} className="flex-1 h-7 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-muted">Discard</button><button onClick={()=>{onUpdate({...company,notes});setEditingNotes(false);}} className="flex-1 h-7 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Save Notes</button></div></div>):(<div>{notes?<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>:<p className="text-xs text-muted-foreground italic">No notes yet.</p>}<button onClick={()=>setEditingNotes(true)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mt-3"><Pencil size={12}/>{notes?"Edit notes":"Add notes"}</button></div>)}</IntelPanelSection>
        <IntelPanelSection title="Application History" icon={Clock}>{apps.length===0?(<div className="py-2"><p className="text-xs text-muted-foreground italic">No applications to {company.name} yet.</p></div>):(<div className="space-y-0 relative"><div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />{apps.map(app=>(<div key={app.id} className="flex gap-3 relative pb-4 last:pb-0 pt-1"><div className={`w-[22px] h-[22px] rounded-full border-2 border-card flex items-center justify-center shrink-0 z-10 ${COLUMN_DOT[app.status]}`} /><div className="flex-1 min-w-0 pt-0.5"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-foreground">{app.role}</p><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[app.status]} mt-1 inline-block`}>{app.status}</span></div><div className="text-right shrink-0"><p style={{fontFamily:"'JetBrains Mono',monospace"}} className="text-[11px] text-muted-foreground">{daysSince(app.dateApplied)}</p><p style={{fontFamily:"'JetBrains Mono',monospace"}} className="text-[10px] text-muted-foreground/60">{app.resumeVersion}</p></div></div></div></div>))}</div>)}</IntelPanelSection>
      </div>
    </div>
  );
}
const TIER_TABS: { key: Tier; label: string; sub: string }[] = [{ key:"tier1", label:"Tier 1", sub:"Dream" },{ key:"tier2", label:"Tier 2", sub:"Target" },{ key:"archived", label:"Archived", sub:"" }];
function IntelView({ apps }: { apps: Application[] }) {
  const [companies, setCompanies] = useState<TargetCompany[]>(INITIAL_COMPANIES);
  const [selectedId, setSelectedId] = useState<string>("c1"); const [activeTier, setActiveTier] = useState<Tier>("tier1");
  const selectedCompany = companies.find(c=>c.id===selectedId)??null;
  const tierCompanies = companies.filter(c=>c.tier===activeTier);
  const companyApps = selectedCompany?apps.filter(a=>a.company.toLowerCase()===selectedCompany.name.toLowerCase()):[];
  const handleUpdate = (updated: TargetCompany) => setCompanies(prev=>prev.map(c=>c.id===updated.id?updated:c));
  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex flex-col overflow-hidden border-r border-border" style={{ width:"55%" }}>
        <div className="flex items-center gap-1 px-5 pt-4 pb-0 shrink-0 border-b border-border bg-card">
          {TIER_TABS.map(({key,label,sub})=>{const count=companies.filter(c=>c.tier===key).length;return(<button key={key} onClick={()=>setActiveTier(key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTier===key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>{label}{sub&&<span className="text-[11px] font-normal text-muted-foreground hidden sm:inline">{sub}</span>}<span style={{fontFamily:"'JetBrains Mono',monospace"}} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${activeTier===key?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}>{count}</span></button>);})}
          <div className="ml-auto pb-1"><button className="h-7 pl-2.5 pr-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1"><Plus size={12} strokeWidth={2.5}/>Add</button></div>
        </div>
        <div className="px-5 pt-3 pb-2 shrink-0">{activeTier==="tier1"&&<div className="flex items-center gap-2 text-xs text-muted-foreground"><Star size={11} className="text-primary" fill="currentColor"/><span>Dream companies — apply with your strongest resume</span></div>}{activeTier==="tier2"&&<div className="flex items-center gap-2 text-xs text-muted-foreground"><Target size={11} className="text-amber-500"/><span>Target companies — strong fit, actively applying</span></div>}{activeTier==="archived"&&<div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={11} className="text-muted-foreground"/><span>Past applications — preserved for reference</span></div>}</div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{tierCompanies.length===0?(<div className="flex flex-col items-center justify-center h-48"><Target size={28} className="text-muted-foreground/40 mb-3"/><p className="text-sm font-semibold text-foreground">No companies here</p></div>):(<div className="grid grid-cols-2 gap-3">{tierCompanies.map(company=><CompanyCard key={company.id} company={company} selected={selectedId===company.id} onClick={()=>setSelectedId(company.id)} />)}</div>)}</div>
      </div>
      <div className="flex-1 overflow-hidden bg-background">{selectedCompany?<IntelPanel key={selectedCompany.id} company={selectedCompany} apps={companyApps} onUpdate={handleUpdate}/>:<div className="h-full flex items-center justify-center"><Target size={40} className="text-muted-foreground/30"/></div>}</div>
    </div>
  );
}

// ─── Radar: Match Ring ────────────────────────────────────────────────────────

function MatchRing({ score }: { score: number }) {
  const size = 60;
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor  = score >= 85 ? "#059669" : score >= 70 ? "#0D9488" : score >= 55 ? "#D97706" : "#94A3B8";
  const textColor  = score >= 85 ? "#059669" : score >= 70 ? "#0D9488" : score >= 55 ? "#D97706" : "#94A3B8";
  const trackColor = score >= 85 ? "#D1FAE5" : score >= 70 ? "#CCFBF1" : score >= 55 ? "#FEF3C7" : "#F1F5F9";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={ringColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: 14, color: textColor }}>{score}</span>
        <span className="leading-none" style={{ fontSize: 8, color: textColor, opacity: 0.7 }}>%</span>
      </div>
    </div>
  );
}

// ─── Radar: Opportunity Card ──────────────────────────────────────────────────

function OpportunityCard({ opp, onAdd, onDismiss }: { opp: Opportunity; onAdd: (o: Opportunity) => void; onDismiss: (id: string) => void }) {
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const handleAdd = () => { setState("adding"); onAdd(opp); setTimeout(() => setState("added"), 600); };
  const scoreLabel = opp.matchScore >= 85 ? "Excellent" : opp.matchScore >= 70 ? "Good Match" : opp.matchScore >= 55 ? "Partial" : "Weak";
  const isAdded = opp.addedToPipeline || state === "added";
  return (
    <div className={`bg-card border rounded-xl p-4 transition-all duration-200 ${isAdded ? "opacity-60 border-emerald-200 bg-emerald-50/20" : "border-border hover:shadow-md hover:border-primary/15"}`}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <MatchRing score={opp.matchScore} />
          <span className="text-[9px] font-semibold text-muted-foreground text-center leading-tight" style={{ maxWidth: 60 }}>{scoreLabel}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: opp.companyColor }}>{opp.initial}</div>
            <span className="text-sm font-semibold text-foreground">{opp.company}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${SOURCE_STYLE[opp.source] ?? "bg-muted text-muted-foreground"}`}>{opp.source}</span>
            {opp.isRemote && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700">Remote</span>}
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="ml-auto text-[11px] text-muted-foreground shrink-0">{opp.postedAgo}</span>
          </div>
          <p className="font-semibold text-foreground text-sm leading-tight mb-1">{opp.role}</p>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} />{opp.location}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xs font-semibold text-foreground">{opp.salary}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {opp.matchedSkills.slice(0, 5).map(s => <span key={s} className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><Check size={8} strokeWidth={3}/>{s}</span>)}
            {opp.missingSkills.map(s => <span key={s} className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700"><TrendingDown size={8}/>Missing: {s}</span>)}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          {isAdded ? (
            <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Check size={13} strokeWidth={2.5}/>Added!
            </div>
          ) : (
            <button onClick={handleAdd} disabled={state==="adding"} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 whitespace-nowrap">
              {state==="adding" ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <ArrowRight size={12}/>}
              + Pipeline
            </button>
          )}
          <button onClick={() => onDismiss(opp.id)} className="h-8 px-3 rounded-lg text-xs font-semibold text-muted-foreground border border-border hover:bg-muted hover:text-foreground transition-all whitespace-nowrap">Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ─── Radar: Insights Panel ────────────────────────────────────────────────────

function InsightsPanel() {
  const totalScanned = FEED_SOURCES.reduce((s, f) => s + f.count, 0);
  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio size={14} className="text-primary"/>
          <h3 className="text-sm font-semibold text-foreground">Live Feed Stats</h3>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{ label:"Scanned", value:totalScanned.toLocaleString() },{ label:"Matches", value:"23" },{ label:"High (>85%)", value:"4" }].map(({ label, value }) => (
            <div key={label} className="text-center p-2 bg-muted/50 rounded-lg">
              <p style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-base font-bold text-foreground leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Lightbulb size={14} className="text-primary"/><h3 className="text-sm font-semibold text-foreground">AI Insights</h3></div>
        <div className="space-y-3">
          {AI_INSIGHTS_DATA.map(({ icon: Icon, text, impact, impactColor }, i) => (
            <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
              <Icon size={14} className="text-primary shrink-0 mt-0.5"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">{text}</p>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${impactColor}`}>{impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Layers size={14} className="text-muted-foreground"/><h3 className="text-sm font-semibold text-foreground">Skill Coverage</h3></div>
        <div className="space-y-2.5">
          {SKILL_CATEGORIES.map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs font-bold text-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width:`${pct}%` }}/></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><SlidersHorizontal size={14} className="text-muted-foreground"/><h3 className="text-sm font-semibold text-foreground">Feed Sources</h3></div>
        <div className="space-y-2">
          {FEED_SOURCES.map(({ name, count, color }) => {
            const pct = Math.round((count / totalScanned) * 100);
            return (
              <div key={name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}/>
                <span className="flex-1 text-xs text-muted-foreground">{name}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-xs font-semibold text-foreground">{count}</span>
                <div className="w-14 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor:color }}/></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Radar: View ──────────────────────────────────────────────────────────────

function RadarView({ onAddApp }: { onAddApp: (app: Omit<Application, "id" | "initial" | "color">) => void }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(RADAR_OPPORTUNITIES);
  const [activeSkills, setActiveSkills] = useState<string[]>(["Java", "Spring Boot", "PostgreSQL", "Kafka", "REST APIs"]);
  const [activeProfile, setActiveProfile] = useState("Backend Focus");
  const [syncing, setSyncing] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "medium">("all");

  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 1800); };

  const handleAdd = (opp: Opportunity) => {
    onAddApp({ company: opp.company, role: opp.role, dateApplied: "2026-06-27", resumeVersion: "v3", status: "Applied" });
    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, addedToPipeline: true } : o));
  };

  const handleDismiss = (id: string) => setOpportunities(prev => prev.filter(o => o.id !== id));

  const filtered = opportunities.filter(opp => {
    if (opp.dismissed) return false;
    if (scoreFilter === "high") return opp.matchScore >= 85;
    if (scoreFilter === "medium") return opp.matchScore >= 70 && opp.matchScore < 85;
    return true;
  });

  const highMatchCount = opportunities.filter(o => o.matchScore >= 85 && !o.dismissed).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Search Parameters Bar */}
      <div className="shrink-0 border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">CV Profile</span>
            <div className="relative">
              <select value={activeProfile} onChange={e => setActiveProfile(e.target.value)} className="h-7 pl-2.5 pr-7 border border-border rounded-lg text-xs font-semibold text-foreground bg-background focus:outline-none appearance-none cursor-pointer">
                {["Backend Focus","Full-Stack Focus","ML Engineer","Management Track"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {USER_SKILLS_ALL.map(skill => {
              const active = activeSkills.includes(skill);
              return (
                <button key={skill} onClick={() => setActiveSkills(p => active ? p.filter(s=>s!==skill) : [...p, skill])}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>
                  {skill}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
              <span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-[11px] text-muted-foreground">Synced 3m ago</span>
            </div>
            <button onClick={handleSync} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""}/>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Feed */}
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-foreground">
                <span style={{ fontFamily:"'JetBrains Mono',monospace" }} className="text-primary">{filtered.length}</span>
                <span className="text-muted-foreground ml-1">opportunities</span>
              </p>
              {highMatchCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Star size={9} fill="currentColor"/>{highMatchCount} high match
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
              {(["all","high","medium"] as const).map(f => (
                <button key={f} onClick={() => setScoreFilter(f)} className={`h-6 px-2.5 rounded-md text-[11px] font-semibold transition-all ${scoreFilter===f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {f==="all" ? "All" : f==="high" ? "≥ 85%" : "70–84%"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Radio size={36} className="text-muted-foreground/30 mb-3"/>
                <p className="text-sm font-semibold text-foreground">No opportunities</p>
                <p className="text-xs text-muted-foreground mt-1">Adjust the score filter or sync for fresh results</p>
                <button onClick={handleSync} className="mt-4 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">Sync Now</button>
              </div>
            ) : (
              filtered.map(opp => <OpportunityCard key={opp.id} opp={opp} onAdd={handleAdd} onDismiss={handleDismiss}/>)
            )}
          </div>
        </div>

        {/* Insights sidebar */}
        <div className="w-[272px] shrink-0 border-l border-border bg-background overflow-hidden">
          <InsightsPanel/>
        </div>
      </div>
    </div>
  );
}

// ─── Outreach: helpers ────────────────────────────────────────────────────────

function followUpUrgency(dateStr: string): "overdue" | "today" | "soon" | "fine" {
  const diff = Math.floor((new Date(dateStr).getTime() - TODAY.getTime()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 2) return "soon";
  return "fine";
}

// ─── Outreach: Interaction Panel ──────────────────────────────────────────────

function InteractionPanel({ contact, onUpdate, onClose }: {
  contact: Contact;
  onUpdate: (c: Contact) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(contact.notes);
  const [status, setStatus] = useState<OutreachStatus>(contact.status);
  const [nextDate, setNextDate] = useState(contact.nextActionDate);
  const urgency = followUpUrgency(contact.nextActionDate);

  const save = () => onUpdate({ ...contact, notes, status, nextActionDate: nextDate });

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: contact.avatarColor }}>
              {contact.avatarInitial}
            </div>
            <div>
              <p className="font-semibold text-foreground">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-3 h-3 rounded-sm flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: contact.companyColor }}>{contact.company.charAt(0)}</div>
                <span className="text-[11px] text-muted-foreground">{contact.company}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 mt-3">
          {contact.linkedin && (
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-accent/40 transition-all">
              <Linkedin size={12} />LinkedIn
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-accent/40 transition-all">
              <Mail size={12} />Email
            </a>
          )}
        </div>

        {/* Linked app badge */}
        {contact.linkedApp && (
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-accent/60 rounded-lg border border-primary/20">
            <Briefcase size={11} className="text-primary shrink-0" />
            <span className="text-[11px] font-semibold text-primary">{contact.linkedApp.company} — {contact.linkedApp.role}</span>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Status</label>
          <div className="relative">
            <select value={status} onChange={e => setStatus(e.target.value as OutreachStatus)}
              className="w-full h-9 pl-3 pr-8 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
              {(["To Contact","Connection Sent","In Discussion","Coffee Chat","Ghosted","Replied"] as OutreachStatus[]).map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Next action date */}
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Next Action Date</label>
          <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}
            className="w-full h-9 px-3 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          {(urgency === "overdue" || urgency === "today") && (
            <button onClick={save} className="mt-2 w-full h-8 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-orange-600 transition-colors">
              <Send size={12} />Send Follow-up Now
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Interaction Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={10}
            placeholder="Log your conversation, key points, next steps..."
            className="w-full text-sm text-foreground bg-background border border-border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 leading-relaxed placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="shrink-0 px-5 pb-4">
        <button onClick={save} className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Outreach: Contact Row ────────────────────────────────────────────────────

function ContactRow({ contact, selected, onClick }: {
  contact: Contact; selected: boolean; onClick: () => void;
}) {
  const urgency = followUpUrgency(contact.nextActionDate);
  const { badge, dot } = OUTREACH_STATUS_STYLE[contact.status];

  const urgencyDateClass = urgency === "overdue" ? "text-red-600 font-semibold" :
    urgency === "today" ? "text-orange-600 font-semibold" : "text-muted-foreground";

  return (
    <tr
      onClick={onClick}
      className={`group cursor-pointer transition-all ${selected ? "bg-accent/40" : "hover:bg-muted/30"} ${urgency === "overdue" ? "border-l-2 border-red-400" : urgency === "today" ? "border-l-2 border-orange-400" : "border-l-2 border-transparent"}`}
    >
      {/* Contact info */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: contact.avatarColor }}>
              {contact.avatarInitial}
            </div>
            {urgency === "overdue" && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-card animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{contact.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{contact.title}</p>
          </div>
        </div>
      </td>

      {/* Company */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: contact.companyColor }}>
            {contact.company.charAt(0)}
          </div>
          <span className="text-sm text-foreground">{contact.company}</span>
          {contact.linkedApp && <Briefcase size={11} className="text-primary ml-1 shrink-0" title={`Linked: ${contact.linkedApp.role}`} />}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>{contact.status}</span>
        </div>
      </td>

      {/* Follow-up date */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className={`text-xs ${urgencyDateClass}`}>
            {urgency === "overdue" ? "Overdue · " : urgency === "today" ? "Today · " : ""}{contact.nextActionDate}
          </span>
          {(urgency === "overdue" || urgency === "today") && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
              Follow up!
            </span>
          )}
        </div>
      </td>

      {/* Quick actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {contact.linkedin && (
            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-all">
              <Linkedin size={13} />
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-all">
              <Mail size={13} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Outreach: View ───────────────────────────────────────────────────────────

function OutreachView() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [selectedId, setSelectedId] = useState<string>("ct3"); // overdue by default
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all");

  const selectedContact = contacts.find(c => c.id === selectedId) ?? null;
  const filtered = statusFilter === "all" ? contacts : contacts.filter(c => c.status === statusFilter);
  const overdueCount = contacts.filter(c => followUpUrgency(c.nextActionDate) === "overdue").length;
  const todayCount   = contacts.filter(c => followUpUrgency(c.nextActionDate) === "today").length;

  const handleUpdate = (updated: Contact) => setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Left: Contact Table ── */}
      <div className="flex flex-col overflow-hidden flex-1 min-w-0">

        {/* Toolbar */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-5 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-foreground">
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-primary">{contacts.length}</span>
              <span className="text-muted-foreground ml-1">contacts</span>
            </p>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {overdueCount} overdue
              </span>
            )}
            {todayCount > 0 && (
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                {todayCount} due today
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OutreachStatus | "all")}
                className="h-8 pl-3 pr-8 border border-border rounded-lg text-xs font-semibold text-foreground bg-background focus:outline-none appearance-none cursor-pointer">
                <option value="all">All Statuses</option>
                {(["To Contact","Connection Sent","In Discussion","Coffee Chat","Ghosted","Replied"] as OutreachStatus[]).map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button className="h-8 pl-2.5 pr-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
              <Plus size={13} strokeWidth={2.5} />Add Contact
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                {["Contact", "Company", "Status", "Follow-Up Radar", "Actions"].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-5 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(contact => (
                <ContactRow key={contact.id} contact={contact} selected={selectedId === contact.id} onClick={() => setSelectedId(contact.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right: Interaction Panel ── */}
      <div className="w-[340px] shrink-0 overflow-hidden">
        {selectedContact ? (
          <InteractionPanel
            key={selectedContact.id}
            contact={selectedContact}
            onUpdate={handleUpdate}
            onClose={() => setSelectedId("")}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card border-l border-border">
            <MessageCircle size={36} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-foreground">Select a contact</p>
            <p className="text-xs text-muted-foreground mt-1">Click any row to log an interaction</p>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Vault: Question Card ─────────────────────────────────────────────────────

function QuestionCard({ q, onDelete }: { q: VaultQuestion; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-all">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-foreground leading-snug flex-1">{q.question}</p>
          {q.frequency >= 2 && (
            <span className="shrink-0 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              🔥 Asked {q.frequency}×
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {q.companies.map(co => (
            <div key={co.name} className="flex items-center gap-1">
              <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: co.color }}>{co.initial}</div>
              <span className="text-[11px] text-muted-foreground">{co.name}</span>
            </div>
          ))}
          <span className="text-muted-foreground">·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-muted-foreground">{daysSince(q.date)}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {q.tags.map(tag => (
            <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getSkillColor(tag)}`}>{tag}</span>
          ))}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${open ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          {open ? "Hide answer" : "Show answer"}
        </button>
      </div>

      {/* Expanded answer */}
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{q.answer}</p>
          {q.hasCode && q.codeSnippet && (
            <pre
              className="rounded-xl p-4 text-xs overflow-x-auto leading-relaxed"
              style={{ backgroundColor: "#0F172A", color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace" }}
            >
              <code>{q.codeSnippet}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Vault: View ──────────────────────────────────────────────────────────────

function VaultView() {
  const [questions, setQuestions] = useState<VaultQuestion[]>(INITIAL_QUESTIONS);
  const [dumpText, setDumpText] = useState("");
  const [dumpCompany, setDumpCompany] = useState("Stripe");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Compute tag counts
  const tagCounts: Record<string, number> = {};
  questions.forEach(q => q.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const filtered = questions.filter(q => {
    if (activeTag && !q.tags.includes(activeTag)) return false;
    if (searchText && !q.question.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const handleDump = () => {
    if (!dumpText.trim()) return;
    const newQ: VaultQuestion = {
      id: `vq${Date.now()}`,
      question: dumpText.trim(),
      answer: "",
      hasCode: false,
      tags: ["General"],
      companies: [{ name: dumpCompany, initial: dumpCompany.charAt(0), color: "#4F46E5" }],
      date: "2026-06-27",
      frequency: 1,
    };
    setQuestions(prev => [newQ, ...prev]);
    setDumpText("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Quick Dump Bar ── */}
      <div className="shrink-0 border-b border-border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleDump()}
              placeholder="What were you just asked? Dump it here before you forget..."
              className="w-full h-10 pl-4 pr-4 border border-border rounded-xl text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
          <div className="relative shrink-0">
            <select value={dumpCompany} onChange={e => setDumpCompany(e.target.value)}
              className="h-10 pl-3 pr-8 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none appearance-none cursor-pointer">
              {["Stripe","Anthropic","Linear","Cloudflare","Vercel","Notion","Figma","Google","Other"].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <button onClick={handleDump} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-1.5">
            <Plus size={15} strokeWidth={2.5} />Save
          </button>
        </div>
        {/* Search */}
        <div className="relative mt-2.5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
            placeholder="Search questions..."
            className="w-full h-8 pl-9 pr-3 border border-border rounded-lg text-xs text-foreground bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar: tag filters */}
        <div className="w-[200px] shrink-0 border-r border-border overflow-y-auto py-4 bg-background">
          <p className="px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Filter by Tag</p>

          <button
            onClick={() => setActiveTag(null)}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${!activeTag ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span>All questions</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px]">{questions.length}</span>
          </button>

          {sortedTags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${activeTag === tag ? "text-primary font-semibold bg-accent/50" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Hash size={10} className="shrink-0 opacity-50" />
                <span className="truncate">{tag}</span>
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] shrink-0 ml-2">{count}</span>
            </button>
          ))}
        </div>

        {/* Main: question cards */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No questions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Use the Quick Dump bar above to capture interview questions</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              <p className="text-xs text-muted-foreground mb-4">
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-foreground font-semibold">{filtered.length}</span> questions
                {activeTag && <> tagged <span className="text-primary font-semibold">#{activeTag}</span></>}
              </p>
              {filtered.map(q => (
                <QuestionCard key={q.id} q={q} onDelete={id => setQuestions(prev => prev.filter(x => x.id !== id))} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Streak: Heatmap ──────────────────────────────────────────────────────────

function ActivityHeatmap() {
  const getColor = (n: number) =>
    n === 0 ? "#E2E8F0" : n <= 2 ? "#99F6E4" : n <= 5 ? "#2DD4BF" : "#0F766E";

  // 52 week columns × 7 day rows
  const weeks = Array.from({ length: 52 }, (_, w) => HEATMAP_CELLS.slice(w * 7, w * 7 + 7));

  // Month labels (approximate positions)
  const MONTH_LABELS: Record<number, string> = { 0:"Jul", 4:"Aug", 9:"Sep", 13:"Oct", 18:"Nov", 22:"Dec", 27:"Jan", 31:"Feb", 35:"Mar", 40:"Apr", 44:"May", 48:"Jun" };
  const DAY_LABELS = ["M","","W","","F","","S"];

  return (
    <div className="overflow-x-auto">
      {/* Month row */}
      <div className="flex gap-[3px] mb-1 pl-6">
        {weeks.map((_, wi) => (
          <div key={wi} style={{ fontFamily: "'JetBrains Mono', monospace", width: 13 }} className="text-[9px] text-muted-foreground shrink-0">
            {MONTH_LABELS[wi] ?? ""}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", width: 16, height: 13 }} className="text-[9px] text-muted-foreground flex items-center justify-end pr-1">
              {d}
            </div>
          ))}
        </div>
        {/* Cells */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((count, di) => (
              <div key={di}
                title={`${count} action${count !== 1 ? "s" : ""}`}
                className="rounded-[2px] cursor-pointer hover:ring-1 hover:ring-teal-400 transition-all"
                style={{ width: 13, height: 13, backgroundColor: getColor(count) }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 1, 3, 6, 8].map(n => (
          <div key={n} className="rounded-[2px]" style={{ width: 13, height: 13, backgroundColor: getColor(n) }} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

function StreakSection() {
  const stats = [
    { label: "Current Streak", value: "12", unit: "days", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Longest Streak", value: "18", unit: "days", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Actions",  value: "145", unit: "all time", icon: Zap,   color: "text-primary",  bg: "bg-accent" },
    { label: "This Week",      value: "23",  unit: "actions",  icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-orange-500" />
        <h3 className="font-semibold text-foreground">Activity Streak</h3>
        <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          🔥 12 days and counting
        </span>
      </div>

      <div className="flex gap-4 mb-5">
        {/* Streak stats */}
        <div className="flex gap-3">
          {stats.map(({ label, value, unit, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
              <div className={`flex items-center justify-center gap-1 mb-0.5 ${color}`}>
                <Icon size={12} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xl font-bold text-foreground leading-none">{value}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{unit}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Today's activity feed */}
        <div className="flex-1 border-l border-border pl-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Today</p>
          <div className="space-y-2">
            {TODAY_ACTIVITIES.map(({ icon: Icon, color, text, time }, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: color + "20" }}>
                  <Icon size={11} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-tight">{text}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <ActivityHeatmap />
    </div>
  );
}

// ─── Add Application Modal ────────────────────────────────────────────────────

function AddAppModal({ onClose, onAdd }: { onClose: () => void; onAdd: (app: Omit<Application, "id" | "initial" | "color">) => void }) {
  const [form, setForm] = useState({ company:"", role:"", url:"", resumeVersion:"v1", status:"Applied" as Status, dateApplied:"2026-06-27" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if(!form.company.trim()||!form.role.trim())return; onAdd({ company:form.company.trim(), role:form.role.trim(), dateApplied:form.dateApplied, resumeVersion:form.resumeVersion, status:form.status }); onClose(); };
  const inputClass = "w-full h-9 px-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/10 backdrop-blur-[3px]" onClick={onClose}/>
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-[472px] max-w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border"><div><h2 className="font-semibold text-foreground">Track New Application</h2><p className="text-xs text-muted-foreground mt-0.5">Add a job to your pipeline</p></div><button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X size={15}/></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Job Posting URL</label><div className="relative"><input type="url" placeholder="https://jobs.company.com/role/..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} className={inputClass+" pr-9"}/><Sparkles size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40"/></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Company <span className="text-red-500">*</span></label><input required type="text" placeholder="e.g. Stripe" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} className={inputClass}/></div><div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Job Title <span className="text-red-500">*</span></label><input required type="text" placeholder="e.g. Backend Engineer" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={inputClass}/></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Resume Version</label><select value={form.resumeVersion} onChange={e=>setForm(f=>({...f,resumeVersion:e.target.value}))} className={inputClass+" cursor-pointer appearance-none"}>{["v1","v2","v3","v4","v5"].map(v=><option key={v} value={v}>{v}</option>)}</select></div><div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Date Applied</label><input type="date" value={form.dateApplied} onChange={e=>setForm(f=>({...f,dateApplied:e.target.value}))} className={inputClass}/></div></div>
          <div><label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Initial Stage</label><div className="grid grid-cols-5 gap-1.5">{COLUMNS.map(({key})=>(<button key={key} type="button" onClick={()=>setForm(f=>({...f,status:key}))} className={`text-[11px] font-semibold py-1.5 px-1 rounded-lg border transition-all leading-tight text-center ${form.status===key?STATUS_BADGE[key]+" border-current":"border-border text-muted-foreground hover:bg-muted"}`}>{key}</button>))}</div></div>
          <div className="flex gap-3 pt-1"><button type="button" onClick={onClose} className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button><button type="submit" className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save & Track</button></div>
        </form>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("radar");
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (partial: Omit<Application, "id" | "initial" | "color">) => {
    const color = LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)];
    setApps(prev => [{ ...partial, id: String(Date.now()), initial: partial.company.charAt(0).toUpperCase(), color }, ...prev]);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="flex h-screen bg-background overflow-hidden">
      <Sidebar view={view} setView={setView} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header view={view} onAdd={() => setShowModal(true)} />
        <main className="flex-1 overflow-hidden">
          {view === "pipeline"  && <PipelineView apps={apps} setApps={setApps} />}
          {view === "dashboard" && <DashboardView apps={apps} />}
          {view === "applications" && <ApplicationsView apps={apps} />}
          {view === "intel"     && <IntelView apps={apps} />}
          {view === "radar"     && <RadarView onAddApp={handleAdd} />}
          {view === "outreach"  && <OutreachView />}
          {view === "vault"     && <VaultView />}
          {view === "profile"   && <ProfileView />}
        </main>
      </div>
      {showModal && <AddAppModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
