FROM node:18.20.4-alpine

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
CMD ["npm", "start"]
