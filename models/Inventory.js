import mongoose from "mongoose"

const inventorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true },
  occasion:    { type: [String], default: [] },
  body_types:  { type: [String], default: [] },
  colors:      { type: [String], default: [] },
  price:       { type: Number, required: true },
  image_url:   { type: String, default: null },
  description: { type: String, default: "" },
  sizes:       { type: [String], default: ["S","M","L","XL"] },
  in_stock:    { type: Boolean, default: true },
  store_name:  { type: String, required: true },
  created_at:  { type: Date, default: Date.now }
})

inventorySchema.index({ body_types: 1 })
inventorySchema.index({ occasion: 1 })
inventorySchema.index({ in_stock: 1 })

export default mongoose.model("Inventory", inventorySchema)