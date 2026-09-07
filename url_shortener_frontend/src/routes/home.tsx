import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold">URL Shortener</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage short URLs.
          </p>
        </div>
      </main>
    </div>
  );
}
