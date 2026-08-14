import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [alamat, setAlamat] = useState("");
  const [no_tlp, setNo_tlp] = useState("");
  const [foto, setFoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
    } else {
      setFoto(null);
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("gender", gender);
    formData.append("alamat", alamat);
    formData.append("no_tlp", no_tlp);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin/user");
    } catch (error) {
      console.error("Gagal menyimpan user:", error.response || error.message || error);
      let msg = "Terjadi kesalahan.";
      if (error.response?.data?.msg) {
        msg = error.response.data.msg;
      } else if (error.message) {
        msg = error.message;
      }
      alert(`Gagal menyimpan data: ${msg}.`);
    }
  };

  return (
    <div className="columns mt-5 is-centered">
      <div className="column is-half">
        <form onSubmit={saveUser}>
          {/* Nama */}
          <div className="field">
            <label className="label">Nama</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <label className="checkbox mt-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />{" "}
              Lihat Password
            </label>
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="field">
            <label className="label">Alamat</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                required
              />
            </div>
          </div>

          {/* No. Telepon */}
          <div className="field">
            <label className="label">No. Telepon</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Nomor Telepon"
                value={no_tlp}
                onChange={(e) => setNo_tlp(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Foto */}
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

          {/* Tombol Simpan */}
          <div className="field">
            <button type="submit" className="button is-success">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
