import React from 'react';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { getContactDetails } from '@/lib/db/contact';
import { ContactClientView } from './ContactClientView';

export const revalidate = 60;

export default async function ContactPage() {
  const contact = await getContactDetails();

  return (
    <div className="space-y-8">
      <TypedCommand
        command="cat /etc/security/contact_endpoints.json"
        prefix="sys@cyberlog:~$"
      />

      <TerminalWindow pathLabel="terminal ~ /network/contact">
        <ContactClientView initialContact={contact} />
      </TerminalWindow>
    </div>
  );
}
