# Vidoer

Vidoer is a web application that allows users to upload an image and an audio file to generate a video. The generated video can then be uploaded to YouTube.

## Project Structure

- `frontend/`: Contains the Next.js frontend application.
- `backend/`: Contains the Node.js backend application.
- `k8s/`: Contains the Kubernetes deployment and service files.
- `helm/`: Contains the Helm chart for deploying the application.

## Requirements

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)

## Development

To develop the application locally, you can run the frontend and backend servers separately.

### Frontend

To start the frontend development server, run the following commands:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Backend

To start the backend server, run the following commands:

```bash
cd backend
npm install
npm start
```

The backend will be available at `http://localhost:3001`.

## Debugging

To debug the application, you can use the browser's developer tools for the frontend and the Node.js inspector for the backend.

### Frontend

To debug the frontend, open the browser's developer tools and go to the "Sources" tab. You can set breakpoints and inspect the code from there.

### Backend

To debug the backend, you can start the server with the `--inspect` flag:

```bash
node --inspect src/index.js
```

You can then use a debugger like the Chrome DevTools for Node.js to connect to the inspector and debug the code.

## Deployment

To deploy the application to a Kubernetes cluster, you can use the provided Helm chart.

First, build the Docker image:

```bash
docker build -t vidoer .
```

Then, deploy the application using Helm:

```bash
helm install vidoer ./helm
```

This will deploy the application to your Kubernetes cluster. You can then access the application through the NodePort service.
