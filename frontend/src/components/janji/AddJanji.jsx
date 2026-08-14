import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utils/LoadingSpinner';

const AddJanji = () => {
  const [users, setUsers] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSpesialis, setSelectedSpesialis] = useState('');
  const [selectedDokterId, setSelectedDokterId] = useState('');
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // NEW
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, doktersRes, jadwalRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/users`),
          axios.get(`${process.env.REACT_APP_API_URL}/dokters`),
          axios.get(`${process.env.REACT_APP_API_URL}/jadwal`),
        ]);

        setUsers(usersRes.data);
        setDokters(doktersRes.data);
        setJadwalList(jadwalRes.data);
      } catch (err) {
        console.error('Gagal mengambil data!', err);
        setError("Gagal memuat data. Pastikan server backend berjalan dan data tersedia.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser ||
        !selectedDokterId ||
        !selectedJadwalId ||
        !selectedTanggal) {
      alert("Mohon lengkapi semua pilihan (Pengguna, Dokter, Jadwal, Tanggal) sebelum submit.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/janji`, {
        userId: selectedUser,
        dokterId: selectedDokterId,
        jadwalId: selectedJadwalId,
        tanggal: selectedTanggal,
        status: 'pending',
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Gagal menyimpan reservasi!', err);
      setErrorMsg('Gagal menyimpan reservasi. Silakan coba lagi.');
      setShowErrorModal(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/admin/janji'); // Kembali ke daftar janji
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
  };

  const selectedDokter = dokters.find((d) => d.id === parseInt(selectedDokterId));

  if (loading) {
    return <LoadingSpinner text="Memuat form tambah janji..." />;
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
    <section className="hero is-fullheight" style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', paddingTop: '3rem' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="box" style={{ borderRadius: '12px' }}>
          <h2 className="title has-text-centered has-text-link mb-5">Formulir Reservasi</h2>

          <form onSubmit={handleSubmit}>
            {/* User */}
            <div className="field">
              <label className="label">Nama Pengguna</label>
              <div className="select is-fullwidth is-info">
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
                    <option value="">Pilih Nama</option>
                    {users.length === 0 ? (
                      <option disabled>Tidak ada data pengguna</option>
                    ) : (
                      users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nama} - {user.no_tlp}
                        </option>
                      ))
                    )}

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
                    {dokters.length === 0 ? (
                      <option disabled>Tidak ada data spesialis</option>
                    ) : (
                      [...new Set(dokters.map((d) => d.spesialis))].map((sp, index) => (
                        <option key={index} value={sp}>{sp}</option>
                      ))
                    )}

                </select>
              </div>
            </div>

            {/* Dokter */}
            {selectedSpesialis && (
              <div className="field">
                <label className="label">Dokter</label>
                <div className="select is-fullwidth is-info">
                    <select
                        value={selectedDokterId}
                        onChange={(e) => {
                           setSelectedDokterId(e.target.value);
                           setSelectedJadwalId('');
                        }}
                        required
                    >
                        <option value="">Pilih Dokter</option>
                        {dokters.filter((d) => d.spesialis === selectedSpesialis).length === 0 ? (
                           <option disabled>Tidak ada dokter untuk spesialis ini</option>
                         ) : (
                           dokters
                             .filter((d) => d.spesialis === selectedSpesialis)
                             .map((dokter) => (
                                <option key={dokter.id} value={dokter.id}>
                                   {dokter.nama}
                                </option>
                             ))
                         )}

                    </select>
                </div>
              </div>
            )}

            {/* Foto Dokter */}
            {selectedDokter && selectedDokter.foto && (
              <div className="field has-text-centered">
                <figure className="image is-128x128 is-inline-block mt-2">
                    <img
                        className="is-rounded"
                        src={`${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`}
                        alt={selectedDokter.nama}
                        onError={(e) => {
                           e.target.onerror = null;
                           console.log('Error loading doctor photo!', `${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`);
                        }}
                    />
                </figure>
              </div>
            )}

            {/* Tanggal Janji Temu */}
            <div className="field">
              <label className="label">Tanggal Janji Temu</label>
              <div className="control">
                <input
                    className="input is-info"
                    type="date"
                    value={selectedTanggal}
                    onChange={(e) => setSelectedTanggal(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
              </div>
            </div>

            {/* Jadwal */}
            <div className="field">
              <label className="label">Jadwal</label>
              <div className="select is-fullwidth is-info">
                <select value={selectedJadwalId} onChange={(e) => setSelectedJadwalId(e.target.value)} required>
                    <option value="">Pilih Jadwal</option>
                    {jadwalList.length === 0 ? (
                      <option disabled>Tidak ada data jadwal</option>
                    ) : (
                      jadwalList.map((jadwalItem) => (
                        <option key={jadwalItem.id} value={jadwalItem.id}>
                           {jadwalItem.hari} - {jadwalItem.waktu}
                        </option>
                      ))
                    )}

                </select>
              </div>
            </div>

            <div className="field has-text-centered mt-5">
              <button className="button is-link is-medium" type="submit">
                Kirim Reservasi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div style={{ position:'fixed', top:'0', left:'0', right:'0', bottom:'0',
          background:'rgba(0,0,0,0.5)', zIndex:'1000',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ padding:'20px', background:'#fff', borderRadius:'12px' }}>
            <p>Reservasi berhasil disimpan</p>
            <div style={{ marginTop:'20px', textAlign:'center' }}>
              <button onClick={handleCloseSuccess} style={{ padding:'10px 20px', background:'green', color:'white', border:'none', borderRadius:'5px' }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ERROR MODAL --- */}
      {showErrorModal && (
        <div style={{ position:'fixed', top:'0', left:'0', right:'0', bottom:'0',
          background:'rgba(0,0,0,0.5)', zIndex:'1000',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ padding:'20px', background:'#fff', borderRadius:'12px' }}>
            <p>Terjadi kesalahan</p>
            <p>{errorMsg}</p>
            <div style={{ marginTop:'20px', textAlign:'center' }}>
              <button onClick={handleCloseError} style={{ padding:'10px 20px', background:'red', color:'white', border:'none', borderRadius:'5px' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default AddJanji;
