
# next-electron-express-monorepo-template

![image](https://github.com/user-attachments/assets/ba0343d5-5d82-403e-abf5-b802c351cd08)

A robust and highly-optimized boilerplate for building cross-platform desktop applications with **Electron.js**, a **Next.js** frontend, and a bundled **Express.js** backend, all structured within a **monorepo**. Experience seamless development with hot-reloading across your entire stack!

## ✨ Features

* **Electron.js:** Build native desktop applications for Windows, macOS, and Linux using web technologies.
* **Next.js Frontend:** Leverage React's power with Next.js for a performant and modern user interface.
    * Optimized production builds (`frontend/out` directory).
* **Express.js Backend:** A dedicated Node.js/Express.js backend service for your application's logic, data processing, and local API.
    * **Bundled Executable:** The backend is compiled into a standalone `.exe` (for Windows) using `pkg` for easy distribution within your Electron app.
* **Monorepo Structure (npm Workspaces):** Clean separation of `frontend`, `backend`, and `electron` core for enhanced organization and code sharing.
* **Unified Development Experience:**
    * **Full Stack Hot Reload:** Make changes to your Next.js frontend or Express.js backend, and see them instantly reflected in the running Electron app. No manual restarts!
    * Concurrent development scripts to run all parts of your stack simultaneously.
* **Prisma Integration:** Ready-to-use setup for database management with Prisma (ORM).
* **`dotenv-cli`:** Seamless environment variable management across all workspaces.
* **`electron-builder`:** Simplifies packaging and creating distributable installers for your application.

## 🚀 Getting Started

Follow these steps to get your development environment up and running quickly.

### Prerequisites

* Node.js (LTS version recommended, e.g., v18.x or v20.x)
* npm (comes with Node.js)
* Git

### 1. Clone the Repository

First, clone this template to your local machine:

```bash
git clone https://github.com/Heshan-404/next-electron-express-monorepo-template.git
cd next-electron-express-monorepo-template
```

### 2. Install Dependencies

Navigate to the root of the cloned repository and install all necessary dependencies for the frontend, backend, and Electron processes.

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the **root** of your project. This file will hold your environment variables, such as database connection strings, API keys, etc.

**Example `.env` file:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yourdatabase?schema=public"
# Add any other environment variables your frontend or backend needs
```

**Important:** Make sure to replace `postgresql://...` with your actual database URL if you're using Prisma. If you're not using a database, you can still keep the file, but `DATABASE_URL` might not be strictly necessary unless your backend relies on it.

### 4. Database Setup (Optional - if using Prisma)

If you're using Prisma for your database, you'll need to generate the Prisma client based on your schema and potentially run migrations.

```bash
npm run db:generate # Generates Prisma client
npm run db:update   # Applies database migrations (if you have any)
```

You can also open Prisma Studio to visually manage your database:

```bash
npm run db:live
```

### 5. Run in Development Mode (The Magic Command!)

This single command will concurrently start your Next.js frontend, your Express.js backend, and launch the Electron application. You'll experience full hot-reloading for both frontend and backend changes.

```bash
npm run dev:electron
```

**What this command does:**

* `npm run dev:frontend`: Starts the Next.js development server for your UI.
* `npm run dev:backend`: Starts your Express.js backend server.
* `electron electron/main-dev.js`: Launches the Electron application, configured to load your Next.js development server and communicate with your Express.js backend.

You should see your desktop application window appear, and any changes you make in `frontend/` or `backend/` will automatically update!

-----

## 📦 Project Structure

```
.
├── electron/                   # Electron Main Process code and configuration
│   ├── main-dev.js             # Entry point for Electron in development mode
│   ├── main-prod.js            # Entry point for Electron in production/build mode
│   ├── preload.js              # Preload script for secure IPC (Inter-Process Communication)
│   └── icon.ico                # Application icon (for Windows builds)
├── frontend/                   # Your Next.js application (the UI layer)
│   ├── public/                 # Static assets for Next.js
│   ├── src/                    # Your Next.js source code (pages, components, etc.)
│   ├── out/                    # Output directory for production builds (generated by `npm run build:frontend`)
│   └── package.json            # Frontend-specific dependencies and scripts
├── backend/                    # Your Node.js/Express.js backend service
│   ├── src/                    # Backend source code (e.g., Express routes, services)
│   ├── prisma/                 # Prisma schema and migration files
│   ├── dist/                   # Compiled JavaScript output for the backend (generated by `npm run build:backend`)
│   ├── bin/                    # Output directory for backend executables (generated by `pkg`)
│   └── package.json            # Backend-specific dependencies and scripts
├── .env                        # Environment variables for the entire project
├── package.json                # Root package.json (monorepo config, shared scripts, dev dependencies)
├── tsconfig.json               # TypeScript configuration for the root project
└── ... (other config files like .gitignore, prettierrc, etc.)
```

-----

## ⚙️ Available Scripts

These scripts are defined in the root `package.json` and orchestrate the entire monorepo.

* `npm install`
    * Installs dependencies for the root, frontend, and backend workspaces.
* `npm run postinstall`
    * Automatically runs `npm run db:generate` after `npm install` for Prisma setup.
* `npm run dev:electron`
    * Starts Next.js frontend, Express.js backend, and Electron concurrently with hot-reloading. **Your go-to development command.**
* `npm run dev:frontend`
    * Starts only the Next.js development server.
* `npm run dev:backend`
    * Starts only the Express.js backend development server.
* `npm run dev`
    * Starts Next.js frontend and Express.js backend (useful if you only need the web part without Electron).
* `npm run build:frontend`
    * Loads `frontend/out`.
* `npm run build:backend`
    * Transpiles the backend TypeScript code to JavaScript, outputting to `backend/dist`.
* `npm run build:backend-executable:x64`
    * Packages the compiled backend (`backend/dist/index.js`) into a standalone Windows 64-bit executable (`backend/bin/index-x64.exe`) using `pkg`.
* `npm run build:backend-executable:ia32`
    * (Optional) Packages the compiled backend into a Windows 32-bit executable.
* `npm run build:backend-executables`
    * Runs all necessary backend executable builds (currently just x64).
* `npm run build`
    * Runs `build:frontend`, `build:backend`, and `build:backend-executables`. This prepares all necessary assets and executables for `electron-builder`.
* `npm run dist`
    * **The final step for creating your installer!** Runs `npm run build` then uses `electron-builder` to package your entire application into an OS-specific installer (e.g., `.exe` for Windows, `.dmg` for macOS, `.deb`/`.AppImage` for Linux).
* `npm run start`
    * Starts the *packaged* Electron application from the `dist/win-unpacked` (or similar OS-specific) folder. Use this to test your final built app.
* `npm run db:generate`
    * Generates Prisma client.
* `npm run db:update`
    * Runs Prisma migrations, updating your database schema.
* `npm run db:reset`
    * Resets your database (destroys data and recreates schema). **Use with caution in development only!**
* `npm run db:live`
    * Opens Prisma Studio for a visual interface to your database.
* `npm run db:update:force`
    * Pushes the Prisma schema changes to the database directly, bypassing migrations. **Use with caution!**

-----

## 🛠️ How It Works (Under the Hood)

This template intelligently integrates the three main components:

1.  **Frontend (`frontend/`):**
    * In `dev` mode, Electron points to the Next.js development server (`http://localhost:3000`). This enables hot-reloading provided by Next.js.
    * In `build`/`prod` mode, the Next.js app is built into static assets (`frontend/out`), and Electron loads these local files.
2.  **Backend (`backend/`):**
    * In `dev` mode, the `backend` Express server runs as a Node.js process, accessible by both the Next.js frontend (if needed) and the Electron main/renderer processes (via IPC or direct HTTP calls to `http://localhost:4000`).
    * In `build`/`prod` mode, the backend is compiled into a standalone `.exe` using `pkg`. The Electron main process then spawns this `.exe` as a child process, allowing your backend to run locally alongside your Electron app. This ensures your application's logic is self-contained.
3.  **Electron (`electron/`):**
    * Manages the main process, window creation, IPC (Inter-Process Communication) between the main process and renderer (frontend), and handles system interactions.
    * Dynamically loads the frontend from either the Next.js dev server or the built static files.
    * Starts and manages the backend process.

## 🤝 Contribution

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

## 📧 Contact
**Tharushka Heshan Nadishanka**

[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:heshantharushka2002@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tharushka-heshan/)
