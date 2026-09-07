import { Search, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { ApiError } from "@/lib/api/client";
import {
  useAdminUrls,
  useAdminUsers,
  useDeleteAdminUrl,
  useDisableAdminUrl,
} from "@/hooks/use-admin";
import type { Pagination } from "@/types/admin";

type AdminTab = "users" | "urls";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<"all" | "user" | "admin">("all");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const adminUsersQuery = useAdminUsers({
    page,
    limit: 10,
    search,
    role: role === "all" ? undefined : role,
  });
  const adminUrlsQuery = useAdminUrls({
    page,
    limit: 10,
    search,
    isActive: isActive === "all" ? undefined : isActive === "true",
  });
  const disableMutation = useDisableAdminUrl();
  const deleteMutation = useDeleteAdminUrl();
  const currentQuery = activeTab === "users" ? adminUsersQuery : adminUrlsQuery;
  const pagination = currentQuery.data?.pagination;
  const mutationError = disableMutation.error ?? deleteMutation.error;

  const changeTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Manage your platform
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review users and keep shared links healthy.
            </p>
          </div>
        </div>

        <div className="flex gap-1 border-b">
          <button
            type="button"
            className={`border-b-2 px-4 py-3 text-sm font-medium ${activeTab === "users" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
            onClick={() => changeTab("users")}
          >
            Users
          </button>
          <button
            type="button"
            className={`border-b-2 px-4 py-3 text-sm font-medium ${activeTab === "urls" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
            onClick={() => changeTab("urls")}
          >
            URLs
          </button>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={
                  activeTab === "users"
                    ? "Search username or email"
                    : "Search short code or original URL"
                }
                className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {activeTab === "users" ? (
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value as typeof role);
                  setPage(1);
                }}
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All roles</option>
                <option value="user">Users only</option>
                <option value="admin">Admins only</option>
              </select>
            ) : (
              <select
                value={isActive}
                onChange={(event) => {
                  setIsActive(event.target.value as typeof isActive);
                  setPage(1);
                }}
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All URLs</option>
                <option value="true">Active only</option>
                <option value="false">Disabled only</option>
              </select>
            )}
          </div>

          {mutationError && (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {mutationError instanceof ApiError
                ? mutationError.message
                : "The action could not be completed."}
            </p>
          )}

          {currentQuery.isLoading && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading {activeTab}...
            </p>
          )}
          {currentQuery.error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Unable to load {activeTab}.
            </p>
          )}

          {activeTab === "users" && adminUsersQuery.data && (
            <UsersTable users={adminUsersQuery.data.users} />
          )}
          {activeTab === "urls" && adminUrlsQuery.data && (
            <UrlsTable
              urls={adminUrlsQuery.data.urls}
              isDisabling={disableMutation.isPending}
              isDeleting={deleteMutation.isPending}
              onDisable={(id) => disableMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          )}

          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function UsersTable({
  users,
}: {
  users: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}) {
  if (users.length === 0) {
    return <EmptyState label="No users found." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-160 text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-4 font-medium">Username</th>
            <th className="px-5 py-4 font-medium">Email</th>
            <th className="px-5 py-4 font-medium">Role</th>
            <th className="px-5 py-4 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-5 py-4 font-medium">{user.username}</td>
              <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
              <td className="px-5 py-4 capitalize">{user.role}</td>
              <td className="px-5 py-4 text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface UrlsTableProps {
  urls: Array<{
    _id: string;
    shortCode: string;
    originalUrl: string;
    clickCount: number;
    isActive: boolean;
  }>;
  isDisabling: boolean;
  isDeleting: boolean;
  onDisable: (id: string) => void;
  onDelete: (id: string) => void;
}

function UrlsTable({
  urls,
  isDisabling,
  isDeleting,
  onDisable,
  onDelete,
}: UrlsTableProps) {
  if (urls.length === 0) {
    return <EmptyState label="No URLs found." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-4 font-medium">Short code</th>
            <th className="px-5 py-4 font-medium">Original URL</th>
            <th className="px-5 py-4 font-medium">Clicks</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {urls.map((url) => (
            <tr key={url._id}>
              <td className="px-5 py-4 font-medium">{url.shortCode}</td>
              <td className="max-w-xs truncate px-5 py-4 text-muted-foreground">
                {url.originalUrl}
              </td>
              <td className="px-5 py-4">{url.clickCount}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  {url.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {url.isActive && (
                    <button
                      type="button"
                      title="Disable URL"
                      aria-label={`Disable ${url.shortCode}`}
                      className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-50"
                      disabled={isDisabling}
                      onClick={() => onDisable(url._id)}
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Delete URL"
                    aria-label={`Delete ${url.shortCode}`}
                    className="inline-flex size-9 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    disabled={isDeleting}
                    onClick={() => onDelete(url._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} (
        {pagination.total} total)
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-2 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-2 hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
