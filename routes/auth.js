const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.accepts('html')) {
          return res.status(400).render('register', { error: 'El usuario ya existe' });
        } else {
          return res.status(400).json({ message: 'El usuario ya existe' });
        }
      }
      
      // Crear nuevo usuario
      const newUser = new User({ email, password });
      await newUser.save();
      
      // Iniciar sesión automáticamente después del registro
      req.login(newUser, (err) => {
        if (err) {
          if (req.accepts('html')) {
            return res.status(500).render('register', { error: 'Error al iniciar sesión' });
          } else {
            return res.status(500).json({ message: 'Error al iniciar sesión' });
          }
        }
        
        if (req.accepts('html')) {
          // Redirigir a la página de perfil
          return res.redirect('/auth/check');
        } else {
          return res.json({ message: 'Registro exitoso', user: newUser });
        }
      });
    } catch (err) {
      if (req.accepts('html')) {
        return res.status(500).render('register', { error: 'Error en el servidor' });
      } else {
        return res.status(500).json({ message: 'Error en el servidor' });
      }
    }
});

// Inicio de sesión
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Inicio de sesión exitoso', user: req.user });
});

// Cierre de sesión
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Sesión cerrada' });
});

// Verificar sesión
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;