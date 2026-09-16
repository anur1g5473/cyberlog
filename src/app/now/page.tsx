import React from 'react';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { getNowData } from '@/lib/db/now';
import { NowClientView } from './NowClientView';

export const revalidate = 60;

export default async function NowPage() {
  const { settings, items } = await getNowData();

  return (
    <div className="space-y-8">
      <TypedCommand
        command="cat /var/log/telemetry/now.status"
        prefix="sys@cybersec:~$"
      />

      <TerminalWindow pathLabel="terminal ~ /telemetry/now">
        <NowClientView settings={settings} items={items} />
      </TerminalWindow>
    </div>
  );
}
