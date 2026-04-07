import { useState } from 'react'

import './App.css'



function App() {
  const [value, setValue] = useState(1);
  // const [multipliedValue, setMultipliedValue] = useState(1);
  let multipliedValue = value * 5;


  const multiplybyfive = () =>  {
    // setMultipliedValue(value * 5);
    setValue(value + 1)
  }

  return (
    <>
      <h1>Main value: {value}</h1>
      <button
      onClick={ multiplybyfive }
      >Click to multiply by 5</button>
      <h2>Multiplied value: { multipliedValue }</h2>
    </>
  )
}

export default App
