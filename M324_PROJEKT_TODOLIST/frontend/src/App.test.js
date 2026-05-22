import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {

  /**
   * Testet das Rendern der Überschrift.
   */
  test('renders heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /ToDo Liste/i });
    expect(headingElement).toBeInTheDocument();
  });

  /**
   * Testet das Hinzufügen einer Aufgabe.
   */
  test('allows user to add a new task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });
    const taskName = 'Buy groceries';
    fireEvent.change(inputElement, { target: { value: taskName } });
    fireEvent.click(addButtonElement);
    const newTaskElement = screen.getByText('Buy groceries');
    expect(newTaskElement).toBeInTheDocument();
  });

  /**
   * Testet, dass das Eingabefeld nach dem Hinzufügen geleert wird.
   */
  test('input field is cleared after adding a task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });
    fireEvent.change(inputElement, { target: { value: 'Sport' } });
    fireEvent.click(addButtonElement);
    expect(inputElement.value).toBe('');
  });

  /**
   * Testet, dass leere Eingaben nicht als Task hinzugefügt werden.
   */
  test('does not add empty task', () => {
    render(<App />);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });
    fireEvent.click(addButtonElement);
    const listItems = screen.queryAllByRole('listitem');
    expect(listItems.length).toBe(0);
  });

  /**
   * Testet, dass mehrere Aufgaben hinzugefügt werden können.
   */
  test('can add multiple tasks', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Task 1' } });
    fireEvent.click(addButtonElement);
    fireEvent.change(inputElement, { target: { value: 'Task 2' } });
    fireEvent.click(addButtonElement);

    expect(screen.getByText(/Task 1/)).toBeInTheDocument();
    expect(screen.getByText(/Task 2/)).toBeInTheDocument();
  });

  /**
   * Testet das Löschen einer Aufgabe (handleDelete).
   */
  test('allows user to delete a task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Putzen' } });
    fireEvent.click(addButtonElement);
    expect(screen.getByText('Putzen')).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /Löschen/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Putzen')).not.toBeInTheDocument();
  });

  /**
   * Testet den Wechsel in den Edit-Modus (handleEdit).
   */
  test('shows edit input when edit button is clicked', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Lesen' } });
    fireEvent.click(addButtonElement);

    const editButton = screen.getByRole('button', { name: /Bearbeiten/i });
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Lesen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Speichern/i })).toBeInTheDocument();
  });

  /**
   * Testet das Bearbeiten und Speichern einer Aufgabe (handleSave).
   */
  test('allows user to edit and save a task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Kochen' } });
    fireEvent.click(addButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Bearbeiten/i }));

    const editInput = screen.getByDisplayValue('Kochen');
    fireEvent.change(editInput, { target: { value: 'Backen' } });
    fireEvent.click(screen.getByRole('button', { name: /Speichern/i }));

    expect(screen.getByText('Backen')).toBeInTheDocument();
    expect(screen.queryByText('Kochen')).not.toBeInTheDocument();
  });

  /**
   * Testet das Abbrechen des Bearbeitens (Abbrechen-Button).
   */
  test('cancels edit mode without saving changes', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Einkaufen' } });
    fireEvent.click(addButtonElement);

    fireEvent.click(screen.getByRole('button', { name: /Bearbeiten/i }));
    fireEvent.click(screen.getByRole('button', { name: /Abbrechen/i }));

    expect(screen.getByText('Einkaufen')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Speichern/i })).not.toBeInTheDocument();
  });

});
