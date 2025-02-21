FROM node:18-alpine
WORKDIR /DadminGUI
COPY package.json ./
COPY module.d.ts ./
COPY index.html ./
COPY .env ./
RUN npm install
RUN npm install serve -g 
COPY . . 
RUN npm run build
RUN rm -r src

CMD ["npm", "run", "serve"]