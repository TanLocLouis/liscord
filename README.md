# 📋 Project Overview

This is my pet project offers a fast and lightweight solution for storing and sharing temporary content, similar to **Pastebin**.

---

# 🛠️ Technologies Used

- **Node.js** – Backend server
- **React.js** – Web frontend
- **MongoDB** – Primary data storage
- **Redis** *(optional)* – Caching layer for enhanced performance
- **Docker** – Containerized deployment
- **GitHub CI/CD** – Automated build and deployment pipelines (Not implemented yet :D)

---

# 🧪 Getting Started with Development

## To run the frontend locally:

```bash
cd frontend
npm run dev
```

## For the backend  
Open new terminal:
```bash
cd backend
npm run dev
```

## For the database
Use `mongodb` container
```bash
cd tools/mongodb
sudo docker-compose up -d
```

# ✅ Production
## To run the frontend  
```bash
npm run build
```
This will create `/dist` folder which can be served by `Nginx`  
Before use it, you need to change this folder permission.  
```
sudo chown root
sudo chmod -R 705 dist
```
To use `Nginx` in `Docker` to deploy this.
On main folder run:
```bash
sudo docker-compose up -d
```
**📌Note:** If you are using Cloudflare tunnel to host, sometime it needs to be cleaned cache to update to the latest version of website from Nginx.

## For the backend:
```bash
cd backend
sudo docker-compose up -d
```

## For MongoDB
This will deploy a `mongodb` container
```bash
cd tools/mongodb
sudo docker-compose up -d
```

