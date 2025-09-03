"use server";

export async function addItemAction(formData) {
  function generateId(name) {
    return `${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
  }

  const storeId = formData.get("storeId");
  const name = formData.get("name");
  const price = parseInt(formData.get("price"), 10);
  const rawCategory = formData.get("category") || "Uncategorized";
  const categoryId = rawCategory.toLowerCase().replace(/\s+/g, "_");
  const itemId = generateId(name);
  const subsectionId = `${categoryId}_sub_${Date.now()}`;

  // 1. Fetch current menu
  const res = await fetch(
    `https://api.uber.com/v2/eats/stores/${storeId}/menus`,
    {
      headers: { Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}` },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch current menu");
  const menu = await res.json();

  const mainMenu = menu.menus?.[0];
  if (!mainMenu) throw new Error("No main menu found");

  // 2. Create the new item
  const newItem = {
    id: itemId,
    title: { translations: { en_us: name } },
    price_info: { price, currency_code: "USD" },
    status: "AVAILABLE",
  };
  menu.items.push(newItem);

  // 3. Create category if not exists
  let category = menu.categories?.find((c) => c.id === categoryId);
  if (!category) {
    category = {
      id: categoryId,
      title: { translations: { en_us: rawCategory } },
      entities: [],
    };
    menu.categories.push(category);
  }

  // Link item into category
  category.entities.push({ id: itemId, type: "ITEM" });

  // 4. Create a subsection for the category
  const subsection = {
    id: subsectionId,
    title: { translations: { en_us: rawCategory } },
    category_ids: [categoryId],
  };
  menu.subsections.push(subsection);

  // 5. Attach subsection to the first section
  const section = menu.sections?.[0];
  if (!section.subsection_ids.includes(subsectionId)) {
    section.subsection_ids.push(subsectionId);
  }

  // 6. PUT updated menu back
  const putRes = await fetch(
    `https://api.uber.com/v2/eats/stores/${storeId}/menus`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menu),
    }
  );

  if (!putRes.ok) {
    const errBody = await putRes.text();
    console.error("PUT /menus error:", putRes.status, errBody);
    throw new Error(`Uber API returned ${putRes.status}: ${errBody}`);
  }

  return { success: true };
}
