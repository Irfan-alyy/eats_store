import Link from "next/link";
import { uberFetch } from "@/lib/uber";

export default async function StorePage({ params }) {
  let menu = {};
  let error = null;
  const {storeId}= await params
  try {
    menu = await uberFetch(`/v2/eats/stores/${storeId}/menus`);
  } catch (err) {
    error = "Failed to load menu. Please try again later.";
  }

  console.log(menu);
  
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {menu.title?.translations?.en_us || "Menu"}
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            aria-label="Back to store list"
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
            Back to Stores
          </Link>
        </div>
        <div>
          <Link 
          href={`/store/${storeId}/add-menu`}
           className="py-5 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          aria-label="Add New Items to Menu"
          >
          Add Items
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            {error}
          </div>
        )}

        {!error && (!menu.categories || menu.categories.length === 0) && (
          <div className="text-center text-gray-500">No menu items available.</div>
        )}

        {!error &&
          menu.categories?.map((cat) => (
            <section key={cat.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {cat.title?.translations?.en_us || "Category"}
              </h2>
              <ul className="grid grid-cols-1 gap-4">
                {cat.entities?.length === 0 && !error
                  ? // Skeleton Loader
                    Array(4)
                      .fill()
                      .map((_, index) => (
                        <li
                          key={index}
                          className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                        >
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </li>
                      ))
                  : cat.entities?.map((entity) => {
                      const item = menu.items?.find((i) => i.id === entity.id);
                      if (!item) return null;
                      return (
                        <li
                          key={item.id}
                          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <Link
                              href={`/store/${params.storeId}/item/${item.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium line-clamp-1"
                              aria-label={`View details for ${item.title?.translations?.en_us}`}
                            >
                              {item.title?.translations?.en_us || "Item"}
                            </Link>
                            {item.price_info?.price && (
                              <span className="text-gray-900 font-medium">
                                ${(item.price_info.price / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
              </ul>
            </section>
          ))}
      </div>
    </main>
  );
}