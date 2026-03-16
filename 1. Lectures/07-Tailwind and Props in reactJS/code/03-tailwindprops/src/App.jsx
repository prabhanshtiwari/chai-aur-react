
import Card from "./components/Card";

function App() {
  
  return (
    <>
      <h1 className='bg-green-400 text-black p-4 rounded-xl mb-4 mx-auto my-10 text-center text-5xl'>Tailwind Test</h1>

      <Card username="Owl-1" btnText="click me" />
      <Card username="Owl-2" btnText="Visit me" />

    </>
  )
}

export default App