
FROM node:latest as builder
# Create app directory
ARG env
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
# Bundle app source
COPY . .
#RUN npm run lint
RUN npm run build



# Stage 2 - the production environment
# FROM node:latest as production



# RUN mkdir -p /app/node_modules
# WORKDIR /app
# COPY package*.json ./

# RUN npm install --omit=dev
# COPY --from=builder /app/ .
# EXPOSE 3001
# CMD [ "node", "build/app.js" ]