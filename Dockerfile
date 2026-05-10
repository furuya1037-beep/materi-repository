FROM nginx:alpine

# Copy all files from the current directory to the default Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80
