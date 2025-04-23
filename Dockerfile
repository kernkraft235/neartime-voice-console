# Dockerfile for Voice Interaction Web App

# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Tailscale
RUN curl -fsSL https://pkgs.tailscale.com/stable/debian/buster.gpg | apt-key add -
RUN curl -fsSL https://pkgs.tailscale.com/stable/debian/buster.list | tee /etc/apt/sources.list.d/tailscale.list
RUN apt-get update
RUN apt-get install -y tailscale

# Expose the port the app runs on
EXPOSE 3000

# Start Tailscale and the application
CMD tailscale up --authkey=${TAILSCALE_AUTH_KEY} && npm start
