/**
 * Unit Tests - Types Validation
 */

import { Profile, Spot, Payment, Subscription, UserRole } from "@/lib/types";

describe("Type Validation", () => {
  test("UserRole enum should contain all roles", () => {
    expect(UserRole.EXPLORER).toBe("explorer");
    expect(UserRole.PARTNER).toBe("partner");
    expect(UserRole.ADMIN).toBe("admin");
  });

  test("Profile should have required fields", () => {
    const profile: Profile = {
      id: "user-1",
      auth_uid: "auth-1",
      email: "test@example.com",
      full_name: "Test User",
      display_name: "Test",
      locale: "en",
      is_partner: false,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(profile.id).toBeDefined();
    expect(profile.email).toBeDefined();
    expect(profile.full_name).toBeDefined();
  });

  test("Spot should allow optional fields", () => {
    const spot: Spot = {
      id: "spot-1",
      title: "Test Cafe",
      category: "cafe",
      city: "Phnom Penh",
      latitude: 11.566,
      longitude: 104.927,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(spot.title).toBe("Test Cafe");
    expect(spot.description).toBeUndefined(); // Optional field
  });

  test("Payment should have correct status types", () => {
    const payment: Payment = {
      id: "pay-1",
      profile_id: "user-1",
      amount: 29.99,
      currency: "USD",
      status: "completed",
      provider: "bakong",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(["pending", "completed", "failed", "refunded"]).toContain(
      payment.status
    );
  });
});
