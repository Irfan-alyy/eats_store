"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addItem } from "@/actions/add";
import { useParams} from "next/navigation";


const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      Add Item
    </button>
  );
}

export default function AddForm() {
  const params= useParams()
  const storeId = params.storeId;
  const [state, formAction] = useActionState(addItem, initialState);
  console.log(state);
  
  return (
    <form action={formAction}>
      <label htmlFor="storeId">Add Items to Menu </label>
      <input type="hidden" id="store" name="storeId" value={storeId} />
      <fieldset>
        <label htmlFor="todo">Item Name</label>
        <input type="text" id="name" name="name" required />
      </fieldset>
      <fieldset>
        <label htmlFor="price">Item Price</label>
        <input type="number" id="price" name="price" required />
      </fieldset>
      <fieldset>
        <label htmlFor="category">Item Category</label>
        <input type="text" id="category" name="category" placeholder="e.g Burgers" required />
      </fieldset>
      <SubmitButton />
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message}
      </p>
    </form>
  );
}
