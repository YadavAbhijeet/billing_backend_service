# connecting AWS EC2 Backend with S3/CloudFront Frontend

This guide explains how to connect your deployed React frontend (on S3/CloudFront) to your Node.js backend (on EC2).

## ⚠️ Critical Warning: HTTP vs HTTPS (Mixed Content)

By default, CloudFront uses **HTTPS** (e.g., `https://d1234.cloudfront.net`).
Your EC2 instance by default uses **HTTP** (e.g., `http://54.123.45.67:3000`).

**Browsers will BLOCK requests** from an HTTPS site to an HTTP backend ("Mixed Content Error").

### You have two options:
1.  **Production (Recommended)**: Buy a domain name (e.g., `api.myapp.com`), point it to your EC2 IP, and use Nginx + Certbot (Let's Encrypt) to get free SSL.
2.  **Testing/Dev**: Access your S3 website using its **HTTP** URL (not CloudFront) so both are insecure. (Not recommended for real users).

The steps below assume you want to set this up correctly (Option 1).

---

## Step 1: Allow Traffic to Backend (EC2 Security Groups)

1.  Go to **AWS Console > EC2**.
2.  Select your Backend Instance -> **Security** tab -> Click on the **Security Group**.
3.  **Edit Inbound Rules**:
    *   Open Port **80 (HTTP)** from `0.0.0.0/0`.
    *   Open Port **443 (HTTPS)** from `0.0.0.0/0`.
    *   (Optional for testing) Open Port **3000** if accessing directly without Nginx.

---

## Step 2: Configure Backend CORS

Your backend needs to know that the frontend looks like (domain name) to allow requests.

1.  **SSH into your EC2**:
    ```bash
    ssh -i your-key.pem ubuntu@your-ec2-ip
    cd app/billing_backend_service
    ```

2.  **Edit .env file**:
    ```bash
    nano .env
    ```

3.  **Add/Update CORS_ORIGIN**:
    ```env
    # Allow your CloudFront URL (no trailing slash)
    CORS_ORIGIN=https://d123456.cloudfront.net
    
    # OR allow everything (less secure, but easier for testing)
    CORS_ORIGIN=*
    ```

4.  **Restart Backend**:
    ```bash
    pm2 restart billing-backend
    ```

---

## Step 3: Setup Frontend API URL

Your React app needs to know where to send requests.

1.  **On your Local Machine (VS Code)**, go to standard `invoice-dashboard` folder.
2.  Create a file named `.env.production` in the root (next to `package.json`).
3.  Add the Backend URL:

    ```env
    # If using Domain + SSL (Recommended)
    VITE_API_BASE_URL=https://api.yourdomain.com/api/
    
    # OR if testing with raw IP (only works if Frontend is HTTP)
    VITE_API_BASE_URL=http://your-ec2-ip:3000/api/
    ```

    *Note: The trailing `/` at the end of `/api/` works best with your code.*

4.  **Build the Frontend**:
    ```bash
    npm run build
    ```
    This creates a `dist` folder.

---

## Step 4: Deploy to S3

Upload the new build to your S3 bucket.

1.  **Using AWS CLI** (if installed):
    ```bash
    aws s3 sync dist/ s3://your-bucket-name --delete
    ```
    
2.  **OR Manual Upload**:
    *   Go to S3 Console.
    *   Open your bucket.
    *   Delete old files.
    *   Upload everything inside the `dist` folder (index.html, assets, etc.).

---

## Step 5: Invalidate CloudFront (Optional but Recommended)

If you updated files but don't see changes:
1.  Go to **AWS Console > CloudFront**.
2.  Select your distribution.
3.  **Invalidations** tab -> **Create Invalidation**.
4.  Enter `/*` and create.

---

## Troubleshooting

*   **"Network Error" or "Failed to fetch"**: 
    *   Check Browser Console (F12) -> Network Tab. 
    *   If you see `blocked:mixed-content`, you are mixing HTTPS and HTTP.
    *   If you see `CORS error`, check Step 2.
*   **"Connection Refused"**: Check port 3000 is running on EC2 (`pm2 status`) and Security Group allows traffic.
