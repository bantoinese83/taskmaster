"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface KanbanSearchProps {
  tasks: Task[]
  onSearchChange: (query: string) => void
  onTaskSelect: (taskId: string) => void
  searchQuery: string
}

export function KanbanSearch({ tasks, onSearchChange, onTaskSelect, searchQuery }: KanbanSearchProps) {
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the search input when advanced search is opened
  useEffect(() => {
    if (isAdvancedSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdvancedSearch])

  // Update search results when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      )
      .slice(0, 5) // Limit to 5 results for dropdown

    setSearchResults(results)

    // Open dropdown if we have results and input is focused
    if (results.length > 0 && document.activeElement === inputRef.current) {
      setIsDropdownOpen(true)
    } else {
      setIsDropdownOpen(false)
    }
  }, [searchQuery, tasks])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }

  const clearSearch = () => {
    onSearchChange("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleTaskClick = (taskId: string) => {
    onTaskSelect(taskId)
    setIsDropdownOpen(false)
  }

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className={cn("transition-all duration-200 ease-in-out", isAdvancedSearch ? "w-full" : "w-full md:w-64")}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search tasks..."
            className="pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-8 hover:bg-transparent"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Search results dropdown */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="p-2">
              <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Search Results</p>
              <div className="mt-1 space-y-1">
                {searchResults.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="font-medium">{highlightMatch(task.title, searchQuery)}</div>
                    {task.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {highlightMatch(task.description, searchQuery)}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced search toggle */}
      <div className="mt-1 flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
        >
          {isAdvancedSearch ? (
            <>
              <ChevronUp className="mr-1 h-3 w-3" />
              Simple Search
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-3 w-3" />
              Advanced Search
            </>
          )}
        </Button>
      </div>

      {/* Advanced search options */}
      {isAdvancedSearch && (
        <div className="mt-2 space-y-2 rounded-md border p-3">
          <div className="text-sm font-medium">Search in:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer bg-primary/10">
              Title
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Description
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Comments
            </Badge>
          </div>

          <div className="mt-3 text-sm font-medium">Search tips:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use quotes for exact phrases: "project meeting"</li>
            <li>• Use + to require words: +urgent +report</li>
            <li>• Use - to exclude words: meeting -weekly</li>
          </ul>
        </div>
      )}
    </div>
  )
}
