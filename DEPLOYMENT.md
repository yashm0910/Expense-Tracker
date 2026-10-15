# Deployment

## Live URLs
- Backend API: https://13.239.84.60.nip.io
- Frontend: [to be added after deploy]

## Architecture
User → Frontend
     → Backend API (AWS EC2 + Nginx + HTTPS)
     → MongoDB Atlas

## Backend Stack
- AWS EC2 (Ubuntu 24.04, t2.micro)
- PM2 (process manager + boot persistence)
- Nginx (reverse proxy + SSL termination)
- Let's Encrypt (auto-renewing HTTPS)
- MongoDB Atlas (managed database)
- Docker (containerized locally)

## Setup Steps
1. Launch EC2, configure Security Group (22, 80, 443)
2. SSH via key pair
3. Install Node 20 + PM2
4. Clone repo, create `.env` with secrets
5. `npm install` and `pm2 start server.js`
6. Configure `pm2 startup` + `pm2 save` for boot persistence
7. Install Nginx, configure reverse proxy to `localhost:3000`
8. Run `certbot --nginx` for SSL + HTTPS redirect

## Issues Encountered & Fixes
- Security Group blocked port 80 → added inbound rule
- Cookie `Secure` flag not sent over HTTP → enabled HTTPS via Certbot
- PM2 process list empty after reboot → ran `pm2 startup` correctly (it only prints the sudo command) + `pm2 save`
- Package lock held by `unattended-upgrades` on first boot → waited it out

## Containerization
- Multi-stage Dockerfile (node:20-alpine)
- `.dockerignore` to exclude `node_modules` and `.env`
- Tested: `docker build -t expense-api .` + `docker run -p 4000:3000 --env-file .env expense-api`