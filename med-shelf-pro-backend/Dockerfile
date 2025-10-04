# Simple container to avoid Windows build issues
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm install --production=false
COPY . .
ENV PORT=4000
EXPOSE 4000
CMD ["npm","run","dev"]
