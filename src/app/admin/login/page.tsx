'use client';

import React, { useState } from 'react';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock } from 'lucide-react';
import { MathChallenge } from '@/components/ui/MathChallenge';

export default function AdminLoginPage() {
  const [passphrase, setPassphrase] = useState('');
  const [challengeData, setChallengeData] = useState({ token: '', answer: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        setError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

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
            className='w-full px-4 py-2.5 rounded bg-black border border-terminal-green/30 focus:border-terminal-green focus:outline-none'
            required
          />

          <MathChallenge
            onValidated={(isValid: boolean, token: string, answer: string) => setChallengeData({ token, answer })}
          />

          {error && (
            <div className='flex items-center gap-2 text-terminal-red text-xs bg-terminal-red/10 p-3 rounded'>
              <AlertCircle className='w-4 h-4' />
              <span>{error}</span>
            </div>
          )}

          <button
            type='submit'
            className='w-full py-2.5 rounded bg-terminal-green/10 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black font-bold transition'
          >
            Authenticate
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
