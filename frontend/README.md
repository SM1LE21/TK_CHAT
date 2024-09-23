# **Frontend for AI Chat Application**

This is the React frontend for the AI chat application, providing a chat interface for users to interact with the AI assistant. The project uses TypeScript.

## **Prerequisites**

- Node.js (version 14 or higher)
- npm (version 6 or higher)

## **Setup Instructions**

1. **Navigate to the Frontend Directory**

   ```bash
   cd frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create a .env File**

    - Create a .env file in the frontend/ directory with the following content:

        ```
        REACT_APP_API_BASE_URL=http://localhost:8000
        ```
    - Replace http://localhost:8000 with the URL where your backend API is running if different.

4. **Start the Development Server**

   ```bash
   npm start
   ```

    - The application will be accessible at http://localhost:3000

## **Setup Instructions**

To build the app for production:

   ```
   npm run build
   ```

The optimized production build will be in the build/ directory.

## **Project Structure**
- `src/components/`: Contains the React components.
    - `ChatInterface/`: The chat interface component.
    - `FeedbackForm/`: The feedback form component.
- `src/utils/api.ts`: API utility functions for interacting with the backend.

