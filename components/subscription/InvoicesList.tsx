'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  url: string;
  downloadUrl?: string;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort invoices newest to oldest
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [invoices]);

  const displayedInvoices = isExpanded ? sortedInvoices : sortedInvoices.slice(0, 5);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Format: "D MMMM YYYY" (e.g., "15 February 2024")
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (sortedInvoices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No invoices yet</p>
        <p className="mt-1 text-xs text-gray-500">Your invoices will appear here once you have billing activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {displayedInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(invoice.date)}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(invoice.amount)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : invoice.status === 'open' || invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : invoice.status === 'void'
                          ? 'bg-gray-100 text-gray-700'
                          : invoice.status === 'uncollectible'
                            ? 'bg-red-100 text-red-700'
                            : invoice.status === 'draft'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                {(invoice.url || invoice.downloadUrl) && (
                  <Link
                    href={invoice.downloadUrl || invoice.url}
                    target="_blank"
                    className="text-sm font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
                    download
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {sortedInvoices.length > 5 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            {isExpanded ? 'Show less' : `Show all ${sortedInvoices.length} invoices`}
          </button>
        </div>
      )}
    </div>
  );
}
