/**
 * Unit Tests - API Client
 */

import apiFetch from "@/lib/apiClient";

describe("apiClient", () => {
  beforeEach(() => {
    // Clear fetch mock before each test
    jest.clearAllMocks();
  });

  test("GET request should return success response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: "test-1" } }),
      })
    ) as jest.Mock;

    const result = await apiFetch("/api/test");
    expect(result.success).toBe(true);
    expect(result.data.id).toBe("test-1");
  });

  test("POST request should include body", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    const testData = { email: "test@example.com" };
    await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(testData),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/users"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  test("Failed response should return error", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, error: "Not found" }),
      })
    ) as jest.Mock;

    const result = await apiFetch("/api/notfound");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not found");
  });
});
