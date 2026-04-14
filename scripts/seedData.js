import mongoose from "mongoose"
import dotenv from "dotenv"
import Inventory from "../models/Inventory.js"

dotenv.config()

const mockInventory = [
  // ── WOMENSWEAR ──────────────────────────────────────────
  {
    name: "Wrap Midi Dress",
    category: "dress",
    occasion: ["casual", "date"],
    body_types: ["pear", "hourglass"],
    colors: ["black", "navy", "floral"],
    price: 89.99,
    description: "Flattering wrap style that cinches the waist and flows over the hips beautifully",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Wide Leg Trousers",
    category: "bottoms",
    occasion: ["work", "formal"],
    body_types: ["apple", "rectangle", "inverted triangle"],
    colors: ["beige", "black", "navy"],
    price: 64.99,
    description: "High waisted wide leg cut that balances broader shoulders and adds volume below",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e7e?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Fitted Blazer",
    category: "outerwear",
    occasion: ["work", "formal", "party"],
    body_types: ["rectangle", "inverted triangle", "hourglass"],
    colors: ["charcoal", "navy", "camel"],
    price: 119.99,
    description: "Structured blazer with defined shoulders that creates a powerful silhouette",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1555069519-127aadecd674?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "A-Line Skirt",
    category: "bottoms",
    occasion: ["casual", "date", "party"],
    body_types: ["apple", "inverted triangle", "rectangle"],
    colors: ["floral", "pink", "blue"],
    price: 49.99,
    description: "Flared A-line skirt that adds beautiful volume to the lower half",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Bodycon Dress",
    category: "dress",
    occasion: ["party", "date"],
    body_types: ["hourglass", "rectangle"],
    colors: ["red", "black", "emerald"],
    price: 79.99,
    description: "Form fitting dress that showcases an hourglass silhouette perfectly",
    sizes: ["XS", "S", "M", "L"],
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Pleated Midi Skirt",
    category: "bottoms",
    occasion: ["casual", "work", "date"],
    body_types: ["inverted triangle", "apple", "rectangle"],
    colors: ["blush", "sage", "navy"],
    price: 54.99,
    description: "Flowy pleated skirt that adds volume to the lower half effortlessly",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Floral Maxi Dress",
    category: "dress",
    occasion: ["casual", "date", "party"],
    body_types: ["hourglass", "pear", "rectangle"],
    colors: ["floral", "blue", "pink"],
    price: 89.99,
    description: "Flowy maxi dress that skims the body and creates a romantic summer look",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "High Waist Wide Leg Jeans",
    category: "bottoms",
    occasion: ["casual", "date"],
    body_types: ["inverted triangle", "apple", "hourglass"],
    colors: ["blue", "black", "white"],
    price: 79.99,
    description: "High rise wide leg that balances shoulders and creates an hourglass effect",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Fitted Turtleneck",
    category: "tops",
    occasion: ["casual", "work", "date"],
    body_types: ["pear", "hourglass", "rectangle"],
    colors: ["black", "cream", "camel"],
    price: 44.99,
    description: "Slim turtleneck that defines the upper body and elongates the neck beautifully",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Trench Coat",
    category: "outerwear",
    occasion: ["work", "formal", "casual"],
    body_types: ["hourglass", "rectangle", "pear"],
    colors: ["camel", "beige", "black"],
    price: 159.99,
    description: "Classic belted trench that cinches the waist and creates an elegant silhouette",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },

  // ── MENSWEAR ────────────────────────────────────────────
  {
    name: "Slim Fit Chinos",
    category: "bottoms",
    occasion: ["casual", "work"],
    body_types: ["inverted triangle", "rectangle"],
    colors: ["beige", "navy", "olive"],
    price: 59.99,
    description: "Clean slim fit trousers that balance broader shoulders perfectly",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Oversized Linen Shirt",
    category: "tops",
    occasion: ["casual", "date"],
    body_types: ["inverted triangle", "apple"],
    colors: ["white", "light blue", "ecru"],
    price: 49.99,
    description: "Relaxed linen shirt that softens the shoulder line for a casual look",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Straight Leg Jeans",
    category: "bottoms",
    occasion: ["casual", "date"],
    body_types: ["inverted triangle", "rectangle", "pear"],
    colors: ["blue", "black", "grey"],
    price: 69.99,
    description: "Classic straight cut that adds volume to the lower half effortlessly",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Relaxed Blazer",
    category: "outerwear",
    occasion: ["work", "formal", "party"],
    body_types: ["rectangle", "inverted triangle"],
    colors: ["charcoal", "navy", "camel"],
    price: 129.99,
    description: "Unstructured blazer with soft shoulders for a modern relaxed look",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1555069519-127aadecd674?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Crew Neck Sweater",
    category: "tops",
    occasion: ["casual", "work", "date"],
    body_types: ["rectangle", "pear", "apple"],
    colors: ["grey", "navy", "burgundy", "forest green"],
    price: 64.99,
    description: "Chunky knit sweater that adds volume and structure to the upper body",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Cargo Wide Leg Pants",
    category: "bottoms",
    occasion: ["casual"],
    body_types: ["inverted triangle", "apple", "rectangle"],
    colors: ["khaki", "black", "grey"],
    price: 64.99,
    description: "Trendy wide leg cargo that adds significant volume to the lower half",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e7e?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Polo Shirt",
    category: "tops",
    occasion: ["casual", "work", "date"],
    body_types: ["rectangle", "inverted triangle", "apple"],
    colors: ["white", "navy", "black", "red"],
    price: 39.99,
    description: "Classic polo that adds structure without over-emphasizing broad shoulders",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Bomber Jacket",
    category: "outerwear",
    occasion: ["casual", "party", "date"],
    body_types: ["pear", "rectangle", "hourglass"],
    colors: ["black", "olive", "navy"],
    price: 99.99,
    description: "Fitted bomber that cinches at the waist and adds shoulder definition",
    sizes: ["S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Oxford Button-Down Shirt",
    category: "tops",
    occasion: ["work", "formal", "casual"],
    body_types: ["inverted triangle", "rectangle", "apple"],
    colors: ["white", "light blue", "pink"],
    price: 54.99,
    description: "Classic oxford shirt with relaxed fit that softens broad shoulders",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  },
  {
    name: "Linen Co-ord Set",
    category: "tops",
    occasion: ["casual", "work", "date"],
    body_types: ["rectangle", "apple", "inverted triangle"],
    colors: ["white", "beige", "sage", "terracotta"],
    price: 109.99,
    description: "Matching linen set that creates a polished yet relaxed summer look",
    sizes: ["XS", "S", "M", "L", "XL"],
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    in_stock: true,
    store_name: "StyleSense Store"
  }
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ MongoDB connected")

    // Clear existing inventory
    await Inventory.deleteMany({ store_name: "StyleSense Store" })
    console.log("🗑️  Cleared existing StyleSense Store inventory")

    // Insert mock data
    const inserted = await Inventory.insertMany(mockInventory)
    console.log(`✅ Inserted ${inserted.length} inventory items`)

    console.log("\n📦 Sample items added:")
    inserted.slice(0, 5).forEach(item => {
      console.log(`   - ${item.name} ($${item.price}) → ${item.body_types.join(", ")}`)
    })

    console.log("\n🎉 Seed complete! Your store is ready.")
    process.exit(0)
  } catch (err) {
    console.error("❌ Seed error:", err.message)
    process.exit(1)
  }
}

seedDatabase()