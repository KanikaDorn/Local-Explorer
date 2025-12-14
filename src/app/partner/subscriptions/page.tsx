"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import supabaseBrowser from "@/lib/supabaseClient";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: "month" | "year";
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  recommended?: boolean;
}

interface CurrentSubscription {
  planId: string;
  planName: string;
  startDate: string;
  renewalDate: string;
  status: "active" | "cancelled" | "expired";
  autoRenew: boolean;
  paymentMethod?: string;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "USD",
    period: "month",
    description: "Perfect for new businesses",
    features: [
      "Up to 5 locations",
      "Basic analytics dashboard",
      "Email support",
      "Standard visibility in search",
      "Monthly reporting",
      "Mobile app access",
    ],
    isCurrentPlan: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    currency: "USD",
    period: "month",
    description: "For growing businesses",
    features: [
      "Up to 20 locations",
      "Advanced analytics",
      "Priority email & chat support",
      "Enhanced visibility in search",
      "Custom banners & images",
      "Weekly performance reports",
      "API access (limited)",
      "A/B testing tools",
    ],
    isCurrentPlan: false,
    recommended: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 199,
    currency: "USD",
    period: "month",
    description: "For established enterprises",
    features: [
      "Unlimited locations",
      "Full analytics suite with AI insights",
      "24/7 priority phone support",
      "Premium visibility & featured spots",
      "Custom branding & white-label options",
      "Real-time performance reports",
      "Full API access",
      "Advanced A/B testing",
      "Dedicated account manager",
      "Multi-user team management",
    ],
    isCurrentPlan: false,
  },
];

export default function PartnerSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [currentSubscription, setCurrentSubscription] =
    useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const addToast = ({ message }: { message: string; duration?: number }) => toast({ title: message });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user
        const { data: { user: currentUser } } = await supabaseBrowser.auth.getUser();
        setUser(currentUser);

        // Load subscriptions
        const res = await apiFetch("/api/partner/subscriptions");
        if (res?.success) {
          if (res.data?.plans) {
            setPlans(res.data.plans);
          }
          if (res.data?.current) {
            setCurrentSubscription(res.data.current);
            // Mark current plan
            setPlans((prev) =>
              prev.map((p) => ({
                ...p,
                isCurrentPlan: p.id === res.data.current.planId,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpgrade = async (planId: string) => {
    console.log("Starting upgrade for plan:", planId);
    setUpgrading((prev) => ({ ...prev, [planId]: true }));
    try {
      if (!user) {
        console.warn("User not logged in");
        addToast({ message: "Please log in first" });
        return;
      }

      // 1. Create Subscription Intent
      console.log("Creating subscription intent...");
      const intentRes = await apiFetch("/api/partner/subscriptions/intent", {
        method: "POST",
        body: JSON.stringify({ planId, interval: "month" }),
      });

      console.log("Intent Response:", intentRes);

      if (!intentRes?.success) {
          throw new Error(intentRes?.error || "Failed to create subscription");
      }
      
      const { subscriptionId, amount } = intentRes.data;
      console.log("Subscription created:", subscriptionId);

      // 2. Initialize Card Linking (CoF)
      console.log("Initializing Card Linking...");
      const cofRes = await apiFetch("/api/payway/cards/initial", {
          method: "POST",
          body: JSON.stringify({ subscriptionId })
      });
      
      console.log("CoF Response:", cofRes);

      if (!cofRes?.success) {
           throw new Error(cofRes?.error || "Failed to initialize card payment");
      }

      const { actionUrl, fields } = cofRes.data;

      addToast({
          message: "Opening secure payment window...",
          duration: 2000,
      });

      // 3. Submit Form to PayWay (Hidden Form)
      console.log("Submitting form to:", actionUrl);
      const form = document.createElement("form");
      form.method = "POST";
      form.action = actionUrl; 
      
      Object.keys(fields).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
          
          if (key === 'ctid') {
             console.log("CTID being sent to PayWay:", fields[key]);
          }
      });

      document.body.appendChild(form);
      
      // Delay submit slightly to allow logs to flush and detach from current microtask
      setTimeout(() => {
          form.submit();
      }, 100);

    } catch (err: any) {
      console.error("Error upgrading:", err);
      // Fallback alert ensures the user sees something went wrong
      // alert(`Error: ${err.message || "Something went wrong"}`); 
      addToast({
        message: err.message || "Error upgrading plan",
        duration: 3000,
      });
    } finally {
        // Reset state only on error. Success navigates away.
        setTimeout(() => setUpgrading((prev) => ({ ...prev, [planId]: false })), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your business growth
        </p>
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {currentSubscription.planName}
              </h2>
              <p className="text-blue-700 mb-4">Your current active plan</p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-700">
                  📅 Started:{" "}
                  {new Date(currentSubscription.startDate).toLocaleDateString("en-US")}
                </p>
                <p className="text-blue-700">
                  🔄 Renews:{" "}
                  {new Date(
                    currentSubscription.renewalDate
                  ).toLocaleDateString("en-US")}
                </p>
                <p className="text-blue-700">
                  {currentSubscription.autoRenew
                    ? "✅ Auto-renewal enabled"
                    : "⏸️ Auto-renewal disabled"}
                </p>
              </div>
            </div>
            <Link href="/partner/billing">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all flex flex-col ${
              plan.isCurrentPlan
                ? "ring-2 ring-blue-600 shadow-xl"
                : plan.recommended
                ? "ring-2 ring-amber-400 shadow-lg"
                : "hover:shadow-lg"
            }`}
          >
            {plan.isCurrentPlan && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Current Plan
              </div>
            )}

            {plan.recommended && !plan.isCurrentPlan && (
              <div className="absolute top-0 right-0 bg-amber-400 text-gray-900 px-4 py-1 text-sm font-medium rounded-bl-lg flex items-center gap-1">
                <Zap className="w-3 h-3" /> Recommended
              </div>
            )}

            <div className="p-8 flex flex-col flex-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
              </div>

              {plan.isCurrentPlan ? (
                <Button disabled variant="outline" className="w-full mb-6">
                  Current Plan
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading[plan.id]}
                    className={`w-full mb-6 relative group overflow-hidden ${
                      plan.recommended
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {upgrading[plan.id] ? "Securely Linking..." : "Subscribe with Card"}
                  </Button>
                  <div className="text-center mb-6">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" /> Secured by PayWay (Visa/Mastercard)
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-3 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Methods & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payment Methods
          </h2>
          <p className="text-gray-600 mb-4">
            We accept multiple payment methods for your convenience:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <strong>Credit Cards:</strong> Visa, Mastercard, American Express
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <strong>ABA:</strong> Direct bank transfers & QR
              codes
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <strong>Wing:</strong> Mobile money transfers
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <strong>Bank Transfer:</strong> Direct deposit to our account
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            All payments are secured with SSL encryption
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Money-Back Guarantee
          </h2>
          <p className="text-gray-600 mb-4">
            Not satisfied with your plan? We offer a hassle-free guarantee:
          </p>
          <div className="space-y-3 text-sm">
            <p>
              <strong>7-Day Refund:</strong> Full refund if you cancel within 7
              days
            </p>
            <p>
              <strong>30-Day Trial:</strong> First month at 50% discount to test
              the plan
            </p>
            <p>
              <strong>Flexible Upgrades:</strong> Upgrade anytime, pro-rated
              billing
            </p>
          </div>
          <Link href="/partner/billing">
            <Button variant="outline" className="w-full mt-4">
              View Billing Details
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}