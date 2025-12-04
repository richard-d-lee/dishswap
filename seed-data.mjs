import { drizzle } from "drizzle-orm/mysql2";
import { allergies, foodSpecialties } from "./drizzle/schema.ts";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const commonAllergies = [
  { name: "Peanuts", description: "Peanut allergy" },
  { name: "Tree Nuts", description: "Almonds, walnuts, cashews, etc." },
  { name: "Milk", description: "Dairy products" },
  { name: "Eggs", description: "Egg allergy" },
  { name: "Wheat", description: "Gluten/wheat allergy" },
  { name: "Soy", description: "Soy products" },
  { name: "Fish", description: "Fish allergy" },
  { name: "Shellfish", description: "Shrimp, crab, lobster, etc." },
  { name: "Sesame", description: "Sesame seeds" },
  { name: "Mustard", description: "Mustard allergy" },
  { name: "Celery", description: "Celery allergy" },
  { name: "Sulfites", description: "Sulfite sensitivity" }
];

const commonSpecialties = [
  { name: "Italian", category: "Cuisine", description: "Italian cuisine" },
  { name: "Chinese", category: "Cuisine", description: "Chinese cuisine" },
  { name: "Mexican", category: "Cuisine", description: "Mexican cuisine" },
  { name: "Indian", category: "Cuisine", description: "Indian cuisine" },
  { name: "Japanese", category: "Cuisine", description: "Japanese cuisine" },
  { name: "Thai", category: "Cuisine", description: "Thai cuisine" },
  { name: "French", category: "Cuisine", description: "French cuisine" },
  { name: "Mediterranean", category: "Cuisine", description: "Mediterranean cuisine" },
  { name: "American", category: "Cuisine", description: "American cuisine" },
  { name: "Korean", category: "Cuisine", description: "Korean cuisine" },
  { name: "Vietnamese", category: "Cuisine", description: "Vietnamese cuisine" },
  { name: "Greek", category: "Cuisine", description: "Greek cuisine" },
  { name: "Spanish", category: "Cuisine", description: "Spanish cuisine" },
  { name: "Middle Eastern", category: "Cuisine", description: "Middle Eastern cuisine" },
  { name: "Vegan", category: "Diet", description: "Plant-based cuisine" },
  { name: "Vegetarian", category: "Diet", description: "Vegetarian cuisine" },
  { name: "Gluten-Free", category: "Diet", description: "Gluten-free options" },
  { name: "Keto", category: "Diet", description: "Ketogenic diet" },
  { name: "Paleo", category: "Diet", description: "Paleo diet" },
  { name: "BBQ", category: "Style", description: "Barbecue" },
  { name: "Comfort Food", category: "Style", description: "Comfort food" },
  { name: "Seafood", category: "Type", description: "Seafood dishes" },
  { name: "Desserts", category: "Type", description: "Desserts and sweets" },
  { name: "Baking", category: "Type", description: "Baked goods" },
  { name: "Soup & Stew", category: "Type", description: "Soups and stews" }
];

async function seed() {
  console.log("Seeding allergies...");
  for (const allergy of commonAllergies) {
    try {
      await db.insert(allergies).values(allergy).onDuplicateKeyUpdate({ set: { name: allergy.name } });
    } catch (e) {
      console.log(`Allergy ${allergy.name} already exists`);
    }
  }

  console.log("Seeding food specialties...");
  for (const specialty of commonSpecialties) {
    try {
      await db.insert(foodSpecialties).values(specialty).onDuplicateKeyUpdate({ set: { name: specialty.name } });
    } catch (e) {
      console.log(`Specialty ${specialty.name} already exists`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
