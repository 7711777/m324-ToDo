import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([]);
  const [taskdescription, setTaskdescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchTasks = () => {
    fetch("http://localhost:8080/")
      .then(r => r.json())
      .then(data => setTodos(data))
      .catch(err => console.log(err));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = event => {
    event.preventDefault();
    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription, dueDate: dueDate || null })
    })
    .then(() => { fetchTasks(); setTaskdescription(""); setDueDate(""); })
    .catch(err => console.log(err));
  };

  const handleDelete = (taskdescription) => {
    fetch("http://localhost:8080/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription })
    })
    .then(() => fetchTasks())
    .catch(err => console.log(err));
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.taskdescription);
  };

  const handleSave = (id) => {
    if (!editText.trim()) return;
    fetch(`http://localhost:8080/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription: editText })
    })
    .then(() => { fetchTasks(); setEditingId(null); setEditText(""); })
    .catch(err => console.log(err));
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDo Liste</h1>
        <form onSubmit={handleSubmit} className="todo-form">
          <label>Neues Todo anlegen:</label>
          <input
            type="text"
            value={taskdescription}
            onChange={e => setTaskdescription(e.target.value)}
            placeholder="Aufgabe..."
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          <button type="submit">Absenden</button>
        </form>
        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.id} className={isOverdue(todo.dueDate) ? "overdue" : ""}>
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                  />
                  <button onClick={() => handleSave(todo.id)}>Speichern</button>
                  <button onClick={() => setEditingId(null)}>Abbrechen</button>
                </>
              ) : (
                <>
                  <span>
                    {"Task " + (index + 1) + ": " + todo.taskdescription}
                    {todo.dueDate && <span className="due-date"> — {todo.dueDate}</span>}
                  </span>
                  <button onClick={() => handleEdit(todo)}>&#9998;</button>
                  <button onClick={() => handleDelete(todo.taskdescription)}>&#10004;</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App
