'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PaymentMethod {
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  url: string;
}

interface BillingInformationProps {
  billing: {
    paymentMethod: PaymentMethod | null;
    billingEmail: string;
    nextInvoiceAmount: number | null;
    nextInvoiceDate?: string | null;
    taxNote?: string;
  };
  invoices: Invoice[];
  userEmail: string;
}

export function BillingInformation({ billing, invoices, userEmail }: BillingInformationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleOpenBillingPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/student/subscription`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (!data.portalUrl) {
        throw new Error('No portal URL returned');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.portalUrl;
    } catch (err: any) {
      console.error('Error opening billing portal:', err);
      setError(
        err.message === 'No active subscription found' || err.message === 'NO_STRIPE_CUSTOMER'
          ? 'No active subscription found. Please contact support.'
          : 'We couldn\'t open billing settings. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    const newEmail = prompt('Enter new billing email:', billing.billingEmail || userEmail);
    
    if (!newEmail || newEmail === billing.billingEmail) {
      return; // User cancelled or email unchanged
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/update-billing-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingEmail: newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update billing email');
      }

      // Revalidate and reload page to show updated data
      window.location.reload();
    } catch (err: any) {
      console.error('Error updating billing email:', err);
      setError(err.message || 'Failed to update billing email. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
          <button
            onClick={handleOpenBillingPortal}
            disabled={isLoading}
            className="text-sm font-medium text-brand-light hover:text-brand-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Opening billing portal...' : 'Update Payment Method'}
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          {billing.paymentMethod ? (
            <>
              <p className="text-sm text-gray-900">
                {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
              </p>
              {billing.paymentMethod.expiryMonth && billing.paymentMethod.expiryYear && (
                <p className="text-xs text-gray-500 mt-1">
                  Expires {String(billing.paymentMethod.expiryMonth).padStart(2, '0')}/{billing.paymentMethod.expiryYear}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No payment method on file</p>
          )}
        </div>
      </div>

      {/* Billing Email */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Billing Email</h3>
          <button
            onClick={handleUpdateEmail}
            disabled={isLoading}
            className="text-sm font-medium text-brand-light hover:text-brand-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-900">{billing.billingEmail || userEmail}</p>
        </div>
      </div>

      {/* Next Invoice */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Next Invoice</h3>
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          {billing.nextInvoiceAmount !== null ? (
            <>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(billing.nextInvoiceAmount)}
              </p>
              {billing.nextInvoiceDate && (
                <p className="text-xs text-gray-600">
                  You will not be charged until {formatDate(billing.nextInvoiceDate)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No upcoming invoice</p>
          )}
          {billing.taxNote && (
            <p className="text-xs text-gray-500 italic">{billing.taxNote}</p>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Invoices</h3>
          <Link
            href="/student/subscription/invoices"
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-2">
          {invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(invoice.date)}</p>
                <p className="text-xs text-gray-500">{invoice.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(invoice.amount)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
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
                {invoice.url && (
                  <Link
                    href={invoice.url}
                    target="_blank"
                    className="text-xs font-medium text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
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
          ))}
        </div>
      </div>
    </div>
  );
}
