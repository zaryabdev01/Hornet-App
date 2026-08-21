Hi Nordine,

Quick request to get the TestFlight build moving — I need an App Store Connect API key rather than an account login, so this works cleanly for automated builds without needing your password or a 2FA code each time. Steps, if you (or whoever is Admin on the team) can generate one:

1. Go to appstoreconnect.apple.com and sign in.
2. Users and Access → Integrations → App Store Connect API (sometimes just labelled "Keys").
3. Click "+" / "Generate API Key".
4. Name it something like "ApiSave EAS CI".
5. Access level: "App Manager" is enough — Admin isn't required.
6. Download the resulting `.p8` file immediately — Apple only lets you download it once, so grab it before navigating away.
7. Note the **Key ID** (shown in the key list) and the **Issuer ID** (shown at the top of that page).

Once you have those three things — the `.p8` file, the Key ID, and the Issuer ID — send them over (the usual channel is fine) and I'll wire it into the build config. This key is scoped and revocable on your end at any time, so there's no ongoing exposure the way a password would be.

Thanks,
Zaryab
