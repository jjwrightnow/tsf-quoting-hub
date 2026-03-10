import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Mail } from "lucide-react";
import HeroMockup from "@/components/login/HeroMockup";
import LoginChatbot from "@/components/login/LoginChatbot";

const Login = () => {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [domainBlocked, setDomainBlocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setDomainBlocked(false);

    try {
      const { data: domainCheck, error: fnError } = await supabase.functions.invoke("check-domain-on-signup", {
        body: { email },
      });
      if (fnError) {
        setLoading(false);
        setError("Unable to verify your domain. Please try again.");
        return;
      }
      if (!domainCheck?.allowed) {
        setLoading(false);
        setDomainBlocked(true);
        return;
      }
    } catch {
      setLoading(false);
      setError("Unable to verify your domain. Please try again.");
      return;
    }

    const { error: err } = await sendMagicLink(email);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const timestamp = Date.now();
      for (const file of Array.from(files)) {
        const path = `guest-uploads/${timestamp}-${file.name}`;
        const { error } = await supabase.storage.from("intake-assets").upload(path, file);
        if (error) throw error;
      }
      setUploadDone(true);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background" style={{ padding: 0, margin: 0 }}>
      {/* Background mockup — hidden on mobile */}
      <div
        className="hidden md:flex fixed inset-0 items-center justify-center overflow-hidden pointer-events-none select-none opacity-25"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div className="w-[66vw] max-w-[66vw] aspect-[16/10] flex flex-col overflow-hidden rounded-xl">
          <HeroMockup />
        </div>
      </div>
      {/* Dark overlay */}
      <div
        className="hidden md:block fixed inset-0 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.65)", zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Floating login card */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-6"
        style={{ zIndex: 10 }}
      >
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-pink-blue">
              <div className="h-5 w-5 rounded-sm bg-primary-foreground/90" />
            </div>
            <p className="text-sm text-muted-foreground">Professional Sign Quoting</p>
          </div>

          {sent ? (
            <div className="animate-fade-in-up rounded-lg border border-border bg-secondary p-6 text-center">
              <div className="mb-3 text-2xl">&#9993;</div>
              <p className="text-sm text-foreground">Check your email &mdash; we've sent you a secure login link.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (domainBlocked) {
                      setDomainBlocked(false);
                      setUploadDone(false);
                    }
                  }}
                  className="h-12 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                {error && !domainBlocked && <p className="text-sm text-accent">{error}</p>}
                {!domainBlocked && (
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="h-12 w-full gradient-pink-blue text-foreground font-semibold transition-all duration-300 hover:opacity-90"
                  >
                    {loading ? "Sending..." : "Send Magic Link"}
                  </Button>
                )}
              </form>

              {domainBlocked && !uploadDone && (
                <div className="mt-4 animate-fade-in-up rounded-lg border border-border bg-secondary p-5 space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    SignMaker.ai is a wholesale platform for verified sign companies.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    To request access, email{" "}
                    <a href="mailto:jj@thesignagefactory.co" className="text-primary underline underline-offset-2">
                      jj@thesignagefactory.co
                    </a>{" "}
                    with your company name and domain.
                  </p>
                  <p className="text-sm text-muted-foreground">In the meantime, you can still get a quote:</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Upload your artwork below</li>
                    <li>
                      Or email it directly to{" "}
                      <a
                        href="mailto:quotes@thesignagefactory.co"
                        className="text-primary underline underline-offset-2"
                      >
                        quotes@thesignagefactory.co
                      </a>
                    </li>
                  </ul>

                  <div className="flex gap-3 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-11 gap-2 gradient-pink-blue text-foreground font-semibold transition-all duration-300 hover:opacity-90"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading…" : "Upload Artwork for a Quote"}
                    </Button>
                    <a
                      href="mailto:quotes@thesignagefactory.co?subject=Quote Request&body=Please find my artwork attached."
                      className="flex-shrink-0"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 gap-2 border-border text-foreground hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                      >
                        <Mail className="h-4 w-4" />
                        Email Your Artwork
                      </Button>
                    </a>
                  </div>

                  {error && <p className="text-sm text-accent">{error}</p>}
                </div>
              )}

              {domainBlocked && uploadDone && (
                <div className="mt-4 animate-fade-in-up rounded-lg border border-border bg-secondary p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-lg">
                      ✓
                    </div>
                    <p className="text-sm font-semibold text-foreground">Artwork received.</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A member of our team will review and send a quote to the email you provided within 24 hours.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Not a SignMaker.ai member yet? Email{" "}
                    <a href="mailto:jj@thesignagefactory.co" className="text-primary underline underline-offset-2">
                      jj@thesignagefactory.co
                    </a>{" "}
                    with your company name and domain to request wholesale access.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <LoginChatbot />
    </div>
  );
};

export default Login;
