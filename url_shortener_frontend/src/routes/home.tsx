import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, Link2, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { ApiError } from "@/lib/api/client";
import {
  useCreateUrl,
  useDeleteUrl,
  useDisableUrl,
  useMyUrls,
} from "@/hooks/use-urls";
import type { CreateUrlPayload, ShortUrl } from "@/types/url";

const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "URL must start with http:// or https://.",
    ),
});

export default function Home() {
  const [createdUrl, setCreatedUrl] = useState<ShortUrl | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const urlsQuery = useMyUrls();
  const createMutation = useCreateUrl();
  const disableMutation = useDisableUrl();
  const deleteMutation = useDeleteUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlPayload>({
    resolver: zodResolver(createUrlSchema),
    defaultValues: { originalUrl: "" },
  });

  const onSubmit = (payload: CreateUrlPayload) => {
    createMutation.mutate(payload, {
      onSuccess: (url) => {
        setCreatedUrl(url);
        reset();
      },
    });
  };

  const copyUrl = async (shortUrl: string) => {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedUrl(shortUrl);
    window.setTimeout(() => setCopiedUrl(null), 1500);
  };

  const mutationError =
    createMutation.error ?? disableMutation.error ?? deleteMutation.error;

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your short links
          </h1>
          <p className="mt-2 text-muted-foreground">
            Turn long URLs into links that are easy to share.
          </p>
        </div>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 size={19} />
            </div>
            <div>
              <h2 className="font-semibold">Create a short link</h2>
              <p className="text-sm text-muted-foreground">
                Paste any HTTP or HTTPS URL below.
              </p>
            </div>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="min-w-0 flex-1">
              <input
                type="url"
                placeholder="https://example.com/a-long-url"
                className="flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("originalUrl")}
              />
              {errors.originalUrl && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.originalUrl.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Shorten URL"}
            </button>
          </form>

          {createdUrl && (
            <div className="mt-5 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your short URL
                </p>
                <a
                  className="block truncate font-medium text-primary hover:underline"
                  href={createdUrl.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {createdUrl.shortUrl}
                </a>
              </div>
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-background"
                onClick={() => copyUrl(createdUrl.shortUrl)}
              >
                <Copy size={15} />
                {copiedUrl === createdUrl.shortUrl ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </section>

        {mutationError && (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {mutationError instanceof ApiError
              ? mutationError.message
              : "The action could not be completed. Please try again."}
          </p>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your links</h2>
            {urlsQuery.data && (
              <span className="text-sm text-muted-foreground">
                {urlsQuery.data.length} total
              </span>
            )}
          </div>

          {urlsQuery.isLoading && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading your links...
            </p>
          )}
          {urlsQuery.error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Unable to load your links.
            </p>
          )}
          {urlsQuery.data?.length === 0 && (
            <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
              <p className="font-medium">No short links yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first one above.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {urlsQuery.data?.map((url) => (
              <UrlRow
                key={url.id}
                url={url}
                copiedUrl={copiedUrl}
                onCopy={copyUrl}
                onDisable={(id) => disableMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDisabling={disableMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

interface UrlRowProps {
  url: ShortUrl;
  copiedUrl: string | null;
  onCopy: (shortUrl: string) => void;
  onDisable: (id: string) => void;
  onDelete: (id: string) => void;
  isDisabling: boolean;
  isDeleting: boolean;
}

function UrlRow({
  url,
  copiedUrl,
  onCopy,
  onDisable,
  onDelete,
  isDisabling,
  isDeleting,
}: UrlRowProps) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a
              className="truncate font-semibold text-primary hover:underline"
              href={url.shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {url.shortUrl}
            </a>
            <ExternalLink
              className="shrink-0 text-muted-foreground"
              size={15}
            />
            {!url.isActive && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                Disabled
              </span>
            )}
          </div>
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {url.originalUrl}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {url.clickCount} {url.clickCount === 1 ? "click" : "clicks"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
            onClick={() => onCopy(url.shortUrl)}
          >
            <Copy size={15} />
            {copiedUrl === url.shortUrl ? "Copied" : "Copy"}
          </button>
          {url.isActive && (
            <button
              type="button"
              title="Disable link"
              aria-label={`Disable ${url.shortUrl}`}
              className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              disabled={isDisabling}
              onClick={() => onDisable(url.id)}
            >
              <XCircle size={16} />
            </button>
          )}
          <button
            type="button"
            title="Delete link"
            aria-label={`Delete ${url.shortUrl}`}
            className="inline-flex size-9 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10 disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => onDelete(url.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
