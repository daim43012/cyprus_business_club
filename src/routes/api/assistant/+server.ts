// src/routes/api/assistant/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSystemPrompt, type ContextKey } from "$lib/prompts/assistant";
import {
  BRAND_CATEGORY_FILTER_RU,
  BRAND_CATEGORY_FILTER_EN
} from "$lib/prompts/brandCategoryFilter";
import prisma from "$lib/prisma";

function detectLang(text: string): "ru" | "en" {
  return /[а-яё]/i.test(text) ? "ru" : "en";
}

// мини-вызов модели для выбора релевантных категорий
async function pickCategoriesByLLM(
  fetchFn: typeof fetch,
  userQuery: string,
  lang: "ru" | "en"
): Promise<string[]> {
  const categories = await prisma.eventCategory.findMany({
    select: { id: true, name: true }
  });

  const systemPrompt =
    lang === "ru" ? BRAND_CATEGORY_FILTER_RU : BRAND_CATEGORY_FILTER_EN;

  const res = await fetchFn("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            `Пользовательский запрос: ${userQuery}`,
            `Доступные категории (JSON): ${JSON.stringify(categories)}`
          ].join("\n\n")
        }
      ]
    })
  });

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";

  let ids: string[] = [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.categoryIds)) {
      ids = parsed.categoryIds;
    }
  } catch (e) {
    console.error("Category filter JSON parse error:", content);
  }

  const allowedIds = new Set(categories.map((c) => c.id));
  return ids.filter((id) => allowedIds.has(id));
}

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const {
      prompt,
      lang,
      contextKey = "global",
      payload = {},
      history = []
    } = await request.json();

    if (!prompt) {
      return json({ error: "Missing prompt" }, { status: 400 });
    }

    const finalLang = (lang ?? detectLang(prompt)) as "ru" | "en";
    const ctxKey = contextKey as ContextKey;

    let enrichedPayload = payload;

    // 🔍 спец-логика поиска брендов:
    // работает и для чистого поиска, и для универсального режима
    if (ctxKey === "brand_search" || ctxKey === "brand_unified") {
      const categoryIds = await pickCategoriesByLLM(fetch, prompt, finalLang);

      let brands: any[] = [];
      if (categoryIds.length > 0) {
        brands = await prisma.brand.findMany({
          where: {
            status: "ACTIVE", // подставь свой статус/enum
            categories: {
              some: { id: { in: categoryIds } }
            }
          },
          select: {
            id: true,
            name: true,
            website: true,
            answers: true,
            categories: { select: { id: true, name: true } }
          },
          take: 20
        });
      }

      enrichedPayload = {
        ...payload,
        brandSearchCategories: categoryIds,
        brandSearchResults: brands
      };
    }

    const systemPrompt = getSystemPrompt(finalLang, ctxKey);

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Context payload (JSON): ${JSON.stringify(enrichedPayload)}`
      },
      ...history,
      { role: "user", content: prompt }
    ];

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages,
        temperature: 0.5,
        max_tokens: 350
      })
    });

    const gptResult = await gptRes.json();
    const reply = gptResult?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("GPT error:", gptResult);
      return json({ error: "OpenAI error", details: gptResult }, { status: 500 });
    }

    return json({ reply, lang: finalLang });
  } catch (err) {
    console.error("Server error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
