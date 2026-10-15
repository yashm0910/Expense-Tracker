# Use Node 20 on a small Linux base
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start command
CMD ["node", "server.js"]