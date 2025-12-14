# Connecting invoice.parivartanai.com to api-invoice.parivartanai.com

Since you have dedicated domains for both Frontend (**invoice.parivartanai.com**) and Backend (**api-invoice.parivartanai.com**), the setup is clean and professional.

---

## 1. Backend Configuration (EC2)

We need to configure Nginx on your EC2 instance to receive traffic for `api-invoice.parivartanai.com` and use SSL (HTTPS).

### Step A: Configure Nginx
1.  **SSH into your EC2**.
2.  Open the Nginx config:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
3.  Replace the content with this reverse proxy block:
    ```nginx
    server {
        server_name api-invoice.parivartanai.com;

        location / {
            proxy_pass http://localhost:3000; # Points to your Node app
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
4.  Save and test:
    *   `Ctrl+O`, `Enter`, `Ctrl+X`
    *   `sudo nginx -t` (Should say syntax is ok)
    *   `sudo systemctl restart nginx`

### Step B: Enable SSL (HTTPS)
1.  Install Certbot (if not installed):
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```
2.  Get the certificate:
    ```bash
    sudo certbot --nginx -d api-invoice.parivartanai.com
    ```
    *Follow prompt: Enter email -> Agree -> Redirect HTTP to HTTPS (Select 2).*

### Step C: Update Backend CORS
1.  Navigate to your app:
    ```bash
    cd ~/app/billing_backend_service
    nano .env
    ```
2.  Update `CORS_ORIGIN` to allow your frontend domain:
    ```env
    CORS_ORIGIN=https://invoice.parivartanai.com
    ```
3.  Restart App:
    ```bash
    pm2 restart billing-backend
    ```

---

## 2. Frontend Configuration (React)

Now tell the React app where the API lives.

1.  **On your Local Machine (VS Code)**.
2.  Create/Edit `.env.production` in `d:\pravirtan\invoice_dashboard\invoice-dashboard`:
    ```env
    VITE_API_BASE_URL=https://api-invoice.parivartanai.com/api/
    ```
3.  Build the project:
    ```bash
    npm run build
    ```
4.  **Deploy to S3**:
    Upload the contents of the `dist` folder to the S3 bucket backing `invoice.parivartanai.com`.
    *(Ensure you invalidate CloudFront cache `/*` after upload).*

---

## Summary Checklist
- [ ] **DNS**: `api-invoice.parivartanai.com` points to EC2 IP.
- [ ] **Nginx**: Configured to proxy port 80/443 -> 3000.
- [ ] **SSL**: Certbot ran successfully on EC2.
- [ ] **Backend**: `.env` has `CORS_ORIGIN=https://invoice.parivartanai.com`.
- [ ] **Frontend**: `.env.production` has `VITE_API_BASE_URL=https://api-invoice.parivartanai.com/api/`.
