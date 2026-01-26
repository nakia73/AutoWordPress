"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Palette,
  Settings,
  Users,
  Plus,
  Eye,
  Search,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Globe,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WordPressAdminProps {
  publishedArticle: {
    title: string;
    content: string;
  };
  onViewLive: () => void;
  onBackToDashboard: () => void;
}

// Mock articles for the WordPress admin
const mockPosts = [
  {
    id: 1,
    title: "Next.js 14 Server Components: A Complete Migration Guide",
    status: "publish",
    author: "AI Writer",
    date: "2024-01-25",
    categories: ["Web Development"],
    isNew: true,
  },
  {
    id: 2,
    title: "10 Essential Tips for Building Scalable React Applications",
    status: "publish",
    author: "AI Writer",
    date: "2024-01-24",
    categories: ["React", "Performance"],
    isNew: false,
  },
  {
    id: 3,
    title: "Why TypeScript is a Game Changer for Large Codebases",
    status: "publish",
    author: "AI Writer",
    date: "2024-01-23",
    categories: ["TypeScript"],
    isNew: false,
  },
  {
    id: 4,
    title: "The Future of AI in Software Development",
    status: "draft",
    author: "AI Writer",
    date: "2024-01-22",
    categories: ["AI", "Future Tech"],
    isNew: false,
  },
  {
    id: 5,
    title: "Mastering CSS Grid: A Complete Guide",
    status: "scheduled",
    author: "AI Writer",
    date: "2024-01-26",
    categories: ["CSS", "Layout"],
    isNew: false,
  },
];

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "posts", label: "Posts", icon: FileText, active: true },
  { id: "media", label: "Media", icon: Image },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "comments", label: "Comments", icon: MessageSquare, badge: 3 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

type ViewMode = "list" | "detail";

