const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3050;

const app = express();

app.use(cors()); // Permite conexiones de otros origenes
app.use(bodyParser.json());

// MySql

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "prueba",
});

// Rutas Usuarios

// Registrar

app.post("/add", (req, res) => {
  const sql = "INSERT INTO usuario SET ?";
  const customerObj = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    if (
      customerObj.username == "" ||
      customerObj.email == "" ||
      customerObj.password == ""
    ) {
      res.send();
    } else {
      if (
        /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(
          customerObj.email
        ) &&
        customerObj.password.length >= 8
      ) {
        connection.query(sql, customerObj, (error) => {
          if (error) {
            res.send(false);
          } else {
            res.status(200);
            res.send(true);
          }
        });
      } else {
        res.send();
      }
    }
  } catch (error) {
    res.send(error);
  }
});

// Listar usuarios

app.get("/customers", (req, res) => {
  const sql = "SELECT * FROM usuario";
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

// Ver usuario

app.get("/customers/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM usuario WHERE id_user = ${id}`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

//Iniciar sesión método

app.post("/login", (req, res) => {
  const customerObj = {
    email: req.body.email,
    password: req.body.password,
  };
  if (customerObj.email == "" || customerObj.password == "") {
    res.send(false)
  } else {
    const sql = `SELECT * FROM usuario WHERE email = '${customerObj.email}' AND password = '${customerObj.password}'`;
    connection.query(sql, (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        jwt.sign(
          { user: results },
          "secretKey",
          { expiresIn: "1d" },
          function (err, token) {
            if (err) {
              res.send(false)
            } else {
              res.json(token);
            }
          }
        );
      } else {
        res.send(false);
      }
    });
  }
});

//Autorización del token

app.post("/post", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (error, authData) => {
    if (error) {
      res.send(false);
    } else {
      res.send(authData);
    }
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

//Borrar usuario

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM usuario WHERE id_user = '${id}'`;
  connection.query(
    `SELECT * FROM usuario WHERE id_user = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) throw error;
          res.send(true);
        });
      } else {
        res.send(false);
      }
    }
  );
});

//Actualizar usuario

app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const sql = `UPDATE usuario SET username = '${username}', email = '${email}', password = '${password}' WHERE id_user = '${id}'`;
  connection.query(
    `SELECT * FROM usuario WHERE id_user = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) {
            res.send(false);
          } else {
            res.send(true);
          }

        });
      } else {
        res.send();
      }
    }
  );
});


// Rutas Libros 

// Registrar Libro

app.post("/addBook", (req, res) => {
  const sql = "INSERT INTO libro SET ?";
  const customerObj = {
    author: req.body.author,
    name: req.body.name,
    id_user: req.body.id_user,
  };
  try {
    if (
      customerObj.author == "" ||
      customerObj.name == "" ||
      customerObj.id_user == ""
    ) {
      res.send(false);
    } else {
      connection.query(sql, customerObj, (error) => {
        if (error) {
          res.send(false);
        } else {
          res.send(true);
        }
      });
    }
  } catch (error) {
    res.send(error);
  }
});

// Listar libros

app.get("/books", (req, res) => {
  const sql = "SELECT * FROM libro";
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

// Ver libro

app.get("/books/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM libro WHERE id_libro = ${id}`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

//Borrar usuario

app.delete("/deleteBook/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM libro WHERE id_libro = '${id}'`;
  connection.query(
    `SELECT * FROM libro WHERE id_libro = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) throw error;
          res.send(true);
        });
      } else {
        res.send(false);
      }
    }
  );
});

//Actualizar usuario

app.put("/updateBook/:id", (req, res) => {
  const { id } = req.params;
  const { name, author } = req.body;
  const sql = `UPDATE libro SET name = '${name}', author = '${author}' WHERE id_libro = '${id}'`;
  connection.query(
    `SELECT * FROM libro WHERE id_libro = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) {
            res.send(false);
          } else {
            res.send(true);
          }

        });
      } else {
        res.send();
      }
    }
  );
});

// Rutas Prestamos

// Registrar Prestamos

app.post("/addPrest", (req, res) => {
  const sql = "INSERT INTO prestamos SET ?";
  const customerObj = {
    fecha_ent: req.body.fecha_ent,
    fecha_dev: req.body.fecha_dev,
    id_libro: req.body.id_libro,
    id_user: req.body.id_user
  };
  try {
    if (
      customerObj.fecha_ent == "" ||
      customerObj.fecha_dev == "" ||
      customerObj.id_user == "" ||
      customerObj.id_libro == ""
    ) {
      res.send(false);
    } else {
      connection.query(sql, customerObj, (error) => {
        if (error) {
          res.send(false);
        } else {
          res.send(true);
        }
      });
    }
  } catch (error) {
    res.send(error);
  }
});

// Listar libros

app.get("/prestamos", (req, res) => {
  const sql = "SELECT * FROM prestamos";
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

// Ver prestamo

app.get("/prestamos/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM prestamos WHERE id_prestamo = ${id}`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.send(false);
    }
  });
});

//Borrar usuario

app.delete("/deletePrest/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM prestamos WHERE id_prestamo = '${id}'`;
  connection.query(
    `SELECT * FROM prestamos WHERE id_prestamo = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) throw error;
          res.send(true);
        });
      } else {
        res.send(false);
      }
    }
  );
});

//Actualizar usuario

app.put("/updatePrest/:id", (req, res) => {
  const { id } = req.params;
  const { fecha_ent, fecha_dev, id_libro } = req.body;
  const sql = `UPDATE prestamos SET fecha_ent = '${fecha_ent}', fecha_dev = '${fecha_dev}', id_libro = '${id_libro}' WHERE id_prestamo = '${id}'`;
  connection.query(
    `SELECT * FROM prestamos WHERE id_prestamo = ${id}`,
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        connection.query(sql, (error) => {
          if (error) {
            res.send(false);
          } else {
            res.send(true);
          }

        });
      } else {
        res.send();
      }
    }
  );
});


// Verificar conexión

connection.connect((error) => {
  console.log("Servidor de base de datos está corriendo!");
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
