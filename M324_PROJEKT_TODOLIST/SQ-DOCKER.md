# Containerisierung mit Docker & Docker Compose

**Modul:** M324 – DevOps-Prozesse mit Tools unterstützen
**Autor:** Metehan Celik
**Datum:** 30.05.2026

> Dieses Dokument dient als **Tutorial** für Mitarbeitende, um die ToDo-App
> mit Docker zu bauen, in die GitHub Container Registry (ghcr.io) zu pushen
> und lokal mit Docker Compose zu starten.

---

## Übersicht / Architektur

Die App besteht aus zwei Containern, die über Docker Compose orchestriert werden:

```
                    docker-compose
   ┌─────────────────────────┴─────────────────────────┐
   │                                                     │
┌──▼───────────────┐                      ┌──────────────▼──┐
│  frontend         │                      │  backend         │
│  nginx:alpine     │                      │  eclipse-temurin │
│  Port 80 → 8000   │   Browser-fetch      │  Port 8080 →8080 │
│  (statische Files)│ ───────────────────► │  (Spring Boot WAR)│
└───────────────────┘   localhost:8080     └──────────────────┘
                                                     │
                                                     ▼
                                            H2 (In-Memory)
```

- **Frontend-Container:** baut das React-Projekt und liefert die statischen Files via nginx aus.
- **Backend-Container:** baut das Spring Boot WAR und führt es mit einem schlanken JRE aus.
- Der Browser lädt das Frontend von `localhost:8000` und ruft das Backend direkt unter `localhost:8080` auf.

---

## Schritt 1 — Dockerfile für das Frontend

Datei: `M324_PROJEKT_TODOLIST/frontend/Dockerfile`

Es wird ein **Multi-Stage-Build** verwendet: zuerst wird mit Node gebaut, danach werden nur die fertigen statischen Files in einen schlanken nginx-Container kopiert. Das hält das finale Image klein.

```dockerfile
# --- Build stage: React mit Vite bauen ---
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Serve stage: statische Files mit nginx ausliefern ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Warum nginx?** Das ist die einfachste und ressourcenschonendste Variante — nginx ist auf das Ausliefern statischer Dateien spezialisiert.

---

## Schritt 2 — Dockerfile für das Backend

Datei: `M324_PROJEKT_TODOLIST/backend/Dockerfile`

Auch hier ein **Multi-Stage-Build**: bauen mit dem Maven-Image, ausführen mit einem reinen JRE-Image (ohne Maven, dadurch deutlich kleiner).

```dockerfile
# --- Build stage: Spring Boot mit Maven bauen ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -B -DskipTests

# --- Run stage: WAR mit schlankem JRE ausführen ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
```

**Warum fertige Grund-Images?** Statt Java/Maven manuell zu installieren, nutzen wir die offiziellen Images `maven:3.9-eclipse-temurin-21` (Build) und `eclipse-temurin:21-jre` (Runtime).

---

## Schritt 3 — Build + Push in die Pipeline einbauen

Die Pipeline (`.github/workflows/build.yml`) wurde um zwei Jobs erweitert, die beim **Push auf main** (nach dem Merge) die Images bauen und nach **ghcr.io** pushen.

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  # ... bestehende build-frontend / build-backend Jobs ...

  docker-frontend:
    name: Build & Push Frontend Image
    needs: build-frontend
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push frontend image
        uses: docker/build-push-action@v6
        with:
          context: M324_PROJEKT_TODOLIST/frontend
          push: true
          tags: ghcr.io/7711777/m324-todo-frontend:latest

  docker-backend:
    name: Build & Push Backend Image
    needs: build-backend
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push backend image
        uses: docker/build-push-action@v6
        with:
          context: M324_PROJEKT_TODOLIST/backend
          push: true
          tags: ghcr.io/7711777/m324-todo-backend:latest
```

**Wichtige Punkte:**
- `if: github.event_name == 'push'` — Images werden nur beim Merge gebaut, nicht bei jedem PR.
- `permissions: packages: write` — erlaubt der Pipeline das Pushen in die Registry.
- `secrets.GITHUB_TOKEN` — wird von GitHub automatisch bereitgestellt, kein manuelles Setup nötig.

*Bild einfügen (Screenshot der Pipeline mit den 4 grünen Jobs inkl. docker-frontend / docker-backend)*

*Bild einfügen (Screenshot der Packages-Seite des Repos mit den beiden Images)*

---

## Schritt 4 — Images öffentlich machen (einmalig)

Standardmässig sind ghcr.io-Images privat. Damit `docker-compose` sie ohne Login ziehen kann, werden sie einmalig auf **public** gesetzt:

GitHub → Repo → rechts **Packages** → Image anklicken → **Package settings** → **Change visibility** → **Public**.

*Bild einfügen (Screenshot der Package-Visibility-Einstellung auf Public)*

---

## Schritt 5 — Docker Compose

Datei: `docker-compose.yml` (im Repo-Root). Es referenziert die fertigen Images aus der Registry — es wird **nichts lokal gebaut**.

```yaml
services:
  backend:
    image: ghcr.io/7711777/m324-todo-backend:latest
    container_name: todo-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:h2:mem:tododb
    restart: unless-stopped

  frontend:
    image: ghcr.io/7711777/m324-todo-frontend:latest
    container_name: todo-frontend
    ports:
      - "8000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Erklärung:**
- `backend` lauscht auf Port 8080 und nutzt eine In-Memory-H2-Datenbank (via `SPRING_DATASOURCE_URL`).
- `frontend` liefert die App auf Host-Port 8000 aus.
- `depends_on` sorgt dafür, dass das Backend zuerst gestartet wird.

---

## Schritt 6 — Docker Compose lokal starten

```bash
# Images aus der Registry ziehen und Container starten
docker compose up -d

# Status prüfen
docker compose ps
```

*Bild einfügen (Screenshot von `docker compose ps` mit beiden laufenden Containern)*

Anschliessend im Browser öffnen:

```
http://localhost:8000
```

Die ToDo-App lädt, Tasks können angelegt, bearbeitet und gelöscht werden.

*Bild einfügen (Screenshot der laufenden App im Browser über localhost:8000)*

### Nützliche Befehle

```bash
docker compose logs -f          # Logs beider Container live verfolgen
docker compose down             # Container stoppen und entfernen
docker compose pull             # Neueste Images aus der Registry ziehen
```

---

## Zusammenfassung

| Schritt | Ergebnis |
|---|---|
| Dockerfile Frontend | nginx-Image mit gebauten React-Files |
| Dockerfile Backend | JRE-Image mit Spring Boot WAR |
| Pipeline erweitert | Images werden bei Merge automatisch nach ghcr.io gepusht |
| docker-compose.yml | orchestriert beide Container aus der Registry |
| Lokaler Start | `docker compose up -d` → App läuft auf localhost:8000 |

Die Applikation ist vollständig containerisiert, die Container sind mit Docker Compose orchestriert und die App ist lauffähig. Ein Mitarbeitender muss nur das Repo klonen und `docker compose up -d` ausführen — keine lokale Java/Node-Installation nötig.
