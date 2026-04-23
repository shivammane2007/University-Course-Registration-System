import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  pagination, 
  onPageChange, 
  onSearch, 
  searchPlaceholder = "Search..." 
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        {pagination && (
          <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-widest bg-primary-50 px-4 py-2 rounded-xl">
            <span>Page {pagination.page} of {pagination.pages}</span>
            <div className="flex items-center gap-1 border-l border-primary-200 ml-2 pl-3">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-icon !p-1 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn-icon !p-1 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="skeleton h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-24">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10 text-primary-200" />
                    </div>
                    <div>
                      <p className="text-primary-900 font-bold">No results matching your criteria</p>
                      <p className="text-muted text-sm mt-1">Try adjusting your filters or search terms</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
