### STAGE 1: Build the Angular application ###
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Angular application for production
# 'your-app-name' should be replaced with the actual name of your Angular project
# found in angular.json under "projects"
RUN npm run build -- --output-path=./dist/your-app-name --configuration=production

### STAGE 2: Serve the application with Nginx ###
FROM nginx:alpine

# Copy the built Angular application from the 'builder' stage
# Replace 'your-app-name' with the actual output path of your Angular build
COPY --from=builder /app/dist/your-app-name /usr/share/nginx/html

# Optional: Copy a custom Nginx configuration if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx listens on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
