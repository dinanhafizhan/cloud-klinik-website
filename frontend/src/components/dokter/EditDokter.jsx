import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditDokter = () => {
  const [nama, setNama] = useState("");
  const [gender, setGender] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [newFoto, setNewFoto] = useState(null);
  const [currentFotoUrl, setCurrentFotoUrl] = useState("");
  const [no_tlp, setNo_tlp] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  const getDokterById = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/dokters/${id}`);
      const data = response.data;
      setNama(data.nama);
      setGender(data.gender);
      setSpesialis(data.spesialis);
      setNo_tlp(data.no_tlp);
      if (data.foto) {
        setCurrentFotoUrl(data.foto.startsWith('http') ? data.foto : `${process.env.REACT_APP_API_URL}/images/${data.foto}`);
      } else {
        setCurrentFotoUrl("");
      }
    } catch (error) {
      console.error("Error getting dokter by ID:", error);
    }
  }, [id]);

  useEffect(() => {
    getDokterById();
  }, [getDokterById]);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFoto(file);
      setCurrentFotoUrl(URL.createObjectURL(file));
    } else {
      setNewFoto(null);
    }
  };

  const updateDokter = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("gender", gender);
    formData.append("spesialis", spesialis);
    formData.append("no_tlp", no_tlp);

    if (newFoto) {
      formData.append("foto", newFoto);
    }

    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/dokters/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      navigate("/admin/dokter");
    } catch (error) {
      console.error("Error updating dokter:", error.response || error.message || error);
      alert("Gagal memperbarui data. Cek console untuk detail.");
    }
  };

  return (
    <div className="columns mt-5 is-centered">
      <div className="column is-half">
        <form onSubmit={updateDokter}>
          <div className="field">
            <label className="label">Nama Dokter</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Nama Dokter"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label">Spesialis</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Spesialis"
                value={spesialis}
                onChange={(e) => setSpesialis(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">No Telepon</label>
            <div className="control">
              <input
                type="tel"
                className="input"
                placeholder="No Telepon"
                value={no_tlp}
                onChange={(e) => setNo_tlp(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Foto</label>
            <div className="control">
              <input
                type="file"
                className="input"
                onChange={loadImage}
              />
            </div>
          </div>

          {currentFotoUrl && (
            <div className="field">
              <figure className="image is-64x64">
                <img src={currentFotoUrl} alt="Foto Dokter" />
              </figure>
            </div>
          )}

          <div className="field">
            <button type="submit" className="button is-success">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDokter;
