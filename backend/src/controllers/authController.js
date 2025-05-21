import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId, isAdmin) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, profile } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await User.create({
      email,
      password: hashedPassword,
      isAdmin: false,
      profile: profile || {}
    });

    const token = generateToken(userId, false);
    res.status(201).json({ userId, token });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;
    
    await User.updateProfile(userId, profileData);
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      name: user.name,
      lastname: user.lastname,
      age: user.age,
      avatar: user.avatar,
      university: user.university,
      interests: user.interests,
      bio: user.bio
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id, user.isAdmin);
    res.json({ 
      userId: user.id, 
      token,
      isAdmin: user.isAdmin 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export const verifyAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ isAdmin: false });
    }
    res.json({ isAdmin: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar administrador' });
  }
};