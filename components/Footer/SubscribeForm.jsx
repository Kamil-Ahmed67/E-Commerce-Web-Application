'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import config from '@/config';
import { trackEvent } from '@/lib/trackEvent';

export default function SubscribeForm() {
  const [formData, setFormData] = useState({ email: '', phone: '', location: 'Inside bangladesh' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId,
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomSubscribe',
          parameters: {
            QueryChecker: 1,
            Email: formData.email,
            Phone: formData.phone || null,
            Location: formData.location,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.Status === 'error') {
        throw new Error(result.Message || 'Subscription failed');
      }

      toast.success('You are subscribed! Thank you.');
      trackEvent('subscribe', { email: formData.email, phone: formData.phone || null, location: formData.location });
      setFormData({ email: '', phone: '', location: 'Inside bangladesh' });
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lg:w-1/2 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          autoComplete="email"
          required
          className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-sm py-2.5 px-4 text-sm outline-none focus:border-gray-400 transition"
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone number"
          autoComplete="tel"
          className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-sm py-2.5 px-4 text-sm outline-none focus:border-gray-400 transition"
        />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="location"
            value="Inside bangladesh"
            checked={formData.location === 'Inside bangladesh'}
            onChange={handleChange}
            className="accent-white w-3.5 h-3.5"
          />
          <span className="text-gray-400 text-xs">Inside Bangladesh</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="location"
            value="Outside bangladesh"
            checked={formData.location === 'Outside bangladesh'}
            onChange={handleChange}
            className="accent-white w-3.5 h-3.5"
          />
          <span className="text-gray-400 text-xs">Outside Bangladesh</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-gray-900 font-semibold text-sm px-8 py-2.5 rounded-sm hover:bg-gray-100 transition disabled:opacity-60"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
