const express = require('express');
const swaggerUI = require('swagger-ui-express');
const fileUpload = require('express-fileupload');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

const app = express();
const cors = require('cors');
const config = require('./config/server.config');
const {
  readDirectory,
  responser,
  readFileContent,
} = require('./utils/helperFunction');

app.use(express.json({ limit: '500mb' }));
app.use(cors());

// Enable file uploads
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

const swagger = {
  openapi: '3.0.0',
  info: {
    title: 'Backend Service API',
    version: '1.0.0',
    description: 'API work',
  },
  host: 'localhost:5002',
  basePath: '/',
  servers: [
    {
      url: config.base_url,
    },
  ],
  paths: {},
};
const uiOptions = {
  swaggerOptions: {
    docExpansion: 'none', // set the docExpansion to 'none'
  },
};
const appendRoutes = async (folder) => {
  try {
    let arrayList = await readDirectory(folder);
    if (arrayList.length) {
      for (let ele of arrayList) {
        if (!ele.includes('.')) {
          await appendRoutes(folder + '/' + ele);
        }
        if (ele.endsWith('.routes.js')) {
          app.use(
            // this will make api endpoint like /api/v1/{file name without route.js}/{your specified endpoint in that file}
            `/api/v1/${ele.split('.')[0]}`,
            // this will make api endpoint like /api/v1/{last folder name}/{file name without route.js}/{your specified endpoint in that file}
            // `/api/v1/${folder.split('/').at(-1)}/${ele.split('.')[0]}`,
            require(`./${folder}/${ele}`),
          );
        }
        if (ele.endsWith('.swagger.json')) {
          let swaggerPayload = JSON.parse(await readFileContent(folder, ele));
          swagger.paths = { ...swagger.paths, ...swaggerPayload.paths };
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swagger, uiOptions));
  app.get('/', async (req, res) => {
    res.status(200).json(responser('Welcome to Server.'));
  });
};

if (config.NODE_CLUSTER === 'true' && cluster.isMaster) {
  // console.log("numCPUs",numCPUs);
  // Master process - Fork workers for each CPU core
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs * +config.CPU_USAGE; i++) {
    cluster.fork();
  }

  // Listen for workers exiting and replace them if necessary
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  appendRoutes('src');

  app.listen(config.PORT, () => {
    console.log(
      `Process ${process.pid} running at:`,
      config.base_url + '/api-docs',
    );
  });
}

// CRON JOBS
