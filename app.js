// Base URL for the JSON-server API
const API_URL = 'http://localhost:3000/todos';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const refreshBtn = document.getElementById('refresh-btn');
const todoTitle = document.getElementById('todo-title');
const todoDescription = document.getElementById('todo-description');

// Event Listeners
document.addEventListener('DOMContentLoaded', getTodos);
todoForm.addEventListener('submit', addTodo);
refreshBtn.addEventListener('click', getTodos);

// Get all todos from API and display them
async function getTodos() {
  try {
    // Show loading state (optional)
    todoList.innerHTML = '<div class="text-center py-3">Loading...</div>';
    
    // Fetch todos from API using async/await
    const response = await fetch(API_URL);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse JSON response
    const todos = await response.json();
    
    // Display todos
    displayTodos(todos);
    
  } catch (error) {
    console.error('Error fetching todos:', error);
    todoList.innerHTML = `
      <div class="alert alert-danger">
        Failed to load todos. Make sure JSON-server is running.
      </div>
    `;
  }
}

// Display todos in the list
function displayTodos(todos) {
  // Clear the list
  todoList.innerHTML = '';
  
  // Check if there are any todos
  if (todos.length === 0) {
    todoList.innerHTML = '<div class="text-center py-3">No todos yet. Add one above!</div>';
    return;
  }
  
  // Loop through todos and create list items
  todos.forEach(todo => {
    const listItem = document.createElement('li');
    listItem.className = `list-group-item todo-item ${todo.completed ? 'completed-todo' : ''}`;
    listItem.innerHTML = `
      <div class="todo-content">
        <h5>${todo.title}</h5>
        <p class="todo-description mb-0">${todo.description || 'No description'}</p>
      </div>
      <div class="todo-actions">
        <button class="btn btn-sm btn-success toggle-btn" data-id="${todo.id}" data-completed="${todo.completed}">
          ${todo.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${todo.id}">
          Delete
        </button>
      </div>
    `;
    
    todoList.appendChild(listItem);
  });
  
  // Add event listeners to the toggle and delete buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTodoStatus);
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', deleteTodo);
  });
}

// Add a new todo
async function addTodo(e) {
  // Prevent form submission
  e.preventDefault();
  
  // Get values from form
  const title = todoTitle.value.trim();
  const description = todoDescription.value.trim();
  
  // Validate input
  if (!title) {
    alert('Please enter a title for your todo');
    return;
  }
  
  // Create todo object
  const newTodo = {
    title,
    description,
    completed: false
  };
  
  try {
    // Send POST request to API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTodo)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse the response
    const addedTodo = await response.json();
    
    // Refresh todos list
    getTodos();
    
    // Reset form
    todoForm.reset();
    
  } catch (error) {
    console.error('Error adding todo:', error);
    alert('Failed to add todo. Please try again.');
  }
}

// Toggle todo completion status
async function toggleTodoStatus(e) {
  const id = e.target.dataset.id;
  const completed = e.target.dataset.completed === 'true';
  
  try {
    // First, get the current todo
    const response = await fetch(`${API_URL}/${id}`);
    const todo = await response.json();
    
    // Update the completion status
    todo.completed = !completed;
    
    // Send PATCH request to update only the completion status
    const updateResponse = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',  // Use PATCH to update only some fields
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: todo.completed })
    });
    
    // Check if update was successful
    if (!updateResponse.ok) {
      throw new Error(`HTTP error! Status: ${updateResponse.status}`);
    }
    
    // Refresh todos list
    getTodos();
    
  } catch (error) {
    console.error('Error updating todo status:', error);
    alert('Failed to update todo status. Please try again.');
  }
}

// Delete a todo
async function deleteTodo(e) {
  const id = e.target.dataset.id;
  
  // Confirm before deleting
  if (!confirm('Are you sure you want to delete this todo?')) {
    return;
  }
  
  try {
    // Send DELETE request to API
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    // Check if deletion was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Refresh todos list
    getTodos();
    
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Failed to delete todo. Please try again.');
  }
}