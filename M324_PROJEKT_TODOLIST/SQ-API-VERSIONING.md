# REST-API Versionierung in Spring Boot

**Modul:** M324 – DevOps-Prozesse mit Tools unterstützen
**Autor:** Metehan Celik
**Datum:** 30.05.2026

---

## Einführung

REST-APIs entwickeln sich über die Zeit weiter — neue Felder kommen dazu, Endpoints werden umbenannt, Verhalten ändert sich. Wenn bereits Clients (Frontend, Mobile-Apps, andere Services) eine API nutzen, dürfen solche Änderungen die Clients nicht plötzlich brechen.

**API-Versionierung** löst dieses Problem: Mehrere Versionen einer API können parallel existieren. Neue Clients nutzen `v2`, alte Clients bleiben auf `v1` bis sie umgezogen sind.

---

## Übersicht der Methoden

### 1. URI Versioning (Path Versioning)
Die Version wird direkt in den URL-Pfad eingebaut.
```
GET /api/v1/tasks
GET /api/v2/tasks
```

### 2. Query Parameter Versioning
Die Version wird als Query-Parameter übergeben.
```
GET /api/tasks?version=1
GET /api/tasks?version=2
```

### 3. Header Versioning
Die Version wird in einem Custom-HTTP-Header gesetzt.
```
GET /api/tasks
X-API-Version: 1
```

### 4. Media Type Versioning (Content Negotiation)
Die Version wird im `Accept`-Header über einen Custom Media Type angegeben.
```
GET /api/tasks
Accept: application/vnd.todo.v1+json
```

---

## Bewertende Analyse

| Methode | Vorteile | Nachteile |
|---|---|---|
| **URI Versioning** | Sehr einfach umzusetzen<br>Sofort sichtbar in URL<br>Direkt im Browser testbar<br>Caching-freundlich | Verstösst gegen "URI sollte Ressource identifizieren, nicht Version"<br>Verschiedene URLs für gleiche Ressource |
| **Query Parameter** | Einfach umsetzbar<br>Kein neuer URL-Pfad nötig | Wird oft beim Cachen ignoriert<br>Optional → fehleranfällig (welche Default-Version?) |
| **Header Versioning** | URL bleibt clean<br>Trennt Ressource und Version sauber | Im Browser schwer testbar<br>Unsichtbar in Logs / Bookmarks<br>Custom Header sind kein Standard |
| **Media Type** | Sehr REST-konform<br>Standard-konform via `Accept`-Header | Komplex zu implementieren<br>Schwer testbar im Browser<br>Hohe Lernkurve |

### Bewertung anhand von Kriterien

| Kriterium | URI | Query | Header | Media Type |
|---|---|---|---|---|
| **Zuverlässigkeit** | hoch | mittel | hoch | hoch |
| **Einfachheit** | sehr hoch | hoch | mittel | niedrig |
| **Flexibilität** | mittel | mittel | hoch | sehr hoch |
| **Browser-tauglich** | ja | ja | nein | nein |
| **Caching-freundlich** | ja | bedingt | bedingt | bedingt |
| **REST-Pureness** | niedrig | niedrig | mittel | hoch |
| **Discoverability** | sehr hoch | hoch | niedrig | niedrig |

---

## Begründung der Wahl: URI Versioning

Für dieses Projekt wurde **URI Versioning** (`/api/v1/...`) gewählt.

**Begründung:**

1. **Einfachheit** — In Spring Boot mit einer einzigen `@RequestMapping`-Annotation am Controller umsetzbar. Keine Konfiguration, kein Filter, kein Custom-Header-Handler.
2. **Browser-Testbarkeit** — Endpoints lassen sich direkt mit `curl` oder im Browser testen, was die Entwicklung und das Debugging stark erleichtert.
3. **Klarheit für Frontend** — Beim Anschauen der Network-Requests im DevTools ist sofort sichtbar, welche API-Version angesprochen wird.
4. **Standard in der Industrie** — Grosse APIs wie GitHub, Twitter und Stripe nutzen ebenfalls URI Versioning. Bekannt für Entwickler, geringe Lernkurve.
5. **Klare Migration** — Wenn `v2` kommt, kann `v1` problemlos parallel weiterlaufen, ohne Filter oder Header-Logik.
6. **Pipeline-/Deployment-freundlich** — Logs zeigen sofort die genutzte Version, was Monitoring und Fehlersuche vereinfacht.

