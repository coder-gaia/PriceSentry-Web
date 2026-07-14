import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { App } from "../App";

function renderApp(initialPath: string) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("App routing", () => {
  it("redirects an unauthenticated visitor from the dashboard to login", () => {
    renderApp("/");
    expect(screen.getByText("SENTRY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /acessar sistema/i })).toBeInTheDocument();
  });

  it("redirects an unauthenticated visitor from a sentinel detail page to login", () => {
    renderApp("/sentinel/abc-123");
    expect(screen.getByRole("button", { name: /acessar sistema/i })).toBeInTheDocument();
  });
});
