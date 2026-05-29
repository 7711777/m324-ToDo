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
    if (!taskdescription.trim()) return;
    const newTask = { id: Date.now(), taskdescription, dueDate: dueDate || null };
    setTodos([...todos, newTask]);
    setTaskdescription("");
    setDueDate("");
    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription, dueDate: dueDate || null })
    })
    .then(() => fetchTasks())
    .catch(err => console.log(err));
  };

  const handleDelete = (taskdescription) => {
    setTodos(todos.filter(t => t.taskdescription !== taskdescription));
    fetch("http://localhost:8080/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription })
    })
    .catch(err => console.log(err));
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.taskdescription);
  };

  const handleSave = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map(t => t.id === id ? { ...t, taskdescription: editText } : t));
    setEditingId(null);
    setEditText("");
    fetch(`http://localhost:8080/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskdescription: editText })
    })
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
          <label htmlFor="task-input">Neue Aufgabe hinzufügen</label>
          <input
            id="task-input"
            type="text"
            value={taskdescription}
            onChange={e => setTaskdescription(e.target.value)}
            placeholder="Was muss erledigt werden?"
          />
          <input
            type="date"
            aria-label="Fälligkeitsdatum"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          <button type="submit">Hinzufügen</button>
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
                  <span>{todo.taskdescription}</span>
                  {todo.dueDate && <span className="due-date"> — {todo.dueDate}</span>}
                  <button aria-label="Bearbeiten" onClick={() => handleEdit(todo)}>&#9998;</button>
                  <button aria-label="Löschen" onClick={() => handleDelete(todo.taskdescription)}>&#10004;</button>
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
