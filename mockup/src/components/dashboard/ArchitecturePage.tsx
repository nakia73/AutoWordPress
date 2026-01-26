"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  GitBranch,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  List,
  Grid3X3,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  architectureNodes,
  getNodeById,
  getChildNodes,
  getRootNode,
  getNodePath,
  getAllIssues,
  type ArchitectureNode,
  type Issue,
  type IssueLevel,
  type IssueCategory,
  type DiagramNode,
  type DiagramEdge,
} from "./architectureData";

// ============================================================================
// Issue Badge Component
// ============================================================================

function IssueBadge({ level }: { level: IssueLevel }) {
  const config = {
    high: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "High" },
    medium: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Medium" },
    low: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Low" },
  };

  return (
    <Badge variant="outline" className={cn("text-xs", config[level].color)}>
      {config[level].label}
    </Badge>
  );
}

// ============================================================================
// Issue Card Component
// ============================================================================

function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);

  const levelIcon = {
    high: <AlertTriangle className="w-4 h-4 text-red-400" />,
    medium: <AlertCircle className="w-4 h-4 text-yellow-400" />,
    low: <Info className="w-4 h-4 text-blue-400" />,
  };

  return (
    <motion.div
      layout
      className={cn(
        "p-3 rounded-lg border transition-colors cursor-pointer",
        issue.level === "high"
          ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
          : issue.level === "medium"
          ? "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40"
          : "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{levelIcon[issue.level]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
            <IssueBadge level={issue.level} />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">{issue.title}</h4>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                {issue.location && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <span className="text-foreground/60">Location:</span> {issue.location}
                  </p>
                )}
                {issue.solution && (
                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                    <p className="text-xs text-primary/80">
                      <span className="font-medium">Solution:</span> {issue.solution}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Issue Filters Component
// ============================================================================

const categoryLabels: Record<IssueCategory, string> = {
  interface: "Interface",
  responsibility: "Responsibility",
  "error-handling": "Error Handling",
  "data-flow": "Data Flow",
  state: "State",
  schema: "Schema",
  security: "Security",
  performance: "Performance",
};

interface IssueFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLevels: IssueLevel[];
  onLevelToggle: (level: IssueLevel) => void;
  selectedCategories: IssueCategory[];
  onCategoryToggle: (category: IssueCategory) => void;
  onClearFilters: () => void;
}

function IssueFilters({
  searchQuery,
  onSearchChange,
  selectedLevels,
  onLevelToggle,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
}: IssueFiltersProps) {
  const hasActiveFilters =
    searchQuery || selectedLevels.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Level Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Level:</span>
        {(["high", "medium", "low"] as IssueLevel[]).map((level) => {
          const isSelected = selectedLevels.includes(level);
          const config = {
            high: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
            medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
            low: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
          };
          return (
            <Badge
              key={level}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors text-xs capitalize",
                isSelected ? config[level] : "opacity-50 hover:opacity-100"
              )}
              onClick={() => onLevelToggle(level)}
            >
              {level}
            </Badge>
          );
        })}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Category:</span>
        {(Object.keys(categoryLabels) as IssueCategory[]).map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors text-xs",
                isSelected
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "opacity-50 hover:opacity-100"
              )}
              onClick={() => onCategoryToggle(category)}
            >
              {categoryLabels[category]}
            </Badge>
          );
        })}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
          <X className="w-3 h-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Global Issues List Component
// ============================================================================

