import { SiGithub, SiGmail, SiLinkedin, SiX } from "@icons-pack/react-simple-icons";
import { useNotifications } from "../../state/notifications";
import { ExternalLinkIcon } from "../../desktop/icons";
import { CONTACTS, PROFILE, type Contact } from "../../content/portfolio";

const CONTACT_DECORATION: Record<Contact["id"], { color: string; icon: React.ReactNode }> = {
  email: { color: "#ea4335", icon: <SiGmail size={22} title="Gmail" /> },
  github: { color: "#24292f", icon: <SiGithub size={22} title="GitHub" /> },
  linkedin: { color: "#0a66c2", icon: <SiLinkedin size={22} title="LinkedIn" /> },
  x: { color: "#1d1d1f", icon: <SiX size={22} title="X" /> },
};

export function Contacts() {
  const { notify } = useNotifications();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("yeunwookk@gmail.com");
      notify({ title: "Copied to clipboard", body: "yeunwookk@gmail.com" });
    } catch {
      window.location.href = "mailto:yeunwookk@gmail.com";
    }
  };

  return (
    <div className="breeze-scroll h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5">
        {/* Identity header */}
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--breeze-accent), var(--breeze-accent-strong))",
            }}
          >
            YK
          </div>
          <div>
            <p className="text-[17px] font-bold">Yeunwook Kim</p>
            <p className="text-[12.5px] text-subtle">
              Math-CS @ UC San Diego ('26) · {PROFILE.location}
            </p>
          </div>
        </div>

        {/* Contact cards */}
        <ul className="grid gap-2.5 sm:grid-cols-1">
          {CONTACTS.map((contact) => (
            <li key={contact.id}>
              <div className="flex items-center gap-3 rounded-lg border border-line bg-window p-3 transition-colors hover:border-accent/60">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${CONTACT_DECORATION[contact.id].color}22`, color: CONTACT_DECORATION[contact.id].color }}
                >
                  {CONTACT_DECORATION[contact.id].icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold uppercase tracking-wide text-subtle">
                    {contact.label}
                  </span>
                  <span className="block truncate text-[13.5px] font-medium">
                    {contact.value}
                  </span>
                </span>
                {contact.id === "email" ? (
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="shrink-0 rounded-md bg-accent px-3.5 py-1.5 text-[12px] font-bold text-accent-fg hover:bg-accent-strong"
                  >
                    Copy
                  </button>
                ) : (
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3.5 py-1.5 text-[12px] font-bold hover:bg-hover"
                  >
                    Open <ExternalLinkIcon size={12} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Location map */}
        <div className="overflow-hidden rounded-lg border border-line bg-window">
          <iframe
            title="Map of SoMa, San Francisco"
            src="https://www.google.com/maps?q=South+of+Market,+San+Francisco,+CA&output=embed"
            className="h-[240px] w-full border-none"
            loading="lazy"
          />
          <p className="border-t border-line px-4 py-2 text-[11.5px] text-subtle">
            Current location: SoMa, San Francisco, California
          </p>
        </div>
      </div>
    </div>
  );
}
