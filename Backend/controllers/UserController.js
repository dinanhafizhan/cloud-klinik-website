import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { uploadToGCS } from "../config/GetStorage.js";

// GET semua user
export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ['id', 'nama', 'email', 'gender', 'alamat', 'no_tlp', 'role', 'foto']
    });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengambil data user." });
  }
};

// GET user berdasarkan ID
export const getUserById = async (req, res) => {
  try {
    const response = await User.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'nama', 'email', 'gender', 'alamat', 'no_tlp', 'role', 'foto']
    });
    if (!response) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengambil data user." });
  }
};

// POST user baru (Registrasi)
export const createUser = async (req, res) => {
  const {
    nama,
    email,
    password,
    gender = null,
    alamat = null,
    no_tlp = null,
    role = "user"
  } = req.body;

  try {
    let foto = null;
    if (req.file) {
      foto = await uploadToGCS(req.file);
    }

    if (!nama || !email || !password) {
      return res.status(400).json({ msg: "Nama, email, dan password wajib diisi." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah digunakan." });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await User.create({
      nama,
      email,
      password: hashPassword,
      gender,
      alamat,
      no_tlp,
      role,
      foto
    });

    res.status(201).json({ msg: "User berhasil dibuat." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal membuat user." });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  const {
    nama,
    email,
    password,
    gender,
    alamat,
    no_tlp,
    role
  } = req.body;

  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan." });

    let foto = user.foto;
    if (req.file) {
      foto = await uploadToGCS(req.file);
    }

    let hashPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt();
      hashPassword = await bcrypt.hash(password, salt);
    }

    await User.update(
      {
        nama: nama ?? user.nama,
        email: email ?? user.email,
        password: hashPassword,
        gender: gender ?? user.gender,
        alamat: alamat ?? user.alamat,
        no_tlp: no_tlp ?? user.no_tlp,
        role: role ?? user.role,
        foto
      },
      { where: { id: req.params.id } }
    );

    res.status(200).json({ msg: "User berhasil diperbarui." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal memperbarui user." });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan." });

    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({ msg: "User berhasil dihapus." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal menghapus user." });
  }
};
