# Automatisierte Tests in der Pipeline

**Modul:** M324 – DevOps-Prozesse mit Tools unterstützen
**Autor:** Metehan Celik
**Datum:** 30.05.2026

---

## Ziel

Die bestehenden Unit-Tests (Frontend mit Jest, Backend mit JUnit) sollen **automatisch in der Pipeline nach dem Build** durchlaufen. So wird bei jedem Pull Request und jedem Merge sichergestellt, dass keine fehlerhafte Software in den `main`-Branch gelangt.

---

## Aufbau: Test-Stage nach dem Build

GitHub Actions kennt keine "Stages" wie GitLab. Die Reihenfolge wird über `needs:` gesteuert: Ein Job mit `needs: build-xxx` startet erst, **nachdem** der Build-Job erfolgreich war. Damit entsteht logisch eine Test-Stage nach der Build-Stage.

Es wurden zwei neue Jobs erstellt:

- **test-frontend** → läuft nach `build-frontend`
- **test-backend** → läuft nach `build-backend`

Zusätzlich wurden die Docker-Push-Jobs so angepasst, dass sie erst nach den Tests laufen (`needs: test-frontend` / `needs: test-backend`). Dadurch werden Images **nur dann** gebaut und gepusht, wenn alle Tests grün sind — ein echtes Quality Gate.

```
build-frontend ──► test-frontend ──► docker-frontend (nur bei Push auf main)
build-backend  ──► test-backend  ──► docker-backend  (nur bei Push auf main)
```

---

## Die Jobs im Detail

### test-frontend

```yaml
test-frontend:
  name: Test React Frontend
  needs: build-frontend
  runs-on: ubuntu-latest
  container:
    image: node:22
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Install dependencies
      working-directory: M324_PROJEKT_TODOLIST/frontend
      run: npm install

    - name: Run Jest tests
      working-directory: M324_PROJEKT_TODOLIST/frontend
      run: npm run test:ci
```

**Erklärung der Befehle:**

| Befehl | Wozu |
|---|---|
| `needs: build-frontend` | Stellt sicher, dass die Tests erst nach dem erfolgreichen Build laufen. |
| `container: image: node:22` | Das **gleiche Image wie beim Build** — Node + npm sind vorinstalliert, keine Extra-Installation nötig. |
| `actions/checkout@v4` | Holt den Quellcode in den Runner. |
| `npm install` | Installiert die dependencies inkl. der Test-Tools (Jest, Testing-Library, babel-jest). Diese sind devDependencies und werden zum Testen gebraucht. |
| `npm run test:ci` | Führt die Tests einmalig aus (siehe unten). |

**Warum `test:ci` und nicht `npm test`?**

Das normale Script `npm test` ist `jest --watch` — der Watch-Modus läuft endlos weiter und wartet auf Dateiänderungen. In einer Pipeline würde der Job dadurch **niemals beenden** und ins Timeout laufen. Deshalb wurde ein eigenes Script ergänzt:

```json
"test:ci": "jest --ci"
```

Das Flag `--ci` lässt Jest **einmal durchlaufen** und danach beenden. Zusätzlich verhindert es, dass im CI versehentlich neue Snapshots geschrieben werden. Der Exit-Code von Jest entscheidet dann über grün/rot in der Pipeline.

### test-backend

```yaml
test-backend:
  name: Test Spring Boot Backend
  needs: build-backend
  runs-on: ubuntu-latest
  container:
    image: maven:3.9-eclipse-temurin-21
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Maven tests
      working-directory: M324_PROJEKT_TODOLIST/backend
      run: mvn test -B
```

**Erklärung der Befehle:**

| Befehl | Wozu |
|---|---|
| `needs: build-backend` | Tests laufen erst nach dem erfolgreichen Build. |
| `container: image: maven:3.9-eclipse-temurin-21` | Das **gleiche Image wie beim Build** — Maven + JDK 21 vorinstalliert. |
| `mvn test -B` | Führt alle JUnit-Tests aus. `-B` = Batch-Modus (keine interaktiven Prompts, sauberere CI-Logs). |

Maven kompiliert dabei den Test-Code und führt die JUnit-Tests (inkl. MockMvc-Test) aus. Schlägt ein Test fehl, gibt `mvn test` einen Fehler-Exit-Code zurück und der Job wird rot.

---

## Warum dieselben Images wie beim Build?

Laut Aufgabenstellung dürfen die gleichen Images wie beim Build genutzt werden. Das ist sinnvoll, weil:

- **Konsistenz:** Tests laufen in exakt derselben Umgebung wie der Build — keine Überraschungen durch andere Tool-Versionen.
- **Kein Mehraufwand:** Die Images enthalten bereits Node/npm bzw. Maven/JDK. Es muss nichts zusätzlich installiert werden.
- **Schnelligkeit:** Die Images sind bei GitHub bereits gecacht.

---

## Ergebnis

Bei jedem Pull Request und jedem Push auf `main` laufen jetzt automatisch:

1. `build-frontend` + `build-backend` (Build)
2. `test-frontend` + `test-backend` (Tests)
3. (nur bei Merge) `docker-frontend` + `docker-backend` (Image-Push)

*Bild einfügen (Screenshot der Pipeline mit den grünen Test-Jobs test-frontend + test-backend)*

*Bild einfügen (Screenshot der Job-Logs mit der Test-Ausgabe, z.B. "Tests: 9 passed" bzw. "Tests run: 4")*

---

## Zusammenfassung

| Job | Image | Befehl | Zweck |
|---|---|---|---|
| test-frontend | node:22 | `npm run test:ci` | Jest-Tests (React) |
| test-backend | maven:3.9-eclipse-temurin-21 | `mvn test -B` | JUnit-Tests (Spring Boot) |

Die Tests laufen automatisch nach dem Build. Schlägt ein Test fehl, wird die Pipeline rot und ein Merge bzw. Image-Push wird verhindert. Dadurch ist die Qualität der Software in `main` jederzeit abgesichert.
