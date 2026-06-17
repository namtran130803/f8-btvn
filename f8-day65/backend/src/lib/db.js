import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../../data/db.json");

const seedData = {
  products: [
    {
      id: 1,
      name: "Node.js Handbook",
      price: 120000,
      description: "A compact guide for backend learners"
    },
    {
      id: 2,
      name: "Redis Cache Notes",
      price: 90000,
      description: "Practical notes about cache hit and cache miss"
    }
  ]
};

export async function initDb() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    await writeDb(seedData);
  }
}

async function readDb() {
  const content = await fs.readFile(dbPath, "utf8");
  return JSON.parse(content);
}

async function writeDb(data) {
  await fs.writeFile(dbPath, `${JSON.stringify(data, null, 2)}\n`);
}

export async function getProducts() {
  const db = await readDb();
  return db.products;
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.id === Number(id)) || null;
}

export async function createProduct(payload) {
  const db = await readDb();
  const nextId = db.products.length
    ? Math.max(...db.products.map((product) => product.id)) + 1
    : 1;

  const product = {
    id: nextId,
    name: payload.name,
    price: Number(payload.price),
    description: payload.description || ""
  };

  db.products.push(product);
  await writeDb(db);

  return product;
}

export async function updateProduct(id, payload) {
  const db = await readDb();
  const index = db.products.findIndex((product) => product.id === Number(id));

  if (index === -1) {
    return null;
  }

  db.products[index] = {
    ...db.products[index],
    ...payload,
    id: Number(id),
    price:
      payload.price === undefined
        ? db.products[index].price
        : Number(payload.price)
  };

  await writeDb(db);

  return db.products[index];
}

export async function deleteProduct(id) {
  const db = await readDb();
  const index = db.products.findIndex((product) => product.id === Number(id));

  if (index === -1) {
    return null;
  }

  const [deletedProduct] = db.products.splice(index, 1);
  await writeDb(db);

  return deletedProduct;
}
