import Link from 'next/link';

export function SubscriptionSection() {
  // This section is admin-only and shows subscription management
  // Mock data - in production, this would come from the database
  const currentPlan = {
    name: 'Professional Access',
    price: 79,
    currency: 'GBP',
    billingCycle: 'monthly',
    status: 'active',
    startDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
    features: [
      'Full access to all courses',
      'Certificate of Completion',
      'Monthly Live Q&A / AMA',
      'Community access (Slack / Discord)',
      'Priority support',
    ],
  };

  const usageStats = {
    coursesCompleted: 3,
    coursesInProgress: 2,
    totalLessonsCompleted: 45,
    hoursSpent: 120,
    communityPosts: 12,
    questionsAsked: 8,
  };

  const billingHistory = [
    { date: '2024-01-01', amount: 79, status: 'paid', invoice: 'INV-001' },
    { date: '2023-12-01', amount: 79, status: 'paid', invoice: 'INV-002' },
    { date: '2023-11-01', amount: 79, status: 'paid', invoice: 'INV-003' },
  ];

  const upgradeOptions = [
    {
      name: 'Enterprise Plan',
      price: 'Custom',
      status: 'coming-soon',
      description: 'Custom pricing for teams and organizations',
      features: [
        'Everything in Professional',
        'Team management',
        'Custom training programs',
        'Dedicated account manager',
        'SLA guarantees',
      ],
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Subscription</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin Only</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Current Plan */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Current Plan</h3>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-semibold text-gray-900">{currentPlan.name}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatCurrency(currentPlan.price, currentPlan.currency)}/{currentPlan.billingCycle}
                </p>
              </div>
            </div>
            
            {/* Features */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Plan Features:</p>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="text-green-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Statistics */}
            <div className="pt-4 border-t border-blue-200">
              <p className="text-xs font-medium text-gray-700 mb-3">Your Usage This Month:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">Courses</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {usageStats.coursesInProgress} active
                  </p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">Lessons</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {usageStats.totalLessonsCompleted} completed
                  </p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">Hours</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {usageStats.hoursSpent} spent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Billing Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(currentPlan.nextBillingDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(currentPlan.price, currentPlan.currency)}
                </p>
                <p className="text-xs text-gray-500">Auto-renewal enabled</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Payment Method</p>
                <Link
                  href="/student/subscription/payment"
                  className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                >
                  Update →
                </Link>
              </div>
              <p className="text-xs text-gray-600">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500 mt-1">Expires 12/25</p>
            </div>

            {/* Billing History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Recent Invoices</p>
                <Link
                  href="/student/subscription/billing"
                  className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                {billingHistory.slice(0, 3).map((invoice, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {formatDate(invoice.date)}
                      </p>
                      <p className="text-xs text-gray-500">{invoice.invoice}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-900">
                        {formatCurrency(invoice.amount, currentPlan.currency)}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Upgrade Options</h3>
          <div className="space-y-3">
            {upgradeOptions.map((option, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-base font-semibold text-gray-900">{option.name}</span>
                    {option.status === 'coming-soon' && (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{option.price}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{option.description}</p>
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {option.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  disabled={option.status === 'coming-soon'}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    option.status === 'coming-soon'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-light text-white hover:bg-brand-light/90'
                  }`}
                >
                  {option.status === 'coming-soon' ? 'Contact Sales' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Management */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Manage Subscription</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/student/subscription/manage"
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
            >
              ⚙️ Subscription Settings
            </Link>
            <Link
              href="/student/subscription/cancel"
              className="px-4 py-3 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium text-center"
            >
              Cancel Subscription
            </Link>
          </div>
        </div>

        {/* Subscription Benefits Summary */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Your Subscription Value</h4>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-900">{usageStats.coursesCompleted}</p>
                <p className="text-xs text-green-700">Courses Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{usageStats.totalLessonsCompleted}</p>
                <p className="text-xs text-green-700">Lessons Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{usageStats.hoursSpent}h</p>
                <p className="text-xs text-green-700">Learning Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{usageStats.communityPosts}</p>
                <p className="text-xs text-green-700">Community Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
