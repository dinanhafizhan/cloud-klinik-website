import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditUser = () => {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // opsional
  const [gender, setGender] = useState("");
  const [alamat, setAlamat] = useState("");
  const [no_tlp, setNo_tlp] = useState("");
  const [newFoto, setNewFoto] = useState(null);
  const [currentFotoUrl, setCurrentFotoUrl] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  const getUserById = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${id}`);
      const data = res.data;
      setNama(data.nama);
      setEmail(data.email);
      setGender(data.gender);
      setAlamat(data.alamat);
      setNo_tlp(data.no_tlp);
      if (data.foto) {
        setCurrentFotoUrl(`${process.env.REACT_APP_API_URL}/images/${data.foto}`);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    }
  }, [id]);

  useEffect(() => {
    getUserById();
  }, [getUserById]);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFoto(file);
      setCurrentFotoUrl(URL.createObjectURL(file));
    } else {
      setNewFoto(null);
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("email", email);
    if (password) formData.append("password", password);
    formData.append("gender", gender);
    formData.append("alamat", alamat);
    formData.append("no_tlp", no_tlp);
    if (newFoto) formData.append("foto", newFoto);

    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/admin/user");
    } catch (error) {
      console.error("Gagal update user:", error.response || error.message || error);
      alert("Gagal memperbarui data user.");
    }
  };

  return (
    <div className="columns mt-5 is-centered">
      <div className="column is-half">
        <form onSubmit={updateUser}>
          <div className="field">
            <label className="label">Nama</label>
            <div className="control">
              <input type="text" className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label className="label">Password (biarkan kosong jika tidak diubah)</label>
            <div className="control">
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label">Alamat</label>
            <div className="control">
              <input type="text" className="input" value={alamat} onChange={(e) => setAlamat(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label className="label">No. Telepon</label>
            <div className="control">
              <input type="text" className="input" value={no_tlp} onChange={(e) => setNo_tlp(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label className="label">Foto</label>
            <div className="control">
              <input type="file" className="input" onChange={loadImage} />
            </div>
          </div>

          {currentFotoUrl && (
            <div className="field">
              <figure className="image is-64x64">
                <img src={currentFotoUrl} alt="Foto User" />
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

export default EditUser;
