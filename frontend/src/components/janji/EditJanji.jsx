import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../utils/LoadingSpinner';

const EditJanji = () => {
  const [users, setUsers] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSpesialis, setSelectedSpesialis] = useState('');
  const [selectedDokterId, setSelectedDokterId] = useState('');
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState(''); // NEW STATE FOR DATE
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true); // Added loading state for initial fetch
  const [error, setError] = useState(null); // Added error state for initial fetch


  const navigate = useNavigate();
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Set loading true when fetching starts
      setError(null);

      const [usersRes, doktersRes, jadwalRes, janjiRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/users`),
        axios.get(`${process.env.REACT_APP_API_URL}/dokters`),
        axios.get(`${process.env.REACT_APP_API_URL}/jadwal`),
        axios.get(`${process.env.REACT_APP_API_URL}/janji/${id}`),
      ]);

      const janji = janjiRes.data;
      setUsers(usersRes.data);
      setDokters(doktersRes.data);
      setJadwalList(jadwalRes.data);

      // Set initial state values from fetched janji data
      setSelectedUser(janji.userId);
      setSelectedDokterId(janji.dokterId);
      setSelectedJadwalId(janji.jadwalId);
      setSelectedTanggal(janji.tanggal); // NEW: Set existing tanggal
      setStatus(janji.status);

      // Auto-pilih spesialis berdasarkan dokter
      const selectedDokter = doktersRes.data.find(d => d.id === janji.dokterId);
      if (selectedDokter) {
        setSelectedSpesialis(selectedDokter.spesialis);
      }

    } catch (err) {
      console.error('Gagal memuat data:', err);
      setError("Gagal memuat data janji atau data lain. Pastikan ID janji valid dan server backend berjalan.");
    } finally {
      setLoading(false); // Set loading false after fetch completes
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedDokterId || !selectedJadwalId || !selectedTanggal) { // Added selectedTanggal validation
      alert("Mohon lengkapi semua pilihan (Pengguna, Dokter, Jadwal, Tanggal) sebelum menyimpan.");
      return;
    }

    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/janji/${id}`, {
        userId: selectedUser,
        dokterId: selectedDokterId,
        jadwalId: selectedJadwalId,
        tanggal: selectedTanggal, // NEW: Include selectedTanggal in update payload
        status,
      });
      alert("Janji berhasil diperbarui.");
      navigate("/admin/janji");
    } catch (err) {
      console.error("Gagal update janji:", err.response?.data || err.message);
      alert("Terjadi kesalahan saat mengupdate janji. Silakan coba lagi.");
    }
  };

  const selectedDokter = dokters.find(d => d.id === parseInt(selectedDokterId));

  // Loading and Error states
  if (loading) {
    return <LoadingSpinner text="Memuat form edit janji..." />;
  }

  if (error) {
    return (
      <section className="hero is-fullheight is-danger is-bold">
        <div className="hero-body">
          <div className="container has-text-centered">
            <p className="title">Terjadi Kesalahan</p>
            <p className="subtitle">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', paddingTop: '3rem' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="box" style={{ borderRadius: '12px' }}>
          <h2 className="title has-text-centered has-text-link mb-5">Edit Janji Temu</h2>

          <form onSubmit={handleUpdate}>
            {/* User */}
            <div className="field">
              <label className="label">Nama Pengguna</label>
              <div className="select is-fullwidth is-info">
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
                  <option value="">Pilih Pengguna</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nama} - {user.no_tlp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spesialis */}
            <div className="field">
              <label className="label">Spesialis</label>
              <div className="select is-fullwidth is-info">
                <select
                  value={selectedSpesialis}
                  onChange={(e) => {
                    setSelectedSpesialis(e.target.value);
                    setSelectedDokterId('');
                    setSelectedJadwalId('');
                  }}
                  required
                >
                  <option value="">Pilih Spesialis</option>
                  {[...new Set(dokters.map(d => d.spesialis))].map((sp, idx) => (
                    <option key={idx} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dokter */}
            <div className="field">
              <label className="label">Dokter</label>
              <div className="select is-fullwidth is-info">
                <select value={selectedDokterId} onChange={(e) => setSelectedDokterId(e.target.value)} required>
                  <option value="">Pilih Dokter</option>
                  {dokters.filter(d => d.spesialis === selectedSpesialis).map(dokter => (
                    <option key={dokter.id} value={dokter.id}>{dokter.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDokter?.foto && (
              <div className="field has-text-centered">
                <figure className="image is-128x128 is-inline-block mt-2">
                  <img
                    className="is-rounded"
                    src={`${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`}
                    alt={selectedDokter.nama}
                    onError={(e) => {
                      e.target.onerror = null;
                      console.log('Error loading doctor photo:', `${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`);
                    }}
                  />
                </figure>
                <p className="has-text-weight-semibold mt-2">{selectedDokter.nama}</p>
              </div>
            )}

            {/* Jadwal */}
            <div className="field">
              <label className="label">Jadwal</label>
              <div className="select is-fullwidth is-info">
                <select value={selectedJadwalId} onChange={(e) => setSelectedJadwalId(e.target.value)} required>
                  <option value="">Pilih Jadwal</option>
                  {jadwalList.map(j => (
                    <option key={j.id} value={j.id}>{j.hari} - {j.waktu}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* NEW: Tanggal */}
            <div className="field">
              <label className="label">Tanggal Janji Temu</label>
              <div className="control">
                <input
                  className="input is-info"
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="field">
              <label className="label">Status</label>
              <div className="select is-fullwidth">
                <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="field has-text-centered mt-5">
              <button className="button is-success is-medium" type="submit">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditJanji;