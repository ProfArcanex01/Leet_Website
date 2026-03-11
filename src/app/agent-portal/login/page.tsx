"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  agentAuthFetch,
  clearAgentToken,
  initAgentLogin,
  setAgentToken,
  verifyAgentLogin,
} from "@/lib/api";

type LoginState = {
  email: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
};

export default function AgentPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loginState, setLoginState] = useState<LoginState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVerificationStep = Boolean(loginState);

  async function handleStartLogin() {
    if (!email.trim()) {
      setError("Enter the email linked to your agent account.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await initAgentLogin(email.trim().toLowerCase());
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || "Unable to start login.");
      }

      if (!payload?.user_exists || !payload?.phone_number) {
        throw new Error("We could not find an agent account with that email.");
      }

      setLoginState({
        email: String(payload.email),
        phoneNumber: String(payload.phone_number),
        phoneNumberDisplay: String(payload.phone_number_display || "****"),
      });
      setVerificationCode("");
    } catch (err) {
      clearAgentToken();
      setError(err instanceof Error ? err.message : "Unable to start login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!loginState) return;
    if (verificationCode.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await verifyAgentLogin(
        loginState.email,
        loginState.phoneNumber,
        verificationCode.trim(),
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || "Verification failed.");
      }
      if (!payload?.access) {
        throw new Error("No access token returned.");
      }

      setAgentToken(String(payload.access));

      const checkResponse = await agentAuthFetch("/agents/me/dashboard/");
      const checkPayload = await checkResponse.json().catch(() => ({}));
      if (!checkResponse.ok) {
        clearAgentToken();
        throw new Error(
          checkPayload?.detail ||
            checkPayload?.error ||
            "This account does not have agent portal access yet.",
        );
      }

      router.replace("/agent-portal");
    } catch (err) {
      clearAgentToken();
      setError(
        err instanceof Error ? err.message : "Unable to verify this agent session.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111E] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(150,255,213,0.18),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(240,142,67,0.18),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1120px] items-center justify-center px-6 py-10 lg:px-10">
        <section className="w-full max-w-lg flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#96FFD5] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Agent Portal
          </div>
          <h1 className="mt-6 max-w-[12ch] text-[clamp(2.8rem,6vw,4.5rem)] leading-[0.98] text-white">
            Sign in to continue.
          </h1>
          <p className="mt-4 max-w-[36ch] text-base leading-8 text-white/66">
            Use the email linked to your agent account.
          </p>
          <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.06] text-white shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="border-b border-white/10 px-7 pb-6 pt-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F08E43] text-white shadow-[0_14px_30px_rgba(240,142,67,0.35)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                      Secure Access
                    </p>
                    <h2 className="mt-1 text-2xl text-white">
                      {isVerificationStep ? "Verify your code" : "Enter your portal"}
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/60">
                  {isVerificationStep
                    ? `Enter the code sent to ${loginState?.email}.`
                    : "We will send a one-time verification code."}
                </p>
              </div>

              <div className="space-y-5 px-7 py-7">
                {!isVerificationStep ? (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">
                      Agent email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="agent@leetgh.com"
                      className="h-13 rounded-2xl border-white/10 bg-[#0B1727] text-white placeholder:text-white/28"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-white/80">
                      One-time verification code
                    </Label>
                    <Input
                      id="otp"
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      className="h-13 rounded-2xl border-white/10 bg-[#0B1727] text-white placeholder:text-white/28"
                    />
                  </div>
                )}

                {error ? (
                  <div className="rounded-2xl border border-[#F08E43]/30 bg-[#F08E43]/12 px-4 py-3 text-sm text-[#FFD3B5]">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={isVerificationStep ? handleVerifyCode : handleStartLogin}
                    disabled={loading}
                    className="h-12 rounded-full bg-[#F08E43] px-6 text-white shadow-[0_18px_44px_rgba(240,142,67,0.34)] hover:bg-[#df7f35]"
                  >
                    {loading
                      ? "Working..."
                      : isVerificationStep
                        ? "Unlock workspace"
                        : "Send verification code"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {isVerificationStep ? (
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        setLoginState(null);
                        setVerificationCode("");
                        setError(null);
                      }}
                      className="h-12 rounded-full border-white/12 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                    >
                      Change email
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
