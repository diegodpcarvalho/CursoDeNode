const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Verifique se o nome de usuário é válido
  // Implemente a lógica de validação do nome de usuário, se necessário
  // Por exemplo, verificar se o nome de usuário atende a certos critérios
  return true; // Retorna true por enquanto, você pode implementar a lógica necessária aqui
}

const authenticatedUser = (username, password) => {
  // Verifique se o nome de usuário e a senha correspondem aos registros existentes
  return users.some(user => user.username === username && user.password === password);
}

// Rota para login de usuário registrado
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verifique se o nome de usuário e a senha foram fornecidos
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verifique se o nome de usuário é válido
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Verifique se o nome de usuário e a senha correspondem aos registros existentes
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Se as credenciais estiverem corretas, gerar um token JWT
  const token = jwt.sign({ username }, 'your_secret_key_here');

  // Retorne o token JWT como resposta
  return res.status(200).json({ token });
});

// Adicione uma revisão de livro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.user.username; // Obtendo o nome de usuário da sessão

  // Verificar se o ISBN e a revisão foram fornecidos
  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  // Verificar se o livro com o ISBN fornecido existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Verificar se o usuário já postou uma revisão para este ISBN
  let userReviewIndex = -1;
  books[isbn].reviews.forEach((item, index) => {
    if (item.username === username) {
      userReviewIndex = index;
    }
  });

  // Se o usuário já tiver postado uma revisão, modificar a revisão existente
  if (userReviewIndex !== -1) {
    books[isbn].reviews[userReviewIndex].review = review;
    return res.status(200).json({ message: "Review modified successfully" });
  }

  // Se o usuário não tiver postado uma revisão, adicionar uma nova revisão
  books[isbn].reviews.push({ username, review });
  return res.status(201).json({ message: "Review added successfully" });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers.authorization; // Obter token JWT do cabeçalho da solicitação
  const decodedToken = jwt.verify(token, 'your_secret_key_here'); // Decodificar o token JWT
  const username = decodedToken.username; // Obtendo o nome de usuário do token

  // Verificar se o livro com o ISBN fornecido existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Filtrar e deletar as revisões do usuário atual para este ISBN
  books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);

  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;