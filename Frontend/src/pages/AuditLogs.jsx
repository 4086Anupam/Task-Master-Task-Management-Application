import { useEffect, useState } from 'react';
import { AdminService } from '../services/admin.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await AdminService.getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        setError(err?.response?.data || 'Unable to load audit logs.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground max-w-2xl">
          Full history of task, project, and user changes recorded by the backend.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading audit history...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <ShieldAlert size={44} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No audit entries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Changes will appear here as soon as the backend starts recording them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {/* Desktop / tablet table */}
                <div className="hidden sm:block">
                  <table className="w-full min-w-[720px] table-fixed border-collapse">
                <thead>
                  <tr className="text-sm text-muted-foreground">
                    <th className="p-3 text-left w-20">ID</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left w-40">Action</th>
                    <th className="p-3 text-left w-40">Entity</th>
                    <th className="p-3 text-left w-44">Performed By</th>
                    <th className="p-3 text-left w-32">When</th>
                    <th className="p-3 text-left w-28">View</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="odd:bg-muted/10">
                      <td className="p-3 align-top text-xs text-muted-foreground">{log.id}</td>
                      <td className="p-3 align-top text-sm">{log.details}</td>
                      <td className="p-3 align-top text-sm font-medium">{log.action}</td>
                      <td className="p-3 align-top text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.entityName}</span>
                          {log.entityId != null && <Badge variant="secondary">#{log.entityId}</Badge>}
                        </div>
                      </td>
                      <td className="p-3 align-top text-sm">{log.performedByEmail || 'system'}</td>
                      <td className="p-3 align-top text-sm text-muted-foreground">{log.performedAt ? new Date(log.performedAt).toLocaleString() : ''}</td>
                      <td className="p-3 align-top">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedLog(log); setIsDialogOpen(true); }}
                          onTouchStart={() => { setSelectedLog(log); setIsDialogOpen(true); }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                  </table>
                </div>

                {/* Mobile stacked cards */}
                <div className="block sm:hidden space-y-3 p-3">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-lg border bg-card/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{log.action}</span>
                            <Badge variant="outline">{log.entityName}</Badge>
                            {log.entityId != null && <Badge variant="secondary">#{log.entityId}</Badge>}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{log.details}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <div>{log.performedByEmail || 'system'}</div>
                            <div>{log.performedAt ? new Date(log.performedAt).toLocaleString() : ''}</div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedLog(log); setIsDialogOpen(true); }}
                            onTouchStart={() => { setSelectedLog(log); setIsDialogOpen(true); }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JSON viewer dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              // wait for the dialog close animation to finish before clearing the selected log
              setTimeout(() => setSelectedLog(null), 280);
            }
          }}>
              <DialogContent className="w-[min(98vw,1200px)] max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl">
              <DialogHeader className="pb-4">
                <DialogTitle>Audit Entry {selectedLog ? `#${selectedLog.id}` : ''}</DialogTitle>
                <DialogDescription className="mb-3">Action: {selectedLog?.action} — Entity: {selectedLog?.entityName} {selectedLog?.entityId ? `#${selectedLog.entityId}` : ''}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Before</p>
                  <pre className="box-border max-h-[40vh] sm:max-h-[60vh] overflow-auto rounded-xl border bg-muted/40 p-4 text-sm whitespace-pre-wrap">{formatJson(selectedLog?.beforeState)}</pre>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">After</p>
                  <pre className="box-border max-h-[40vh] sm:max-h-[60vh] overflow-auto rounded-xl border bg-muted/40 p-4 text-sm whitespace-pre-wrap">{formatJson(selectedLog?.afterState)}</pre>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

function formatJson(value) {
  if (!value && value !== 0) return '—';
  try {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    }
    return JSON.stringify(value, null, 2);
  } catch (e) {
    // not JSON — return as-is
    return String(value);
  }
}
