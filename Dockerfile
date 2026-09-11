FROM node:20-alpine

ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN rm -rf node_modules/ yarn.lock

RUN npm cache clean --force

RUN npm install --no-cache

# Bundle app source

COPY . .

RUN npm run build

EXPOSE 3000

# Container tự báo unhealthy nếu /api/health không trả 2xx (dùng cho docker / orchestrator)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO /dev/null http://127.0.0.1:3000/api/health || exit 1

CMD ["npm", "start"]
