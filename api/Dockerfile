FROM node:20-alpine AS backend

COPY package.json /app/package.json

WORKDIR /app
RUN npm install
COPY . /app
RUN npm run build

CMD ["npm", "start"]
