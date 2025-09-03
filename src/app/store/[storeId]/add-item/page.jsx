import AddItemForm from "./AddItem";

export default async function AddItemPage({ params }) {
  const {storeId} = await  params;
  const BASE = (process.env.UBER_API_BASE || "https://api.uber.com").replace(/\/$/, "");
  const TOKEN = process.env.UBER_ACCESS_TOKEN;

  let menu = { menus: [], categories: [], items: [], modifier_groups: [] };

  try {
    const res = await fetch(`${BASE}/v2/eats/stores/${storeId}/menus`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });

    if (res.status === 204) {
      menu = { menus: [], categories: [], items: [], modifier_groups: [] };
    } else if (res.ok) {
      menu = await res.json();
    } else {
      // log but continue — page still renders with form
      const text = await res.text().catch(() => "");
      console.error("GET /menus failed:", res.status, text);
    }
  } catch (err) {
    console.error("Error fetching menu on page:", err);
  }

  const items = Array.isArray(menu.items) ? menu.items : [];
  const categories = Array.isArray(menu.categories) ? menu.categories : [];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Item to Store</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Existing items</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">No items yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="border p-2 rounded">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{it.title?.translations?.en_us || it.id}</div>
                    <div className="text-sm text-gray-600">{it.description?.translations?.en_us || ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{it.price_info?.price ? `$${(it.price_info.price/100).toFixed(2)}` : "-"}</div>
                    <div className="text-xs text-gray-500">{it.status}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Add new item</h2>
        {/* client form */}
        {/* storeId passed in props — safe because it's just an id */}
        <AddItemForm storeId={storeId} />
      </section>
    </main>
  );
}
