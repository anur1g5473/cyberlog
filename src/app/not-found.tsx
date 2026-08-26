import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto py-12">
      <TerminalWindow pathLabel="404 ~ resource_not_found">
        <div className="space-y-4 text-center font-mono py-8">
          <div className="inline-flex p-3 rounded-full bg-terminal-red/10 border border-terminal-red/30 text-terminal-red mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-terminal-red">ERROR 404: RESOURCE UNMAPPED</h1>
          <p className="text-xs text-terminal-muted max-w-md mx-auto">
            The requested payload, endpoint, or log entry does not exist on this terminal node.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-terminal-green text-black font-bold text-xs hover:bg-terminal-green/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO ROOT DOMAIN</span>
            </Link>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
