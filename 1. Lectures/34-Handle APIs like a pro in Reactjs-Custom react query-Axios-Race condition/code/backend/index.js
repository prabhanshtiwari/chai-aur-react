import express from "express";

const app = express();

app.get("/api/products", (req, res) => {
  const product = [
    {
      id: 1,
      name: "Wooden Table",
      price: 200,
      image: "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
    },
    {
      id: 2,
      name: "Office Chair",
      price: 150,
      image:
        "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg",
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: 40,
      image: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg",
    },
    {
      id: 4,
      name: "Desk Lamp",
      price: 25,
      image: "https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg",
    },
    {
      id: 5,
      name: "Bookshelf",
      price: 120,
      image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg",
    },
    {
      id: 6,
      name: "Gaming Mouse",
      price: 35,
      image:
        "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg",
    },
    {
      id: 7,
      name: "Mechanical Keyboard",
      price: 80,
      image:
        "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg",
    },
    {
      id: 8,
      name: "Monitor",
      price: 220,
      image:
        "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
    },
    {
      id: 9,
      name: "Headphones",
      price: 60,
      image:
        "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg",
    },
    {
      id: 10,
      name: "Coffee Table",
      price: 180,
      image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg",
    },
  ];

  // http://localhost:3000/api/products?search=metal

    if (req.query.search) {
    const filterProducts = product.filter((product) =>
        product.name.toLowerCase().includes(req.query.search.toLowerCase()),
    );
    res.json(filterProducts);
    return;
    }


  setTimeout(() => {
    res.json(product);
  }, 3000);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
