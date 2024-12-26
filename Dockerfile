FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install && npm install -g nodemon   # Install nodemon globally
EXPOSE 3000
CMD ["nodemon", "server.js"]
