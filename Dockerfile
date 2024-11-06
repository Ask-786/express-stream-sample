FROM node:18-alpine

WORKDIR /bin/src/app

COPY . .

RUN npm install -g pnpm && pnpm install && npx tsc

EXPOSE 3000

CMD ["node", "dist/server.js"]
