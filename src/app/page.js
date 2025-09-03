// pages/index.js
import Link from "next/link";
import { uberFetch } from "@/lib/uber";

export default async function Home() {
  let stores = [];
  let error = null;

  try {
    const data = await uberFetch("/v1/eats/stores");
    stores = data.stores || [];
  } catch (err) {
    error = "Failed to load stores. Please try again later.";
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Discover Local Restaurants
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            {error}
          </div>
        )}

        {!error && stores.length === 0 && (
          <div className="text-center text-gray-500">No stores found.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.length === 0 && !error
            ? // Skeleton Loader
              Array(6)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
            : stores.map((store) => (
                <div
                  key={store.store_id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {store.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {store.description || "No description available."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{store.name}</span>
                    <Link
                      href={`/store/${store.store_id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      aria-label={`View menu for ${store.name}`}
                    >
                      View Menu
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </main>
  );
}