// api/submit.js — Memory3D order submission handler
// Uploads photo → creates GHL contact → creates GHL opportunity → adds full order note (addons included)

const GHL_BASE = "https://rest.gohighlevel.com/v1";

/* ── helpers ── */

function readBody(req) {
  // Express/Railway already parses the body; raw Node http needs stream reading
  if (req.body) return Promise.resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

async function uploadToImgBB(base64Data, filename) {
  if (!base64Data) return null;
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const params = new URLSearchParams({ image: base64, name: filename || "photo" });
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: "POST",
    body: params,
  });
  const json = await res.json();
  return json?.data?.url ?? null;
}

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_PRIVATE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function createGHLContact({ name, email, phone }) {
  const [firstName, ...rest] = name.trim().split(" ");
  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      firstName,
      lastName: rest.join(" ") || "",
      email,
      phone,
      locationId: process.env.GHL_LOCATION_ID,
      tags: ["3D Crystal Order"],
    }),
  });
  const json = await res.json();
  // GHL returns existing contact id if duplicate email
  return json?.contact?.id ?? json?.id ?? null;
}

async function createGHLOpportunity({ contactId, name, totalPrice, firstItemLabel }) {
  const opportunityName = `${name} — ${firstItemLabel || "3D Crystal"} Order`;
  const res = await fetch(`${GHL_BASE}/pipelines/${process.env.GHL_PIPELINE_ID}/opportunities`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      pipelineId: process.env.GHL_PIPELINE_ID,
      locationId: process.env.GHL_LOCATION_ID,
      name: opportunityName,
      pipelineStageId: process.env.GHL_STAGE_ID,
      status: "open",
      contactId,
      monetaryValue: totalPrice,
    }),
  });
  const json = await res.json();
  return json?.opportunity?.id ?? null;
}

async function addGHLNote({ contactId, body }) {
  await fetch(`${GHL_BASE}/contacts/${contactId}/notes/`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({ userId: contactId, body }),
  });
}

function buildOrderNote({ name, email, phone, cartItems, totalPrice, photoUrl }) {
  const lines = [
    "ORDER DETAILS",
    "=============",
    `Customer : ${name}`,
    `Email    : ${email}`,
    `Phone    : ${phone}`,
    "",
    "ITEMS:",
  ];

  for (const item of cartItems || []) {
    lines.push(`  • ${item.shapeLabel} — ${item.sizeLabel}   $${Number(item.price).toFixed(2)}`);

    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const qty = addon.qty > 1 ? ` ×${addon.qty}` : "";
        const addonTotal = (addon.price * (addon.qty || 1)).toFixed(2);
        lines.push(`      + ${addon.label}${qty}   $${addonTotal}`);
      }
    }

    if (item.inscriptionText && item.inscriptionText.trim()) {
      lines.push(`      Inscription: "${item.inscriptionText.trim()}"`);
    }
  }

  lines.push("");
  lines.push(`TOTAL : $${Number(totalPrice).toFixed(2)}`);

  if (photoUrl) {
    lines.push("");
    lines.push(`Photo : ${photoUrl}`);
  }

  return lines.join("\n");
}

/* ── main handler ── */

module.exports = async function handler(req, res) {
  if (req.method && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { name, email, phone, cartItems, totalPrice, photoBase64, photoName } = body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    // 1. Upload photo
    const photoUrl = await uploadToImgBB(photoBase64, photoName);

    // 2. GHL contact
    const contactId = await createGHLContact({ name, email, phone });
    if (!contactId) throw new Error("Failed to create GHL contact");

    // 3. GHL opportunity
    const firstItemLabel = cartItems?.[0]?.shapeLabel;
    await createGHLOpportunity({ contactId, name, totalPrice, firstItemLabel });

    // 4. Note with full order (addons + inscription included)
    const noteBody = buildOrderNote({ name, email, phone, cartItems, totalPrice, photoUrl });
    await addGHLNote({ contactId, body: noteBody });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: err.message || "Submission failed" });
  }
};
