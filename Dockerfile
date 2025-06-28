### STAGE 1: Build the Angular application ###
FROM node:20.11 AS builder

WORKDIR /app

# Set Node.js memory limit if you suspect out-of-memory errors (optional)
# ENV NODE_OPTIONS="--max_old_space_size=4096"

# Copy package.json and package-lock.json first to leverage Docker cache
# Use npm ci instead of npm install for consistent builds with package-lock.json
COPY package*.json ./
RUN npm ci

# Copy the rest of your application code
COPY . .

# Build the Angular application for production
# *** IMPORTANT: Replace 'petricator' with your actual Angular project name from angular.json ***
RUN npm run build -- --configuration=development

### STAGE 2: Serve the application with Nginx ###
FROM nginx:alpine

# Copy the built Angular application from the 'builder' stage
# *** IMPORTANT: Replace 'petricator' with your actual Angular project name from angular.json ***
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/petricator/browser /usr/share/nginx/html

# Optional: Copy a custom Nginx configuration if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx listens on
# EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]