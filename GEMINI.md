# GEMINI.md

## Project Overview

This project is a Next.js web application called "Kasa Learn Journey," designed to teach users about real estate investment. It's a gamified learning platform with features like levels, streaks, XP points, and leaderboards.

The application uses a modern frontend stack:

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Authentication:** Supabase Auth
*   **API Communication:** the `./app/api` directory communicates with Supabase postgresql database of supabase project. Too use GraphQl API, you need to use the `./app/api/graphql` directory.

The app is structured with clear separation of concerns, using components, hooks, and a context provider for user data. It also seems to be configured for module federation, suggesting it might be part of a larger micro-frontend architecture.

## Building and Running

The following commands are available in `package.json`:

*   **`npm run dev`**: Starts the development server.
*   **`npm run build`**: Creates a production build of the application.
*   **`npm run start`**: Starts the production server.
*   **`npm run lint`**: Lints the codebase for errors and style issues.

To run the application in a development environment, you would typically run:

```bash
npm install
npm run dev
```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS with a custom theme defined in `tailwind.config.js`. Utility classes are combined using the `clsx` library and a custom `cn` utility function.
*   **Components:** Components are organized by feature (e.g., `dashboard`, `quiz`, `profile`) and re-exported through `index.ts` files for cleaner imports.
*   **State Management:** A `UserContext` is used to provide user data throughout the application. The `useAuth` hook provides a simple interface for accessing user state and authentication status.
*   **API:** A centralized API client in `lib/api.ts` is used for all communication with the backend. This makes it easy to manage API endpoints and handle errors consistently.
*   **Authentication:** Authentication is handled by Supabase, with client-side and server-side utilities provided in the `utils/supabase` directory. A middleware file (`middleware.ts`) is used to protect routes and manage user sessions.
*   **File Structure:** The project follows the standard Next.js App Router structure, with pages defined in the `app` directory. Reusable components, hooks, and utility functions are located in their respective directories (`components`, `hooks`, `lib`).


## 3D Visualization Strategy
To support the "Personalized Streak House" feature [Phase 2], the frontend utilizes a 3D rendering stack:
* **Three.js:** Core 3D library.
* **React Three Fiber:** React renderer for Three.js, managing the 3D scene graph as components.
* **Optimization:** 3D assets are rendered entirely client-side to reduce server load.

## API Communication & Validation
* **Protocol:** GraphQL (consuming the Hono + GraphQL-Yoga backend).
* **Data Fetching:** [Aquí pon tu cliente, ej: urql / TanStack Query / fetch].
* **Validation:** **Zod** is used for validating GraphQL inputs and typing Supabase responses to ensure type safety.

## Key Frontend Logic
* **Module Locking:** Implements strict sequential progression; future modules remain locked until the previous quiz is passed with >70% score.
* **Streak Management:** Client-side logic handles visual updates for streaks, syncing with the backend's 24-hour reset rule.

## User Context
* **UserContext:** A custom context provider is used to provide user data throughout the application. The `useAuth` hook provides a simple interface for accessing user state and authentication status, just use the `useAuth` hook to access user data.

## Authentication
* **Authentication:** Authentication is handled by Supabase, with client-side and server-side utilities provided in the `utils/supabase` directory. A middleware file (`middleware.ts`) is used to protect routes and manage user sessions.

## Fetch 
Dont use fetch, use the `./app/api/` directory to fetch data from the backend.

## Subdomain
The application is hosted on a subdomain: `https://kasa-learning.vercel.app/`

## Database Modeling (Supabase)

The application leverages a relational database hosted on Supabase (PostgreSQL). The schema is designed to support hierarchical content, granular progress tracking, and gamification mechanics.

### Core Schema Structure

#### 1. User & Gamification Profile
* **`user`**: Extends the default Supabase Auth. Stores gamification state:
    * `current_level` (Int)
    * `xp` (Int) - Total experience points.
    * `streak` (Int) - Current daily streak.
    * `profile_url` (Text) - Avatar reference.

#### 2. Educational Content Hierarchy
The content follows a strict parent-child relationship:
* **`section`**: Top-level topics (e.g., "Fundamentos").
    * *Relation:* One-to-Many with Modules.
* **`module`**: Specific learning units. Contains metadata like `estimated_time` and `xp` reward.
    * *Relation:* One-to-Many with Lessons/Quizzes.
* **`lesson`**: Individual content pieces associated with a module.
* **`quiz`**: Assessment units linked to modules.
    * Define `minimum_score` required to pass.

#### 3. Assessment Engine
The quiz system is polymorphic, supporting different question types linked via the `question` table:
* **`question`**: Base table for all query items.
* **Specific Types:**
    * `pairs`: Matching logic (left_words / right_words).
    * `input_question`: Text input validation.
    * `cloze`: Fill-in-the-blank style interaction.

#### 4. Progress Tracking & Analytics
User activity is tracked at three levels of granularity:
* **`progress`**: High-level summary of user advancement per section/module.
* **`user_module_progress`**: Tracks the status of specific modules (e.g., `status`, `xp_earned`, `completed_at`).
* **`user_lesson_attempt`**: Detailed logs of every quiz attempt.
    * Stores `score`, `pass` (boolean), and specific `xp_earned` for that attempt.
* **`user_question_answer`**: Records the exact answer provided by the user for granular analytics (correct vs. user input).

