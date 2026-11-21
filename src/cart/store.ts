import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore, createAsyncThunk, createListenerMiddleware, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { isProduct, type Product } from "../products/product";

const CART_KEY = "cart.items";

export type CartItem = { product: Product; quantity: number };

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null || !("product" in value) || !("quantity" in value)) return false;
  return isProduct(value.product) && typeof value.quantity === "number"
    && Number.isSafeInteger(value.quantity) && value.quantity > 0;
}

export const loadCart = createAsyncThunk<CartItem[]>("cart/load", async () => {
  const saved = await AsyncStorage.getItem(CART_KEY);
  if (saved === null) return [];
  const data: unknown = JSON.parse(saved);
  if (!Array.isArray(data) || !data.every(isCartItem) || new Set(data.map((item) => item.product.id)).size !== data.length) {
    throw new Error("Invalid saved cart");
  }
  return data;
}, {
  condition: (_, { getState }) => {
    const state = getState() as RootState;
    return state.cart.status === "idle" || state.cart.status === "error";
  },
});

type CartState = {
  items: CartItem[];
  status: "idle" | "loading" | "ready" | "error";
  saveError: boolean;
};

const initialState: CartState = { items: [], status: "idle", saveError: false };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      if (state.status !== "ready") return;
      const item = state.items.find((entry) => entry.product.id === action.payload.id);
      if (item) {
        item.quantity += 1;
      } else {
        const { id, title, price, image } = action.payload;
        state.items.push({ product: { id, title, price, image }, quantity: 1 });
      }
    },
    decreaseItem(state, action: PayloadAction<number>) {
      if (state.status !== "ready") return;
      const item = state.items.find((entry) => entry.product.id === action.payload);
      if (!item) return;
      if (item.quantity > 1) item.quantity -= 1;
      else state.items = state.items.filter((entry) => entry.product.id !== action.payload);
    },
    removeItem(state, action: PayloadAction<number>) {
      if (state.status !== "ready") return;
      state.items = state.items.filter((entry) => entry.product.id !== action.payload);
    },
    retrySave() {},
    saveFailed(state) { state.saveError = true; },
    saveSucceeded(state) { state.saveError = false; },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.pending, (state) => { state.status = "loading"; });
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "ready";
    });
    builder.addCase(loadCart.rejected, (state) => { state.status = "error"; });
  },
});

export const { addItem, decreaseItem, removeItem, retrySave } = cartSlice.actions;
const { saveFailed, saveSucceeded } = cartSlice.actions;

export function createCartStore() {
  const listener = createListenerMiddleware();
  let writeQueue = Promise.resolve();

  listener.startListening({
    matcher: isAnyOf(addItem, decreaseItem, removeItem, retrySave),
    effect: (_action, api) => {
      writeQueue = writeQueue.then(async () => {
        const state = api.getState() as RootState;
        if (state.cart.status !== "ready") return;
        try {
          await AsyncStorage.setItem(CART_KEY, JSON.stringify(state.cart.items));
          api.dispatch(saveSucceeded());
        } catch {
          api.dispatch(saveFailed());
        }
      });
    },
  });

  return configureStore({
    reducer: { cart: cartSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
  });
}

export type CartStore = ReturnType<typeof createCartStore>;
export type RootState = ReturnType<CartStore["getState"]>;
export type AppDispatch = CartStore["dispatch"];