function GlobalIssuesList({
  issues,
  searchQuery,
  selectedLevels,
  selectedCategories,
}: {
  issues: Issue[];
  searchQuery: string;
  selectedLevels: IssueLevel[];
  selectedCategories: IssueCategory[];
}) {
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(query) &&
          !issue.description.toLowerCase().includes(query) &&
          !issue.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(issue.level)) {
        return false;
      }
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(issue.category)) {
        return false;
      }
      return true;
    });
  }, [issues, searchQuery, selectedLevels, selectedCategories]);

  // Sort by level priority
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.level] - order[b.level];
    });
  }, [filteredIssues]);

  if (sortedIssues.length === 0) {
    return (
      <div className="py-8 text-center">
        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No issues match your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Showing {sortedIssues.length} of {issues.length} issues
      </p>
      {sortedIssues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}

// ============================================================================
// Tree Node Component
// ============================================================================

function TreeNode({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: ArchitectureNode;
  selectedId: string;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = getChildNodes(node.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="select-none">
      <motion.button
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary border border-primary/20"
            : "hover:bg-secondary/50 text-foreground/80"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {hasChildren ? (
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} className="w-4 h-4">
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        ) : (
          <div className="w-4 h-4" />
        )}
        <span className="flex-1 truncate">{node.nameJa}</span>
        {node.issues.length > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5",
              node.issues.some((i) => i.level === "high")
                ? "text-red-400 border-red-400/30"
                : node.issues.some((i) => i.level === "medium")
                ? "text-yellow-400 border-yellow-400/30"
                : "text-blue-400 border-blue-400/30"
            )}
          >
            {node.issues.length}
          </Badge>
        )}
      </motion.button>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Diagram Renderer Component
// ============================================================================

function DiagramRenderer({
  node,
  zoom,
}: {
  node: ArchitectureNode;
  zoom: number;
}) {
  const { diagram } = node;

  // Calculate bounds
  const bounds = useMemo(() => {
    if (!diagram.nodes.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    const xs = diagram.nodes.map((n) => n.position.x);
    const ys = diagram.nodes.map((n) => n.position.y);
    return {
      minX: Math.min(...xs) - 50,
      minY: Math.min(...ys) - 50,
      maxX: Math.max(...xs) + 150,
      maxY: Math.max(...ys) + 100,
    };
  }, [diagram.nodes]);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  const getNodeColor = (type: DiagramNode["type"]) => {
    const colors = {
      user: "#64748b",
      service: "#3b82f6",
      database: "#22c55e",
      external: "#f59e0b",
      process: "#a855f7",
      storage: "#06b6d4",
      layer: "#6366f1",
    };
    return colors[type];
  };

  const getNodeIcon = (type: DiagramNode["type"]) => {
    switch (type) {
      case "user":
        return "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";
      case "database":
        return "M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2z";
      case "external":
        return "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z";
      case "process":
        return "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z";
      default:
        return "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z";
    }
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-background/50 rounded-lg border border-border/50">
      <svg
        width={width * zoom}
        height={height * zoom}
        viewBox={`${bounds.minX} ${bounds.minY} ${width} ${height}`}
        className="min-w-full"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-animated"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Groups */}
        {diagram.groups?.map((group) => {
          const groupNodes = diagram.nodes.filter((n) => group.nodeIds.includes(n.id));
          if (!groupNodes.length) return null;
          const gxs = groupNodes.map((n) => n.position.x);
          const gys = groupNodes.map((n) => n.position.y);
          const gMinX = Math.min(...gxs) - 30;
          const gMinY = Math.min(...gys) - 40;
          const gMaxX = Math.max(...gxs) + 130;
          const gMaxY = Math.max(...gys) + 70;

          return (
            <g key={group.id}>
              <rect
                x={gMinX}
                y={gMinY}
                width={gMaxX - gMinX}
                height={gMaxY - gMinY}
                rx="8"
                fill={group.color || "#3b82f610"}
                stroke="#3b82f630"
                strokeDasharray="4"
              />
              <text
                x={gMinX + 8}
                y={gMinY + 16}
                fill="#64748b"
                fontSize="10"
                fontWeight="500"
              >
                {group.label}
              </text>
            </g>
          );
        })}

        {/* Edges */}
        {diagram.edges.map((edge, idx) => {
          const fromNode = diagram.nodes.find((n) => n.id === edge.from);
          const toNode = diagram.nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.position.x + 50;
          const y1 = fromNode.position.y + 25;
          const x2 = toNode.position.x + 50;
          const y2 = toNode.position.y + 25;

          // Calculate control points for curved lines
          const dx = x2 - x1;
          const dy = y2 - y1;
          const cx = x1 + dx * 0.5;
          const cy = y1 + dy * 0.5;

          return (
            <g key={`${edge.from}-${edge.to}-${idx}`}>
              <path
                d={`M ${x1} ${y1} Q ${cx} ${cy - Math.abs(dx) * 0.1} ${x2} ${y2}`}
                fill="none"
                stroke={edge.animated ? "#f59e0b" : "#64748b"}
                strokeWidth="1.5"
                strokeDasharray={edge.style === "dashed" ? "6,4" : edge.style === "dotted" ? "2,2" : "none"}
                markerEnd={edge.animated ? "url(#arrowhead-animated)" : "url(#arrowhead)"}
                opacity={0.6}
              >
                {edge.animated && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="20"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
              {edge.label && (
                <text
                  x={cx}
                  y={cy - 8}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {diagram.nodes.map((node) => {
          const color = node.color || getNodeColor(node.type);
          const lines = node.label.split("\n");

          return (
            <g key={node.id}>
              <motion.rect
                x={node.position.x}
                y={node.position.y}
                width={100}
                height={50}
                rx="6"
                fill={`${color}15`}
                stroke={color}
                strokeWidth="1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              />
              <svg
                x={node.position.x + 8}
                y={node.position.y + 8}
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path d={getNodeIcon(node.type)} fill={color} opacity="0.7" />
              </svg>
              {lines.map((line, i) => (
                <text
                  key={i}
                  x={node.position.x + 50}
                  y={node.position.y + 28 + i * 12}
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

function Breadcrumb({
  nodeId,
  onNavigate,
}: {
  nodeId: string;
  onNavigate: (id: string) => void;
}) {
  const path = getNodePath(nodeId);

  return (
    <div className="flex items-center gap-1 text-sm">
      {path.map((node, idx) => (
        <div key={node.id} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <button
            onClick={() => onNavigate(node.id)}
            className={cn(
              "hover:text-primary transition-colors",
              idx === path.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {node.nameJa}
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Issues Summary Component
// ============================================================================

function IssuesSummary() {
  const allIssues = getAllIssues();
  const highCount = allIssues.filter((i) => i.level === "high").length;
  const mediumCount = allIssues.filter((i) => i.level === "medium").length;
  const lowCount = allIssues.filter((i) => i.level === "low").length;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-1 sm:gap-2 mb-1">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
          <span className="text-[10px] sm:text-xs text-red-400 font-medium">High</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-red-400">{highCount}</p>
      </div>
      <div className="p-2 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-center gap-1 sm:gap-2 mb-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
          <span className="text-[10px] sm:text-xs text-yellow-400 font-medium">Medium</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-yellow-400">{mediumCount}</p>
      </div>
      <div className="p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-1 sm:gap-2 mb-1">
          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
          <span className="text-[10px] sm:text-xs text-blue-400 font-medium">Low</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-blue-400">{lowCount}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Architecture Page Component
// ============================================================================

interface ArchitecturePageProps {
  onNavigate?: (page: string) => void;
}

export default function ArchitecturePage({ onNavigate }: ArchitecturePageProps) {
  const [selectedNodeId, setSelectedNodeId] = useState("system-overview");
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [activeTab, setActiveTab] = useState<"diagram" | "issues" | "all-issues">("diagram");
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<IssueLevel[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);

  const selectedNode = getNodeById(selectedNodeId) || getRootNode();
  const childNodes = getChildNodes(selectedNodeId);
  const allIssues = useMemo(() => getAllIssues(), []);

  // Filter functions
  const handleLevelToggle = (level: IssueLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleCategoryToggle = (category: IssueCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedCategories([]);
  };

  // Filtered issues for current node
  const filteredNodeIssues = useMemo(() => {
    return selectedNode.issues.filter((issue) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(query) &&
          !issue.description.toLowerCase().includes(query) &&
          !issue.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedLevels.length > 0 && !selectedLevels.includes(issue.level)) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(issue.category)) {
        return false;
      }
      return true;
    });
  }, [selectedNode.issues, searchQuery, selectedLevels, selectedCategories]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6 max-w-[1600px]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Architecture Directory</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Argo Noteの本番環境アーキテクチャ図と課題一覧
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Navigation Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden gap-2"
          >
            <GitBranch className="w-4 h-4" />
            {showMobileNav ? "Hide" : "Show"} Tree
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "tree" ? "grid" : "tree")}
            className="gap-2 hidden sm:flex"
          >
            {viewMode === "tree" ? (
              <>
                <Grid3X3 className="w-4 h-4" />
                Grid View
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                Tree View
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Issues Summary */}
      <Card className="mb-6 border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Issues Summary (from Integration Risk Report)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IssuesSummary />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Sidebar - Tree Navigation */}
        <AnimatePresence>
          {(showMobileNav || typeof window !== 'undefined') && (
            <motion.div
              className={cn(
                "lg:col-span-3",
                !showMobileNav && "hidden lg:block"
              )}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-border/50 bg-card/50 lg:sticky lg:top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    Logic Tree
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[50vh] lg:max-h-[calc(100vh-300px)] overflow-auto">
                  <TreeNode
                    node={getRootNode()}
                    selectedId={selectedNodeId}
                    onSelect={(id) => {
                      setSelectedNodeId(id);
                      setShowMobileNav(false);
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {/* Breadcrumb & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="overflow-x-auto">
              <Breadcrumb nodeId={selectedNodeId} onNavigate={setSelectedNodeId} />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-10 sm:w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom} className="h-8 w-8 p-0">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="bg-secondary/30 w-full sm:w-auto inline-flex">
                <TabsTrigger value="diagram" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Diagram</span>
                  <span className="sm:hidden">図</span>
                </TabsTrigger>
                <TabsTrigger value="issues" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Issues</span>
                  <span className="sm:hidden">課題</span>
                  <Badge variant="outline" className="ml-1 text-[10px] px-1">{selectedNode.issues.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="all-issues" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">All Issues</span>
                  <span className="sm:hidden">全課題</span>
                  <Badge variant="outline" className="ml-1 text-[10px] px-1">{allIssues.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="diagram" className="space-y-4">
              {/* Node Info */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedNode.nameJa}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {selectedNode.name} (Level {selectedNode.level})
                      </CardDescription>
                    </div>
                    {selectedNode.parentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNodeId(selectedNode.parentId!)}
                        className="gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                </CardContent>
              </Card>

              {/* Diagram */}
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-2 sm:p-4">
                  <div className="h-[300px] sm:h-[400px]">
                    <DiagramRenderer node={selectedNode} zoom={zoom} />
                  </div>
                </CardContent>
              </Card>

              {/* Child Nodes */}
              {childNodes.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Sub-components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {childNodes.map((child) => (
                        <motion.button
                          key={child.id}
                          onClick={() => setSelectedNodeId(child.id)}
                          className="p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors text-left group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{child.nameJa}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {child.description}
                          </p>
                          {child.issues.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  child.issues.some((i) => i.level === "high")
                                    ? "text-red-400 border-red-400/30"
                                    : child.issues.some((i) => i.level === "medium")
                                    ? "text-yellow-400 border-yellow-400/30"
                                    : "text-blue-400 border-blue-400/30"
                                )}
                              >
                                {child.issues.length} issues
                              </Badge>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {/* Filters */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    Filter Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IssueFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedLevels={selectedLevels}
                    onLevelToggle={handleLevelToggle}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    onClearFilters={handleClearFilters}
                  />
                </CardContent>
              </Card>

              {selectedNode.issues.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="py-12 text-center">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No issues found for this component</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Issues for {selectedNode.nameJa}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Showing {filteredNodeIssues.length} of {selectedNode.issues.length} issues.
                      Click on an issue to expand details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filteredNodeIssues.length === 0 ? (
                      <div className="py-8 text-center">
                        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No issues match your filters</p>
                      </div>
                    ) : (
                      [...filteredNodeIssues]
                        .sort((a, b) => {
                          const order = { high: 0, medium: 1, low: 2 };
                          return order[a.level] - order[b.level];
                        })
                        .map((issue) => (
                          <IssueCard key={issue.id} issue={issue} />
                        ))
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* All Issues Tab */}
            <TabsContent value="all-issues" className="space-y-4">
              {/* Filters */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    Filter All Issues
                  </CardTitle>
                  <CardDescription className="text-xs">
                    View and filter all {allIssues.length} issues from the Integration Risk Report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IssueFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedLevels={selectedLevels}
                    onLevelToggle={handleLevelToggle}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    onClearFilters={handleClearFilters}
                  />
                </CardContent>
              </Card>

              {/* Issues List */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    All Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GlobalIssuesList
                    issues={allIssues}
                    searchQuery={searchQuery}
                    selectedLevels={selectedLevels}
                    selectedCategories={selectedCategories}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
