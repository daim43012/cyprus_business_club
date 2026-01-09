import prisma from "../src/lib/prisma.js";

const T = {
  AUDIENCE: "AUDIENCE",
  PAIN: "PAIN",
  SOLUTION: "SOLUTION",
  MONETIZATION: "MONETIZATION",
  CLIENT: "CLIENT",
};

// ---- DATA (English, lots of options) ----

const AUDIENCE = [
  "Founders & startup teams",
  "Entrepreneurs",
  "Small business owners",
  "E-commerce sellers",
  "Marketing managers",
  "CMOs / Heads of Marketing",
  "Sales leaders",
  "Product managers",
  "Designers",
  "Software developers",
  "Data analysts",
  "Finance professionals",
  "Investors",
  "Traders",
  "Creators / influencers",
  "Coaches & mentors",
  "Freelancers",
  "Students",
  "Corporate employees",
  "HR / recruiters",
  "Healthcare professionals",
  "Real estate professionals",
  "Legal professionals",
  "Hospitality / HoReCa",
  "NGOs / non-profits",
  "Local communities",
  "Parents",
  "Expats",
  "High-net-worth individuals (HNWIs)",
  "B2B buyers",
  "B2C customers",
];

const CLIENT = [
  "Individuals (B2C)",
  "Solopreneurs",
  "Small businesses (SMB)",
  "Mid-market companies",
  "Enterprise companies",
  "Startups",
  "Agencies",
  "Marketing departments",
  "Sales teams",
  "HR departments",
  "Operations teams",
  "Finance teams",
  "Education providers",
  "Clinics & healthcare businesses",
  "Law firms",
  "Real estate agencies",
  "Restaurants & cafes",
  "E-commerce brands",
  "SaaS companies",
  "Mobile app companies",
  "Web3 / crypto companies",
  "Media companies",
  "Event organizers",
  "Government / municipal bodies",
  "Non-profit organizations",
];

const PAIN = [
  "No consistent lead flow",
  "Low conversion rate",
  "High cost per lead (CPL)",
  "High customer acquisition cost (CAC)",
  "Unclear positioning",
  "Weak brand awareness",
  "Low customer retention",
  "Churn is too high",
  "Long sales cycle",
  "Poor sales performance",
  "Lack of predictable revenue",
  "Inconsistent cash flow",
  "No clear go-to-market strategy",
  "No repeatable marketing system",
  "Poor analytics and tracking",
  "No clear KPIs / messy reporting",
  "Operational chaos / no processes",
  "Manual work / low automation",
  "Hiring problems / talent shortage",
  "Team productivity issues",
  "Burnout / not enough time",
  "Competition is strong / commoditized market",
  "Customer support overload",
  "Scaling breaks the quality",
  "Hard to create content consistently",
  "No product-market fit yet",
  "Weak community engagement",
  "Low trust / credibility issues",
  "Hard to price the offer",
  "Offer is not compelling",
];

const SOLUTION = [
  "Lead generation system",
  "Conversion rate optimization (CRO)",
  "Marketing strategy & funnel design",
  "Brand positioning & messaging",
  "Content strategy",
  "Sales scripts & sales process",
  "CRM implementation & automation",
  "AI-based analytics & insights",
  "Customer retention program",
  "Community building",
  "Product packaging & pricing strategy",
  "Go-to-market (GTM) plan",
  "Operational process design (SOPs)",
  "Hiring & onboarding framework",
  "Performance marketing setup",
  "SEO and content optimization",
  "Email marketing automation",
  "Partnership strategy",
  "Influencer marketing program",
  "Education & training",
  "Data dashboards & KPI tracking",
  "Customer support optimization",
  "User onboarding optimization",
  "User research & discovery",
  "UX/UI improvements",
  "Tech implementation / development services",
];

const MONETIZATION = [
  // Your must-haves (English)
  "1:1 consulting",
  "Group consulting",
  "Online courses",
  "Workshops (paid)",
  "Guides / playbooks",
  "Books / eBooks",
  "Speaking engagements",
  "Brand collaborations",
  "Paid memberships",
  "Private clubs / closed community access",

  // More common monetization models
  "Subscription plans",
  "One-time purchase",
  "Freemium (upgrade to paid)",
  "Commission / revenue share",
  "Affiliate marketing",
  "Sponsorships",
  "Advertising revenue",
  "Licensing",
  "White-label offering",
  "Marketplace fee",
  "Usage-based pricing",
  "Tiered pricing packages",
  "Retainers (monthly)",
  "Paid audits / diagnostics",
  "Done-for-you services",
  "Done-with-you services",
  "Templates / digital products",
  "Toolkits / resources bundles",
  "Certification program",
  "Paid mastermind",
  "VIP access / premium support",
  "Corporate training",
  "Events / tickets",
  "Paid webinars",
  "Patreon-style support",
  "Donations",
];

function makeItems(type, titles) {
  return titles
    .map((title) => title.trim())
    .filter(Boolean)
    .map((title) => ({ type, title }));
}

async function main() {
  const items = [
    ...makeItems(T.AUDIENCE, AUDIENCE),
    ...makeItems(T.CLIENT, CLIENT),
    ...makeItems(T.PAIN, PAIN),
    ...makeItems(T.SOLUTION, SOLUTION),
    ...makeItems(T.MONETIZATION, MONETIZATION),
  ];

  // de-duplicate by (type|title) in JS just in case
  const seen = new Set();
  const unique = [];
  for (const it of items) {
    const key = `${it.type}|||${it.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(it);
  }

  let created = 0;
  let updated = 0;

  for (const it of unique) {
    // relies on @@unique([type, title]) which generates a compound unique input named type_title
    const res = await prisma.brandTag.upsert({
      where: { type_title: { type: it.type, title: it.title } },
      update: { isActive: true },
      create: { type: it.type, title: it.title, isActive: true },
    });

    // Prisma doesn't tell if it was created/updated. We'll do a cheap check:
    // If you need accurate counts, you'd query first; this is ok for seed.
    // We'll just increment "updated" after upsert; it's mostly informational.
    updated++;
  }

  console.log(`Seeded BrandTag entries: ${unique.length} (upserted)`);
  console.log(`Done.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
