# Owen Project

This is a full-stack web application with a React frontend and a Node.js (Express) backend.

## Tech Stack

### Frontend

- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, shadcn-ui
- **State Management:** Redux
- **Routing:** React Router
- **HTTP Client:** Axios
- **Linting:** ESLint
- **Language:** TypeScript

### Backend

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer, Cloudinary
- **Middleware:** CORS, body-parser, cookie-parser
- **Runtime:** Node.js
- **Languge:** JavaScript


## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm
- MongoDB

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/VuNam002/Owen
    cd Owen
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory and add the necessary environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_URL`).
    ```bash
    # .env example
    PORT=3000
    MONGO_URL=mongodb+srv://namvu7702:5go1WutvKcx4mGN8@cluster0.j08llyg.mongodb.net/shopnew?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=your_jwt_secret_key
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```
    - Create a `.env` file in the `frontend` directory if you need to store environment variables, such as the backend API endpoint.
    ```bash
    # .env example
    VITE_API_URL=http://localhost:3000 
    ```

### Running the Application

1.  **Start the backend server:**
    - From the `backend` directory:
    ```bash
    npm start
    ```
    - The server will start on the port configured in your environment (e.g., http://localhost:3000).

2.  **Start the frontend development server:**
    - From the `frontend` directory:
    ```bash
    npm run dev
    ```
    - The application will be available at http://localhost:5173 (or another port if 5173 is in use).
3. **Demo**
<div >
    <img src="./demo/trangchu.png" alt="Trang chủ"/>
    <img src = "./demo/login1.png" alt="Đăng nhập người dùng"/>
    <img src = "./demo/login2.png" alt="Đăng nhập quản trị viên"/>
    <img src="./demo/demo1.png"/>
</div>
## Folder Structure

```

## Demo

### Trang chủ
![Trang chủ](./demo/trangchu.png)

### Demo
<div></div>

### Đăng nhập
![Đăng nhập 1](./demo/login1.png)
![Đăng nhập 2](./demo/login2.png)

### Trang quản trị
![Admin](./demo/admin.png)