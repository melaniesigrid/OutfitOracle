(function () {
  const profiles = [
    {
      match: /storm|thunder|lightning/,
      className: "glance-storm",
      status: "STORM WATCH",
      days: [["Now", "49°", "ϟ"], ["Tue", "51°", "☂"], ["Wed", "55°", "≋"]],
    },
    {
      match: /heavy rain|pouring/,
      className: "glance-rain",
      status: "RAIN CHECK",
      days: [["Now", "51°", "☂"], ["Tue", "54°", "⌄"], ["Wed", "57°", "≋"]],
    },
    {
      match: /rain|drizzle/,
      className: "glance-rain",
      status: "RAIN CHECK",
      days: [["Now", "56°", "☂"], ["Tue", "58°", "⌄"], ["Wed", "60°", "≋"]],
    },
    {
      match: /snow/,
      className: "glance-snow",
      status: "SNOW MODE",
      days: [["Now", "28°", "❄"], ["Tue", "30°", "✦"], ["Wed", "34°", "≋"]],
    },
    {
      match: /fog|mist|hazy/,
      className: "glance-fog",
      status: "LOW VISIBILITY",
      days: [["Now", "47°", "≋"], ["Tue", "50°", "◌"], ["Wed", "53°", "☁"]],
    },
    {
      match: /wind|gust/,
      className: "glance-wind",
      status: "WIND CHECK",
      days: [["Now", "58°", "≋"], ["Tue", "60°", "⌁"], ["Wed", "63°", "☁"]],
    },
    {
      match: /night|moon|after dark|clear-night|cloudy-night|rain-night|snow-night/,
      className: "glance-night",
      status: "AFTER DARK",
      days: [["Now", "61°", "☾"], ["Tue", "58°", "☁"], ["Wed", "55°", "≋"]],
    },
    {
      match: /cloud|partly/,
      className: "glance-cloud",
      status: "LAYER CHECK",
      days: [["Now", "68°", "☁"], ["Tue", "70°", "☼"], ["Wed", "66°", "≋"]],
    },
    {
      match: /sun|clear/,
      className: "glance-sunny",
      status: "SUN CHECK",
      days: [["Now", "22°", "☀"], ["Tue", "24°", "☼"], ["Wed", "23°", "≋"]],
    },
  ];

  function detectProfile(card) {
    const signal = [
      document.title,
      card.className,
      card.getAttribute("aria-label") || "",
    ].join(" ").toLowerCase();

    return profiles.find((profile) => profile.match.test(signal)) || profiles[profiles.length - 1];
  }

  function addHeader(card, profile) {
    if (card.querySelector(":scope > .glance-header")) return;

    const header = document.createElement("div");
    header.className = "glance-header";

    const kicker = document.createElement("span");
    kicker.className = "glance-kicker";
    kicker.textContent = "WEATHER EDITORIAL";

    const status = document.createElement("span");
    status.className = "glance-status";
    status.textContent = profile.status;

    header.append(kicker, status);
    card.insertBefore(header, card.firstElementChild);
  }

  function addDailyRail(card, profile) {
    if (card.querySelector(":scope > .glance-daily-rail")) return;

    const panel = card.querySelector(".glass-panel");
    if (!panel) return;

    const rail = document.createElement("div");
    rail.className = "glance-daily-rail";

    profile.days.forEach(([label, temp, icon]) => {
      const day = document.createElement("div");
      day.className = "glance-day";

      const iconNode = document.createElement("span");
      iconNode.setAttribute("aria-hidden", "true");
      iconNode.textContent = icon;

      const labelNode = document.createElement("span");
      labelNode.textContent = label;

      const tempNode = document.createElement("strong");
      tempNode.textContent = temp;

      day.append(iconNode, labelNode, tempNode);
      rail.append(day);
    });

    panel.insertAdjacentElement("afterend", rail);
  }

  document.querySelectorAll(".weather-card").forEach((card) => {
    const profile = detectProfile(card);
    card.classList.add("glance-parity-card", profile.className);
    addHeader(card, profile);
    addDailyRail(card, profile);
  });
})();
