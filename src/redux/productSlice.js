import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
  productList: [],
  cartItem: [],
};


export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setDataProduct: (state, action) => {
      state.productList = [...action.payload.data];
    },
    setNewProduct: (state, action) => {
      state.record = [...action.payload];
    },
   
    addCartItem: (state, action) => {
      const check = state.cartItem.some((item) => item._id === action.payload._id);
      if (check) {
        toast("Item is already in cart.");
      } else {
        const total = action.payload.price;
        state.cartItem = [
          ...state.cartItem,
          { ...action.payload, qty: 1, total: total },
        ];
      }
    },

    
    deleteCartItem: (state, action) => {
      toast.success("Item has been removed !!");
      const index = state.cartItem.findIndex((el) => el._id === action.payload);
      state.cartItem.splice(index, 1);
    },

    increaseQty: (state, action) => {
      const index = state.cartItem.findIndex((el) => el._id === action.payload);
      let qty = state.cartItem[index].qty;
      const qtyInc = ++qty;
      state.cartItem[index].qty = qtyInc;
      const price = state.cartItem[index].price;
      const total = price * qtyInc;
      state.cartItem[index].total = total;
    },
    decreaseQty: (state, action) => {
      const index = state.cartItem.findIndex((el) => el._id === action.payload);
      let qty = state.cartItem[index].qty;
      if (qty > 1) {
        const qtyDec = --qty;
        state.cartItem[index].qty = qtyDec;
        const price = state.cartItem[index].price;
        const total = price * qtyDec;
        state.cartItem[index].total = total;
      } else {
        const productId = state.cartItem[index]._id;
        productSlice.caseReducers.deleteCartItem(state, { payload: productId });
      }
    },
  },
});

export const {
  setDataProduct,
  addCartItem,
  deleteCartItem,
  increaseQty,
  decreaseQty,
  incrementQuantity,
  decrementQuantity,
  setNewProduct,
  addProductItem
} = productSlice.actions;

export default productSlice.reducer;