'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PaymentMethod {
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
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
    paymentMethod: PaymentMethod;
    billingEmail: string;
    nextInvoiceAmount: number;
  };
  invoices: Invoice[];
  userEmail: string;
}

export function BillingInformation({ billing, invoices, userEmail }: BillingInformationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>

      {/* Payment Method */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
          <button className="text-sm font-medium text-brand-light hover:text-brand-light/90">
            Update Payment Method
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-900">
            {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Expires {billing.paymentMethod.expiryMonth}/{billing.paymentMethod.expiryYear}
          </p>
        </div>
      </div>

      {/* Billing Email */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Billing Email</h3>
          <button className="text-sm font-medium text-brand-light hover:text-brand-light/90">
            Update Email
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-900">{billing.billingEmail || userEmail}</p>
        </div>
      </div>

      {/* Next Invoice */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Next Invoice</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(billing.nextInvoiceAmount)}
          </p>
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
                      : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {invoice.status}
                </span>
                {invoice.url && (
                  <Link
                    href={invoice.url}
                    target="_blank"
                    className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                  >
                    View →
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
