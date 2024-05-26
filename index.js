const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
// Verifica se o token de acesso está presente na sessão do usuário
if (req.session && req.session.accessToken) {
    // Se o token estiver presente, isso significa que o usuário está autenticado
    // Avança para o próximo middleware
    next();
  } else {
    // Se o token não estiver presente, o usuário não está autenticado
    // Retorna um erro de autenticação
    res.status(401).json({ error: "Unauthorized" });
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
