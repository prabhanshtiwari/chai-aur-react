import { useState, useEffect } from 'react'

import './App.css'
import axios from "axios"

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get("/api/jokes")
      .then((response) => {
        setJokes(response.data)
      })
      .catch((error) => {
        console.error("Error fetching jokes:", error)
      })
  }, [])

  return (
    <>
      <h1>Chai and Full stack</h1>
      <p>JOKES: {jokes.length}</p>
      {
        jokes.map((joke) => (
          <div key={joke.id}>
            <h3>{joke.title}</h3>
            <p>{joke.content}</p>
          </div>
        ))
      }
    </>
  )
}

export default App
