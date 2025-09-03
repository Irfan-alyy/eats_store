import Link from "next/link";
import { uberFetch } from "@/lib/uber";
import ItemClient from "./ItemClient";

export default async function ItemPage({ params }) {
  const { storeId, itemId } = await params;

  let menu = {};
  let item = null;
  let error = null;

  try {
    menu = await uberFetch(`/v2/eats/stores/${storeId}/menus`);
    item = menu.items?.find((i) => i.id === itemId);
  } catch (err) {
    error = "Failed to load item details. Please try again later.";
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
          <Link
            href={`/store/${storeId}`}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            aria-label="Back to menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500 mb-6">Item not found.</div>
          <Link
            href={`/store/${storeId}`}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 justify-center"
            aria-label="Back to menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  return <ItemClient item={item} storeId={storeId} />;
}