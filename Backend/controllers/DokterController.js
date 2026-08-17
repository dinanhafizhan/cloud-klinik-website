import Dokter from "../models/DokterModel.js";
import { uploadToGCS } from "../config/GetStorage.js";


// GET semua dokter
export const getDokters = async (req, res) => {
    try {
        const response = await Dokter.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Gagal mengambil data dokter" });
    }
};

// GET dokter berdasarkan ID
export const getDokterById = async (req, res) => {
    try {
        const response = await Dokter.findOne({
            where: { id: req.params.id }
        });
        if (!response) {
            return res.status(404).json({ msg: "Dokter tidak ditemukan" });
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Gagal mengambil data dokter" });
    }
};

// POST dokter baru
export const createDokter = async (req, res) => {
    const { nama, gender, spesialis, no_tlp } = req.body;

    try {
        let foto = null;
        if (req.file) {
            foto = await uploadToGCS(req.file);
        }

        await Dokter.create({
            nama,
            gender,
            spesialis,
            no_tlp,
            foto
        });
        res.status(201).json({ msg: "Dokter berhasil dibuat" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Gagal membuat dokter" });
    }
};

// PUT update data dokter
export const updateDokter = async (req, res) => {
    const { nama, gender, spesialis, no_tlp } = req.body;

    try {
        const dokter = await Dokter.findOne({ where: { id: req.params.id } });
        if (!dokter) return res.status(404).json({ msg: "Dokter tidak ditemukan" });

        let foto = dokter.foto;
        if (req.file) {
            foto = await uploadToGCS(req.file);
        }

        await Dokter.update(
            { nama, gender, spesialis, no_tlp, foto },
            { where: { id: req.params.id } }
        );
        res.status(200).json({ msg: "Dokter berhasil diperbarui" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Gagal memperbarui dokter" });
    }
};

// DELETE dokter
export const deleteDokter = async (req, res) => {
    try {
        await Dokter.destroy({
            where: { id: req.params.id }
        });
        res.status(200).json({ msg: "Dokter berhasil dihapus" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Gagal menghapus dokter" });
    }
};
