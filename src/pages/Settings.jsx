import { useState, useEffect } from 'react';
import {
  Save, Settings as SettingsIcon, Mail, CreditCard, Truck,
  Shield, Palette, Globe, DollarSign, Bell, Search
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'tax', label: 'Tax', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notification', label: 'Notifications', icon: Bell },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data);
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save settings');
      }

      const data = await response.json();
      setSettings(data);
      setSuccess('Settings saved successfully');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={formData.general?.siteName || ''}
            onChange={(e) => updateFormData('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            value={formData.general?.contactEmail || ''}
            onChange={(e) => updateFormData('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Description
        </label>
        <textarea
          value={formData.general?.siteDescription || ''}
          onChange={(e) => updateFormData('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support Email
          </label>
          <input
            type="email"
            value={formData.general?.supportEmail || ''}
            onChange={(e) => updateFormData('general', 'supportEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.general?.phoneNumber || ''}
            onChange={(e) => updateFormData('general', 'phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          value={formData.general?.address || ''}
          onChange={(e) => updateFormData('general', 'address', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.general?.currency || 'USD'}
            onChange={(e) => updateFormData('general', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <input
            type="text"
            value={formData.general?.timezone || 'UTC'}
            onChange={(e) => updateFormData('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={formData.general?.language || 'en'}
            onChange={(e) => updateFormData('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stripe Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.payment?.stripeEnabled || false}
              onChange={(e) => updateFormData('payment', 'stripeEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable Stripe Payments
            </label>
          </div>

          {formData.payment?.stripeEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Public Key
                </label>
                <input
                  type="text"
                  value={formData.payment?.stripePublicKey || ''}
                  onChange={(e) => updateFormData('payment', 'stripePublicKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  value={formData.payment?.stripeSecretKey || ''}
                  onChange={(e) => updateFormData('payment', 'stripeSecretKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk_test_..."
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">PayPal Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.payment?.paypalEnabled || false}
              onChange={(e) => updateFormData('payment', 'paypalEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable PayPal Payments
            </label>
          </div>

          {formData.payment?.paypalEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Client ID
                </label>
                <input
                  type="text"
                  value={formData.payment?.paypalClientId || ''}
                  onChange={(e) => updateFormData('payment', 'paypalClientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Secret Key
                </label>
                <input
                  type="password"
                  value={formData.payment?.paypalSecretKey || ''}
                  onChange={(e) => updateFormData('payment', 'paypalSecretKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Mode
                </label>
                <select
                  value={formData.payment?.paypalMode || 'sandbox'}
                  onChange={(e) => updateFormData('payment', 'paypalMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.payment?.taxEnabled || false}
              onChange={(e) => updateFormData('payment', 'taxEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable Tax
            </label>
          </div>

          {formData.payment?.taxEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.payment?.taxRate || 0}
                onChange={(e) => updateFormData('payment', 'taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.shipping?.shippingEnabled || false}
          onChange={(e) => updateFormData('shipping', 'shippingEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Enable Shipping
        </label>
      </div>

      {formData.shipping?.shippingEnabled && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.shipping?.freeShippingThreshold || 0}
                onChange={(e) => updateFormData('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flat Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.shipping?.flatRate || 0}
                onChange={(e) => updateFormData('shipping', 'flatRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Days
              </label>
              <input
                type="number"
                value={formData.shipping?.processingDays || 2}
                onChange={(e) => updateFormData('shipping', 'processingDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.shipping?.localDeliveryEnabled || false}
                onChange={(e) => updateFormData('shipping', 'localDeliveryEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable Local Delivery
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.shipping?.internationalShippingEnabled || false}
                onChange={(e) => updateFormData('shipping', 'internationalShippingEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable International Shipping
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.shipping?.trackingEnabled || false}
                onChange={(e) => updateFormData('shipping', 'trackingEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable Order Tracking
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.tax?.gstEnabled || false}
          onChange={(e) => updateFormData('tax', 'gstEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Enable GST
        </label>
      </div>

      {formData.tax?.gstEnabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.tax?.gstRate || 18}
              onChange={(e) => updateFormData('tax', 'gstRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.tax?.hsnCodeMandatory || false}
              onChange={(e) => updateFormData('tax', 'hsnCodeMandatory', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              HSN Code Mandatory
            </label>
          </div>
        </>
      )}
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Host
          </label>
          <input
            type="text"
            value={formData.email?.smtpHost || ''}
            onChange={(e) => updateFormData('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="smtp.example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <input
            type="number"
            value={formData.email?.smtpPort || 587}
            onChange={(e) => updateFormData('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Username
          </label>
          <input
            type="text"
            value={formData.email?.smtpUser || ''}
            onChange={(e) => updateFormData('email', 'smtpUser', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Password
          </label>
          <input
            type="password"
            value={formData.email?.smtpPassword || ''}
            onChange={(e) => updateFormData('email', 'smtpPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.email?.smtpSecure || false}
          onChange={(e) => updateFormData('email', 'smtpSecure', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Use SSL/TLS
        </label>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Email
          </label>
          <input
            type="email"
            value={formData.email?.fromEmail || ''}
            onChange={(e) => updateFormData('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Name
          </label>
          <input
            type="text"
            value={formData.email?.fromName || ''}
            onChange={(e) => updateFormData('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            value={formData.appearance?.logoUrl || ''}
            onChange={(e) => updateFormData('appearance', 'logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Favicon URL
          </label>
          <input
            type="url"
            value={formData.appearance?.faviconUrl || ''}
            onChange={(e) => updateFormData('appearance', 'faviconUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.appearance?.primaryColor || '#3B82F6'}
              onChange={(e) => updateFormData('appearance', 'primaryColor', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={formData.appearance?.primaryColor || '#3B82F6'}
              onChange={(e) => updateFormData('appearance', 'primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.appearance?.secondaryColor || '#10B981'}
              onChange={(e) => updateFormData('appearance', 'secondaryColor', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={formData.appearance?.secondaryColor || '#10B981'}
              onChange={(e) => updateFormData('appearance', 'secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accent Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.appearance?.accentColor || '#F59E0B'}
              onChange={(e) => updateFormData('appearance', 'accentColor', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={formData.appearance?.accentColor || '#F59E0B'}
              onChange={(e) => updateFormData('appearance', 'accentColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Theme Mode
        </label>
        <select
          value={formData.appearance?.theme || 'light'}
          onChange={(e) => updateFormData('appearance', 'theme', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (System Preference)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom CSS
        </label>
        <textarea
          value={formData.appearance?.customCSS || ''}
          onChange={(e) => updateFormData('appearance', 'customCSS', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="/* Add your custom CSS here */"
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.security?.twoFactorEnabled || false}
              onChange={(e) => updateFormData('security', 'twoFactorEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable Two-Factor Authentication
            </label>
          </div>

          {formData.security?.twoFactorEnabled && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.security?.twoFactorRequired || false}
                onChange={(e) => updateFormData('security', 'twoFactorRequired', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Require 2FA for all admin users
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Requirements</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Length
            </label>
            <input
              type="number"
              min="6"
              max="128"
              value={formData.security?.passwordMinLength || 8}
              onChange={(e) => updateFormData('security', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.security?.passwordRequireUppercase || false}
              onChange={(e) => updateFormData('security', 'passwordRequireUppercase', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Require uppercase letters
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.security?.passwordRequireNumbers || false}
              onChange={(e) => updateFormData('security', 'passwordRequireNumbers', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Require numbers
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.security?.passwordRequireSpecialChars || false}
              onChange={(e) => updateFormData('security', 'passwordRequireSpecialChars', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Require special characters
            </label>
          </div>
        </div>
      </div>

      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={formData.security?.sessionTimeout || 30}
              onChange={(e) => updateFormData('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login Security</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={formData.security?.maxLoginAttempts || 5}
              onChange={(e) => updateFormData('security', 'maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.security?.lockoutDuration || 15}
              onChange={(e) => updateFormData('security', 'lockoutDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'tax':
        return renderTaxSettings();
      case 'email':
        return renderEmailSettings();
      case 'theme':
        return renderThemeSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return <div className="text-gray-500">Coming soon...</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application settings</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow">
            <nav className="space-y-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow p-6">
              {renderContent()}

              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
