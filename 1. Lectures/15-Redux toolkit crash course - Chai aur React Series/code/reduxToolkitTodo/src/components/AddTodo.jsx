import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addTodo } from '../features/todo/todoSlice'

function AddTodo() {
    const [input, setInput] = useState('')
    const dispatch = useDispatch()

    const addTodoHandler = (e) => {
        e.preventDefault()

        if (!input.trim()) return // prevent empty todos

        dispatch(addTodo(input))
        setInput('')
    }

    return (
        <form
            onSubmit={addTodoHandler}
            className="flex items-center gap-3 mt-12 bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800"
        >
            <input
                type="text"
                placeholder="Enter a Todo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="
          flex-1
          bg-gray-800
          text-gray-100
          placeholder-gray-400
          border border-gray-700
          rounded-lg
          px-4 py-2
          outline-none
          transition-all duration-200

          focus:border-indigo-500
          focus:ring-2 focus:ring-indigo-600
          focus:bg-gray-850
        "
            />

            <button
                type="submit"
                disabled={!input.trim()}
                className="
          px-5 py-2
          rounded-lg
          font-medium
          transition-all duration-200

          bg-indigo-500
          hover:bg-indigo-600
          active:scale-95

          disabled:bg-gray-700
          disabled:text-gray-400
          disabled:cursor-not-allowed
        "
            >
                Add
            </button>
        </form>
    )
}

export default AddTodo