import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { InventoryItem } from '../../types/index.ts';

interface InventoryTableProps {
  data: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
}

const columnHelper = createColumnHelper<InventoryItem>();

export const InventoryTable: React.FC<InventoryTableProps> = ({ data, onSelectItem }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null);

  const handleCopy = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('sku', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600"
          >
            <span>SKU / Barcode</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-mono-code font-bold text-slate-900">
              <span>{info.getValue()}</span>
              <button
                onClick={(e) => handleCopy(info.getValue(), e)}
                title="Copy SKU"
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                {copiedSku === info.getValue() ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="text-[10px] font-mono-code text-slate-400">
              EAN: {info.row.original.barcode}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('productName', {
        header: 'Product & Category',
        cell: (info) => (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
              {info.getValue()}
            </p>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
              {info.row.original.category}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('warehouseCode', {
        header: 'Warehouse Hub',
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('locationFormatted', {
        header: 'Bin Coordinate',
        cell: (info) => (
          <span className="font-mono-code text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('quantityOnHand', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600"
          >
            <span>On Hand</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono-code font-bold text-xs text-slate-900">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('quantityReserved', {
        header: 'Reserved',
        cell: (info) => (
          <span className="font-mono-code text-xs font-semibold text-amber-600">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('quantityAvailable', {
        header: 'Available',
        cell: (info) => {
          const avail = info.getValue();
          const total = info.row.original.quantityOnHand || 1;
          const pct = Math.min(100, Math.round((avail / total) * 100));
          return (
            <div className="space-y-1 w-24">
              <div className="flex justify-between text-xs font-mono-code font-bold">
                <span className="text-emerald-700">{avail}</span>
                <span className="text-slate-400 text-[10px]">{pct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    pct < 30 ? 'bg-rose-500' : pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('unitCost', {
        header: 'Valuation',
        cell: (info) => {
          const totalVal = (info.getValue() * info.row.original.quantityOnHand).toFixed(2);
          return (
            <div className="font-mono-code text-xs">
              <span className="font-bold text-slate-900">${totalVal}</span>
              <div className="text-[10px] text-slate-400">${info.getValue().toFixed(2)}/u</div>
            </div>
          );
        },
      }),
      columnHelper.accessor('reorderStatus', {
        header: 'Reorder Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              status === 'CRITICAL'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : status === 'LOW'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <button
            onClick={() => onSelectItem(info.row.original)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span>Allocate</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        ),
      }),
    ],
    [copiedSku, onSelectItem]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="clean-card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-200">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => onSelectItem(row.original)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TanStack Table Pagination */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{table.getRowModel().rows.length}</span> of{' '}
          <span className="font-bold text-slate-800">{data.length}</span> SKU items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
