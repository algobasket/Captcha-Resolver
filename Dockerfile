# Use the official Node.js Docker image with the desired version
FROM node:18.10.0 AS node

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Switch to a Python Docker image with Python 3.8.0
FROM python:3.8.0-slim AS python

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file to the working directory
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Use a combined base image including both Node.js and Python
FROM node

# Set the working directory in the container
WORKDIR /app

# Copy Node.js dependencies from the previous stage
COPY --from=node /app/node_modules ./node_modules

# Copy Python dependencies from the previous stage
COPY --from=python /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
