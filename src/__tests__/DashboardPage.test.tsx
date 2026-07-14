import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { DashboardPage } from "../pages/DashboardPage";
import type { TrackedProduct } from "../lib/api";

vi.mock("../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../lib/api")>("../lib/api");
  return {
    ...actual,
    listSentinels: vi.fn(),
  };
});

import { listSentinels } from "../lib/api";

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const baseProduct: TrackedProduct = {
  id: "p1",
  userId: "u1",
  url: "http://localhost:4000/mock-store/products/demo-1",
  domain: "localhost",
  name: "Console demo",
  selector: ".price",
  targetPriceCents: 100_000,
  currentPriceCents: 90_000,
  currency: "BRL",
  checkIntervalMinutes: 60,
  isActive: true,
  lastCheckedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

describe("DashboardPage", () => {
  it("shows the empty state when there are no sentinels", async () => {
    vi.mocked(listSentinels).mockResolvedValueOnce([]);
    renderDashboard();
    expect(await screen.findByText(/nenhuma sentinela implantada/i)).toBeInTheDocument();
  });

  it("renders a sentinel card and marks a breached target", async () => {
    vi.mocked(listSentinels).mockResolvedValueOnce([
      { ...baseProduct, currentPriceCents: 80_000, targetPriceCents: 100_000 },
    ]);
    renderDashboard();
    expect(await screen.findByText("Console demo")).toBeInTheDocument();
    expect(screen.getByText("breach")).toBeInTheDocument();
  });
});
