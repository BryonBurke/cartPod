module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://bryonburke:funShipFlorida@zombiedev.p4lmitq.mongodb.net/?retryWrites=true&w=majority&appName=ZombieDev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  server: {
    port: 8081,
    host: 'localhost'
  },
  basicAuth: {
    username: process.env.ME_CONFIG_BASICAUTH_USERNAME || 'admin',
    password: process.env.ME_CONFIG_BASICAUTH_PASSWORD || 'pass'
  }
}; 