export default function WordPressAdmin({
  publishedArticle,
  onViewLive,
  onBackToDashboard,
}: WordPressAdminProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewBadge, setShowNewBadge] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState("posts");

  // Update the first post with the published article title
  const posts = mockPosts.map((post, index) =>
    index === 0 ? { ...post, title: publishedArticle.title } : post
  );

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPost = (post: typeof posts[0]) => {
    setSelectedPost(post);
    setViewMode("detail");
    if (post.isNew) setShowNewBadge(false);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedPost(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "publish":
        return (
          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
            Scheduled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#f0f0f1]"
    >
      {/* WordPress Admin Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="h-8 bg-[#1d2327] flex items-center justify-between px-3 text-white text-xs"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 bg-white/20 rounded flex items-center justify-center"
          >
            <span className="text-[10px] font-bold">W</span>
          </motion.div>
          <span className="text-white/70 hidden sm:inline">Tech Blog</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-white/70 hover:text-white hover:bg-white/10 px-2"
            onClick={onViewLive}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Visit Site
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/70">Howdy, Admin</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-white/70 hover:text-white hover:bg-white/10 px-2"
            onClick={onBackToDashboard}
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Argo Note
          </Button>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-32px)]">
        {/* WordPress Sidebar */}
        <motion.aside
          initial={{ x: -200 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-40 bg-[#1d2327] text-white/80 flex-shrink-0 hidden md:block"
        >
          <nav className="py-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenuItem === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  onClick={() => setActiveMenuItem(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors relative ${
                    isActive
                      ? "bg-[#2271b1] text-white"
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#72aee6]"
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[#d63638] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-normal text-[#1d2327]">Posts</h1>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#2271b1] hover:bg-[#135e96] text-white"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add New
                      </Button>
                    </motion.div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-7 pl-7 text-xs bg-white border-gray-300 w-48"
                    />
                  </div>
                </div>

                {/* Success Banner for New Post */}
                {showNewBadge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        <strong>Article published!</strong> Your new post is now live.
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                      onClick={() => setShowNewBadge(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}

                {/* Posts Table */}
                <div className="bg-white border border-gray-200 rounded shadow-sm">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-2 hidden sm:block">Author</div>
                    <div className="col-span-2 hidden md:block">Categories</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Table Body */}
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-2 px-3 py-3 border-b border-gray-100 text-xs hover:bg-blue-50/50 group transition-colors ${
                        post.isNew && showNewBadge ? "bg-yellow-50" : ""
                      }`}
                    >
                      <div className="col-span-5">
                        <div className="flex items-start gap-2">
                          {post.isNew && showNewBadge && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="flex-shrink-0 mt-0.5"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                            </motion.span>
                          )}
                          <div>
                            <button
                              onClick={() => handleViewPost(post)}
                              className="font-medium text-[#2271b1] hover:text-[#135e96] hover:underline text-left"
                            >
                              {post.title}
                            </button>
                            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewPost(post)}
                                className="text-[#2271b1] hover:text-[#135e96]"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button className="text-red-600 hover:text-red-800">
                                Trash
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={onViewLive}
                                className="text-[#2271b1] hover:text-[#135e96]"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 hidden sm:flex items-center text-gray-600">
                        {post.author}
                      </div>
                      <div className="col-span-2 hidden md:flex items-center gap-1 flex-wrap">
                        {post.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[#2271b1] hover:underline cursor-pointer"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        {getStatusBadge(post.status)}
                        <span className="text-gray-500 hidden lg:inline">{post.date}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleViewPost(post)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                  <span>{filteredPosts.length} items</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      disabled
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs bg-[#2271b1] text-white border-[#2271b1]"
                    >
                      1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      disabled
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Post Detail / Edit View */
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4"
              >
                {/* Back Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="text-xs text-[#2271b1] hover:text-[#135e96] -ml-2"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to Posts
                  </Button>
                </motion.div>

                {/* Edit Header */}
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-normal text-[#1d2327]">Edit Post</h1>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={onViewLive}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-[#2271b1] hover:bg-[#135e96] text-white"
                    >
                      Update
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Editor */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                      <Input
                        defaultValue={selectedPost?.title}
                        className="border-0 text-lg font-medium h-12 focus-visible:ring-0"
                        placeholder="Add title"
                      />
                    </div>

                    {/* Content */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm min-h-[400px] p-4">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <p>
                          Server Components represent a paradigm shift in how we build
                          React applications. With Next.js 14, migrating to Server
                          Components has never been easier. This guide will walk you
                          through the entire process, from understanding the
                          fundamentals to implementing them in your existing project.
                        </p>

                        <h2 className="text-lg font-semibold mt-6 mb-3">
                          Why Migrate to Server Components?
                        </h2>

                        <p>The benefits of Server Components are substantial:</p>

                        <ul className="list-disc pl-5 space-y-1 my-3">
                          <li>
                            <strong>Reduced Bundle Size:</strong> Server Components
                            don't add to your JavaScript bundle.
                          </li>
                          <li>
                            <strong>Direct Database Access:</strong> Query your
                            database directly from components.
                          </li>
                          <li>
                            <strong>Improved SEO:</strong> Content is rendered on the
                            server.
                          </li>
                          <li>
                            <strong>Better Performance:</strong> Faster Time to
                            Interactive (TTI).
                          </li>
                        </ul>

                        <h2 className="text-lg font-semibold mt-6 mb-3">
                          Prerequisites and Setup
                        </h2>

                        <p>
                          Before we begin, ensure you have Next.js 14 or later
                          installed, understanding of the App Router, and familiarity
                          with async/await patterns.
                        </p>

                        <div className="bg-gray-900 rounded p-3 my-4">
                          <code className="text-green-400 text-sm">
                            npx create-next-app@latest --typescript
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    {/* Publish Box */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-medium text-sm flex items-center justify-between">
                        <span>Publish</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="p-3 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-green-600">Published</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Visibility:</span>
                          <span className="font-medium">Public</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Published:</span>
                          <span className="font-medium">{selectedPost?.date}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600">
                            Move to Trash
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#2271b1] hover:bg-[#135e96] text-white"
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-medium text-sm flex items-center justify-between">
                        <span>Categories</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="p-3 space-y-2 text-xs">
                        {["Web Development", "React", "Performance", "TypeScript"].map(
                          (cat) => (
                            <label key={cat} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                defaultChecked={selectedPost?.categories.includes(cat)}
                                className="rounded border-gray-300"
                              />
                              <span>{cat}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-medium text-sm flex items-center justify-between">
                        <span>Tags</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="p-3 text-xs">
                        <Input
                          placeholder="Add New Tag"
                          className="h-7 text-xs mb-2"
                        />
                        <div className="flex flex-wrap gap-1">
                          {["next.js", "react", "server-components", "migration"].map(
                            (tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] bg-gray-100"
                              >
                                {tag}
                                <X className="w-2 h-2 ml-1 cursor-pointer" />
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 font-medium text-sm flex items-center justify-between">
                        <span>Featured Image</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="p-3">
                        <div className="aspect-video bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <Image className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">
                              Set featured image
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Live Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={onViewLive}
                        className="w-full gold-gradient text-primary-foreground font-medium relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <Globe className="w-4 h-4 mr-2 relative z-10" />
                        <span className="relative z-10">View Live on Website</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
