import { useState } from 'react'

import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(0);

  return (
    <div style={{padding: "2rem"}}>
      <h1>Welcome to chai code</h1>
      <button
      onClick={() => setIsLoggedIn(!isLoggedIn)}
      >Toggle login</button>


      <div>
        <h3>&& operator</h3>
        {!!isLoggedIn && <p>Welcome to chai code video</p>}
      </div>


      <div>
        <h3>Ternary operator</h3>
        {isLoggedIn ? <p>Welcome to chai code video</p> : "Please login"}
      </div>



    </div>

    
  )
}

export default App
