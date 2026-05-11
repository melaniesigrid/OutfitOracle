# Privacy Policy — Outfit Oracle

**Last updated: 11 May 2026**

Outfit Oracle ("the app", "we") is a weather-powered fashion advisor that generates outfit recommendations using live weather data and artificial intelligence. This policy explains what data the app handles, how it is used, and your rights.

---

## 1. Data we collect

### 1.1 City name
When you enter a city or tap a recent city chip, that city name is:
- Sent to Open-Meteo (geocoding + weather, see §3)
- Sent to our backend proxy, which forwards it to Anthropic (see §3)
- Stored locally on your device (last 5 cities) via device storage

We do not store city searches on any server we operate.

### 1.2 Device storage
The app stores your last 5 searched cities on-device using AsyncStorage. This data never leaves your device except as described in §2.

### 1.3 Data we do not collect
- We do not collect your name, email, phone number, or account credentials
- We do not collect precise location data (GPS) — only the city name you type
- We do not use advertising identifiers or third-party analytics SDKs
- We do not track behaviour across other apps or websites

---

## 2. How data is used

City name and current weather conditions are combined into a single request sent to our backend proxy (§3) to generate your outfit recommendation. The request includes:
- City, country, temperature, humidity, wind speed, weather condition
- Your selected gender preference (Women / Men / Anyone)

This data is used solely to generate your outfit recommendation and is not retained after the response is returned.

---

## 3. Third-party services

### Open-Meteo
We use Open-Meteo to geocode your city and fetch current weather conditions. Open-Meteo is a free, open-source weather API that does not require an account or personal data.
Privacy policy: [open-meteo.com](https://open-meteo.com)

### Anthropic (Claude)
Your weather data and gender preference are sent to Anthropic's Claude API to generate outfit recommendations. Anthropic processes this data in accordance with their usage policies. No personally identifiable information is included in these requests.
Privacy policy: [anthropic.com/privacy](https://anthropic.com/privacy)

### Google Shopping
If you tap "Shop This Piece", the app opens a Google Shopping search in your browser. Google's own privacy policy governs that interaction. No data is sent to Google by the app itself.
Privacy policy: [policies.google.com](https://policies.google.com)

---

## 4. Data retention

- **On-device storage:** Recent cities remain on your device until you clear app data or uninstall the app. No server-side retention.
- **Anthropic:** Requests are processed in real time. We do not log requests on our proxy beyond what Cloudflare's platform logs by default (anonymous request metadata, no body content).

---

## 5. Children's privacy

Outfit Oracle is not directed at children under 13 (US) or under 16 (EU/UK). We do not knowingly collect data from children. If you believe a child has used the app, contact us and we will ensure any relevant on-device data can be cleared.

---

## 6. Your rights

You may:
- Delete on-device data at any time by uninstalling the app or clearing app storage in your device settings
- Contact us to ask questions about how your data is handled

Depending on your jurisdiction (EU/UK GDPR, CCPA), you may have additional rights including access, portability, and erasure. Because we do not store personal data on our servers, most such requests are fulfilled by clearing your device storage.

---

## 7. Changes to this policy

We may update this policy as the app evolves. Material changes will be noted with a revised "Last updated" date. Continued use of the app after changes constitutes acceptance.

---

## 8. Contact

Questions or concerns about this policy:

**Email:** melaniesigridab@gmail.com

We will respond within 30 days.
