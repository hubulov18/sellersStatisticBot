FROM node:14.18-alpine AS builder

# Create app directory
WORKDIR /shopstat-bot

COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install app dependencies
RUN yarn install

COPY . .

RUN yarn run build

FROM node:14.18-alpine

WORKDIR /shopstat-bot

COPY --from=builder /shopstat-bot/node_modules ./node_modules
COPY --from=builder /shopstat-bot/package.json ./
COPY --from=builder /shopstat-bot/yarn.lock ./
COPY --from=builder /shopstat-bot/dist ./dist
COPY --from=builder /shopstat-bot/prisma ./prisma

EXPOSE 4001

CMD [ "yarn", "run", "start:prod" ]