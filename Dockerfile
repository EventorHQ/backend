FROM node:20-alpine AS packages

COPY .api/package.json /app/package.json

WORKDIR /app
RUN npm install
COPY ./api /app
RUN npm run build

CMD ["npm", "start"]
