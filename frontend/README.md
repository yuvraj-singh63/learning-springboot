# Employee Management Frontend

React and TypeScript dashboard for the Spring Boot employee API.

## Run locally

1. Install Node.js 20 or newer.
2. Start the Spring Boot backend on port 8080.
3. From this directory, install dependencies and start Vite:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/employees` requests to `http://localhost:8080`, so no backend CORS configuration is needed during local development.

The application includes these frontend routes:

- `/` - Employee directory with CRUD actions.
- `/insights` - Team analytics, department mix, salary bands, payroll allocation, and top earners.

## Available UI actions

- View employee counts, total payroll, average salary, and department count.
- Search by employee name or department.
- Filter by department.
- Create, edit, and delete employees through the Spring Boot API.