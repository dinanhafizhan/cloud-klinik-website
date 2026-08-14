import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingSpinner from '../utils/LoadingSpinner';
import { FaPlus, FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import SidebarContext from "../SidebarContext"; // Import SidebarContext

const DokterList = () => {
  const [dokters, setDokters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toggleSidebar } = useContext(SidebarContext);

  // --- NEW STATES FOR MODAL ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dokterToDeleteId, setDokterToDeleteId] = useState(null);
  // --- END NEW STATES ---

  useEffect(() => {
    getDokters();
  }, []);

  const getDokters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/dokters`);
      // Periksa dan sesuaikan URL foto dokter jika perlu
      const processedDokters = res.data.map(item => {
        if (item.foto && !item.foto.startsWith('http')) {
          item.foto = `${process.env.REACT_APP_API_URL}/images/${item.foto}`;
        }
        return item;
      });
      setDokters(processedDokters);
    } catch (err) {
      console.error("Error fetching dokters:", err);
      alert("Gagal memuat data dokter.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleDeleteClick = (id) => {
    setDokterToDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (dokterToDeleteId) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/dokters/${dokterToDeleteId}`);
        getDokters(); // Refresh list
        setShowDeleteModal(false); // Close modal on success
        setDokterToDeleteId(null);
      } catch (err) {
        console.error("Error deleting dokter:", err);
        alert("Gagal menghapus dokter.");
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDokterToDeleteId(null);
  };
  // --- END MODAL HANDLERS ---

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDokters = dokters.filter(dokter => {
    const query = searchTerm.toLowerCase();
    const nama = dokter.nama?.toLowerCase() || '';
    const gender = dokter.gender?.toLowerCase() || '';
    const spesialis = dokter.spesialis?.toLowerCase() || '';
    const noTlp = dokter.no_tlp?.toLowerCase() || '';

    return (
      nama.includes(query) ||
      gender.includes(query) ||
      spesialis.includes(query) ||
      noTlp.includes(query)
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.titleWithToggle}>
        <button
          onClick={toggleSidebar}
          style={styles.toggleButton}
          title="Toggle Sidebar"
        >
          ☰
        </button>
        <h2 style={styles.pageTitle}>Daftar Dokter</h2>
      </div>

      <div style={styles.headerContainer}>
        <div style={styles.searchAndActions}>
          <div style={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            <FaSearch style={styles.searchIcon} />
          </div>
          <Link to="/admin/dokter/add" style={styles.addDokterButton}>
            <FaPlus style={{ marginRight: '8px' }} /> Tambah Dokter
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat data dokter..." />
      ) : (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeaderCell}>No</th>
                <th style={styles.tableHeaderCell}>Nama</th>
                <th style={styles.tableHeaderCell}>Gender</th>
                <th style={styles.tableHeaderCell}>Spesialis</th>
                <th style={styles.tableHeaderCell}>No. Telp</th>
                <th style={styles.tableHeaderCell}>Foto</th>
                <th style={styles.tableHeaderCellLast}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDokters.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.noDataRow}>
                    Tidak ada data Dokter.
                  </td>
                </tr>
              ) : (
                filteredDokters.map((dokter, index) => {
                  // Hapus definisi dokterInitial karena tidak lagi digunakan
                  // const dokterInitial = dokter.nama ? dokter.nama.charAt(0).toUpperCase() : 'D';
                  const dokterPhotoUrl = dokter.foto;

                  return (
                    <tr
                      key={dokter.id}
                      style={styles.tableRow}
                    >
                      <td style={styles.tableCell}>{index + 1}</td>
                      <td style={styles.tableCell}>
                        {/* Hapus div style={styles.avatarCell} dan semua isinya */}
                        {dokter.nama}
                      </td>
                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.genderTag,
                            backgroundColor: dokter.gender === "Laki-laki" ? '#BBDEFB' : '#FFECB3', // Biru muda atau Kuning muda
                            color: dokter.gender === "Laki-laki" ? '#2196F3' : '#FFC107', // Biru atau Kuning
                          }}
                        >
                          {dokter.gender}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{dokter.spesialis}</td>
                      <td style={styles.tableCell}>{dokter.no_tlp || '-'}</td>
                      <td style={styles.tableCell}>
                        {dokterPhotoUrl ? (
                          <img
                            src={dokterPhotoUrl}
                            alt="Foto Dokter"
                            style={styles.doctorPhotoImage}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'placeholder_image_path.jpg'; // Ganti dengan path gambar placeholder jika ada
                              e.target.alt = "Foto tidak tersedia";
                            }}
                          />
                        ) : (
                          <span style={styles.noPhotoText}>-</span>
                        )}
                      </td>
                      <td style={styles.tableCellActions}>
                        <Link
                          to={`/admin/dokter/edit/${dokter.id}`}
                          style={styles.actionButtonSmall}
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(dokter.id)}
                          style={{ ...styles.actionButtonSmall, ...styles.deleteButton }}
                          title="Hapus"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <p style={styles.modalText}>Yakin ingin menghapus Dokter ini?</p>
            <div style={styles.modalButtons}>
              <button
                onClick={handleConfirmDelete}
                style={styles.modalConfirmButton}
              >
                Ya, Hapus!
              </button>
              <button
                onClick={handleCancelDelete}
                style={styles.modalCancelButton}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END DELETE CONFIRMATION MODAL --- */}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  titleWithToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '1.8em',
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    padding: '15px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  searchAndActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    padding: '10px 15px',
    paddingRight: '40px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95em',
    width: '280px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  searchIcon: {
    position: 'absolute',
    right: '15px',
    color: '#888',
  },
  addDokterButton: {
    backgroundColor: '#6A1B9A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '0.95em',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(106, 27, 154, 0.2)',
    transition: 'background-color 0.2s ease',
  },
  loadingProgress: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2em',
    color: '#666',
  },
  tableBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
  },
  tableHeaderRow: {
    backgroundColor: '#F5F5F5',
    borderBottom: '1px solid #E0E0E0',
    height: '60px',
    fontSize: '1em',
    color: '#424242',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    padding: '15px 20px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#424242',
  },
  tableHeaderCellLast: {
    padding: '15px 20px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: '#424242',
  },
  tableRow: {
    borderBottom: '1px solid #ECEFF1',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    height: '70px',
    // '&:hover': { // Efek hover tidak akan bekerja dengan inline styles murni
    //   backgroundColor: '#F5F5F5',
    // },
  },
  tableCell: {
    padding: '12px 20px', // Sedikit mengecilkan dari 14px ke 12px
    color: '#333',
    fontSize: '1.0em', // Sedikit mengecilkan dari 1.05em ke 1.0em
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Hapus styles.avatarCell, styles.avatarImage, styles.avatarPlaceholder
  // karena tidak lagi digunakan di kolom Nama
  doctorPhotoImage: {
    width: '50px', // Kembali ke 50px dari 60px
    height: '50px', // Kembali ke 50px dari 60px
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #E0E0E0',
  },
  noPhotoText: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    fontSize: '0.9em',
  },
  noDataRow: {
    textAlign: 'center',
    padding: '30px',
    color: '#999',
    fontSize: '1.1em',
  },
  tableCellActions: {
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  actionButtonSmall: {
    backgroundColor: '#E0E0E0',
    color: '#555',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '0.85em',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    margin: '0 4px',
    width: '32px', // Kembali ke 32px dari 36px
    height: '32px', // Kembali ke 32px dari 36px
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    // '&:hover': {
    //   backgroundColor: '#D5D5D5',
    //   transform: 'translateY(-1px)',
    // },
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    color: '#EF5350',
    // '&:hover': {
    //   backgroundColor: '#FFCDD2',
    // },
  },
  genderTag: {
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.85em', // Sedikit mengecilkan dari 0.9em ke 0.85em
    fontWeight: 'bold',
    display: 'inline-block',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleButton: {
    fontSize: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
  },

  // --- NEW STYLES FOR MODAL (unchanged) ---
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s forwards',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    transform: 'scale(0.9)',
    animation: 'scaleIn 0.3s forwards',
    border: '2px solid #6A1B9A',
    position: 'relative',
  },
  modalText: {
    fontSize: '1.2em',
    marginBottom: '25px',
    color: '#333',
    fontWeight: '500',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  modalConfirmButton: {
    backgroundColor: '#DC3545',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 25px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 8px rgba(220, 53, 69, 0.2)',
  },
  modalCancelButton: {
    backgroundColor: '#6C757D',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 25px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 8px rgba(108, 117, 125, 0.2)',
  },
};

export default DokterList;