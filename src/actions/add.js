"use server";

import { revalidatePath } from "next/cache";

function slug(str) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
}

function generateId(name) {
  return `${slug(name)}_${Date.now()}`;
}

export async function addItem(prevState, formData) {
  const storeId = (formData.get("storeId") || "").trim();
  const name = (formData.get("name") || "").trim();
  const rawPrice = (formData.get("price") || "0").trim();
  const rawCategory = (formData.get("category") || "Uncategorized").trim();

  if (!storeId) return { ok: false, message: "Missing storeId" };
  if (!name) return { ok: false, message: "Name is required" };

  // Uber requires smallest currency unit (e.g. cents for USD).
  const price = Math.round(parseFloat(rawPrice) * 100) || 0;

  const categoryId = slug(rawCategory);
  const itemId = generateId(name);

  // 1) Fetch current menu
  let menu;
  try {
    const res = await fetch(`https://api.uber.com/v2/eats/stores/${storeId}/menus`, {
      headers: {
        Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Accept-Encoding": "gzip"
      },
      cache: "no-store"
    });
    if (!res.ok) {
      throw new Error(`GET menu failed ${res.status}: ${await res.text()}`);
    }
    menu = await res.json();
  } catch (err) {
    console.error("Failed to fetch current menu:", err);
    return { ok: false, message: "Failed to fetch current menu" };
  }

  // Normalize arrays
  menu.items = Array.isArray(menu.items) ? menu.items : [];
  menu.categories = Array.isArray(menu.categories) ? menu.categories : [];
  menu.menus = Array.isArray(menu.menus) ? menu.menus : [];
  menu.modifier_groups = Array.isArray(menu.modifier_groups) ? menu.modifier_groups : [];

  // 2) New item
  const newItem = {
    id: itemId,
    title: { translations: { en_us: name } },
    price_info: { price }
  };

  menu.items.push(newItem);

  // 3) Category
  let category = menu.categories.find(c => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      title: { translations: { en_us: rawCategory } },
      entities: []
    };
    menu.categories.push(category);
  }
  if (!category.entities.some(e => e.id === itemId && e.type === "ITEM")) {
    category.entities.push({ id: itemId, type: "ITEM" });
  }

  // 4) Menus (must exist + reference category)
  if (menu.menus.length === 0) {
    menu.menus.push({
      id: "default_menu",
      title: { translations: { en_us: "Menu" } },
      service_availability: [
        { day_of_week: "monday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "tuesday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "wednesday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "thursday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "friday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "saturday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
        { day_of_week: "sunday", time_periods: [{ start_time: "00:00", end_time: "23:59" }] }
      ],
      category_ids: []
    });
  }

  menu.menus.forEach(m => {
    m.category_ids = Array.isArray(m.category_ids) ? m.category_ids : [];
    if (!m.category_ids.includes(categoryId)) {
      m.category_ids.push(categoryId);
    }
  });

  // 5) PUT back to Uber
  // console.log("prepared",menu);
  
  try {

    const putRes = await fetch(`https://api.uber.com/v2/eats/stores/${storeId}/menus`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(menu)
    });

    if (!putRes.ok) {
      let error;
      try { error = await putRes.json(); } catch { error = await putRes.text(); }
      console.error("PUT menu failed:", putRes.status, error);
      return { ok: false, message: "Uber rejected the menu payload" };
    }
  } catch (err) {
    console.error("Error putting menu:", err);
    return { ok: false, message: "Failed to update menu" };
  }

  // revalidatePath("/");
  return { ok: true, message: `Added "${name}" to ${rawCategory}` };
}
