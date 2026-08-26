'use client';

import React, { useState, useEffect } from 'react';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, ShieldAlert } from 'lucide-react';
import { MathChallenge } from '@/components/ui/MathChallenge';

export default function AdminLoginPage() {
  const [passphrase, setPassphrase] = useState('');
  const [challengeData, setChallengeData] = useState({ token: '', answer: '' });
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const router = useRouter();

  // Live countdown timer for active lockout
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds && lockoutSeconds > 0) return;

    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passphrase,
          challengeToken: challengeData.token,
          challengeAnswer: challengeData.answer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Authentication failed.');
        if (data.isLocked && data.remainingSeconds) {
          setLockoutSeconds(data.remainingSeconds);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;

  return (
    <div className='max-w-md mx-auto pt-20'>
      <TypedCommand command='login --admin --secure' prefix='> ' />
      <TerminalWindow pathLabel='security-portal ~ /login' className='mt-4'>
        <form onSubmit={handleLogin} className='space-y-4'>
          <div className='flex items-center gap-2 text-terminal-green mb-4'>
            <Lock className='w-5 h-5' />
            <h2 className='font-bold tracking-wider'>SECURE ACCESS REQ</h2>
          </div>

          <input
            type='password'
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder='Enter Master Passphrase...'
            disabled={isLocked}
            className='w-full px-4 py-2.5 rounded bg-black border border-terminal-green/30 focus:border-terminal-green focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
            required
          />

          <MathChallenge
            onValidated={(isValid: boolean, token: string, answer: string) => setChallengeData({ token, answer })}
          />

          {isLocked ? (
            <div className='flex items-center gap-2 text-terminal-red text-xs bg-terminal-red/15 border border-terminal-red/40 p-3 rounded animate-pulse'>
              <ShieldAlert className='w-5 h-5 shrink-0' />
              <div>
                <span className='font-bold block'>SECURITY LOCKOUT ACTIVE</span>
                <span>Threshold exceeded. Origin locked out for {lockoutSeconds}s...</span>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center gap-2 text-terminal-red text-xs bg-terminal-red/10 p-3 rounded'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type='submit'
            disabled={isLocked}
            className='w-full py-2.5 rounded bg-terminal-green/10 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black font-bold transition disabled:opacity-30 disabled:cursor-not-allowed'
          >
            {isLocked ? `Locked (${lockoutSeconds}s)` : 'Authenticate'}
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}

