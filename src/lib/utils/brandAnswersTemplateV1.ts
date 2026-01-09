export const brandAnswersTemplateV1 = {
  formVersion: 1,

  about: {
    description: null as string | null,
    sphere: null as string | null,
    products: [] as string[],
  },

  audience: {
    gender: [] as string[],
    ageRange: {
      from: null as number | null,
      to: null as number | null,
    },
    geo: [] as string[],
    interests: [] as string[],

    segments: [] as string[],
  },

  problems: {
    pains: [] as string[],    
    solutions: [] as string[], 
  },

  clients: {
    potential: [] as string[],
  },

  monetization: {
    models: [] as string[],  
    notes: null as string | null,
  },

  links: {
    website: null as string | null,
    socials: {
      instagram: null as string | null,
      telegram: null as string | null,
      tiktok: null as string | null,
      youtube: null as string | null,
      linkedin: null as string | null,
    },
    contacts: {
      email: null as string | null,
      phone: null as string | null,
    },
  },

  team: [] as Array<{
    name: string | null;
    role: string | null;
    email: string | null;
  }>,
} as const;
