import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../reservasi.css'; // Make sure this CSS file is updated
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'animate.css';
import { isAuthenticated, getLoggedInUserId } from '../utils/auth'; // Import functions from auth.js
import Chatbot from './Chatbot';
import LoadingSpinner from './utils/LoadingSpinner';

// Initialize AOS once
AOS.init();

const ReservasiPage = () => {
    // Reference for the doctor container to enable horizontal scroll
    const dokterContainerRef = useRef(null);

    // --- State Variables for Form ---
    const [users, setUsers] = useState([]);
    const [dokters, setDokters] = useState([]);
    const [jadwalList, setJadwalList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(''); // Will be populated with the logged-in user's ID
    const [selectedSpesialis, setSelectedSpesialis] = useState('');
    const [selectedDokterId, setSelectedDokterId] = useState('');
    const [selectedJadwalId, setSelectedJadwalId] = useState('');
    const [selectedTanggal, setSelectedTanggal] = useState(''); // For the date input
    const [pesanTambahan, setPesanTambahan] = useState(''); // For the textarea
    const [loading, setLoading] = useState(true); // Loading state for initial data fetch
    const [error, setError] = useState(null); // Error state for initial data fetch

    // States for user's photo and name to display, and their contact info
    const [selectedUserPhoto, setSelectedUserPhoto] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [selectedUserPhone, setSelectedUserPhone] = useState('');

    // New state for controlling the success popup
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all necessary data: users, doctors, schedules
                const [usersRes, doktersRes, jadwalRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/users`),
                    axios.get(`${process.env.REACT_APP_API_URL}/dokters`),
                    axios.get(`${process.env.REACT_APP_API_URL}/jadwal`),
                ]);

                setUsers(usersRes.data);
                setDokters(doktersRes.data);
                setJadwalList(jadwalRes.data);

                // --- LOGIC FOR DETERMINING LOGGED-IN USER BASED ON utils/auth.js ---
                let userToSet = null;
                if (isAuthenticated()) {
                    const loggedInUserId = getLoggedInUserId(); // Get ID from auth utility
                    if (loggedInUserId) {
                        userToSet = usersRes.data.find(user => user.id.toString() === loggedInUserId);
                        if (!userToSet) {
                            console.warn(`Pengguna dengan ID ${loggedInUserId} dari auth utility tidak ditemukan. Mungkin data tidak sinkron atau user telah dihapus.`);
                            // Optionally, log out the user if their ID isn't found
                            // logout(); // Uncomment this if you want to force logout on ID mismatch
                        }
                    }
                }

                if (userToSet) {
                    setSelectedUser(userToSet.id.toString());
                    setSelectedUserName(userToSet.nama);
                    setSelectedUserEmail(userToSet.email || 'N/A');
                    setSelectedUserPhone(userToSet.no_tlp || 'N/A');
                } else {
                    // If no user is logged in or user data not found, clear all user-related states
                    setSelectedUser('');
                    setSelectedUserName('');
                    setSelectedUserPhoto('');
                    setSelectedUserEmail('');
                    setSelectedUserPhone('');
                    console.log("Tidak ada pengguna yang terdeteksi login atau data pengguna tidak valid.");
                }

            } catch (err) {
                console.error('Gagal mengambil data untuk halaman reservasi:', err);
                setError("Gagal memuat data reservasi. Pastikan server backend berjalan dan data tersedia.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // This effect runs only once when the component mounts

    // --- Update User Photo, Name, Email, and Phone when selectedUser changes ---
    useEffect(() => {
        const user = users.find(u => u.id === parseInt(selectedUser));
        if (user) {
            const photoUrl = user.foto ? `${process.env.REACT_APP_API_URL}/images/${user.foto}` : '';
            setSelectedUserPhoto(photoUrl);
            setSelectedUserEmail(user.email || 'N/A');
            setSelectedUserPhone(user.no_tlp || 'N/A');
        } else {
            setSelectedUserPhoto('');
            setSelectedUserEmail('');
            setSelectedUserPhone('');
        }
    }, [selectedUser, users]); // Depends on selectedUser and users

    // ✅ Horizontal scroll effect with mouse drag
    useEffect(() => {
        const wrapper = dokterContainerRef.current;
        if (!wrapper) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const handleMouseDown = (e) => {
            isDown = true;
            wrapper.classList.add('scrolling');
            startX = e.pageX - wrapper.offsetLeft;
            scrollLeft = wrapper.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            wrapper.classList.remove('scrolling');
        };

        const handleMouseUp = () => {
            isDown = false;
            wrapper.classList.remove('scrolling');
        };

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.5;
            wrapper.scrollLeft = scrollLeft - walk;
        };

        wrapper.addEventListener('mousedown', handleMouseDown);
        wrapper.addEventListener('mouseleave', handleMouseLeave);
        wrapper.addEventListener('mouseup', handleMouseUp);
        wrapper.addEventListener('mousemove', handleMouseMove);

        return () => {
            wrapper.removeEventListener('mousedown', handleMouseDown);
            wrapper.removeEventListener('mouseleave', handleMouseLeave);
            wrapper.removeEventListener('mouseup', handleMouseUp);
            wrapper.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Empty dependency array so it runs only once on component mount

    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi dasar
        // Pastikan selectedUser tidak kosong, artinya ada user yang terdeteksi login
        if (!selectedUser || !selectedSpesialis || !selectedDokterId || !selectedJadwalId || !selectedTanggal) {
            alert("Mohon lengkapi semua pilihan (Nama Lengkap, Spesialis, Dokter, Waktu Kedatangan, Tanggal) sebelum mengirim reservasi.");
            return;
        }

        try {
            // Send reservation data to your backend
            await axios.post(`${process.env.REACT_APP_API_URL}/janji`, {
                userId: parseInt(selectedUser), // Ensure userId is an integer
                dokterId: parseInt(selectedDokterId), // Ensure dokterId is an integer
                jadwalId: parseInt(selectedJadwalId), // Ensure jadwalId is an integer
                tanggal: selectedTanggal, // Include the selected date
                status: 'pending', // Default status for a new reservation
                catatan: pesanTambahan // Include additional message
            });

            // Show the custom success popup instead of navigating
            setShowSuccessPopup(true);

            // Optionally, reset form fields here after successful submission
            // Only reset fields that the user can still change
            setSelectedSpesialis('');
            setSelectedDokterId('');
            setSelectedJadwalId('');
            setSelectedTanggal('');
            setPesanTambahan('');

        } catch (err) {
            console.error('Failed to submit reservation:', err.response?.data || err.message || err);
            alert('Gagal mengirim reservasi. Silakan coba lagi atau hubungi admin.');
        }
    };

    // Find the selected doctor object to display their photo
    const selectedDokter = dokters.find(d => d.id === parseInt(selectedDokterId));

    // --- Loading and Error States ---
    if (loading) {
        return (
            <div className="reservation-container">
                <LoadingSpinner text="Memuat halaman reservasi..." />
            </div>
        );
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
        <div className="reservation-container">
            {/* Pop-up Sukses Modal */}
            {showSuccessPopup && (
                <div className="modal is-active">
                    <div className="modal-background"></div>
                    {/* Menggunakan gaya yang diperbarui untuk centering */}
                    <div className="modal-content has-text-centered" style={styles.successPopup}>
                        <h3 className="title is-4 has-text-white">Reservasi Berhasil!</h3>
                        <p className="subtitle is-6 has-text-white">Reservasi Anda telah berhasil dikirim dan menunggu konfirmasi. Silakan periksa email Anda secara berkala.</p>
                        <button
                            className="button is-primary is-light mt-4"
                            onClick={() => setShowSuccessPopup(false)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Bagian Hero */}
            <div className="reservation-hero" data-aos="fade-down" data-aos-duration="1000">
                <h1 className="animate__animated animate__fadeInDown">BEST CARING BETTER DOCTOR</h1>
                <p className="breadcrumb">Kesehatanmu Prioritas Kami</p>
            </div>

            {/* Tombol kembali ke Landing Page */}
            <div className="has-text-centered" style={{ margin: '20px 0' }}>
                <a href="/" className="button is-primary is-medium animate__animated animate__fadeInUp">
                    ← Kembali ke Landing Page
                </a>
            </div>

            {/* Formulir Reservasi */}
            <motion.div
                className="reservation-form-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <h2>RESERVASI ONLINE</h2>
                <p>
                    Isi formulir di bawah ini untuk membuat jadwal reservasi keperluan kesehatan Anda di Klinik Hafizh.
                    Kami berkomitmen untuk memberikan pelayanan terbaik.
                </p>

                <form className="reservation-form" onSubmit={handleSubmit}>
                    {/* Kelompok Formulir Pertama: Tanggal dan Nama Lengkap (Dropdown Dinamis Berdasarkan Login) */}
                    <div className="form-group">
                        {/* Pemilih Tanggal */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="reservation-date">Tanggal</label>
                            <input
                                id="reservation-date"
                                className="input-style"
                                type="date"
                                placeholder="mm/dd/yyyy"
                                value={selectedTanggal}
                                onChange={(e) => setSelectedTanggal(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Nama Lengkap (Dropdown menampilkan hanya pengguna yang login) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="reservation-user">Nama Lengkap</label>
                            <div className="select-style">
                                <select
                                    id="reservation-user"
                                    value={selectedUser}
                                    // onChange tidak diperlukan karena ini akan read-only
                                    required
                                    disabled={!selectedUser} // Nonaktifkan jika tidak ada user yang terdeteksi login
                                >
                                    {/* Menampilkan satu opsi: pengguna yang sedang login, atau pesan jika tidak ada */}
                                    {selectedUser && selectedUserName ? (
                                        <option value={selectedUser}>{selectedUserName}</option>
                                    ) : (
                                        <option value="">Mohon Login Terlebih Dahulu</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Menampilkan foto pengguna yang dipilih (jika tersedia) */}
                    {selectedUserPhoto && (
                        <div className="has-text-centered mt-4 mb-4">
                            <figure className="image is-96x96 is-inline-block">
                                <img
                                    className="is-rounded"
                                    src={selectedUserPhoto}
                                    alt={selectedUserName || "User Avatar"}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        console.log('Error loading user photo:', selectedUserPhoto);
                                    }}
                                />
                            </figure>
                            {!selectedUserPhoto && selectedUserName && (
                                <div style={styles.avatarPlaceholder}>
                                    {selectedUserName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="has-text-weight-semibold mt-2">{selectedUserName}</p>
                        </div>
                    )}

                    {/* Kelompok Formulir Baru untuk Spesialis dan Dokter */}
                    <div className="form-group">
                        {/* Spesialis */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="reservation-spesialis">Spesialis</label>
                            <div className="select-style">
                                <select
                                    id="reservation-spesialis"
                                    value={selectedSpesialis}
                                    onChange={(e) => {
                                        setSelectedSpesialis(e.target.value);
                                        setSelectedDokterId(''); // Reset dokter
                                        setSelectedJadwalId(''); // Reset jadwal
                                    }}
                                    required
                                >
                                    <option value="">Pilih Spesialis</option>
                                    {dokters.length === 0 ? (
                                        <option disabled>Tidak ada data spesialis</option>
                                    ) : (
                                        // Menggunakan Set untuk mendapatkan spesialis unik
                                        [...new Set(dokters.map((d) => d.spesialis))].map((sp, index) => (
                                            <option key={index} value={sp}>{sp}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Dokter (dirender secara kondisional) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="reservation-dokter">Dokter</label>
                            <div className="select-style">
                                <select
                                    id="reservation-dokter"
                                    value={selectedDokterId}
                                    onChange={(e) => {
                                        setSelectedDokterId(e.target.value);
                                        setSelectedJadwalId(''); // Reset jadwal
                                    }}
                                    required
                                    disabled={!selectedSpesialis} // Nonaktifkan jika tidak ada spesialis yang dipilih
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
                    </div>

                    {/* Menampilkan foto dokter yang dipilih (jika tersedia) */}
                    {selectedDokter && selectedDokter.foto && (
                        <div className="has-text-centered mt-4 mb-4">
                            <figure >
                                <img
                                    src={`${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`}
                                    alt={selectedDokter.nama}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/128/d1c4e9/5e35b1?text=Dokter';
                                        console.log('Error loading doctor photo!', `${process.env.REACT_APP_API_URL}/images/${selectedDokter.foto}`);
                                    }}
                                    className="dokter-foto"
                                />
                            </figure>
                        </div>
                    )}


                    {/* Kelompok Formulir Kedua: Alamat Email dan Jumlah Tamu */}
                    <div className="form-group">
                        {/* Alamat Email (Read-only dari pengguna yang dipilih) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="user-email">Alamat Email</label>
                            <input
                                id="user-email"
                                className="input-style"
                                type="email"
                                placeholder="Alamat Email"
                                value={selectedUserEmail}
                                readOnly
                                disabled={!selectedUser}
                            />
                        </div>

                        {/* Jumlah Tamu (Dinonaktifkan, tidak berlaku) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="jumlah-tamu">Jumlah Tamu</label>
                            <input
                                id="jumlah-tamu"
                                className="input-style"
                                type="number"
                                placeholder="Jumlah Tamu (Tidak Berlaku)"
                                min="1"
                                value="" // Keep value empty
                                disabled // Nonaktifkan
                            />
                        </div>
                    </div>

                    {/* Kelompok Formulir Ketiga: Waktu Kedatangan (Pilih Jadwal) dan Nomor Telepon */}
                    <div className="form-group">
                        {/* Waktu Kedatangan (Pilih Jadwal) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="reservation-time">Waktu Kedatangan</label>
                            <div className="select-style">
                                <select
                                    id="reservation-time"
                                    value={selectedJadwalId}
                                    onChange={(e) => setSelectedJadwalId(e.target.value)}
                                    required
                                    disabled={!selectedDokterId} // Nonaktifkan sampai dokter dipilih
                                >
                                    <option value="">Waktu Kedatangan</option>
                                    {jadwalList.length === 0 ? (
                                        <option disabled>Tidak ada jadwal tersedia</option>
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

                        {/* Nomor Telepon (Read-only dari pengguna yang dipilih) */}
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="user-phone">Nomor Telepon</label>
                            <input
                                id="user-phone"
                                className="input-style"
                                type="tel"
                                placeholder="Nomor Telepon"
                                value={selectedUserPhone}
                                readOnly
                                disabled={!selectedUser}
                            />
                        </div>
                    </div>

                    {/* Pesan atau Keterangan Tambahan (Textarea) */}
                    <div className="form-group full-width">
                        <div className="form-field-wrapper">
                            <label className="label-hidden" htmlFor="additional-message">Pesan atau Keterangan Tambahan (max 300 karakter)</label>
                            <textarea
                                id="additional-message"
                                className="textarea-style"
                                placeholder="Pesan atau Keterangan Tambahan (max 300 karakter)"
                                value={pesanTambahan}
                                onChange={(e) => setPesanTambahan(e.target.value)}
                                maxLength={300}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit">RESERVATION →</button>
                </form>
            </motion.div>

            {/* --- Bagian Konten dari LandingPage (Daftar Dokter, Tentang Kami, Layanan, Kontak) --- */}
            {/* Daftar Dokter */}
            <section id="dokter" className="section has-background-light">
                <h2 className="title has-text-black has-text-centered mb-6" data-aos="fade-up">
                    Daftar Dokter
                </h2>

                {/* Wrapper for horizontal scroll, attached with ref */}
                <div className="dokter-scroll-wrapper" ref={dokterContainerRef}>
                    {/* Content for horizontal scroll */}
                    <div className="dokter-scroll-content">
                        {/* Duplicate doctors to create a continuous scroll effect */}
                        {[...dokters, ...dokters].map((dokter, index) => (
                            <div key={index} className="dokter-card-column">
                                <div className="box dokter-card-content" data-aos="zoom-in" data-aos-delay={index * 100}>
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}/images/${dokter.foto}`}
                                        alt={dokter.nama}
                                        onError={(e) => { e.target.src = '/default-foto.png'; }} // Fallback image
                                    />
                                    <h3 className="subtitle is-5">{dokter.nama}</h3>
                                    <p>{dokter.spesialis}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="section">
                <div className="container">
                    <div className="columns is-vcentered is-variable is-8">
                        <div className="column is-6 has-text-centered" data-aos="zoom-in">
                            <figure className="image is-4by3" style={{ overflow: 'hidden', borderRadius: '12px' }}>
                                <img
                                    src="/dokterr.jpg"
                                    alt="Ilustrasi Klinik"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease',
                                    }}
                                    className="animate__animated animate__fadeIn"
                                />
                            </figure>
                        </div>
                        <div className="column is-6 has-text-left" data-aos="fade-left">
                            <h2 className="title is-3 has-text-black mb-3">
                                Tentang <span style={{ color: 'var(--primary)' }}>Klinik Kami</span>
                            </h2>
                            <p className="subtitle is-5 has-text-black mb-4">
                                Klinik Sehat telah berdiri sejak 2010 dan berkomitmen untuk memberikan pelayanan kesehatan berkualitas.
                            </p>
                            <p className="has-text-black mb-4">
                                Kami melayani berbagai kebutuhan kesehatan mulai dari pemeriksaan umum, vaksinasi, hingga layanan laboratorium modern. Selalu mengutamakan kenyamanan dan keamanan pasien.
                            </p>
                            <a href="/tentang"
                                className="button is-primary is-light animate__animated animate__fadeInUp"
                                data-aos="fade-up"
                                data-aos-delay="500"
                            >
                                Selengkapnya
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="services" className="section has-background-light">
                <div className="container">
                    <h2 className="title has-text-black has-text-centered mb-6" data-aos="fade-up">Layanan Kami</h2>
                    <div className="columns is-multiline is-centered">
                        {[
                            { icon: 'fa-stethoscope', color: 'info', title: 'Pemeriksaan Umum', desc: 'Layanan kesehatan umum untuk semua usia.' },
                            { icon: 'fa-syringe', color: 'success', title: 'Vaksinasi', desc: 'Tersedia berbagai jenis vaksin untuk anak dan dewasa.' },
                            { icon: 'fa-vials', color: 'danger', title: 'Laboratorium', desc: 'Tes darah, urin, dan pemeriksaan lainnya.' }
                        ].map((item, i) => (
                            <div key={i} className="column is-one-third" data-aos="fade-up" data-aos-delay={i * 300}>
                                <div className="box has-text-centered">
                                    <span className={`icon is-large has-text-${item.color} mb-3`}>
                                        <i className={`fas ${item.icon} fa-2x`}></i>
                                    </span>
                                    <h3 className="subtitle is-5 has-text-black">{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="section" data-aos="fade-up">
                <div className="container has-text-centered">
                    <h2 className="title has-text-black has-text-centered ">Hubungi Kami</h2>
                    <p>📍 Alamat: Jl. Kesehatan No.10, Bandung, Indonesia</p>
                    <p>📞 Telepon: (62) 87263817263</p>
                    <p>📧 Email: @klinikhafizh.com</p>
                </div>
            </section>

            <motion.footer
                style={{ backgroundColor: "#0d6efd", color: "white" }}
                className="footer has-text-centered animate__animated animate__fadeIn"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className="content">
                    <p>&copy; 2025 Klinik Hafizh. All rights reserved.</p>
                </div>
            </motion.footer>

            {/* Chatbot Widget */}
            <Chatbot />
        </div>
    );
};

// Styles for avatar placeholder
const styles = {
    avatarPlaceholder: {
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        backgroundColor: '#D1C4E9',
        color: '#5E35B1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '2em',
        margin: '10px auto',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    // Styles for the success popup modal
    successPopup: {
        backgroundColor: 'var(--primary)',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%', // Tambahkan ini untuk responsivitas yang lebih baik
        padding: '30px', // Sesuaikan padding
        textAlign: 'center',
        position: 'fixed', // Kunci perubahan: fixed ke viewport
        zIndex: '1001',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', // Tambahkan bayangan untuk efek pop-up
    },
};

export default ReservasiPage;
