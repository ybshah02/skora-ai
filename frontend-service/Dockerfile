FROM node:14-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

ENV PYTHONPATH=${PYTHONPATH}:${PWD}
ENV PORT 8080

RUN npm install -g serve
RUN npm install
RUN npm run build

EXPOSE 8080
CMD ["serve", "-s", "-l", "8080", "./dist"]