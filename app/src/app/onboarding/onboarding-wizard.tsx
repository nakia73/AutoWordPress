'use client';

// Argo Note - Onboarding Wizard Component
// Step-by-step site and product setup

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OnboardingWizardProps = {
  userId: string;
};

type Step = 'subdomain' | 'product' | 'processing';

export default function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('subdomain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [subdomain, setSubdomain] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const validateSubdomain = (value: string) => {
    // Subdomain: 3-63 chars, lowercase alphanumeric and hyphens, no leading/trailing hyphen
    if (value.length < 3 || value.length > 63) return false;
    const regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    return regex.test(value);
  };

  const handleSubdomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSubdomain(subdomain)) {
      setError(
        'Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if subdomain is available
      const response = await fetch('/api/sites/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });

      const data = await response.json();

      if (!data.available) {
        setError('This subdomain is already taken. Please choose another.');
        setIsLoading(false);
        return;
      }

      setStep('product');
    } catch (err) {
      setError('Failed to check subdomain availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStep('processing');

    try {
      // Create site and product
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          productUrl,
          productName,
          productDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create site');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setStep('product');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center ${
              step === 'subdomain' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'subdomain'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {step !== 'subdomain' ? '✓' : '1'}
            </span>
            <span className="ml-2 text-sm font-medium">Choose URL</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200 mx-4" />
          <div
            className={`flex items-center ${
              step === 'product' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'product'
                  ? 'bg-blue-600 text-white'
                  : step === 'processing'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {step === 'processing' ? '✓' : '2'}
            </span>
            <span className="ml-2 text-sm font-medium">Add Product</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200 mx-4" />
          <div
            className={`flex items-center ${
              step === 'processing' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              3
            </span>
            <span className="ml-2 text-sm font-medium">Setup</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step 1: Subdomain */}
      {step === 'subdomain' && (
        <form onSubmit={handleSubdomainSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="subdomain"
              className="block text-sm font-medium text-gray-700"
            >
              Choose your blog URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="myproduct"
                required
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                .argonote.app
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This will be your blog&apos;s URL. You can add a custom domain
              later.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || subdomain.length < 3}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      )}

      {/* Step 2: Product Info */}
      {step === 'product' && (
        <form onSubmit={handleProductSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="productUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Product URL (optional)
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://myproduct.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              We&apos;ll analyze your product to generate relevant blog content.
            </p>
          </div>

          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="My Awesome App"
              required
            />
          </div>

          <div>
            <label
              htmlFor="productDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Product Description
            </label>
            <textarea
              id="productDescription"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Briefly describe what your product does and who it's for..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('subdomain')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !productName || !productDescription}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create My Blog'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Processing */}
      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Setting up your blog...
          </h3>
          <p className="mt-2 text-gray-500">
            This may take a few moments. We&apos;re configuring your WordPress
            site and analyzing your product.
          </p>
        </div>
      )}
    </div>
  );
}
