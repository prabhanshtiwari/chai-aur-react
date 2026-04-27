import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeTodo } from '../features/todo/todoSlice'

function Todos() {
    const todos = useSelector(state => state.todos)
    const dispatch = useDispatch()

    return (
        <div className="mt-10 bg-gray-900 p-5 rounded-xl shadow-lg border border-gray-800">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 tracking-wide">
                Your Todos
            </h2>

            {todos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                    No todos yet. Add something 🚀
                </p>
            ) : (
                <ul className="space-y-3">
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            className="
                flex justify-between items-center
                bg-gray-800
                px-4 py-3
                rounded-lg
                border border-gray-700
                transition-all duration-200

                hover:border-indigo-500
                hover:shadow-md
              "
                        >
                            <span className="text-gray-100 text-base tracking-wide">
                                {todo.text}
                            </span>

                            <button
                                onClick={() => dispatch(removeTodo(todo.id))}
                                className="
                  flex items-center justify-center
                  p-2 rounded-lg
                  bg-red-500
                  hover:bg-red-600
                  active:scale-90
                  transition-all duration-200
                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.8}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 7h12M9 7v12m6-12v12M4 7h16m-1 0-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z"
                                    />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Todos