import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './utils/LoadingSpinner';
import '../dashboardcontent.css';
import Chatbot from './Chatbot';

const DashboardContent = () => {
    const [summary, setSummary] = useState({
        totalDoctors: 0,
        totalVisits: 0,
        totalReservations: 0,
    });
    const [pendingReservations, setPendingReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [doktersRes, usersRes, janjiRes, jadwalRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/dokters`),
                    axios.get(`${process.env.REACT_APP_API_URL}/users`),
                    axios.get(`${process.env.REACT_APP_API_URL}/janji`),
                    axios.get(`${process.env.REACT_APP_API_URL}/jadwal`),
                ]);

                setSummary({
                    totalDoctors: doktersRes.data.length,
                    totalVisits: usersRes.data.length,
                    totalReservations: janjiRes.data.length,
                });

                const filtered = janjiRes.data
                    .filter(janji => janji.status === 'pending')
                    .map(janji => {
                        const user = usersRes.data.find(u => u.id === janji.userId);
                        const dokter = doktersRes.data.find(d => d.id === janji.dokterId);
                        const jadwal = jadwalRes.data.find(j => j.id === janji.jadwalId);

                        return {
                            id: janji.id,
                            userName: user?.nama || 'Tidak Ditemukan',
                            doctorSpecialist: dokter?.spesialis || 'Tidak Ditemukan',
                            doctorName: dokter?.nama || 'Tidak Ditemukan',
                            scheduleTime: jadwal ? `${jadwal.hari} - ${jadwal.waktu}` : 'Tidak Ditemukan',
                            reservationDate: janji.tanggal,
                            status: janji.status || 'pending',
                        };
                    });

                setPendingReservations(filtered);

            } catch (err) {
                console.error('Gagal memuat data:', err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/janji/${id}`, { status: newStatus });
            setPendingReservations(prev => prev.filter(res => res.id !== id));
        } catch (err) {
            alert('Gagal mengubah status.');
        }
    };

    if (loading) return <LoadingSpinner text="Memuat Dashboard..." />;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div className="dashboard-wrapper">
            <div className="summary-cards">
                <div className="summary-card">
                    <i className="fa fa-user-md"></i>
                    <h1>{summary.totalDoctors}+</h1>
                    <p>Dokter Terdaftar</p>
                </div>
                <div className="summary-card">
                    <i className="fa fa-users"></i>
                    <h1>{summary.totalVisits}+</h1>
                    <p>Kunjungan Pasien</p>
                </div>
                <div className="summary-card">
                    <i className="fa fa-calendar-check"></i>
                    <h1>{summary.totalReservations}+</h1>
                    <p>Total Reservasi</p>
                </div>
            </div>

            <div className="reservation-section">
                <h2 className="reservation-title">Reservasi Janji Temu Tertunda</h2>
                {pendingReservations.length > 0 ? (
                    <div className="table-container">
                        <table className="reservation-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Pengguna</th>
                                    <th>Spesialis</th>
                                    <th>Nama Dokter</th>
                                    <th>Jadwal</th>
                                    <th>Tanggal</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingReservations.map((res, index) => (
                                    <tr key={res.id}>
                                        <td>{index + 1}</td>
                                        <td>{res.userName}</td>
                                        <td>{res.doctorSpecialist}</td>
                                        <td>{res.doctorName}</td>
                                        <td>{res.scheduleTime}</td>
                                        <td>{res.reservationDate}</td>
                                        <td>
                                            <select
                                                value={res.status}
                                                className={`select-status ${res.status.toLowerCase()}`}
                                                onChange={(e) => handleStatusChange(res.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-data">Tidak ada reservasi tertunda.</p>
                )}
            </div>

            <Chatbot />
        </div>
    );
};

export default DashboardContent;
