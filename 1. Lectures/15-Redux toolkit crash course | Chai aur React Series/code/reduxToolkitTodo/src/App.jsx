import './App.css'
import AddTodo from './components/AddTodo'
import Todos from './components/Todo'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-start justify-center px-4 py-10">

      <div className="w-full max-w-2xl">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-8 tracking-tight">
          Redux Toolkit Todo
        </h1>

        {/* Add Todo */}
        <AddTodo />

        {/* Todo List */}
        <Todos />

      </div>
    </div>
  )
}

export default App