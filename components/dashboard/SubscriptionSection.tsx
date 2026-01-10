import Link from 'next/link';

export function SubscriptionSection() {
  // This section is admin-only and shows subscription management
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Subscription</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin Only</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {/* Current Plan */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Current Plan</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">Professional Access</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">£79/month</p>
              <p className="text-xs text-gray-500">Full access to all courses and features</p>
            </div>
          </div>

          {/* Billing */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Billing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
                  <p className="text-xs text-gray-500">February 1, 2024</p>
                </div>
                <span className="text-sm font-medium text-gray-700">£79.00</span>
              </div>
              <Link
                href="/student/subscription/billing"
                className="block text-sm font-medium text-brand-light hover:text-brand-light/90"
              >
                View Billing History →
              </Link>
            </div>
          </div>

          {/* Upgrade Options */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Upgrade Options</h3>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Enterprise Plan</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Custom pricing for teams and organizations
                </p>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>

          {/* Manage Subscription */}
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/student/subscription/manage"
              className="block w-full text-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
