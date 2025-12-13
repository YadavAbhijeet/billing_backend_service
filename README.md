# Invoice Dashboard (Backend Service)

This is the backend service for the Invoice Dashboard, built with Node.js, Express, and Sequelize.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Environment Variables:
    Create a `.env` file (see `.env.example` if available) with the following:
    - `PORT`: (Optional) Port to run on, default is 3000.
    - `CORS_ORIGIN`: (Optional) The frontend URL allowed to access this API. Defaults to `*`.
    - `DATABASE_URL`: (Optional) Connection string for PostgreSQL (Production).
    - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: (Optional) Alternative Postgres config.

    *If no database config is provided, it defaults to using a local SQLite file (`database.sqlite`).*

3.  **Database Initialization & Migration (Important)**:

    The application uses a hybrid approach for database management:
    *   **Base Tables**: Created automatically by `sequelize.sync()` when the application starts for the first time.
    *   **Schema Updates**: Managed via Sequelize Migrations.

    **Order of Operations (Fresh Install):**
    1.  **Start the App** first:
        ```bash
        npm start
        # OR
        npm run dev
        ```
        *Wait for "Database synchronized..." message in the logs.*

    2.  **Run Migrations** (in a separate terminal):
        ```bash
        npx sequelize-cli db:migrate
        # For Production:
        npx sequelize-cli db:migrate --env production
        ```

    *If you try to run migrations before starting the app, you may get "table does not exist" errors.*

## Deployment

This app includes a `Procfile` for Heroku/Render deployments.

### Production Database
For production, providing a `DATABASE_URL` environment variable will switch the application to use PostgreSQL instead of SQLite. Ensure your database is provisioned and reachable.

### Security
Set `CORS_ORIGIN` to your frontend's production URL to restrict Cross-Origin requests.

## AWS Deployment (Docker)

This service includes a `Dockerfile` for containerized deployment.

### Option 1: AWS App Runner (Recommended)
1.  Push this code to GitHub.
2.  Go to AWS App Runner console -> Create Service.
3.  Connect your GitHub repo.
4.  Configure "Source code" deployment (or "Image" if using ECR).
5.  Set Build Command: `npm install`
6.  Set Start Command: `npm start`
7.  Add Environment Variables (`DATABASE_URL`, `CORS_ORIGIN`, etc.) in the configuration step.

### Option 2: EC2 with Docker
1.  Launch an EC2 instance (e.g., Amazon Linux 2023).
2.  Install Docker:
    ```bash
    sudo yum update -y
    sudo yum install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    ```
3.  Copy your code to the instance (or `git clone`).
4.  Build and run:
    ```bash
    docker build -t billing-backend .
    docker run -d -p 3000:3000 --env-file .env billing-backend
    ```

### Option 3: ECS/Fargate
1.  Push Docker image to Amazon ECR.
2.  Create an ECS Task Definition using that image.
3.  Run it as a Service on Fargate (Serverless container).
