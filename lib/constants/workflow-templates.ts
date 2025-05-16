import type { WorkflowTemplate } from "@/lib/types"

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  SOFTWARE_DEVELOPMENT: {
    id: "software-development",
    name: "Software Development",
    description: "Ideal for software development teams using an agile approach",
    statuses: [
      {
        name: "Backlog",
        description: "Tasks that are planned but not yet ready for development",
        color: "#6b7280", // gray-500
        order: 0,
        wipLimit: null,
      },
      {
        name: "Ready",
        description: "Tasks that are ready to be worked on",
        color: "#8b5cf6", // violet-500
        order: 1,
        wipLimit: 5,
      },
      {
        name: "In Progress",
        description: "Tasks currently being worked on",
        color: "#3b82f6", // blue-500
        order: 2,
        wipLimit: 3,
      },
      {
        name: "Code Review",
        description: "Tasks that are being reviewed",
        color: "#f59e0b", // amber-500
        order: 3,
        wipLimit: 2,
      },
      {
        name: "Testing",
        description: "Tasks that are being tested",
        color: "#ec4899", // pink-500
        order: 4,
        wipLimit: 2,
      },
      {
        name: "Done",
        description: "Tasks that are completed",
        color: "#10b981", // emerald-500
        order: 5,
        wipLimit: null,
      },
    ],
  },
  MARKETING_CAMPAIGN: {
    id: "marketing-campaign",
    name: "Marketing Campaign",
    description: "Structured workflow for planning and executing marketing campaigns",
    statuses: [
      {
        name: "Ideas",
        description: "Campaign ideas and concepts",
        color: "#8b5cf6", // violet-500
        order: 0,
        wipLimit: null,
      },
      {
        name: "Planning",
        description: "Campaigns being planned and scheduled",
        color: "#6366f1", // indigo-500
        order: 1,
        wipLimit: 3,
      },
      {
        name: "Content Creation",
        description: "Creating assets and content",
        color: "#3b82f6", // blue-500
        order: 2,
        wipLimit: 5,
      },
      {
        name: "Review",
        description: "Content under review",
        color: "#f59e0b", // amber-500
        order: 3,
        wipLimit: 3,
      },
      {
        name: "Scheduled",
        description: "Ready to publish or scheduled",
        color: "#f97316", // orange-500
        order: 4,
        wipLimit: null,
      },
      {
        name: "Live",
        description: "Published and being monitored",
        color: "#10b981", // emerald-500
        order: 5,
        wipLimit: null,
      },
      {
        name: "Analysis",
        description: "Analyzing performance and results",
        color: "#0ea5e9", // sky-500
        order: 6,
        wipLimit: null,
      },
    ],
  },
  DESIGN_PROJECT: {
    id: "design-project",
    name: "Design Project",
    description: "Workflow for design teams working on UI/UX and graphic design projects",
    statuses: [
      {
        name: "Brief",
        description: "Initial project requirements and briefs",
        color: "#6b7280", // gray-500
        order: 0,
        wipLimit: null,
      },
      {
        name: "Research",
        description: "Research and inspiration gathering",
        color: "#8b5cf6", // violet-500
        order: 1,
        wipLimit: null,
      },
      {
        name: "Concepts",
        description: "Creating initial concepts and ideas",
        color: "#3b82f6", // blue-500
        order: 2,
        wipLimit: 4,
      },
      {
        name: "Feedback",
        description: "Gathering feedback on concepts",
        color: "#f59e0b", // amber-500
        order: 3,
        wipLimit: 3,
      },
      {
        name: "Refinement",
        description: "Refining designs based on feedback",
        color: "#ec4899", // pink-500
        order: 4,
        wipLimit: 3,
      },
      {
        name: "Approval",
        description: "Awaiting final approval",
        color: "#f97316", // orange-500
        order: 5,
        wipLimit: 2,
      },
      {
        name: "Delivered",
        description: "Completed and delivered designs",
        color: "#10b981", // emerald-500
        order: 6,
        wipLimit: null,
      },
    ],
  },
  CONTENT_PRODUCTION: {
    id: "content-production",
    name: "Content Production",
    description: "Workflow for content teams creating articles, videos, or podcasts",
    statuses: [
      {
        name: "Ideas",
        description: "Content ideas and topics",
        color: "#8b5cf6", // violet-500
        order: 0,
        wipLimit: null,
      },
      {
        name: "Outline",
        description: "Creating content outlines and plans",
        color: "#6366f1", // indigo-500
        order: 1,
        wipLimit: 5,
      },
      {
        name: "Production",
        description: "Content being created",
        color: "#3b82f6", // blue-500
        order: 2,
        wipLimit: 3,
      },
      {
        name: "Review",
        description: "Content under editorial review",
        color: "#f59e0b", // amber-500
        order: 3,
        wipLimit: 3,
      },
      {
        name: "Revisions",
        description: "Content being revised based on feedback",
        color: "#ec4899", // pink-500
        order: 4,
        wipLimit: 2,
      },
      {
        name: "Ready",
        description: "Ready to publish",
        color: "#f97316", // orange-500
        order: 5,
        wipLimit: null,
      },
      {
        name: "Published",
        description: "Live content",
        color: "#10b981", // emerald-500
        order: 6,
        wipLimit: null,
      },
    ],
  },
  SIMPLE_KANBAN: {
    id: "simple-kanban",
    name: "Simple Kanban",
    description: "Basic Kanban workflow with three columns",
    statuses: [
      {
        name: "To Do",
        description: "Tasks that need to be done",
        color: "#3b82f6", // blue-500
        order: 0,
        wipLimit: null,
      },
      {
        name: "In Progress",
        description: "Tasks currently being worked on",
        color: "#f59e0b", // amber-500
        order: 1,
        wipLimit: 5,
      },
      {
        name: "Done",
        description: "Completed tasks",
        color: "#10b981", // emerald-500
        order: 2,
        wipLimit: null,
      },
    ],
  },
}
