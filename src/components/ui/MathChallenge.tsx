'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';

interface MathChallengeProps {
  onValidated: (isValid: boolean, token: string, answer: string) => void;
}

export function MathChallenge({ onValidated }: MathChallengeProps) {
  const [challenge, setChallenge] = useState<{ num1: number; num2: number; operator: string; token: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    setStatusMessage(null);
    setUserAnswer('');
    setIsSuccess(false);

    try {
      const res = await fetch('/api/auth/challenge');
      const data = await res.json();
      if (data.token) {
        setChallenge(data);
      }
    } catch (err) {
      console.error('Failed to load math challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);

    if (challenge) {
      onValidated(val.trim() !== '', challenge.token, val);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-terminal-green/30 bg-bg/90 font-mono text-xs my-4 shadow-inner">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-terminal-green/10">
        <div className="flex items-center gap-1.5 text-terminal-green font-bold">
          <ShieldAlert className="w-4 h-4 text-terminal-amber" />
          <span>SERVER CAPTCHA CHALLENGE</span>
        </div>
        <button
          type="button"
          onClick={fetchChallenge}
          disabled={loading}
          className="text-terminal-muted hover:text-terminal-green p-1 transition"
          title="Refresh Math Problem"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-2 text-terminal-muted text-center animate-pulse">
          Generating cryptographic math problem...
        </div>
      ) : challenge ? (
        <div>
          <label className="block text-terminal-muted mb-2">
            Prove human presence: What is{' '}
            <span className="text-terminal-green font-bold text-sm mx-1">
              {challenge.num1} {challenge.operator} {challenge.num2}
            </span>
            ?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={userAnswer}
              onChange={handleChange}
              placeholder="Answer..."
              className="w-full px-3 py-2 rounded border border-terminal-green/30 bg-black/80 text-terminal-green focus:outline-none focus:border-terminal-green"
              required
            />
          </div>
          <p className="text-[10px] text-terminal-muted/70 mt-1.5">
            * Server validates answer statelessly via HMAC token.
          </p>
        </div>
      ) : (
        <div className="text-terminal-red">Failed to load math challenge.</div>
      )}
    </div>
  );
}
