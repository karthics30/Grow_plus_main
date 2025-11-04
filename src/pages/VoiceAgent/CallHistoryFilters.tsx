// CallHistoryFilters.tsx
import React from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { FilterOptions } from "./VoiceAgent";

interface CallHistoryFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalItems: number;
}

const CallHistoryFilters: React.FC<CallHistoryFiltersProps> = ({
  filters,
  onFilterChange,
  totalItems,
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({
      ...filters,
      search,
    });
  };

  const handleDateFromChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        from: date ? new Date(date) : null,
      },
    });
  };

  const handleDateToChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        to: date ? new Date(date) : null,
      },
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({
      ...filters,
      sortBy,
    });
  };

  const handleSortOrderChange = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "all",
      search: "",
      dateRange: {
        from: null,
        to: null,
      },
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.search !== "" ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  return (
    <div className="bg-white p-4 rounded-lg border mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Call History</h3>
        <div className="text-sm text-muted-foreground">
          {totalItems} calls found
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, number, campaign..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
          <option value="Sending">Sending</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="timestamp">Sort by Date</option>
          <option value="contact">Sort by Contact</option>
          <option value="campaign">Sort by Campaign</option>
          <option value="duration">Sort by Duration</option>
          <option value="status">Sort by Status</option>
          <option value="outcome">Sort by Outcome</option>
        </select>

        {/* Sort Order */}
        <button
          onClick={handleSortOrderChange}
          className="flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Filter className="w-4 h-4" />
          <span>
            {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={
                filters.dateRange.from
                  ? filters.dateRange.from.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={
                filters.dateRange.to
                  ? filters.dateRange.to.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateToChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.status !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Status: {filters.status}
              <button
                onClick={() => handleStatusChange("all")}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Search: {filters.search}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange.from && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              From: {filters.dateRange.from.toLocaleDateString()}
              <button
                onClick={() => handleDateFromChange("")}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange.to && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              To: {filters.dateRange.to.toLocaleDateString()}
              <button
                onClick={() => handleDateToChange("")}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CallHistoryFilters;
