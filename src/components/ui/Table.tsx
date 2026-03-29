// ============================================================
// Reusable Table component
// ============================================================

interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: string;
    emptyMessage?: string;
}

export default function Table<T extends Record<string, unknown>>({
                                                                     columns,
                                                                     data,
                                                                     keyField,
                                                                     emptyMessage = 'No data found',
                                                                 }: TableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className={`px-4 py-3 text-left font-medium text-gray-600 ${col.className || ''}`}
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((item) => (
                        <tr key={String(item[keyField])} className="hover:bg-gray-50 transition-colors">
                            {columns.map((col) => (
                                <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
