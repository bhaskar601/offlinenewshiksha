import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSyncQueue } from "@/services/syncService";
import { Cloud, Database, LogOut, RefreshCcw } from "lucide-react";

const ADMIN_KEY = "adminAuth:v1";

type AnyRecord = {
  uniqueId?: string;
  synced?: boolean;
  createdAt?: string;
  syncedAt?: string;
  [k: string]: any;
};

function isAuthed(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function pickSummary(rec: AnyRecord) {
  // Keep it readable without knowing every schema shape
  if (rec.studentId) return `studentId: ${rec.studentId}`;
  if (rec.teacherId) return `teacherId: ${rec.teacherId}`;
  if (rec.quizId) return `quizId: ${rec.quizId}`;
  if (rec.name) return `name: ${rec.name}`;
  return rec.uniqueId ? `id: ${rec.uniqueId}` : "—";
}

export default function SyncedDataAdminPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");

  const authed = isAuthed();
  const queue = useMemo(() => (authed ? getSyncQueue() : { students: [], quizzes: [], attempts: [] }), [authed, refreshKey]);

  const all = useMemo(() => {
    const normalize = (type: string, arr: AnyRecord[]) => arr.map((r) => ({ ...r, __type: type }));
    return [
      ...normalize("students", queue.students || []),
      ...normalize("quizzes", queue.quizzes || []),
      ...normalize("attempts", queue.attempts || []),
    ] as (AnyRecord & { __type: string })[];
  }, [queue]);

  const counts = useMemo(() => {
    const byType = (type: string) => all.filter((x) => x.__type === type);
    const stats = (arr: AnyRecord[]) => ({
      total: arr.length,
      synced: arr.filter((x) => x.synced).length,
      unsynced: arr.filter((x) => !x.synced).length,
    });
    return {
      students: stats(byType("students")),
      quizzes: stats(byType("quizzes")),
      attempts: stats(byType("attempts")),
      overall: stats(all),
    };
  }, [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [all, search]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="edu-container py-10">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Admin access required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Please login with the admin credentials to view synced data.
              </p>
              <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const renderTable = (rows: (AnyRecord & { __type: string })[]) => (
    <div className="rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Synced</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            rows.slice(0, 200).map((r) => (
              <TableRow key={`${r.__type}:${r.uniqueId || Math.random()}`}>
                <TableCell className="font-medium">{r.__type}</TableCell>
                <TableCell>
                  {r.synced ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">synced</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-800 border border-amber-200">unsynced</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[340px] truncate">{pickSummary(r)}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>{formatDate(r.syncedAt)}</TableCell>
                <TableCell className="font-mono text-xs max-w-[220px] truncate">{r.uniqueId || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {rows.length > 200 && (
        <div className="px-4 py-3 text-sm text-gray-600">
          Showing first 200 records. Refine search to narrow results.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="edu-container py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-7 w-7 text-edu-blue" />
              Synced Data Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Visual summary of local sync queue (synced vs unsynced).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRefreshKey((x) => x + 1)}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem(ADMIN_KEY);
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { title: "Overall", value: `${counts.overall.synced}/${counts.overall.total}`, subtitle: "synced / total" },
            { title: "Students", value: `${counts.students.synced}/${counts.students.total}`, subtitle: "synced / total" },
            { title: "Quizzes", value: `${counts.quizzes.synced}/${counts.quizzes.total}`, subtitle: "synced / total" },
            { title: "Attempts", value: `${counts.attempts.synced}/${counts.attempts.total}`, subtitle: "synced / total" },
          ].map((c) => (
            <Card key={c.title} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{c.value}</div>
                <div className="text-sm text-gray-500 mt-1">{c.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Cloud className="h-4 w-4 text-edu-blue" />
              <span className="font-medium">Search</span>
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by studentId, quizId, uniqueId, name…"
              className="sm:max-w-md"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="attempts">Attempts</TabsTrigger>
            <TabsTrigger value="synced">Synced</TabsTrigger>
            <TabsTrigger value="unsynced">Unsynced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderTable(filtered)}</TabsContent>
          <TabsContent value="students">{renderTable(filtered.filter((x) => x.__type === "students"))}</TabsContent>
          <TabsContent value="quizzes">{renderTable(filtered.filter((x) => x.__type === "quizzes"))}</TabsContent>
          <TabsContent value="attempts">{renderTable(filtered.filter((x) => x.__type === "attempts"))}</TabsContent>
          <TabsContent value="synced">{renderTable(filtered.filter((x) => x.synced))}</TabsContent>
          <TabsContent value="unsynced">{renderTable(filtered.filter((x) => !x.synced))}</TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

