import { useState, useEffect } from 'react'
import axios from 'axios'


function App() {

  // const { products, error, loading } = customReactQuery('/api/products')

  const [products, setProducts] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    ; (async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get('/api/products?search=' + search, { signal: controller.signal });
        console.log(res.data)
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        if(axios.isCancel(error)) {
          console.log('Request cancelled', error.message);
          return;
        }
        console.error(error);
        setError(true);
        setLoading(false);
      }
    })();

    // cleanup 
    return () => {
      controller.abort();
    }

  }, [search])

  // if (error) {
  //   return <h1>Something went wrong</h1>
  // }

  // if (loading) {
  //   return <h1>Loading...</h1>
  // }

  return (
    <>
      <h1>Chai aur API in react</h1>
      <input
        type="text"
        placeholder='Search products'
        value={search}  
        onChange={(e) => setSearch(e.target.value)}

      />

      {loading && <h1>Loading...</h1>}
      {error && <h1>Something went wrong</h1>}

      <h2>Number of products: {products.length}</h2>
      {
        products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <img src={product.image} alt={product.name} height="200px" />
          </div>
        ))
      }
    </>
  )
}

export default App


// const customReactQuery = (urlPath) => {
 
//   return { products, error, loading }
// }