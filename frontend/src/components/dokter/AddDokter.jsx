import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDokter = () => {
  const [nama, setNama] = useState("dr. ");
  const [gender, setGender] = useState("Laki-laki");
  const [spesialis, setSpesialis] = useState("Spesialis "); // Initialize with "Spesialis "
  const [no_tlp, setNo_tlp] = useState("");
  const [foto, setFoto] = useState(null);

  const navigate = useNavigate();

  // Focus on the end of the "Nama Dokter" input field when the component mounts
  useEffect(() => {
    const namaInput = document.getElementById("namaDokterInput");
    if (namaInput) {
      namaInput.setSelectionRange(namaInput.value.length, namaInput.value.length);
    }

    // Focus on the end of the "Spesialis" input field when the component mounts
    const spesialisInput = document.getElementById("spesialisInput");
    if (spesialisInput) {
      spesialisInput.setSelectionRange(spesialisInput.value.length, spesialisInput.value.length);
    }
  }, []);

  const loadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
    } else {
      setFoto(null);
    }
  };

  const addDokter = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("gender", gender);
    formData.append("spesialis", spesialis);
    formData.append("no_tlp", no_tlp);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/dokters`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/admin/dokter");
    } catch (error) {
      console.error("Error adding dokter:", error);
      alert("Gagal menambahkan dokter, cek console untuk detail.");
    }
  };

  return (
    <div className="columns mt-5 is-centered">
      <div className="column is-half">
        <form onSubmit={addDokter}>
          <div className="field">
            <label className="label">Nama Dokter</label>
            <div className="control">
              <input
                type="text"
                className="input"
                id="namaDokterInput"
                placeholder="Nama Dokter"
                value={nama}
                onChange={(e) => {
                  if (!e.target.value.startsWith("dr. ")) {
                    setNama("dr. " + e.target.value.replace("dr. ", ""));
                  } else {
                    setNama(e.target.value);
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Gender</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
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
                id="spesialisInput" // Add an ID for easy access
                placeholder="Spesialis"
                value={spesialis}
                onChange={(e) => {
                  // Ensure "Spesialis " prefix is always present
                  if (!e.target.value.startsWith("Spesialis ")) {
                    setSpesialis("Spesialis " + e.target.value.replace("Spesialis ", ""));
                  } else {
                    setSpesialis(e.target.value);
                  }
                }}
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
              <input type="file" className="input" onChange={loadImage} />
            </div>
          </div>

          <div className="field">
            <button type="submit" className="button is-success">
              Tambah Dokter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDokter;