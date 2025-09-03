"use client";
import { useState } from "react";
import Link from "next/link";

export default function ItemClient({ item, storeId }) {
  const [showToast, setShowToast] = useState(false);

  const handleAddToOrder = () => {
    console.log("Added to order:", item);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {item.title?.translations?.en_us || "Item"}
          </h1>
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {/* Skeleton Loader (simulated for client-side) */}
          {!item && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          )}

          {item && (
            <>
              {item.description?.translations?.en_us && (
                <p className="text-gray-600 mb-4">
                  {item.description.translations.en_us}
                </p>
              )}
              <p className="text-xl font-semibold text-gray-900 mb-6">
                ${((item.price_info?.price || 0) / 100).toFixed(2)}
              </p>
              <button
                onClick={handleAddToOrder}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                aria-label={`Add ${item.title?.translations?.en_us} to order`}
              >
                Add to Order
              </button>
            </>
          )}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
            {item.title?.translations?.en_us} added to cart!
          </div>
        )}
      </div>
    </main>
  );
}