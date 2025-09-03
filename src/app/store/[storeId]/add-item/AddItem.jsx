"use client";

import { useState, useTransition } from "react";
import { addItemAction } from "@/lib/actions/addItem";

export default function AddItemForm({ storeId }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    const fd = new FormData();
    fd.set("storeId", storeId);
    fd.set("name", name);
    fd.set("price", price);
    if (category) fd.set("category", category);

    startTransition(async () => {
      try {
        const res = await addItemAction(fd); // server action called from client
        setMsg(res?.message || "Added");
        // clear inputs on success
        if (res?.success) {
          setName("");
          setPrice("");
          setCategory("");
        }
      } catch (err) {
        console.error(err);
        setMsg(err?.message || "Failed to add item. Check server logs.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <input type="hidden" name="storeId" value={storeId} />
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Price (e.g. 7.99)</label>
        <input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" step="0.01" className="w-full border p-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Category (optional)</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Burgers" className="w-full border p-2" />
      </div>

      <div>
        <button disabled={isPending} className="px-4 py-2 bg-green-600 text-white rounded">
          {isPending ? "Adding…" : "Add Item"}
        </button>
      </div>

      {msg && <p className="mt-2">{msg}</p>}
    </form>
  );
}
