'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Send } from 'lucide-react';

interface GratitudeRequest {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount?: number | null;
}

interface RequesterGratitudePromptProps {
  requests: GratitudeRequest[];
}

export default function RequesterGratitudePrompt({
  requests,
}: RequesterGratitudePromptProps) {
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState(requests[0]?.id || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) || requests[0];

  const handleSubmit = async () => {
    if (!selectedRequestId) {
      setError('Choose a request before posting your thank-you note.');
      return;
    }

    setError('');
    setSuccess('');

    const response = await fetch(`/api/requests/${selectedRequestId}/gratitude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.message || 'Failed to post your thank-you note.');
      return;
    }

    setMessage('');
    setSuccess('Your thank-you update is now visible in community activity.');
    startTransition(() => {
      router.refresh();
    });
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-100 p-3">
          <HeartHandshake className="h-5 w-5 text-emerald-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Share Gratitude
          </p>
          <h2 className="mt-2 text-xl font-bold text-emerald-950">
            Let supporters know their help reached you
          </h2>
          <p className="mt-2 text-sm leading-7 text-emerald-900">
            Once support has come in, you can post one grateful update for your request. It appears in the activity feed and lets donors know their kindness mattered.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-emerald-900">
              Choose a request
            </label>
            <select
              value={selectedRequestId}
              onChange={(event) => setSelectedRequestId(event.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none"
            >
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.title}
                </option>
              ))}
            </select>
          </div>

          {selectedRequest && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-white/80 p-4 text-sm text-emerald-950">
              <p className="font-semibold">{selectedRequest.title}</p>
              <p className="mt-1 text-emerald-800">
                Support received: R {selectedRequest.currentAmount.toFixed(2)}
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-emerald-900">
              Your thank-you message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Thank you for standing with me in this hard season. Your support has made a real difference..."
              className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-emerald-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-emerald-700">
              Keep it positive, respectful, and honest. This note will be visible in community activity.
            </p>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm font-medium text-emerald-700">{success}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isPending ? 'Posting...' : 'Post Thank-You Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
