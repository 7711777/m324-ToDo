# M324 SQ-2B

**Modul:** M324

**Autor:** Metehan Celik

---

## User Story 1 — Persistenz mit Datenbank

Als Benutzer möchte ich, dass meine Todos auch nach einem Neustart des Servers noch da sind, damit ich meine Aufgaben nicht jedes Mal neu eintippen muss.

**Akzeptanzkriterien:**
- Wenn das Backend neu gestartet wird, sind alle vorher erstellten Todos noch in der Liste.
- Die Todos werden in einer Datenbank gespeichert (z.B. MySQL oder H2), nicht nur im Arbeitsspeicher.
- Beim Hinzufügen, Löschen oder Bearbeiten wird die Datenbank sofort aktualisiert.

---

## User Story 2 — Todos bearbeiten

Als Benutzer möchte ich einen bestehenden Todo-Eintrag bearbeiten können, damit ich Tippfehler korrigieren oder Details ergänzen kann, ohne den Task löschen und neu anlegen zu müssen.

**Akzeptanzkriterien:**
- Neben jedem Todo gibt es einen „Bearbeiten"-Button.
- Beim Klick wird der Text in ein editierbares Eingabefeld umgewandelt.
- Mit „Speichern" wird die Änderung ans Backend geschickt und die Liste aktualisiert.
- Wenn der neue Text leer ist, wird die Änderung nicht gespeichert.

---

## User Story 3 — Fälligkeitsdatum und Sortierung

Als Benutzer möchte ich jedem Todo ein Fälligkeitsdatum zuweisen und die Liste nach diesem Datum sortieren können, damit ich sehe, was zuerst erledigt werden muss.

**Akzeptanzkriterien:**
- Beim Anlegen eines Todos kann ich optional ein Datum eintragen.
- Das Datum wird in der Liste neben dem Task angezeigt.
- Die Liste ist standardmässig nach Datum sortiert (frühestes Datum zuerst).
- Tasks ohne Datum erscheinen ganz unten.
- Tasks, deren Datum bereits abgelaufen ist, werden farblich hervorgehoben (z.B. rot).

---

## Wissens-Check

### Wie sind User Stories aufgebaut?

User Stories folgen meistens diesem Schema:

> **Als** \<Rolle\> **möchte ich** \<Funktion\>, **damit** \<Nutzen\>.

Dazu kommen die **Akzeptanzkriterien**: kurze, überprüfbare Punkte, woran man sieht, dass die Story wirklich fertig ist. Wichtig ist dass die Story beschreibt das *Was* und *Warum*, nicht das *Wie*. Die technische Umsetzung ist nicht Teil der Story.

### Warum werden User Stories nicht schon zu Beginn ganz genau definiert?

Weil man am Anfang einfach noch nicht alles weiss. Anforderungen ändern sich während dem Projekt. User geben Feedback, man merkt erst beim Bauen, dass manche Ideen nicht funktionieren, oder es kommen neue Wünsche dazu.

Wenn man am Anfang alles bis ins kleinste Detail festlegt, baut man am Ende oft etwas, das gar nicht mehr passt. Deshalb fängt man mit groben Stories an und macht sie erst dann genauer, wenn sie wirklich umgesetzt werden.
