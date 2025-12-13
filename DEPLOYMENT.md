# Deployment Guide for Ubuntu (AWS EC2)

This guide outlines the steps to deploy the **Billing Backend Service** on an Ubuntu server (e.g., AWS EC2) from scratch.

## Prerequisites

- An AWS Account
- Access to the GitHub repository
- SSH Client (Terminal, PuTTY, etc.)

---

## Step 1: Launch an EC2 Instance

1.  Log in to AWS Console and go to **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `Billing-Backend-Server`
4.  **AMI**: Choose **Ubuntu Server 24.04 LTS** (or 22.04 LTS).
5.  **Instance Type**: `t2.micro` or `t3.micro` (Free tier eligible if applicable).
6.  **Key Pair**: Create a new key pair or select an existing one. **Download the `.pem` file** and keep it safe.
7.  **Network Settings**:
    *   Allow SSH traffic from **My IP** (for security) or Anywhere.
    *   Allow HTTP traffic from the internet.
    *   Allow HTTPS traffic from the internet.
8.  Launch the instance.

---

## Step 2: Connect to Server & Setup Environment

1.  Open your terminal.
2.  Change permissions of your key file (if on Mac/Linux):
    ```bash
    chmod 400 your-key.pem
    ```
3.  SSH into the server:
    ```bash
    ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
    ```

### Update System
Once connected, update the package list:
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (via NVM)
We will install Node.js (LTS version).

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v # Verify installation (should be v20.x or v22.x)
```

### Install Git & PM2
PM2 is a process manager to keep your app running.

```bash
sudo apt install git -y
npm install -g pm2
```

---

## Step 3: Clone & Configure Project

1.  Clone your repository:
    ```bash
    git clone https://github.com/YadavAbhijeet/billing_backend_service.git
    cd billing_backend_service
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file for production configuration.
    ```bash
    nano .env
    ```
    Paste the following (adjust as needed):
    ```env
    PORT=3000
    CORS_ORIGIN=*
    # JWT_SECRET=your_secure_random_string_here
    # DATABASE_URL=... (Only if using external Postgres, otherwise remove to use SQLite)
    ```
    *Press `Ctrl+X`, then `Y`, then `Enter` to save.*

---

## Step 4: Database Setup (SQLite)

Since you are using SQLite, the database file will be created automatically when the app starts.
However, for production, ensure the data persists.

If you want to use **PostgreSQL** instead:
1.  `sudo apt install postgresql postgresql-contrib`
2.  Create user/db and update `.env` with `DATABASE_URL`.

For now, we will proceed with **SQLite**.

---

## Step 5: Start Application with PM2

**CRITICAL STEP**: Starting the application for the first time will initialize the database tables (via `sequelize.sync()`).
You MUST start the app *before* running any migrations.

1.  **Install PM2 Globally** (if not already installed):
    ```bash
    npm install -g pm2
    # If "command not found", try:
    source ~/.bashrc
    ```

2.  **Start the App**:
    ```bash
    pm2 start app.js --name "billing-backend"
    pm2 save
    pm2 startup
    ```

3.  **Check Logs for DB Connection**:
    ```bash
    pm2 logs billing-backend --lines 20
    ```
    *Wait until you see "Database connected..." and "Database synchronized..."*

---

## Step 6: Run Migrations (Post-Start)

Once the app is running and tables are created, run the migrations to apply any additional changes (like the `payment_terms` column).

```bash
npx sequelize-cli db:migrate --env production
```

---

## Step 7: Setup Nginx (Reverse Proxy)

We need Nginx to forward port 80 (HTTP) traffic to port 3000 (your node app).

1.  Install Nginx:
    ```bash
    sudo apt install nginx -y
    ```

2.  Configure sites:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```

3.  Replace the content `location / { ... }` block with:
    ```nginx
    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        server_name _; # Or your domain name like api.example.com

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  Test and Reload Nginx:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

You should now be able to access your API at `http://<YOUR_EC2_PUBLIC_IP>/`.

---

## Step 7: SSL (HTTPS) - Optional but Recommended

If you have a domain name pointing to this IP:

1.  Install Certbot:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Run Certbot:
    ```bash
    sudo certbot --nginx -d yourdomain.com
    ```

---

## Basic Maintenance

- **View Logs**: `pm2 logs billing-backend`
- **Restart App**: `pm2 restart billing-backend`
- **Deploy New Code**:
    ```bash
    cd billing_backend_service
    git pull
    npm install
    pm2 restart billing-backend
    ```
