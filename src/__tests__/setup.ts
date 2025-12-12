/**
 * Test Setup & Utilities
 * Common utilities for unit and integration tests
 */

// Type declarations for Jest
interface JestMock<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  mockReturnThis: () => JestMock<T>;
  mockResolvedValue: (value: any) => JestMock<T>;
  mockReturnValue: (value: any) => JestMock<T>;
  mockImplementation: (fn: T) => JestMock<T>;
}

declare const jest: {
  fn: <T extends (...args: any[]) => any>(implementation?: T) => JestMock<T>;
  clearAllMocks: () => void;
  resetAllMocks: () => void;
  restoreAllMocks: () => void;
};

// Mock Supabase client for testing
export function createMockSupabaseClient() {
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  };
}

// Test data generators
export const testData = {
  user: (overrides = {}) => ({
    id: "test-user-1",
    email: "test@example.com",
    full_name: "Test User",
    auth_uid: "auth-123",
    ...overrides,
  }),

  spot: (overrides = {}) => ({
    id: "spot-1",
    title: "Test Cafe",
    description: "A nice test cafe",
    category: "cafe",
    city: "Phnom Penh",
    latitude: 11.566,
    longitude: 104.927,
    views: 0,
    saves: 0,
    ...overrides,
  }),

  payment: (overrides = {}) => ({
    id: "payment-1",
    profile_id: "user-1",
    amount: 29.99,
    currency: "USD",
    status: "pending",
    provider: "bakong",
    provider_ref: "bakong-123",
    ...overrides,
  }),

  subscription: (overrides = {}) => ({
    id: "sub-1",
    profile_id: "user-1",
    tier: "starter",
    status: "active",
    price: 29.99,
    ...overrides,
  }),
};

// Helper functions
export async function expectAsyncToReject(
  fn: () => Promise<any>,
  message?: string
) {
  try {
    await fn();
    throw new Error(message || "Expected function to throw");
  } catch (error) {
    // Expected
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