Die theoretische "Unsauberkeit" gegenüber den REST-Prinzipien wurde gegenüber der praktischen Einfachheit als nachrangig bewertet — gerade in einem kleinen Projekt überwiegen die Vorteile von URI Versioning klar.

---

## Schritt-für-Schritt-Anleitung zur Implementierung

### Schritt 1 — Backend anpassen

In `DemoApplication.java` wurde am Klassen-Level die `@RequestMapping("/api/v1")` Annotation hinzugefügt. Dadurch bekommen alle Endpoints automatisch den `/api/v1`-Prefix.

**Vorher:**
```java
@GetMapping("/")
public List<Task> getTasks() { ... }

@PostMapping("/tasks")
public String addTask(@RequestBody Task task) { ... }

@PostMapping("/delete")
public String delTask(@RequestBody Task task) { ... }

@PutMapping("/tasks/{id}")
public String updateTask(...) { ... }
```

**Nachher:**
```java
@RestController
@RequestMapping("/api/v1")
@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {

    @GetMapping("/tasks")
    public List<Task> getTasks() { ... }

    @PostMapping("/tasks")
    public String addTask(@RequestBody Task task) { ... }

    @DeleteMapping("/tasks/{id}")
    public String delTask(@PathVariable Long id) { ... }

    @PutMapping("/tasks/{id}")
    public String updateTask(...) { ... }
}
```

Zusätzlich wurde auf RESTful Routes umgestellt:
- `GET /api/v1/tasks` (statt `GET /`)
- `DELETE /api/v1/tasks/{id}` (statt `POST /delete`)

### Schritt 2 — Frontend anpassen

In `App.jsx` wurden alle Fetch-Aufrufe auf die neue API umgestellt:

| Aktion | Alt | Neu |
|---|---|---|
| Tasks laden | `GET /` | `GET /api/v1/tasks` |
| Task hinzufügen | `POST /tasks` | `POST /api/v1/tasks` |
| Task löschen | `POST /delete` (mit Body) | `DELETE /api/v1/tasks/{id}` |
| Task ändern | `PUT /tasks/{id}` | `PUT /api/v1/tasks/{id}` |

### Schritt 3 — Tests anpassen

Der MockMvc-Test in `DemoApplicationTests.java` wurde von `get("/")` auf `get("/api/v1/tasks")` umgestellt, damit weiterhin alle Tests grün laufen.

### Schritt 4 — Verifikation

```bash
curl http://localhost:8080/api/v1/tasks
# → []
```

*Bild einfügen (Screenshot eines erfolgreichen curl-Aufrufs oder Browser-Test mit /api/v1/tasks)*

---

## Zusammenfassung und Schlussfolgerungen

Die Versionierung einer REST-API ist wichtig, sobald Clients von ihr abhängen. Vier Hauptmethoden existieren — URI, Query, Header und Media Type Versioning — jede mit Vor- und Nachteilen.

Für dieses Projekt wurde **URI Versioning** gewählt wegen seiner Einfachheit, Testbarkeit und der nahtlosen Umsetzung in Spring Boot mit einer einzigen Annotation. Die zukünftige Einführung einer `v2`-API würde einfach durch einen neuen Controller mit `@RequestMapping("/api/v2")` möglich sein, ohne `v1` zu beeinträchtigen.

**Schlussfolgerungen:**
- Versionierung sollte von Anfang an in einer API eingeplant werden — der nachträgliche Einbau ist mühsam.
- Die "perfekte" Methode gibt es nicht. Die Wahl hängt vom Anwendungsfall, Team und den Clients ab.
- URI Versioning ist ein pragmatischer Standard, der in den meisten Fällen die beste Balance zwischen Aufwand und Nutzen bietet.
